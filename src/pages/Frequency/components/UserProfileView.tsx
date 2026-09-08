import React, { useEffect, useState } from 'react';
import { ArrowLeft, Edit3, Check, RefreshCw, MessageSquare, Plus, UserPlus, LogOut } from 'lucide-react';
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
  onOpenTransmissionDetail: (tx: Transmission) => void;
  onOpenComposer: () => void;
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
  onOpenTransmissionDetail,
  onOpenComposer,
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

  // Sinkronkan input form saat alias berubah
  useEffect(() => {
    setEditAliasVal(targetUser.alias || '');
  }, [targetUser.alias]);

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

  const handleRemoveAlias = () => {
    if (confirm('Lepas nama alias dan kembali menggunakan ID acak?')) {
      if (onUpdateAlias) {
        onUpdateAlias('');
      }
      setEditAliasVal('');
      setIsEditingAlias(false);
    }
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

  // 3. First Signal Detected calculation
  const getFirstSignalDate = () => {
    if (targetUser.isMe) {
      const stored = localStorage.getItem('sorside_freq_created');
      if (stored) return stored;
    }
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
      {/* 1. TOP BAR NAVIGASI (Sticky Minimalis) */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border/80 px-4 py-3 mb-6">
        <div className="max-w-xl mx-auto relative flex items-center justify-between min-h-[40px]">
          {/* Tombol Back Kiri */}
          <button
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-border/80 hover:border-text-primary text-text-secondary hover:text-text-primary transition-colors z-10"
            aria-label="Kembali ke Feed"
          >
            <ArrowLeft size={18} />
          </button>

          {/* Judul Center Presisi Sempurna */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-text-secondary font-medium">
              {targetUser.isMe ? 'PROFIL ANDA' : 'SINYAL PENGUNJUNG'}
            </span>
          </div>

          <div className="w-10 h-10" />
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 sm:px-0 space-y-6">
        {/* 2. KARTU IDENTITAS FREKUENSI (SUPER BERSIH - TANPA LABEL DO своего / ALIAS ACTIVE) */}
        <div className="border-b border-border/70 pb-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full border border-border/90 bg-surface/80 flex items-center justify-center font-mono text-base font-bold text-text-primary tracking-tighter shrink-0">
              {displayAvatar}
            </div>

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

              {/* Tanggal Sinyal Pertama - Langsung bersih tanpa embel-embel "ID:" atau "Alias Active" */}
              <div className="font-mono text-[11px] text-text-secondary/80">
                <span>Sinyal pertama terdeteksi: </span>
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
                <div className="flex items-center gap-2.5 flex-wrap">
                  <button
                    onClick={() => setIsEditingAlias(true)}
                    className="font-mono text-xs text-text-secondary hover:text-text-primary flex items-center gap-1.5 py-1.5 px-3 border border-border/70 hover:border-border transition-colors uppercase tracking-wider bg-surface/40"
                  >
                    <Edit3 size={12} />
                    <span>Ubah Alias</span>
                  </button>

                  <button
                    onClick={handleRemoveAlias}
                    className="font-mono text-xs text-text-secondary hover:text-red-400 flex items-center gap-1.5 py-1.5 px-3 border border-border/70 hover:border-red-400/60 transition-colors uppercase tracking-wider"
                    title="Hapus alias dan kembali menggunakan ID acak"
                  >
                    <LogOut size={12} />
                    <span>Lepas Alias (Pakai ID)</span>
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

                  {onRegenerateId && (
                    <button
                      onClick={onRegenerateId}
                      className="font-mono text-xs text-text-secondary hover:text-text-primary flex items-center gap-1.5 py-1.5 px-3 border border-border/70 hover:border-border transition-colors uppercase tracking-wider"
                      title="Ganti angka acak ID perangkat ini"
                    >
                      <RefreshCw size={12} />
                      <span>Acak Ulang ID</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 2.2 TOMBOL BUAT POST DARI PROFIL ANDA */}
        {targetUser.isMe && (
          <div 
            onClick={onOpenComposer}
            className="p-3.5 border border-dashed border-border hover:border-accent/80 bg-surface/30 hover:bg-surface/60 transition-all cursor-pointer flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center font-mono text-xs font-bold text-text-primary group-hover:border-accent">
                {displayAvatar}
              </div>
              <div>
                <p className="font-mono text-xs font-semibold text-text-primary group-hover:text-accent transition-colors">
                  Pancarkan Sinyal Baru...
                </p>
                <p className="text-[11px] font-sans text-text-secondary">
                  Tulis catatan atau cerita dari frekuensi profil Anda
                </p>
              </div>
            </div>

            <div className="w-8 h-8 rounded-full bg-text-primary text-background group-hover:bg-accent flex items-center justify-center transition-colors">
              <Plus size={16} />
            </div>
          </div>
        )}

        {/* 3. TAB NAVIGASI ARSIP (Transmisi vs Resonansi) */}
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
                  onOpenDetail={onOpenTransmissionDetail}
                  onQuickReply={() => onOpenTransmissionDetail(tx)}
                  onDeleteTransmission={onDeleteTransmission}
                  onAuthorClick={onAuthorClick}
                />
              ))
            )}
          </div>
        )}

        {/* 5. KONTEN TAB: RESONANSI */}
        {activeTab === 'comments' && (
          <div className="divide-y divide-border/60">
            {userComments.length === 0 ? (
              <div className="py-16 text-center text-text-secondary/70 font-mono text-xs uppercase tracking-widest">
                Belum ada resonansi yang ditinggalkan.
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

                  <div className="pl-3 border-l border-border/80 group-hover:border-accent/60 transition-colors py-0.5">
                    <p className="font-sans text-xs text-text-secondary/60 line-clamp-1 italic">
                      "{parentTx.content}"
                    </p>
                  </div>

                  <p className="font-sans text-sm text-text-secondary group-hover:text-text-primary transition-colors leading-relaxed">
                    {reply.content}
                  </p>

                  <div className="pt-0.5 flex items-center justify-between text-xs font-mono text-text-secondary/60">
                    <span className="text-[11px] text-accent flex items-center gap-1">
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
