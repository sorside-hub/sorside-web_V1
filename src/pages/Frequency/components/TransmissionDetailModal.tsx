import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, MessageSquare, Send, CornerDownRight, X, Trash2, ChevronRight } from 'lucide-react';
import { Transmission, Reply } from './TransmissionItem';

interface TransmissionDetailModalProps {
  transmission: Transmission | null;
  onClose: () => void;
  myId: string;
  myAlias?: string;
  getAvatarInitials: (id: string, alias?: string) => string;
  onSubmitReply: (txId: string, replyContent: string, replyTo?: { id: string; name: string }) => Promise<void>;
  onDeleteTransmission: (txId: string) => void;
  onAuthorClick?: (authorId: string, authorAlias?: string) => void;
  initialReplyTarget?: { id: string; name: string } | null;
}

export const TransmissionDetailModal: React.FC<TransmissionDetailModalProps> = ({
  transmission: tx,
  onClose,
  myId,
  myAlias,
  getAvatarInitials,
  onSubmitReply,
  onDeleteTransmission,
  onAuthorClick,
  initialReplyTarget = null,
}) => {
  const [replyText, setReplyText] = useState('');
  const [targetReply, setTargetReply] = useState<{ id: string; name: string } | null>(initialReplyTarget);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);

  // Sync initial target jika berubah
  useEffect(() => {
    if (initialReplyTarget) {
      setTargetReply(initialReplyTarget);
      inputRef.current?.focus();
    }
  }, [initialReplyTarget]);

  // Scroll to top saat modal muncul
  useEffect(() => {
    if (tx) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [tx?.id]);

  if (!tx) return null;

  const isMyPost = tx.authorId === myId;
  const primaryId = tx.authorAlias || tx.authorId;

  const handleBack = () => {
    onClose();
  };

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

  const handleSetReplyTo = (replyAuthorId: string, replyAuthorAlias?: string) => {
    const name = replyAuthorAlias || replyAuthorId;
    setTargetReply({ id: replyAuthorId, name });
    inputRef.current?.focus();
  };

  const handleClearReplyTo = () => {
    setTargetReply(null);
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = replyText.trim();
    if (!content || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onSubmitReply(tx.id, content, targetReply || undefined);
      setReplyText('');
      setTargetReply(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="fixed inset-0 z-50 bg-background overflow-y-auto pb-28 animate-in fade-in duration-150"
    >
      {/* 1. TOP NAV BAR (Sticky Ala Sosmed Modern) */}
      <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border/80 px-4 py-3 mb-4">
        <div className="max-w-xl mx-auto relative flex items-center justify-between min-h-[40px]">
          {/* Tombol Back */}
          <button
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-border/80 hover:border-text-primary text-text-secondary hover:text-text-primary transition-colors z-10"
            aria-label="Kembali ke Feed"
          >
            <ArrowLeft size={18} />
          </button>

          {/* Title Center */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-text-secondary font-medium">
              TRANSMISI
            </span>
          </div>

          <div className="w-10 h-10" />
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 sm:px-0 space-y-6">
        {/* 2. POSTINGAN UTAMA (DEDICATED FULL VIEW) */}
        <div className="space-y-4 border-b border-border/70 pb-6">
          {/* Header Penulis: Jika punya alias tampilkan alias saja, jika belum set alias tampilkan ID */}
          <div className="flex items-center gap-3">
            <div
              onClick={() => onAuthorClick?.(tx.authorId, tx.authorAlias)}
              className={`w-11 h-11 rounded-full border flex items-center justify-center font-mono text-xs font-bold tracking-tighter cursor-pointer hover:border-accent transition-colors ${
                isMyPost
                  ? 'border-accent/80 text-text-primary bg-accent/5'
                  : 'border-border/90 bg-surface/80 text-text-primary'
              }`}
            >
              {getAvatarInitials(tx.authorId, tx.authorAlias)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span 
                  onClick={() => onAuthorClick?.(tx.authorId, tx.authorAlias)}
                  className="font-mono font-bold text-sm text-text-primary hover:underline cursor-pointer truncate"
                >
                  {primaryId}
                </span>

                {tx.tag && (
                  <div className="flex items-center gap-1.5 font-mono text-xs">
                    <ChevronRight size={13} className="text-text-secondary/50 shrink-0" />
                    <span className="font-semibold flex items-center gap-0.5">
                      <span className="text-accent font-bold">#</span>
                      <span className="text-text-primary lowercase">{tx.tag.replace(/^#+/, '').toLowerCase()}</span>
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 font-mono text-[11px] text-text-secondary mt-0.5">
                <span>{tx.timestamp}</span>
              </div>
            </div>
          </div>

          {/* Konten Utama (Ukuran Lebih Besar & Spasi Lega) */}
          <p className="font-sans text-base sm:text-[17px] text-text-primary leading-relaxed whitespace-pre-wrap pt-1">
            {tx.content}
          </p>

          {/* Meta Info Bawah & Tombol Hapus */}
          <div className="pt-2 flex items-center justify-between text-xs font-mono text-text-secondary border-t border-border/40">
            <div className="flex items-center gap-2">
              <MessageSquare size={13} className="text-accent" />
              <span>{tx.replies.length} Resonansi</span>
            </div>

            {isMyPost && (
              <button
                type="button"
                onClick={() => {
                  onDeleteTransmission(tx.id);
                }}
                className="text-text-secondary hover:text-red-400 flex items-center gap-1 transition-colors p-1"
              >
                <Trash2 size={13} />
                <span className="text-[11px] uppercase">Hapus</span>
              </button>
            )}
          </div>
        </div>

        {/* 3. DAFTAR BALASAN LANGSUNG (Header Ruang Gema yang redundant dihapus) */}
        <div className="space-y-3">
          {tx.replies.length === 0 ? (
            <div className="py-12 text-center text-text-secondary/60 font-mono text-xs space-y-2">
              <p>Belum ada resonansi pada frekuensi ini.</p>
              <p className="text-[11px] text-text-secondary/40">Jadilah yang pertama menyambung getaran cerita.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tx.replies.map((reply) => {
                const isHost = reply.authorAlias?.toLowerCase() === 'sorside' || reply.authorId === 'ss-001';
                const isMyReply = reply.authorId === myId;
                const replyAuthor = reply.authorAlias || reply.authorId;
                const isNestedReply = !!reply.replyToName;

                return (
                  <div
                    key={reply.id}
                    className={`p-3.5 border transition-all ${
                      isNestedReply ? 'ml-4 sm:ml-6 border-l-2 border-l-accent/80' : ''
                    } ${
                      isHost
                        ? 'border-accent/80 bg-accent/5'
                        : 'border-border/70 bg-surface/40 hover:bg-surface/70'
                    }`}
                  >
                    <div className="flex items-start justify-between font-mono text-xs text-text-secondary mb-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Avatar bulat kecil untuk reply */}
                        <div
                          onClick={() => onAuthorClick?.(reply.authorId, reply.authorAlias)}
                          className="w-6 h-6 rounded-full border border-border/80 flex items-center justify-center text-[10px] font-bold text-text-primary cursor-pointer hover:border-accent"
                        >
                          {getAvatarInitials(reply.authorId, reply.authorAlias)}
                        </div>

                        <span
                          onClick={() => onAuthorClick?.(reply.authorId, reply.authorAlias)}
                          className={`font-semibold cursor-pointer hover:underline ${
                            isHost ? 'text-accent' : 'text-text-primary'
                          }`}
                        >
                          {replyAuthor}
                        </span>

                        {isHost && (
                          <span className="px-1 bg-accent text-background text-[9px] uppercase font-bold tracking-wider">
                            HOST
                          </span>
                        )}

                        {isMyReply && (
                          <span className="text-accent text-[9px] uppercase font-mono">
                            (Anda)
                          </span>
                        )}

                        {/* Indikator Membalas User Lain */}
                        {reply.replyToName && (
                          <span className="text-[10px] text-text-secondary/80 flex items-center gap-1 font-mono">
                            <CornerDownRight size={10} className="text-accent" />
                            membalas <strong className="text-text-primary">{reply.replyToName}</strong>
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] text-text-secondary/70 shrink-0">
                        {reply.timestamp}
                      </span>
                    </div>

                    {/* Isi Pesan Balasan */}
                    <p className="font-sans text-sm text-text-secondary leading-relaxed pl-8">
                      {reply.content}
                    </p>

                    {/* Aksi Balas Balasan (Hierarki Thread) */}
                    <div className="pl-8 pt-2 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => handleSetReplyTo(reply.authorId, reply.authorAlias)}
                        className="text-[11px] font-mono text-text-secondary/80 hover:text-accent flex items-center gap-1 transition-colors uppercase tracking-wider"
                      >
                        <CornerDownRight size={11} />
                        <span>Balas</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 4. FLOATING / FIXED BOTTOM REPLY BAR */}
      <div className="fixed bottom-0 inset-x-0 bg-background/95 backdrop-blur-md border-t border-border p-3 z-40">
        <div className="max-w-xl mx-auto">
          {/* Banner Tag Target Reply jika sedang membalas komentar orang tertentu */}
          {targetReply && (
            <div className="flex items-center justify-between text-[11px] font-mono text-text-secondary bg-surface/80 border border-border px-3 py-1 mb-2">
              <span className="flex items-center gap-1">
                <CornerDownRight size={12} className="text-accent" />
                Membalas resonansi <strong className="text-accent">@{targetReply.name}</strong>
              </span>
              <button
                type="button"
                onClick={handleClearReplyTo}
                className="text-text-secondary hover:text-text-primary p-0.5"
              >
                <X size={12} />
              </button>
            </div>
          )}

          <form onSubmit={handleSendReply} className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full border border-border/90 bg-surface/80 flex items-center justify-center font-mono text-[10px] font-bold text-text-primary shrink-0">
              {getAvatarInitials(myId, myAlias)}
            </div>

            <input
              ref={inputRef}
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={
                targetReply
                  ? `Balas @${targetReply.name}...`
                  : `Kirim resonansi sebagai ${myAlias || myId}...`
              }
              maxLength={280}
              className="flex-1 bg-surface border border-border/80 px-3.5 py-2 font-sans text-xs text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-accent"
            />

            <button
              type="submit"
              disabled={!replyText.trim() || isSubmitting}
              className="h-9 px-4 bg-text-primary text-background hover:bg-accent font-mono text-xs uppercase tracking-wider font-semibold disabled:opacity-30 transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Send size={12} />
              <span className="hidden sm:inline">Kirim</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
