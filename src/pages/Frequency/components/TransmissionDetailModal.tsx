import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, MessageSquare, Send, CornerDownRight, X, Trash2, ChevronRight, Flag } from 'lucide-react';
import { Transmission, Reply } from './TransmissionItem';

interface TransmissionDetailModalProps {
  transmission: Transmission | null;
  onClose: () => void;
  myId: string;
  myAlias?: string;
  getAvatarInitials: (id: string, alias?: string) => React.ReactNode;
  onSubmitReply: (txId: string, replyContent: string, replyTo?: { id: string; name: string }) => Promise<void>;
  onDeleteTransmission: (txId: string) => void;
  onDeleteReply?: (txId: string, replyId: string) => void;
  onReportTransmission?: (tx: Transmission) => void;
  onReportReply?: (txId: string, reply: Reply) => void;
  onAuthorClick?: (authorId: string, authorAlias?: string) => void;
  initialReplyTarget?: { id: string; name: string } | null;
  originIds?: string[];
}

export const TransmissionDetailModal: React.FC<TransmissionDetailModalProps> = ({
  transmission: tx,
  onClose,
  myId,
  myAlias,
  getAvatarInitials,
  onSubmitReply,
  onDeleteTransmission,
  onDeleteReply,
  onReportTransmission,
  onReportReply,
  onAuthorClick,
  initialReplyTarget = null,
  originIds = [],
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

  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(new Set());

  const toggleThread = (rootId: string) => {
    setExpandedThreads(prev => {
      const next = new Set(prev);
      if (next.has(rootId)) next.delete(rootId);
      else next.add(rootId);
      return next;
    });
  };

  const groupedReplies = React.useMemo(() => {
    if (!tx || !Array.isArray(tx.replies)) return [];

    const rootsMap = new Map<string, Reply & { children: Reply[] }>();
    const replyMap = new Map<string, Reply>();

    tx.replies.forEach(r => replyMap.set(r.id, r));

    const getRootId = (replyId: string): string => {
      let current = replyMap.get(replyId);
      let lastSeenId = replyId;
      const seen = new Set<string>();
      while (current && current.replyToId) {
        if (seen.has(current.id)) break;
        seen.add(current.id);
        const parent = replyMap.get(current.replyToId);
        if (!parent) break;
        current = parent;
      }
      return current ? current.id : lastSeenId;
    };

    tx.replies.forEach(r => {
      const rootId = getRootId(r.id);
      if (rootId === r.id) {
        if (!rootsMap.has(r.id)) rootsMap.set(r.id, { ...r, children: [] });
      }
    });

    tx.replies.forEach(r => {
      const rootId = getRootId(r.id);
      if (rootId !== r.id) {
         rootsMap.get(rootId)?.children.push(r);
      }
    });

    const groups = Array.from(rootsMap.values());
    groups.sort((a, b) => a.createdAt - b.createdAt);
    groups.forEach(r => r.children.sort((a, b) => a.createdAt - b.createdAt));
    return groups;
  }, [tx.replies]);

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

  const handleSetReplyTo = (replyId: string, replyAuthorId: string, replyAuthorAlias?: string) => {
    const name = replyAuthorAlias || replyAuthorId;
    setTargetReply({ id: replyId, name });
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
      {/* 1. TOP NAV BAR (Hidden di Mobile, Back saja di Desktop) */}
      <div className="hidden sm:block sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border/80 px-4 py-3 mb-4">
        <div className="max-w-xl mx-auto flex items-center justify-start min-h-[40px]">
          {/* Tombol Back */}
          <button
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-border/80 hover:border-text-primary text-text-secondary hover:text-text-primary transition-colors z-10"
            aria-label="Kembali ke Feed"
          >
            <ArrowLeft size={18} />
          </button>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-4 sm:px-0 space-y-6 sm:mt-0 mt-6">
        {/* 2. POSTINGAN UTAMA (DEDICATED FULL VIEW) */}
        <div className="space-y-4">
          {/* Header Penulis: Jika punya alias tampilkan alias saja, jika belum set alias tampilkan ID */}
          <div className="flex items-center gap-3">
            <div
              onClick={() => onAuthorClick?.(tx.authorId, tx.authorAlias)}
              className="w-11 h-11 rounded-full border border-border/90 bg-surface/80 flex items-center justify-center cursor-pointer hover:border-text-secondary/70 transition-colors overflow-hidden"
            >
              {getAvatarInitials(tx.authorId, tx.authorAlias)}
            </div>

            <div className="flex-1 min-w-0 flex items-start justify-between">
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span 
                    onClick={() => onAuthorClick?.(tx.authorId, tx.authorAlias)}
                    className="font-mono font-bold text-sm text-text-primary hover:underline cursor-pointer truncate"
                  >
                    {tx.authorAlias || tx.authorId}
                  </span>

                  {(originIds.includes(tx.authorId) || tx.authorId === 'Freq-999') && (
                    <span 
                      className="text-amber-400 text-sm font-bold leading-none inline-flex items-center shrink-0 select-none ml-0.5"
                      title="Origin Creator"
                    >
                      ✦
                    </span>
                  )}

                  {tx.tag && (
                    <div className="flex items-center gap-1.5 font-mono text-xs">
                      <ChevronRight size={13} className="text-text-secondary/50 shrink-0" />
                      <span className="font-semibold flex items-center gap-0.5">
                        <span className="text-accent font-bold">#</span>
                        <span className="text-text-primary lowercase">{tx.tag.replace(/^#+/, '').toLowerCase()}</span>
                      </span>
                    </div>
                  )}
                  
                  <span className="text-[11px] font-mono text-text-secondary/60 ml-1">
                    {tx.timestamp}
                  </span>
                </div>
              </div>
              
              {isMyPost && (
                <button
                  type="button"
                  onClick={() => {
                    onDeleteTransmission(tx.id);
                  }}
                  className="text-text-secondary/40 hover:text-red-400 flex items-center transition-colors p-1"
                  title="Hapus cerita ini"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </div>

          {/* Konten Utama (Ukuran Lebih Besar & Spasi Lega) */}
          <p className="font-sans text-base sm:text-[17px] text-text-primary leading-relaxed whitespace-pre-wrap pt-1">
            {tx.content}
          </p>

          {/* Meta Info Bawah & Tombol Hapus */}
          <div className="py-2.5 flex items-center justify-between text-xs font-mono text-text-secondary border-t border-b border-border/40">
            <div className="flex items-center gap-1.5" title="Balasan">
              <MessageSquare size={13} className="text-accent" />
              <span>{tx.replies.length}</span>
            </div>

            {!isMyPost && (
              <button
                type="button"
                onClick={() => onReportTransmission?.(tx)}
                className="text-text-secondary/60 hover:text-amber-500 flex items-center gap-1 transition-colors p-1"
                title="Laporkan cerita ini"
              >
                <Flag size={12} />
                <span className="text-[11px] uppercase">Laporkan</span>
              </button>
            )}
          </div>
        </div>

        {/* 3. DAFTAR BALASAN LANGSUNG (Instagram Style) */}
        <div className="space-y-4 pt-1">
          {groupedReplies.length === 0 ? (
            <div className="py-12 text-center text-text-secondary/60 font-mono text-xs">
              <p>Belum ada balasan pada cerita ini.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {groupedReplies.map((root) => {
                const isMyRoot = root.authorId === myId;
                const hasChildren = root.children && root.children.length > 0;
                const isExpanded = expandedThreads.has(root.id);

                return (
                  <div key={root.id} className="flex flex-col gap-1">
                    {/* ROOT REPLY */}
                    <div className="flex items-start gap-3">
                      {/* Avatar */}
                      <div
                        onClick={() => onAuthorClick?.(root.authorId, root.authorAlias)}
                        className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer border border-border/80 bg-surface/80 hover:border-text-secondary/70 shrink-0 overflow-hidden transition-colors"
                      >
                        {getAvatarInitials(root.authorId, root.authorAlias)}
                      </div>

                      {/* Content Area */}
                      <div className="flex-1 min-w-0 flex items-start justify-between">
                        <div>
                          <div className="flex items-baseline gap-2 flex-wrap mb-0.5">
                            <span
                              onClick={() => onAuthorClick?.(root.authorId, root.authorAlias)}
                              className="font-semibold text-xs text-text-primary cursor-pointer hover:underline"
                            >
                              {root.authorAlias || root.authorId}
                            </span>

                            {(originIds.includes(root.authorId) || root.authorId === 'Freq-999') && (
                              <span 
                                className="text-amber-400 text-[10px] font-bold leading-none inline-flex items-center shrink-0 select-none"
                                title="Origin Creator"
                              >
                                ✦
                              </span>
                            )}

                            <span className="text-[10px] text-text-secondary/60">
                              {root.timestamp}
                            </span>
                          </div>

                          <p className="font-sans text-[13px] sm:text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                            {root.content}
                          </p>

                          <div className="flex items-center gap-4 mt-1.5">
                            <button
                              type="button"
                              onClick={() => handleSetReplyTo(root.id, root.authorId, root.authorAlias)}
                              className="text-[11px] font-mono font-medium text-text-secondary/70 hover:text-text-primary transition-colors"
                            >
                              Balas
                            </button>

                            {!isMyRoot && (
                              <button
                                type="button"
                                onClick={() => onReportReply?.(tx.id, root)}
                                className="text-[10px] font-mono text-text-secondary/30 hover:text-amber-500 transition-colors uppercase"
                              >
                                Laporkan
                              </button>
                            )}
                          </div>
                        </div>

                        {isMyRoot && (
                          <button
                            type="button"
                            onClick={() => onDeleteReply?.(tx.id, root.id)}
                            className="text-text-secondary/30 hover:text-red-400 transition-colors p-1 ml-2"
                            title="Hapus balasan ini"
                          >
                            <Trash2 size={12} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* TOGGLE & CHILDREN */}
                    {hasChildren && (
                      <div className="pl-10 mt-1">
                        <button
                          type="button"
                          onClick={() => toggleThread(root.id)}
                          className="flex items-center gap-2 text-[11px] font-semibold text-text-secondary/80 hover:text-text-primary transition-colors py-1"
                        >
                          <span className="w-6 border-b border-text-secondary/40"></span>
                          {isExpanded ? 'Sembunyikan balasan' : `Lihat ${root.children.length} balasan`}
                        </button>

                        {/* CHILD REPLIES */}
                        {isExpanded && (
                          <div className="space-y-4 mt-3">
                            {root.children.map(child => {
                              const isMyChild = child.authorId === myId;
                              const isReplyingToSomeoneElse = child.replyToName && child.replyToId !== root.id;

                              return (
                                <div key={child.id} className="flex items-start gap-3">
                                  {/* Avatar Anak */}
                                  <div
                                    onClick={() => onAuthorClick?.(child.authorId, child.authorAlias)}
                                    className="w-6 h-6 rounded-full flex items-center justify-center cursor-pointer border border-border/80 bg-surface/80 hover:border-text-secondary/70 shrink-0 mt-0.5 overflow-hidden transition-colors"
                                  >
                                    {getAvatarInitials(child.authorId, child.authorAlias)}
                                  </div>

                                  <div className="flex-1 min-w-0 flex items-start justify-between">
                                    <div>
                                      <div className="flex items-baseline gap-2 flex-wrap mb-0.5">
                                        <span
                                          onClick={() => onAuthorClick?.(child.authorId, child.authorAlias)}
                                          className="font-semibold text-xs text-text-primary cursor-pointer hover:underline"
                                        >
                                          {child.authorAlias || child.authorId}
                                        </span>

                                        {(originIds.includes(child.authorId) || child.authorId === 'Freq-999') && (
                                          <span 
                                            className="text-amber-400 text-[10px] font-bold leading-none inline-flex items-center shrink-0 select-none"
                                          >
                                            ✦
                                          </span>
                                        )}

                                        <span className="text-[10px] text-text-secondary/60">
                                          {child.timestamp}
                                        </span>
                                      </div>

                                      <p className="font-sans text-[13px] sm:text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                                        {isReplyingToSomeoneElse && (
                                          <span className="text-accent font-medium mr-1.5">
                                            @{child.replyToName}
                                          </span>
                                        )}
                                        {child.content}
                                      </p>

                                      <div className="flex items-center gap-4 mt-1.5">
                                        <button
                                          type="button"
                                          onClick={() => handleSetReplyTo(child.id, child.authorId, child.authorAlias)}
                                          className="text-[11px] font-mono font-medium text-text-secondary/70 hover:text-text-primary transition-colors"
                                        >
                                          Balas
                                        </button>

                                        {!isMyChild && (
                                          <button
                                            type="button"
                                            onClick={() => onReportReply?.(tx.id, child)}
                                            className="text-[10px] font-mono text-text-secondary/30 hover:text-amber-500 transition-colors uppercase"
                                          >
                                            Laporkan
                                          </button>
                                        )}
                                      </div>
                                    </div>

                                    {isMyChild && (
                                      <button
                                        type="button"
                                        onClick={() => onDeleteReply?.(tx.id, child.id)}
                                        className="text-text-secondary/30 hover:text-red-400 transition-colors p-1 ml-2"
                                        title="Hapus balasan ini"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
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
                Membalas <strong className="text-accent">@{targetReply.name}</strong>
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
                  : `Balas sebagai ${myAlias || myId}...`
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
