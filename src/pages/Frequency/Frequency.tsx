import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { FrequencyHeader } from './components/FrequencyHeader';
import { TransmissionComposerModal } from './components/TransmissionComposerModal';
import { TransmissionItem, Transmission, Reply } from './components/TransmissionItem';
import { UserProfileView, UserProfileTarget } from './components/UserProfileView';
import { 
  subscribeTransmissions, 
  createTransmissionToFirestore, 
  addReplyToFirestore, 
  deleteTransmissionFromFirestore 
} from '../../services/frequencyService';

const INITIAL_TRANSMISSIONS: Transmission[] = [
  {
    id: 'tx-1',
    authorId: 'ss-840',
    authorAlias: 'Pengelana Malam',
    tag: 'HENING',
    content: 'Kadang jam segini lagu-lagu sorside jadi terasa beda banget di telinga. Ada keheningan yang gak bisa dijelasin kata-kata, cuma bisa dinikmati sendiri tanpa perlu pura-pura tegar.',
    timestamp: '14m lalu',
    replies: [
      {
        id: 'rep-1-1',
        authorId: 'ss-109',
        content: 'Bener banget bro, terutama trek nomor 2. Suasana kamar langsung hening total.',
        timestamp: '9m lalu'
      },
      {
        id: 'rep-1-2',
        authorId: 'ss-840',
        authorAlias: 'Pengelana Malam',
        content: 'Iya, distorsi gitarnya seperti bicara langsung ke pikiran yang lagi kusut.',
        timestamp: '4m lalu'
      }
    ]
  },
  {
    id: 'tx-2',
    authorId: 'ss-312',
    tag: 'LELAH',
    content: 'Sisi yang gak pernah terlihat: gue selalu keliatan paling ceria di kantor, tapi tiap pulang ke kosan rasanya kosong banget. Ruang ini kerasa nyaman karena gak ada tuntutan buat terlihat bahagia.',
    timestamp: '1h lalu',
    replies: [
      {
        id: 'rep-2-1',
        authorId: 'ss-001',
        authorAlias: 'Sorside',
        content: 'Terima kasih sudah membagi bebanmu di sini. Istirahat yang cukup malam ini.',
        timestamp: '48m lalu'
      }
    ]
  },
  {
    id: 'tx-3',
    authorId: 'ss-774',
    authorAlias: 'Kamar Lantai 2',
    tag: 'NOSTALGIA',
    content: 'Suara distorsi analognya ngingetin gue sama rekaman pita kaset tua bapak gue di tahun 2000-an awal. Raw, jujur, dan apa adanya.',
    timestamp: '3h lalu',
    replies: []
  }
];

const VIBE_OPTIONS = ['HENING', 'LELAH', 'NOSTALGIA', 'GELISAH', 'HARAP'];

export const Frequency: React.FC = () => {
  // User Identity State (Stored in LocalStorage)
  const [myId, setMyId] = useState('ss-582');
  const [myAlias, setMyAlias] = useState('');
  const [tempAlias, setTempAlias] = useState('');

  // Modals state
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [viewProfileTarget, setViewProfileTarget] = useState<UserProfileTarget | null>(null);

  // Composer modal & auto-draft state
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [draftContent, setDraftContent] = useState(() => {
    try {
      return localStorage.getItem('sorside_freq_draft') || '';
    } catch {
      return '';
    }
  });
  const [selectedVibe, setSelectedVibe] = useState('HENING');

  const handleDraftChange = (text: string) => {
    setDraftContent(text);
    try {
      localStorage.setItem('sorside_freq_draft', text);
    } catch {
      // ignore
    }
  };

  const handlePostTransmission = async (content: string, tag: string) => {
    const newTx: Transmission = {
      id: `tx-${Date.now()}`,
      authorId: myId,
      authorAlias: myAlias || undefined,
      content,
      tag,
      timestamp: 'Baru saja',
      replies: []
    };

    // Optimistic UI update
    setTransmissions(prev => [newTx, ...prev]);
    setDraftContent('');
    try {
      localStorage.removeItem('sorside_freq_draft');
    } catch {
      // ignore
    }

    // Push to Firestore
    try {
      await createTransmissionToFirestore(newTx);
    } catch (err) {
      console.warn('[Frequency] Gagal kirim ke Firestore, tetap ada di lokal:', err);
    }
  };

  // Feed & Replies State
  const [transmissions, setTransmissions] = useState<Transmission[]>(INITIAL_TRANSMISSIONS);
  const [openThreads, setOpenThreads] = useState<Record<string, boolean>>({ 'tx-1': true });
  const [replyInput, setReplyInput] = useState<Record<string, string>>({});
  const [activeReplyBox, setActiveReplyBox] = useState<string | null>(null);

  // Sync dengan Firestore secara Real-Time
  useEffect(() => {
    const unsubscribe = subscribeTransmissions((remoteTransmissions) => {
      if (remoteTransmissions && remoteTransmissions.length > 0) {
        setTransmissions(remoteTransmissions);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Initialize or load identity from localStorage
  useEffect(() => {
    try {
      let id = localStorage.getItem('sorside_freq_id');
      if (!id) {
        const randomNum = Math.floor(100 + Math.random() * 900);
        id = `ss-${randomNum}`;
        localStorage.setItem('sorside_freq_id', id);
      }
      setMyId(id);

      // Pastikan tanggal sinyal pertama tersimpan
      if (!localStorage.getItem('sorside_freq_created')) {
        const now = new Date();
        const formatted = `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`;
        localStorage.setItem('sorside_freq_created', formatted);
      }

      const alias = localStorage.getItem('sorside_freq_alias');
      if (alias) {
        setMyAlias(alias);
        setTempAlias(alias);
      }
    } catch {
      // ignore storage issues
    }
  }, []);

  const handleUpdateAlias = (newAlias: string) => {
    const clean = newAlias.trim();
    setMyAlias(clean);
    setTempAlias(clean);
    try {
      localStorage.setItem('sorside_freq_alias', clean);
    } catch {
      // ignore
    }
    // Update profil aktif jika sedang membuka profil sendiri
    if (viewProfileTarget?.isMe) {
      setViewProfileTarget(prev => prev ? { ...prev, alias: clean } : null);
    }
  };

  const handleRegenerateId = () => {
    const randomNum = Math.floor(100 + Math.random() * 900);
    const newId = `ss-${randomNum}`;
    setMyId(newId);
    try {
      localStorage.setItem('sorside_freq_id', newId);
    } catch {
      // ignore
    }
    if (viewProfileTarget?.isMe) {
      setViewProfileTarget(prev => prev ? { ...prev, id: newId } : null);
    }
  };

  const handlePostReply = async (txId: string, e: React.FormEvent) => {
    e.preventDefault();
    const content = replyInput[txId]?.trim();
    if (!content) return;

    const newReply: Reply = {
      id: `rep-${Date.now()}`,
      authorId: myId,
      authorAlias: myAlias || undefined,
      content,
      timestamp: 'Baru saja'
    };

    // Optimistic UI update
    setTransmissions(prev =>
      prev.map(tx => {
        if (tx.id === txId) {
          return {
            ...tx,
            replies: [...tx.replies, newReply]
          };
        }
        return tx;
      })
    );

    setReplyInput(prev => ({ ...prev, [txId]: '' }));
    setActiveReplyBox(null);
    setOpenThreads(prev => ({ ...prev, [txId]: true }));

    // Push reply to Firestore
    try {
      await addReplyToFirestore(txId, newReply);
    } catch (err) {
      console.warn('[Frequency] Gagal kirim balasan ke Firestore, tetap ada di lokal:', err);
    }
  };

  const handleDeleteMyTx = async (id: string) => {
    // Optimistic UI update
    setTransmissions(prev => prev.filter(t => t.id !== id));

    // Delete from Firestore
    try {
      await deleteTransmissionFromFirestore(id);
    } catch (err) {
      console.warn('[Frequency] Gagal hapus dari Firestore, tetap terhapus di lokal:', err);
    }
  };

  const toggleThread = (id: string) => {
    setOpenThreads(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Helper untuk mendapatkan inisial avatar yang akurat:
  // - Jika punya alias text: ambil inisial kata (misal: "Pejuang Malam" -> "PM", "Pengelana" -> "PE")
  // - Jika default ID (ss-765): ambil angkanya saja ("765")
  const getAvatarInitials = (id: string, alias?: string) => {
    if (alias && alias.trim()) {
      const parts = alias.trim().split(/\s+/);
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return alias.slice(0, 2).toUpperCase();
    }
    // Jika format ss-123, ambil 123
    if (id.startsWith('ss-')) {
      return id.slice(3);
    }
    return id.slice(0, 3).toUpperCase();
  };

  // Get user's own transmissions
  const myTransmissions = transmissions.filter(t => t.authorId === myId);

  return (
    <div className="pb-24 max-w-xl mx-auto px-1 sm:px-0">
      
      {/* 1. COMPACT STICKY HEADER (Ala Threads: Fixed saat scroll, compact text & center sempurna) */}
      <FrequencyHeader 
        onOpenInfo={() => setShowInfoModal(true)}
        onOpenProfile={() => setViewProfileTarget({ id: myId, alias: myAlias, isMe: true })}
      />

      {/* 2. COMPOSER TRIGGER BAR (Ala Threads Murni: Tanpa Box, Garis Bawah Tipis, Mepet Kiri) */}
      <div 
        onClick={() => setIsComposerOpen(true)}
        className="pb-3.5 pt-0 mb-4 border-b border-border/70 cursor-pointer transition-colors flex items-start gap-3.5 select-none group hover:border-border"
      >
        {/* Avatar: Mepet ke kiri, bulat dengan angka ID (misal 765) atau inisial alias (misal PM) */}
        <div className="w-10 h-10 rounded-full border border-border/90 bg-surface/80 flex items-center justify-center font-mono text-xs text-text-primary font-bold shrink-0 tracking-tighter group-hover:border-accent/80 transition-colors">
          {getAvatarInitials(myId, myAlias)}
        </div>

        {/* Info Dua Baris: Baris 1 ID/Alias, Baris 2 Placeholder "Mulai bercerita..." */}
        <div className="flex-1 min-w-0 flex flex-col justify-center pt-0.5">
          <div className="flex items-center gap-1.5 font-mono text-xs text-text-primary font-semibold">
            <span>{myAlias || myId}</span>
            {myAlias && (
              <span className="text-[10px] text-text-secondary font-normal">
                [{myId}]
              </span>
            )}
          </div>
          <p className="text-sm font-sans text-text-secondary/60 group-hover:text-text-secondary transition-colors truncate mt-0.5">
            {draftContent ? `Draft: ${draftContent}` : 'Mulai bercerita...'}
          </p>
        </div>

        {/* Badge status kecil di ujung kanan */}
        <div className="shrink-0 self-center">
          <span className="font-mono text-[10px] text-text-secondary group-hover:text-accent border border-border/70 group-hover:border-accent/60 px-2 py-0.5 uppercase tracking-wider transition-colors">
            Post
          </span>
        </div>
      </div>

      {/* MODAL FOKUS MENULIS (Fullscreen di Mobile, Auto-draft, Dukungan Back Button HP) */}
      <TransmissionComposerModal
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        onSubmit={handlePostTransmission}
        myId={myId}
        myAlias={myAlias}
        draftContent={draftContent}
        onDraftChange={handleDraftChange}
        selectedTag={selectedVibe}
        onTagChange={setSelectedVibe}
        tagOptions={VIBE_OPTIONS}
        avatarInitials={getAvatarInitials(myId, myAlias)}
      />

      {/* 3. FEED (Aliran Cerita Bergaya Threads Minimalis via TransmissionItem) */}
      <div className="divide-y divide-border/60">
        {transmissions.length === 0 ? (
          <div className="py-16 text-center text-text-secondary font-mono text-xs uppercase tracking-widest">
            Belum ada transmisi. Jadilah yang pertama bercerita.
          </div>
        ) : (
          transmissions.map((tx) => (
            <TransmissionItem
              key={tx.id}
              transmission={tx}
              myId={myId}
              myAlias={myAlias}
              getAvatarInitials={getAvatarInitials}
              isThreadOpen={!!openThreads[tx.id]}
              onToggleThread={toggleThread}
              isReplying={activeReplyBox === tx.id}
              onToggleReply={(id) => setActiveReplyBox(activeReplyBox === id ? null : id)}
              replyInputValue={replyInput[tx.id] || ''}
              onReplyInputChange={(id, text) => setReplyInput(prev => ({ ...prev, [id]: text }))}
              onSubmitReply={handlePostReply}
              onDeleteTransmission={handleDeleteMyTx}
              onAuthorClick={(authorId, authorAlias) => {
                setViewProfileTarget({
                  id: authorId,
                  alias: authorAlias,
                  isMe: authorId === myId
                });
              }}
            />
          ))
        )}
      </div>

      {/* 4. MODAL INFO / ABOUT FREQUENCY (Klik tombol kiri header) */}
      {showInfoModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setShowInfoModal(false)}
        >
          <div 
            className="w-full max-w-md border border-border bg-surface p-6 sm:p-7 space-y-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-border/60 pb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-accent rounded-full" />
                <h3 className="font-display text-xl uppercase tracking-widest text-text-primary">
                  Tentang Frequency
                </h3>
              </div>
              <button 
                onClick={() => setShowInfoModal(false)}
                className="p-1 border border-border text-text-secondary hover:text-text-primary transition-colors"
              >
                <X size={15} />
              </button>
            </div>

            <div className="space-y-4 font-sans text-xs text-text-secondary leading-relaxed">
              <p>
                <strong className="text-text-primary font-mono">// 100% PSEUDONYMOUS & BEBAS</strong>
                <br />
                Frequency adalah ruang gema dua arah tempat siapapun bisa menuliskan sisi hidup yang jarang atau bahkan tidak pernah terlihat oleh dunia luar.
              </p>
              <p>
                <strong className="text-text-primary font-mono">// TANPA LOGIN & TANPA DATA PRIBADI</strong>
                <br />
                Kami tidak meminta email, kata sandi, maupun akun Google. Identitas sinyal Anda (<code className="text-accent font-mono">{myId}</code>) digenerate secara acak dan hanya tinggal di dalam peramban perangkat Anda.
              </p>
              <p>
                <strong className="text-text-primary font-mono">// RESONANSI (DUA ARAH)</strong>
                <br />
                Anda bisa membalas transmisi orang lain. Terkadang, Sorside juga ikut nimbrung dan merespons langsung catatan malam Anda.
              </p>
            </div>

            <div className="pt-2 border-t border-border/40">
              <button
                onClick={() => setShowInfoModal(false)}
                className="w-full py-2.5 bg-text-primary text-background font-mono text-xs uppercase tracking-widest hover:bg-accent transition-colors"
              >
                Tutup & Mulai Membaca
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. FULL-PAGE PROFIL SINYAL & ARSIP TRANSMISI (Sendiri maupun Pengunjung Lain) */}
      {viewProfileTarget && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-background">
          <UserProfileView
            targetUser={viewProfileTarget}
            onClose={() => setViewProfileTarget(null)}
            myId={myId}
            myAlias={myAlias}
            allTransmissions={transmissions}
            getAvatarInitials={getAvatarInitials}
            onUpdateAlias={handleUpdateAlias}
            onRegenerateId={handleRegenerateId}
            onDeleteTransmission={handleDeleteMyTx}
            openThreads={openThreads}
            onToggleThread={toggleThread}
            activeReplyBox={activeReplyBox}
            onToggleReply={(id) => setActiveReplyBox(activeReplyBox === id ? null : id)}
            replyInput={replyInput}
            onReplyInputChange={(id, text) => setReplyInput(prev => ({ ...prev, [id]: text }))}
            onSubmitReply={handlePostReply}
            onAuthorClick={(authorId, authorAlias) => {
              setViewProfileTarget({
                id: authorId,
                alias: authorAlias,
                isMe: authorId === myId
              });
            }}
            onSelectParentTransmission={(txId) => {
              // 1. Tutup tampilan profil
              setViewProfileTarget(null);
              // 2. Buka thread dari postingan yang dituju
              setOpenThreads(prev => ({ ...prev, [txId]: true }));
              // 3. Scroll halus ke postingan tersebut di feed
              setTimeout(() => {
                const el = document.getElementById(`transmission-${txId}`);
                if (el) {
                  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
              }, 120);
            }}
          />
        </div>
      )}

    </div>
  );
};
