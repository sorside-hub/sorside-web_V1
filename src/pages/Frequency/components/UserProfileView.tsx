import React, { useEffect, useState, useRef } from 'react';
import { ArrowLeft, Edit3, Check, MessageSquare, Plus, UserPlus, LogOut } from 'lucide-react';
import { Transmission, TransmissionItem } from './TransmissionItem';
import { formatJoinDate } from '../../../utils/timeAgo';

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
  getAvatarInitials: (id: string, alias?: string) => React.ReactNode;
  onUpdateAlias?: (newAlias: string) => void;
  onDeleteTransmission: (id: string) => void;
  onOpenTransmissionDetail: (tx: Transmission) => void;
  onOpenComposer: () => void;
  onAuthorClick: (authorId: string, authorAlias?: string) => void;
  onSelectParentTransmission?: (txId: string) => void;
  originIds?: string[];
  userCreatedDates?: Record<string, number>;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({
  targetUser,
  onClose,
  myId,
  myAlias,
  allTransmissions,
  getAvatarInitials,
  onUpdateAlias,
  onDeleteTransmission,
  onOpenTransmissionDetail,
  onOpenComposer,
  onAuthorClick,
  onSelectParentTransmission,
  originIds = [],
  userCreatedDates = {},
}) => {
  const [activeTab, setActiveTab] = useState<'transmissions' | 'comments'>('transmissions');
  const [isEditingAlias, setIsEditingAlias] = useState(false);
  const [editAliasVal, setEditAliasVal] = useState(targetUser.alias || '');
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);

  // Scroll to top saat user target berubah
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [targetUser.id]);

  // Sinkronkan input form saat alias berubah
  useEffect(() => {
    setEditAliasVal(targetUser.alias || '');
  }, [targetUser.alias]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartXRef.current = e.touches[0].clientX;
      touchStartYRef.current = e.touches[0].clientY;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.changedTouches.length === 1) {
      const deltaX = e.changedTouches[0].clientX - touchStartXRef.current;
      const deltaY = e.changedTouches[0].clientY - touchStartYRef.current;

      // Edge swipe dari tepi kiri (X <= 45px) ke kanan untuk kembali (Back)
      if (touchStartXRef.current <= 45 && deltaX > 60 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
        handleBack();
      }
    }
  };

  const handleBack = () => {
    onClose();
  };

  const handleSaveAliasSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateAlias) {
      onUpdateAlias(editAliasVal.trim());
    }
    setIsEditingAlias(false);
  };

  const handleRemoveAlias = () => {
    if (onUpdateAlias) {
      onUpdateAlias('');
    }
    setEditAliasVal('');
    setIsEditingAlias(false);
  };

  // 1. Ambil semua transmisi yang dibuat oleh user ini
  const userTransmissions = allTransmissions.filter(
    (tx) => tx.authorId === targetUser.id
  );

  // 2. Ambil semua komentar/balasan yang dibuat oleh user ini di transmisi
  const userComments: { reply: any; parentTx: Transmission }[] = [];
  allTransmissions.forEach((tx) => {
    tx.replies.forEach((r) => {
      if (r.authorId === targetUser.id) {
        userComments.push({ reply: r, parentTx: tx });
      }
    });
  });

  // 3. First Signal Detected calculation (True Join Date)
  const getFirstSignalDate = () => {
    // A. Cek dari mapping Firestore terlebih dahulu
    const directCreated = userCreatedDates[targetUser.id];
    if (directCreated) {
      return formatJoinDate(directCreated);
    }

    // B. Khusus Freq-999 (Origin Sorside)
    if (targetUser.id === 'Freq-999') {
      return '01.09.2024';
    }

    // C. Jika profil diri sendiri dan ada di localStorage
    if (targetUser.isMe) {
      const stored = localStorage.getItem('sorside_freq_created');
      if (stored) return formatJoinDate(stored);
    }

    // D. Jika ada transmisi terdahulu yang memiliki data createdAt timestamp
    for (let i = userTransmissions.length - 1; i >= 0; i--) {
      const tx = userTransmissions[i];
      if ((tx as any).createdAt) {
        return formatJoinDate((tx as any).createdAt);
      }
    }

    // E. Jika ada balasan terdahulu yang memiliki data createdAt timestamp
    for (let i = userComments.length - 1; i >= 0; i--) {
      const c = userComments[i];
      if (c.reply && c.reply.createdAt) {
        return formatJoinDate(c.reply.createdAt);
      }
    }

    return '02.09.2026';
  };

  const displayAvatar = getAvatarInitials(targetUser.id, targetUser.alias);
  const displayName = targetUser.alias || targetUser.id;
  const firstSignalText = getFirstSignalDate();

  return (
    <div 
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="min-h-screen bg-background text-text-primary pb-24 animate-in fade-in duration-150"
    >
      {/* 1. TOP BAR NAVIGASI (Hidden di Mobile, Back saja di Desktop) */}
      <div className="hidden sm:block sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border/80 px-4 py-3 mb-6">
        <div className="max-w-xl mx-auto flex items-center justify-start min-h-[40px]">
          {/* Tombol Back Kiri */}
          <button
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-border/80 hover:border-text-primary text-text-secondary hover:text-text-primary transition-colors z-10"
            aria-label="Kembali ke Feed"
          >
            <ArrowLeft size={18} />
          </button>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 sm:px-0 sm:mt-0 mt-6">
        {/* 2. KARTU IDENTITAS FREKUENSI */}
        <div className="border-b border-border/70 pb-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full border border-border/90 bg-surface/80 flex items-center justify-center shrink-0 overflow-hidden">
              {displayAvatar}
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-mono text-base sm:text-lg font-bold text-text-primary truncate">
                  {displayName}
                </h1>
                {(originIds.includes(targetUser.id) || targetUser.id === 'Freq-999') && (
                  <span 
                    className="text-amber-400 text-sm font-bold leading-none inline-flex items-center shrink-0 select-none ml-0.5"
                    title="Origin Creator"
                  >
                    ✦
                  </span>
                )}
              </div>

              {/* ID subtext jika user menggunakan alias */}
              {targetUser.alias && (
                <div className="font-mono text-xs text-text-secondary">
                  <span>id: {targetUser.id}</span>
                </div>
              )}

              {/* Tanggal Sinyal Pertama */}
              <div className="font-mono text-[11px] text-text-secondary/80 pt-0.5">
                <span>Bergabung sejak: </span>
                <span className="text-text-primary">{firstSignalText}</span>
              </div>
            </div>
          </div>

          {/* 2.1 LOGIKA AKSI IDENTITAS (Hanya untuk akun sendiri) */}
          {targetUser.isMe && (
            <div className="pt-2">
              {isEditingAlias ? (
                /* Form Pasang / Ubah Alias */
                <form onSubmit={handleSaveAliasSubmit} className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={editAliasVal}
                    onChange={(e) => setEditAliasVal(e.target.value)}
                    placeholder={targetUser.alias ? "Ubah nama alias..." : "Tulis nama alias (contoh: Penatap Bintang)..."}
                    maxLength={25}
                    autoFocus
                    className="flex-1 bg-surface border border-border px-3 py-1.5 font-sans text-xs text-text-primary focus:outline-none focus:border-accent"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-text-primary text-background hover:bg-accent font-mono text-xs uppercase tracking-wider font-semibold transition-colors flex items-center gap-1 shrink-0"
                  >
                    <Check size={12} />
                    <span>Simpan</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditAliasVal(targetUser.alias || '');
                      setIsEditingAlias(false);
                    }}
                    className="px-2.5 py-1.5 border border-border text-text-secondary hover:text-text-primary font-mono text-xs uppercase shrink-0"
                  >
                    Batal
                  </button>
                </form>
              ) : targetUser.alias ? (
                /* KONDISI B: Pengguna sedang menggunakan nama ALIAS */
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditingAlias(true)}
                    className="font-mono text-xs text-text-secondary hover:text-text-primary flex items-center gap-1.5 py-1.5 px-2.5 sm:px-3 border border-border/70 hover:border-border transition-colors uppercase tracking-wider bg-surface/40 whitespace-nowrap"
                  >
                    <Edit3 size={12} />
                    <span>Ubah Alias</span>
                  </button>

                  <button
                    onClick={handleRemoveAlias}
                    className="font-mono text-xs text-text-secondary hover:text-red-400 flex items-center gap-1.5 py-1.5 px-2.5 sm:px-3 border border-border/70 hover:border-red-400/60 transition-colors uppercase tracking-wider whitespace-nowrap"
                    title="Hapus alias dan kembali menggunakan ID"
                  >
                    <LogOut size={12} />
                    <span>Lepas Alias</span>
                  </button>
                </div>
              ) : (
                /* KONDISI A: Pengguna sedang menggunakan ID acak murni */
                <div className="flex items-center gap-2.5 flex-wrap">
                  <button
                    onClick={() => setIsEditingAlias(true)}
                    className="font-mono text-xs text-text-primary hover:text-accent flex items-center gap-1.5 py-1.5 px-3 border border-border hover:border-accent transition-colors uppercase tracking-wider bg-surface/50 font-medium"
                  >
                    <UserPlus size={12} className="text-accent" />
                    <span>Pasang Nama Alias</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3. TAB NAVIGASI ARSIP (Transmisi vs Resonansi) */}
        <div className="flex items-center border-b border-border/70 font-mono text-xs overflow-x-auto hide-scrollbar mt-3">
          {targetUser.isMe && (
            <div className="pb-3 pr-6 shrink-0">
              <button
                onClick={onOpenComposer}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-text-primary text-background hover:bg-accent transition-colors shadow-sm"
                aria-label="Tulis Cerita Baru"
                title="Tulis Cerita Baru"
              >
                <Plus size={14} strokeWidth={2.5} />
              </button>
            </div>
          )}
          <div className="flex items-center gap-8 justify-center sm:justify-start min-w-max w-full sm:w-auto pb-3">
            <button
              onClick={() => setActiveTab('transmissions')}
              className={`px-2 uppercase tracking-wider transition-colors relative ${
                activeTab === 'transmissions'
                  ? 'text-text-primary font-bold'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Cerita ({userTransmissions.length})
              {activeTab === 'transmissions' && (
                <span className="absolute -bottom-3 left-0 right-0 h-[2px] bg-accent"></span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('comments')}
              className={`px-2 uppercase tracking-wider transition-colors relative ${
                activeTab === 'comments'
                  ? 'text-text-primary font-bold'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Balasan ({userComments.length})
              {activeTab === 'comments' && (
                <span className="absolute -bottom-3 left-0 right-0 h-[2px] bg-accent"></span>
              )}
            </button>
          </div>
        </div>

        {/* 4. KONTEN TAB: TRANSMISI */}
        {activeTab === 'transmissions' && (
          <div className="divide-y divide-border/60 mt-4">
            {userTransmissions.length === 0 ? (
              <div className="py-16 text-center text-text-secondary/70 font-mono text-xs uppercase tracking-widest">
                Belum ada cerita dari pengguna ini.
              </div>
            ) : (
              userTransmissions.map((tx) => (
                <TransmissionItem
                  key={tx.id}
                  transmission={tx}
                  myId={myId}
                  myAlias={myAlias}
                  getAvatarInitials={getAvatarInitials}
                  onOpenDetail={onOpenTransmissionDetail}
                  onQuickReply={() => onOpenTransmissionDetail(tx)}
                  onDeleteTransmission={onDeleteTransmission}
                  onAuthorClick={onAuthorClick}
                  originIds={originIds}
                />
              ))
            )}
          </div>
        )}

        {/* 5. KONTEN TAB: RESONANSI */}
        {activeTab === 'comments' && (
          <div className="divide-y divide-border/60 mt-4">
            {userComments.length === 0 ? (
              <div className="py-16 text-center text-text-secondary/70 font-mono text-xs uppercase tracking-widest">
                Belum ada balasan yang ditulis.
              </div>
            ) : (
              userComments.map(({ reply, parentTx }) => (
                <div
                  key={reply.id}
                  onClick={() => {
                    onOpenTransmissionDetail(parentTx);
                  }}
                  className="py-4 hover:bg-surface/20 transition-colors cursor-pointer space-y-2 group"
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-1.5 truncate">
                      <MessageSquare size={12} className="text-accent shrink-0" />
                      <span className="text-text-secondary truncate">
                        Membalas <strong className="text-text-primary group-hover:text-accent transition-colors font-semibold">{parentTx.authorAlias || parentTx.authorId}</strong>
                      </span>
                    </div>
                    <span className="text-text-secondary/70 shrink-0 text-[11px] font-mono">{reply.timestamp}</span>
                  </div>

                  <div className="pl-3 border-l border-border/80 group-hover:border-text-secondary/60 transition-colors py-0.5">
                    <p className="font-sans text-xs text-text-secondary/60 line-clamp-1 italic">
                      "{parentTx.content}"
                    </p>
                  </div>

                  <p className="font-sans text-sm text-text-secondary group-hover:text-text-primary transition-colors leading-relaxed">
                    {reply.content}
                  </p>

                  <div className="pt-0.5 flex items-center justify-between text-xs font-mono text-text-secondary/60">
                    <span className="text-[11px] text-text-secondary/80 group-hover:text-text-primary transition-colors flex items-center gap-1">
                      Lihat percakapan utuh →
                    </span>
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
