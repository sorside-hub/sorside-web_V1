import React, { useState, useEffect } from 'react';
import { Plus, X, Search, RotateCcw } from 'lucide-react';
import { FrequencyHeader } from './components/FrequencyHeader';
import { FrequencyMenuDrawer } from './components/FrequencyMenuDrawer';
import { TransmissionComposerModal } from './components/TransmissionComposerModal';
import { TransmissionItem, Transmission, Reply } from './components/TransmissionItem';
import { TransmissionDetailModal } from './components/TransmissionDetailModal';
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
    timestamp: '14m',
    replies: [
      {
        id: 'rep-1-1',
        authorId: 'ss-109',
        content: 'Bener banget bro, terutama trek nomor 2. Suasana kamar langsung hening total.',
        timestamp: '9m'
      },
      {
        id: 'rep-1-2',
        authorId: 'ss-840',
        authorAlias: 'Pengelana Malam',
        content: 'Iya, distorsi gitarnya seperti bicara langsung ke pikiran yang lagi kusut.',
        timestamp: '4m',
        replyToId: 'ss-109',
        replyToName: 'ss-109'
      }
    ]
  },
  {
    id: 'tx-2',
    authorId: 'ss-312',
    tag: 'LELAH',
    content: 'Sisi yang gak pernah terlihat: gue selalu keliatan paling ceria di kantor, tapi tiap pulang ke kosan rasanya kosong banget. Ruang ini kerasa nyaman karena gak ada tuntutan buat terlihat bahagia.',
    timestamp: '1j',
    replies: [
      {
        id: 'rep-2-1',
        authorId: 'ss-001',
        authorAlias: 'Sorside',
        content: 'Terima kasih sudah membagi bebanmu di sini. Istirahat yang cukup malam ini.',
        timestamp: '48m'
      }
    ]
  },
  {
    id: 'tx-3',
    authorId: 'ss-774',
    authorAlias: 'Kamar Lantai 2',
    tag: 'NOSTALGIA',
    content: 'Suara distorsi analognya ngingetin gue sama rekaman pita kaset tua bapak gue di tahun 2000-an awal. Raw, jujur, dan apa adanya.',
    timestamp: '3j',
    replies: []
  }
];

const VIBE_OPTIONS = ['HENING', 'LELAH', 'NOSTALGIA', 'GELISAH', 'HARAP'];

export const Frequency: React.FC = () => {
  // User Identity State (Stored in LocalStorage)
  const [myId, setMyId] = useState('ss-582');
  const [myAlias, setMyAlias] = useState('');

  // Modals state
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [viewProfileTarget, setViewProfileTarget] = useState<UserProfileTarget | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Search state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Dedicated Post Detail Modal (Poin 3)
  const [selectedTransmission, setSelectedTransmission] = useState<Transmission | null>(null);
  const [initialReplyTarget, setInitialReplyTarget] = useState<{ id: string; name: string } | null>(null);

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

  // Floating Action Button (+) scroll detector (Poin 5)
  const [showScrollFAB, setShowScrollFAB] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Jika scroll lebih dari 120px ke bawah, munculkan tombol (+) melayang
      if (window.scrollY > 120) {
        setShowScrollFAB(true);
      } else {
        setShowScrollFAB(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // Sync dengan Firestore secara Real-Time
  useEffect(() => {
    const unsubscribe = subscribeTransmissions((remoteTransmissions) => {
      if (remoteTransmissions && remoteTransmissions.length > 0) {
        setTransmissions(remoteTransmissions);
        // Jika ada detail modal yang terbuka, sinkronkan juga datanya secara live
        setSelectedTransmission(prev => {
          if (!prev) return null;
          const updated = remoteTransmissions.find(t => t.id === prev.id);
          return updated || prev;
        });
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

      if (!localStorage.getItem('sorside_freq_created')) {
        const now = new Date();
        const formatted = `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`;
        localStorage.setItem('sorside_freq_created', formatted);
      }

      const alias = localStorage.getItem('sorside_freq_alias');
      if (alias) {
        setMyAlias(alias);
      }
    } catch {
      // ignore storage issues
    }
  }, []);

  const handleUpdateAlias = (newAlias: string) => {
    const clean = newAlias.trim();
    setMyAlias(clean);
    try {
      if (clean) {
        localStorage.setItem('sorside_freq_alias', clean);
      } else {
        localStorage.removeItem('sorside_freq_alias');
      }
    } catch {
      // ignore
    }
    if (viewProfileTarget?.isMe) {
      setViewProfileTarget(prev => prev ? { ...prev, alias: clean || undefined } : null);
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

  // Submit reply di dalam detail modal (Poin 3 & 4)
  const handleSubmitReply = async (txId: string, replyContent: string, replyTo?: { id: string; name: string }) => {
    const newReply: Reply = {
      id: `rep-${Date.now()}`,
      authorId: myId,
      authorAlias: myAlias || undefined,
      content: replyContent,
      timestamp: 'Baru saja',
      replyToId: replyTo?.id,
      replyToName: replyTo?.name
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

    // Update active modal view
    setSelectedTransmission(prev => {
      if (!prev || prev.id !== txId) return prev;
      return {
        ...prev,
        replies: [...prev.replies, newReply]
      };
    });

    // Push reply to Firestore
    try {
      await addReplyToFirestore(txId, newReply);
    } catch (err) {
      console.warn('[Frequency] Gagal kirim balasan ke Firestore, tetap ada di lokal:', err);
    }
  };

  const handleDeleteMyTx = async (id: string) => {
    setTransmissions(prev => prev.filter(t => t.id !== id));
    if (selectedTransmission?.id === id) {
      setSelectedTransmission(null);
    }

    try {
      await deleteTransmissionFromFirestore(id);
    } catch (err) {
      console.warn('[Frequency] Gagal hapus dari Firestore, tetap terhapus di lokal:', err);
    }
  };

  const getAvatarInitials = (id: string, alias?: string) => {
    if (alias && alias.trim()) {
      const parts = alias.trim().split(/\s+/);
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return alias.slice(0, 2).toUpperCase();
    }
    if (id.startsWith('ss-')) {
      return id.slice(3);
    }
    return id.slice(0, 3).toUpperCase();
  };

  // Buka detail post mandiri saat kartu atau tombol balas diklik
  const handleOpenDetail = (tx: Transmission, targetReplyUser?: { id: string; name: string }) => {
    setSelectedTransmission(tx);
    setInitialReplyTarget(targetReplyUser || null);
  };

  // Filter transmissions berdasarkan kata kunci / search
  const filteredTransmissions = searchQuery.trim()
    ? transmissions.filter(tx => {
        const q = searchQuery.toLowerCase().trim();
        return (
          tx.content.toLowerCase().includes(q) ||
          tx.authorId.toLowerCase().includes(q) ||
          (tx.authorAlias && tx.authorAlias.toLowerCase().includes(q)) ||
          (tx.tag && tx.tag.toLowerCase().includes(q))
        );
      })
    : transmissions;

  return (
    <div className="pb-24 max-w-xl mx-auto px-0 relative">
      
      {/* 1. COMPACT STICKY HEADER */}
      <FrequencyHeader 
        onToggleSearch={() => {
          setIsSearchOpen(prev => !prev);
          if (isSearchOpen) {
            setSearchQuery('');
          }
        }}
        isSearchOpen={isSearchOpen}
        onOpenMenu={() => setIsMenuOpen(true)}
      />

      {/* SEARCH BAR (Muncul saat tombol Search di kiri header aktif) */}
      {isSearchOpen && (
        <div className="mb-4 pb-3 border-b border-border/70 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="relative flex items-center">
            <Search size={15} className="absolute left-3 text-text-secondary/70 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari cerita, sinyal (ss-xxx), atau topik..."
              className="w-full bg-surface/70 border border-border/80 pl-9 pr-9 py-2.5 font-mono text-xs text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent focus:bg-surface transition-all"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 p-0.5 text-text-secondary hover:text-text-primary transition-colors"
                title="Hapus pencarian"
              >
                <X size={14} />
              </button>
            )}
          </div>
          {searchQuery.trim() && (
            <div className="flex items-center justify-between font-mono text-[11px] text-text-secondary/70 mt-2 px-1">
              <span>Menemukan {filteredTransmissions.length} sinyal</span>
              <button
                onClick={() => setSearchQuery('')}
                className="text-accent hover:underline"
              >
                Bersihkan
              </button>
            </div>
          )}
        </div>
      )}

      {/* 2. COMPOSER TRIGGER BAR (Hanya tampilkan ID jika belum ada Alias) */}
      <div 
        onClick={() => setIsComposerOpen(true)}
        className="pb-3.5 pt-0 mb-4 border-b border-border/70 cursor-pointer transition-colors flex items-start gap-3.5 select-none group hover:border-border"
      >
        <div className="w-10 h-10 rounded-full border border-border/90 bg-surface/80 flex items-center justify-center font-mono text-xs text-text-primary font-bold shrink-0 tracking-tighter group-hover:border-accent/80 transition-colors">
          {getAvatarInitials(myId, myAlias)}
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-center pt-0.5">
          <div className="flex items-center gap-1.5 font-mono text-xs text-text-primary font-semibold">
            {/* Jika punya alias tampilkan nama alias saja, ID disembunyikan */}
            <span>{myAlias || myId}</span>
          </div>
          <p className="text-sm font-sans text-text-secondary/60 group-hover:text-text-secondary transition-colors truncate mt-0.5">
            {draftContent ? `Draft: ${draftContent}` : 'Mulai bercerita...'}
          </p>
        </div>

        <div className="shrink-0 self-center">
          <span className="font-mono text-[10px] text-text-secondary group-hover:text-accent border border-border/70 group-hover:border-accent/60 px-2 py-0.5 uppercase tracking-wider transition-colors">
            Post
          </span>
        </div>
      </div>

      {/* MODAL FOKUS MENULIS */}
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

      {/* 3. FEED TRANSMISI (Klik card atau balas langsung buka modal mandiri) */}
      <div className="divide-y divide-border/60">
        {filteredTransmissions.length === 0 ? (
          <div className="py-16 text-center text-text-secondary font-mono text-xs uppercase tracking-widest space-y-2">
            {searchQuery.trim() ? (
              <>
                <p>Tidak ada transmisi yang cocok dengan "{searchQuery}".</p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-accent hover:underline lowercase tracking-normal text-[11px]"
                >
                  bersihkan pencarian
                </button>
              </>
            ) : (
              <p>Belum ada transmisi. Jadilah yang pertama bercerita.</p>
            )}
          </div>
        ) : (
          filteredTransmissions.map((tx) => (
            <TransmissionItem
              key={tx.id}
              transmission={tx}
              myId={myId}
              myAlias={myAlias}
              getAvatarInitials={getAvatarInitials}
              onOpenDetail={handleOpenDetail}
              onQuickReply={(targetTx) => handleOpenDetail(targetTx)}
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

      {/* 4. FLOATING ACTION BUTTON (+) CERDAS */}
      {showScrollFAB && (
        <div className="fixed bottom-6 right-6 sm:right-10 z-40 animate-in fade-in zoom-in-95 duration-200">
          <button
            type="button"
            onClick={() => setIsComposerOpen(true)}
            className="w-13 h-13 p-3.5 bg-text-primary text-background rounded-full shadow-2xl hover:bg-accent hover:scale-105 active:scale-95 transition-all flex items-center justify-center border-2 border-background/20"
            aria-label="Pancarkan Sinyal Baru"
            title="Pancarkan Sinyal Baru"
          >
            <Plus size={24} strokeWidth={2.5} />
          </button>
        </div>
      )}

      {/* 5. FULL-PAGE PROFIL SINYAL & ARSIP TRANSMISI */}
      {viewProfileTarget && (
        <div className="fixed inset-0 z-40 overflow-y-auto bg-background">
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
            onOpenTransmissionDetail={(tx) => {
              setSelectedTransmission(tx);
            }}
            onOpenComposer={() => setIsComposerOpen(true)}
            onAuthorClick={(authorId, authorAlias) => {
              setViewProfileTarget({
                id: authorId,
                alias: authorAlias,
                isMe: authorId === myId
              });
            }}
          />
        </div>
      )}

      {/* 6. DEDICATED POST VIEW / MODAL POST MANDIRI (Stack di atas Profile jika dibuka dari profil) */}
      {selectedTransmission && (
        <TransmissionDetailModal
          transmission={selectedTransmission}
          onClose={() => {
            setSelectedTransmission(null);
            setInitialReplyTarget(null);
          }}
          myId={myId}
          myAlias={myAlias}
          getAvatarInitials={getAvatarInitials}
          onSubmitReply={handleSubmitReply}
          onDeleteTransmission={handleDeleteMyTx}
          initialReplyTarget={initialReplyTarget}
          onAuthorClick={(authorId, authorAlias) => {
            setViewProfileTarget({
              id: authorId,
              alias: authorAlias,
              isMe: authorId === myId
            });
          }}
        />
      )}

      {/* 7. MODAL INFO / ABOUT FREQUENCY */}
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
                Identitas sinyal Anda (<code className="text-accent font-mono">{myId}</code>) digenerate secara acak dan hanya tinggal di dalam peramban perangkat Anda.
              </p>
              <p>
                <strong className="text-text-primary font-mono">// RESONANSI (DUA ARAH)</strong>
                <br />
                Anda bisa membaca, membalas, dan merespons cerita pengunjung lain secara leluasa.
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

      {/* 8. DRAWER SIDEBAR MENU (Garis Tiga) */}
      <FrequencyMenuDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        myId={myId}
        myAlias={myAlias}
        avatarInitials={getAvatarInitials(myId, myAlias)}
        onOpenProfile={() => setViewProfileTarget({ id: myId, alias: myAlias, isMe: true })}
        onOpenInfo={() => setShowInfoModal(true)}
        onRegenerateId={handleRegenerateId}
      />

    </div>
  );
};
