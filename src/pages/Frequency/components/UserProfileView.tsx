import React, { useEffect, useState } from 'react';
import { ArrowLeft, Edit3, Check, RefreshCw, MessageSquare } from 'lucide-react';
import { Transmission, TransmissionItem } from './TransmissionItem';

export interface UserProfileTarget {
  id: string;
  alias?: string;
  isMe: boolean;
}

interface UserProfileViewProps {
  targetUser: UserProfileTarget;
  onClose: () => void;
  myId: string;
  myAlias?: string;
  allTransmissions: Transmission[];
  getAvatarInitials: (id: string, alias?: string) => string;
  onUpdateAlias?: (newAlias: string) => void;
  onRegenerateId?: () => void;
  onDeleteTransmission: (id: string) => void;
  // Handler interaksi feed yang tetap jalan di dalam profil
  openThreads: Record<string, boolean>;
  onToggleThread: (id: string) => void;
  activeReplyBox: string | null;
  onToggleReply: (id: string) => void;
  replyInput: Record<string, string>;
  onReplyInputChange: (id: string, text: string) => void;
  onSubmitReply: (id: string, e: React.FormEvent) => void;
  onAuthorClick: (authorId: string, authorAlias?: string) => void;
  onSelectParentTransmission?: (txId: string) => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  targetUser,
  onClose,
  myId,
  myAlias,
  allTransmissions,
  getAvatarInitials,
  onUpdateAlias,
  onRegenerateId,
  onDeleteTransmission,
  openThreads,
  onToggleThread,
  activeReplyBox,
  onToggleReply,
  replyInput,
  onReplyInputChange,
  onSubmitReply,
  onAuthorClick,
  onSelectParentTransmission,
}) => {
  const [activeTab, setActiveTab] = useState<'transmissions' | 'comments'>('transmissions');
  const [isEditingAlias, setIsEditingAlias] = useState(false);
  const [editAliasVal, setEditAliasVal] = useState(targetUser.alias || '');

  // Dukungan tombol Back HP / browser (popstate)
  useEffect(() => {
    window.history.pushState({ profileOpen: true, targetId: targetUser.id }, '');

    const handlePopState = () => {
      onClose();
    };

    window.addEventListener('popstate', handlePopState);
    window.scrollTo({ top: 0, behavior: 'instant' });

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [targetUser.id, onClose]);

  const handleBack = () => {
    if (window.history.state?.profileOpen) {
      window.history.back();
    } else {
      onClose();
    }
  };

  const handleSaveAliasSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateAlias) {
      onUpdateAlias(editAliasVal.trim());
    }
    setIsEditingAlias(false);
  };

  // 1. Ambil semua transmisi yang dibuat oleh user ini
  const userTransmissions = allTransmissions.filter(
    (tx) => tx.authorId === targetUser.id
  );

  // 2. Ambil semua komentar/balasan yang dibuat oleh user ini di transmisi orang lain
  const userComments: { reply: any; parentTx: Transmission }[] = [];
  allTransmissions.forEach((tx) => {
    tx.replies.forEach((r) => {
      if (r.authorId === targetUser.id) {
        userComments.push({ reply: r, parentTx: tx });
      }
    });
  });

  // 3. First Signal Detected calculation
  const getFirstSignalDate = () => {
    if (targetUser.isMe) {
      const stored = localStorage.getItem('sorside_freq_created');
      if (stored) return stored;
    }
    // Jika user lain, ambil tanggal dari postingan atau komentar pertamanya
    if (userTransmissions.length > 0) {
      const first = userTransmissions[userTransmissions.length - 1];
      return first.timestamp || '02.09.2026';
    }
    if (userComments.length > 0) {
      return userComments[userComments.length - 1].reply.timestamp || '04.09.2026';
    }
    return '04.09.2026';
  };

  const displayAvatar = getAvatarInitials(targetUser.id, targetUser.alias);
  const displayName = targetUser.alias || targetUser.id;
  const firstSignalText = getFirstSignalDate();

  return (
    <div className="min-h-screen bg-background text-text-primary pb-24 animate-in fade-in duration-150">
      {/* 1. TOP BAR NAVIGASI (Sticky Minimalis - Cukup Icon Panah, Bersih Tanpa Teks & Tanpa Badge) */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border/80 px-4 py-3 mb-6">
        <div className="max-w-xl mx-auto relative flex items-center justify-between min-h-[40px]">
          {/* Tombol Back Kiri: Icon Saja dengan Touch Target Nyaman */}
          <button
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-border/80 hover:border-text-primary text-text-secondary hover:text-text-primary transition-colors z-10"
            aria-label="Kembali ke Feed"
          >
            <ArrowLeft size={18} />
          </button>

          {/* Judul Center Presisi Sempurna (Absolute Center) */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-text-secondary font-medium">
              {targetUser.isMe ? 'PROFIL ANDA' : 'SINYAL PENGUNJUNG'}
            </span>
          </div>

          {/* Spacer Kanan agar Flex Balance */}
          <div className="w-10 h-10" />
        </div>
      </div>

      <div className="max-w-xl mx-auto px-2 sm:px-0 space-y-6">
        {/* 2. KARTU IDENTITAS FREKUENSI */}
        <div className="border-b border-border/70 pb-6 space-y-4">
          <div className="flex items-start gap-4">
            {/* Avatar Besar Senada */}
            <div className="w-14 h-14 rounded-full border border-border/90 bg-surface/80 flex items-center justify-center font-mono text-base font-bold text-text-primary tracking-tighter shrink-0">
              {displayAvatar}
            </div>

            {/* Detail Identitas */}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="font-mono text-base sm:text-lg font-bold text-text-primary truncate">
                  {displayName}
                </h1>
                {targetUser.isMe && (
                  <span className="font-mono text-[10px] text-accent border border-accent/60 px-1 py-0.2 uppercase shrink-0">
                    Anda
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 font-mono text-xs text-text-secondary">
                <span>ID: {targetUser.id}</span>
                {targetUser.alias && <span>• Alias Aktif</span>}
              </div>

              {/* FIRST SIGNAL DETECTED */}
              <div className="font-mono text-[11px] text-text-secondary/80 pt-0.5">
                <span>Sinyal pertama terdeteksi: </span>
                <span className="text-text-primary">{firstSignalText}</span>
              </div>
            </div>
          </div>

          {/* Opsi Khusus Akun Sendiri: Edit Alias Cepat */}
          {targetUser.isMe && (
            <div className="pt-2">
              {isEditingAlias ? (
                <form onSubmit={handleSaveAliasSubmit} className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={editAliasVal}
                    onChange={(e) => setEditAliasVal(e.target.value)}
                    placeholder="Tulis alias baru (contoh: Penatap Bintang)..."
                    maxLength={25}
                    autoFocus
                    className="flex-1 bg-surface border border-border px-3 py-1.5 font-sans text-xs text-text-primary focus:outline-none focus:border-accent"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-text-primary text-background hover:bg-accent font-mono text-xs uppercase tracking-wider font-semibold transition-colors flex items-center gap-1"
                  >
                    <Check size={12} />
                    <span>Simpan</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingAlias(false)}
                    className="px-2 py-1.5 border border-border text-text-secondary font-mono text-xs uppercase"
                  >
                    Batal
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsEditingAlias(true)}
                    className="font-mono text-xs text-text-secondary hover:text-text-primary flex items-center gap-1.5 py-1 px-2 border border-border/70 hover:border-border transition-colors uppercase tracking-wider"
                  >
                    <Edit3 size={12} />
                    <span>Ubah Nama Alias</span>
                  </button>

                  {onRegenerateId && (
                    <button
                      onClick={onRegenerateId}
                      className="font-mono text-xs text-text-secondary hover:text-accent flex items-center gap-1.5 py-1 px-2 border border-border/70 hover:border-accent/60 transition-colors uppercase tracking-wider"
                      title="Ganti angka acak ID perangkat ini"
                    >
                      <RefreshCw size={12} />
                      <span>Acak ID</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3. TAB NAVIGASI ARSIP (Transmisi vs Resonansi - POSISI CENTER SIMETRIS) */}
        <div className="flex justify-center border-b border-border/70 font-mono text-xs">
          <div className="flex items-center gap-8">
            <button
              onClick={() => setActiveTab('transmissions')}
              className={`pb-3 px-2 uppercase tracking-wider transition-colors border-b-2 -mb-[1px] ${
                activeTab === 'transmissions'
                  ? 'border-accent text-accent font-bold'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              Transmisi ({userTransmissions.length})
            </button>

            <button
              onClick={() => setActiveTab('comments')}
              className={`pb-3 px-2 uppercase tracking-wider transition-colors border-b-2 -mb-[1px] ${
                activeTab === 'comments'
                  ? 'border-accent text-accent font-bold'
                  : 'border-transparent text-text-secondary hover:text-text-primary'
              }`}
            >
              Resonansi ({userComments.length})
            </button>
          </div>
        </div>

        {/* 4. KONTEN TAB: TRANSMISI */}
        {activeTab === 'transmissions' && (
          <div className="divide-y divide-border/60">
            {userTransmissions.length === 0 ? (
              <div className="py-16 text-center text-text-secondary/70 font-mono text-xs uppercase tracking-widest">
                Belum ada transmisi dari sinyal ini.
              </div>
            ) : (
              userTransmissions.map((tx) => (
                <TransmissionItem
                  key={tx.id}
                  transmission={tx}
                  myId={myId}
                  myAlias={myAlias}
                  getAvatarInitials={getAvatarInitials}
                  isThreadOpen={!!openThreads[tx.id]}
                  onToggleThread={onToggleThread}
                  isReplying={activeReplyBox === tx.id}
                  onToggleReply={onToggleReply}
                  replyInputValue={replyInput[tx.id] || ''}
                  onReplyInputChange={onReplyInputChange}
                  onSubmitReply={onSubmitReply}
                  onDeleteTransmission={onDeleteTransmission}
                  onAuthorClick={onAuthorClick}
                />
              ))
            )}
          </div>
        )}

        {/* 5. KONTEN TAB: RESONANSI (Bisa Diklik & Melompat Langsung ke Postingan Utama) */}
        {activeTab === 'comments' && (
          <div className="space-y-3 pt-1">
            {userComments.length === 0 ? (
              <div className="py-16 text-center text-text-secondary/70 font-mono text-xs uppercase tracking-widest">
                Belum ada resonansi yang ditinggalkan.
              </div>
            ) : (
              userComments.map(({ reply, parentTx }) => (
                <div
                  key={reply.id}
                  onClick={() => {
                    if (onSelectParentTransmission) {
                      onSelectParentTransmission(parentTx.id);
                    }
                  }}
                  className="group border border-border/70 hover:border-accent/80 p-4 bg-surface/30 hover:bg-surface/60 transition-all cursor-pointer space-y-2.5"
                >
                  {/* Indikator Menjawab Siapa & Waktu */}
                  <div className="font-mono text-[11px] text-text-secondary flex items-center justify-between border-b border-border/40 pb-2">
                    <div className="flex items-center gap-1.5 truncate">
                      <MessageSquare size={12} className="text-accent shrink-0" />
                      <span className="truncate">
                        Membalas cerita <strong className="text-text-primary group-hover:text-accent transition-colors">{parentTx.authorAlias || parentTx.authorId}</strong>
                      </span>
                    </div>
                    <span className="text-text-secondary/70 shrink-0 text-[10px]">{reply.timestamp}</span>
                  </div>

                  {/* Cuplikan Post Asli */}
                  <div className="bg-background/50 p-2 border-l-2 border-border group-hover:border-accent/60 transition-colors">
                    <p className="font-sans text-xs text-text-secondary/70 line-clamp-1 italic">
                      "{parentTx.content}"
                    </p>
                  </div>

                  {/* Isi Resonansi/Komentar User */}
                  <p className="font-sans text-sm text-text-secondary group-hover:text-text-primary transition-colors leading-relaxed pt-0.5">
                    {reply.content}
                  </p>

                  <div className="pt-1 flex items-center justify-end font-mono text-[10px] text-text-secondary/60 group-hover:text-accent transition-colors">
                    <span>Lihat percakapan penuh →</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
