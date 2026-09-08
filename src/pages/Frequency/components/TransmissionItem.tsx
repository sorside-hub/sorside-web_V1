import React from 'react';
import { MessageSquare, ChevronDown, ChevronUp, Trash2, X } from 'lucide-react';

export interface Reply {
  id: string;
  authorId: string;
  authorAlias?: string;
  content: string;
  timestamp: string;
}

export interface Transmission {
  id: string;
  authorId: string;
  authorAlias?: string;
  content: string;
  tag?: string;
  timestamp: string;
  replies: Reply[];
}

interface TransmissionItemProps {
  transmission: Transmission;
  myId: string;
  myAlias?: string;
  getAvatarInitials: (id: string, alias?: string) => string;
  isThreadOpen: boolean;
  onToggleThread: (id: string) => void;
  isReplying: boolean;
  onToggleReply: (id: string) => void;
  replyInputValue: string;
  onReplyInputChange: (id: string, text: string) => void;
  onSubmitReply: (id: string, e: React.FormEvent) => void;
  onDeleteTransmission: (id: string) => void;
  onAuthorClick?: (authorId: string, authorAlias?: string) => void;
}

export const TransmissionItem: React.FC<TransmissionItemProps> = ({
  transmission: tx,
  myId,
  myAlias,
  getAvatarInitials,
  isThreadOpen,
  onToggleThread,
  isReplying,
  onToggleReply,
  replyInputValue,
  onReplyInputChange,
  onSubmitReply,
  onDeleteTransmission,
  onAuthorClick,
}) => {
  const isMyPost = tx.authorId === myId;
  // Cukup 1 identifier saja: jika ada alias gunakan alias, jika tidak gunakan authorId
  const primaryId = tx.authorAlias || tx.authorId;

  const handleAuthorClick = () => {
    if (onAuthorClick) {
      onAuthorClick(tx.authorId, tx.authorAlias);
    }
  };

  return (
    <article id={`transmission-${tx.id}`} className="py-4 border-b border-border/70 transition-colors">
      <div className="flex items-start gap-3.5">
        {/* Kolom Kiri: Avatar (Ukuran & gaya sama persis dengan input bar w-10 h-10) + Benang Balasan */}
        <div className="flex flex-col items-center shrink-0">
          <div
            onClick={handleAuthorClick}
            className={`w-10 h-10 rounded-full border flex items-center justify-center font-mono text-xs font-bold tracking-tighter cursor-pointer hover:border-accent transition-colors ${
              isMyPost
                ? 'border-accent text-accent bg-accent/10'
                : 'border-border/90 bg-surface/80 text-text-primary'
            }`}
          >
            {getAvatarInitials(tx.authorId, tx.authorAlias)}
          </div>

          {/* Garis benang vertikal ala Threads jika ada balasan dan terbuka */}
          {tx.replies.length > 0 && isThreadOpen && (
            <div className="w-[1.5px] bg-border/80 flex-1 my-2 rounded-full min-h-[36px]" />
          )}
        </div>

        {/* Kolom Kanan: Header (ID & Waktu sebaris), Isi Cerita (Warna ramah mata), Aksi */}
        <div className="flex-1 min-w-0 pt-0.5 space-y-2">
          {/* Header Baris Tunggal: ID di kiri, Waktu di kanan */}
          <div className="flex items-center justify-between text-xs font-mono">
            <div 
              onClick={handleAuthorClick}
              className="flex items-center gap-1.5 min-w-0 cursor-pointer group"
            >
              <span
                className={`font-semibold truncate group-hover:underline ${
                  isMyPost ? 'text-accent' : 'text-text-primary'
                }`}
              >
                {primaryId}
              </span>
              {isMyPost && (
                <span className="text-[9px] text-accent px-1 border border-accent/60 uppercase shrink-0">
                  Anda
                </span>
              )}
            </div>

            {/* Sisi Kanan: Vibe Tag (jika ada) & Waktu sebaris */}
            <div className="flex items-center gap-2 text-[11px] font-mono text-text-secondary shrink-0">
              {tx.tag && (
                <span className="border border-border/70 px-1.5 py-0.2 text-[10px] uppercase tracking-wider text-text-secondary/80">
                  {tx.tag}
                </span>
              )}
              <span className="text-text-secondary/80">{tx.timestamp}</span>
            </div>
          </div>

          {/* Isi Pesan: Warna teks ramah mata seperti artikel (text-text-secondary yang nyaman dibaca) */}
          <p className="font-sans text-sm sm:text-[15px] text-text-secondary leading-relaxed whitespace-pre-wrap">
            {tx.content}
          </p>

          {/* Aksi Bawah: Balas & Buka Resonansi */}
          <div className="flex items-center gap-4 pt-1 text-xs font-mono text-text-secondary">
            <button
              onClick={() => onToggleReply(tx.id)}
              className="flex items-center gap-1.5 hover:text-text-primary transition-colors uppercase tracking-wider text-[11px]"
            >
              <MessageSquare size={13} />
              <span>Balas</span>
            </button>

            {tx.replies.length > 0 && (
              <button
                onClick={() => onToggleThread(tx.id)}
                className="hover:text-accent transition-colors flex items-center gap-1 text-[11px] uppercase tracking-wider"
              >
                <span>{tx.replies.length} Resonansi</span>
                {isThreadOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
            )}

            {isMyPost && (
              <button
                onClick={() => onDeleteTransmission(tx.id)}
                className="ml-auto text-text-secondary/40 hover:text-red-400 transition-colors p-1"
                title="Hapus transmisi ini"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>

          {/* Input Balasan Cepat (Jika aktif) */}
          {isReplying && (
            <form
              onSubmit={(e) => onSubmitReply(tx.id, e)}
              className="mt-3 flex items-center gap-2 p-2 border border-border bg-background/90 animate-in fade-in duration-100"
            >
              <input
                type="text"
                value={replyInputValue}
                onChange={(e) => onReplyInputChange(tx.id, e.target.value)}
                placeholder={`Balas sebagai ${myAlias || myId}...`}
                maxLength={250}
                autoFocus
                className="flex-1 bg-transparent text-xs font-sans text-text-secondary placeholder:text-text-secondary/40 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!replyInputValue.trim()}
                className="px-3 py-1 bg-text-primary text-background hover:bg-accent font-mono text-[10px] uppercase tracking-widest disabled:opacity-30 transition-colors"
              >
                Kirim
              </button>
              <button
                type="button"
                onClick={() => onToggleReply(tx.id)}
                className="p-1 text-text-secondary hover:text-text-primary"
              >
                <X size={13} />
              </button>
            </form>
          )}

          {/* Daftar Balasan (Gaya Thread Indented) */}
          {isThreadOpen && tx.replies.length > 0 && (
            <div className="mt-3 space-y-2.5 pt-2 border-t border-border/40">
              {tx.replies.map((reply) => {
                const isHost =
                  reply.authorAlias?.toLowerCase() === 'sorside' || reply.authorId === 'ss-001';
                const isMyReply = reply.authorId === myId;
                const replyAuthor = reply.authorAlias || reply.authorId;

                return (
                  <div
                    key={reply.id}
                    className={`p-3 border text-xs font-sans space-y-1.5 ${
                      isHost
                        ? 'border-accent/80 bg-accent/5'
                        : 'border-border/60 bg-surface/40'
                    }`}
                  >
                    <div className="flex items-center justify-between font-mono text-[10px] text-text-secondary">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-semibold ${
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
                          <span className="text-accent text-[9px] uppercase">
                            (Anda)
                          </span>
                        )}
                      </div>
                      <span className="text-text-secondary/80">{reply.timestamp}</span>
                    </div>
                    <p className="text-text-secondary font-sans leading-relaxed">
                      {reply.content}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </article>
  );
};
