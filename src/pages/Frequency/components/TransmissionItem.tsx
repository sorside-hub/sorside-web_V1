import React from 'react';
import { MessageSquare, Trash2, ChevronRight } from 'lucide-react';

export interface Reply {
  id: string;
  authorId: string;
  authorAlias?: string;
  content: string;
  timestamp: string;
  createdAt?: any;
  replyToId?: string;
  replyToName?: string;
}

export interface Transmission {
  id: string;
  authorId: string;
  authorAlias?: string;
  content: string;
  tag?: string;
  timestamp: string;
  createdAt?: any;
  replies: Reply[];
}

interface TransmissionItemProps {
  transmission: Transmission;
  myId: string;
  myAlias?: string;
  getAvatarInitials: (id: string, alias?: string) => string;
  onOpenDetail?: (tx: Transmission) => void;
  onQuickReply?: (tx: Transmission, targetReply?: Reply) => void;
  onDeleteTransmission: (id: string) => void;
  onAuthorClick?: (authorId: string, authorAlias?: string) => void;
  onTopicClick?: (topic: string) => void;
  isInsideDetail?: boolean;
}

export const TransmissionItem: React.FC<TransmissionItemProps> = ({
  transmission: tx,
  myId,
  myAlias,
  getAvatarInitials,
  onOpenDetail,
  onQuickReply,
  onDeleteTransmission,
  onAuthorClick,
  onTopicClick,
  isInsideDetail = false,
}) => {
  const isMyPost = tx.authorId === myId;
  // Jika user punya alias, tampilkan nama alias saja. Jika belum, tampilkan ID
  const primaryId = tx.authorAlias || tx.authorId;

  const handleAuthorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAuthorClick) {
      onAuthorClick(tx.authorId, tx.authorAlias);
    }
  };

  const handleTopicClick = (e: React.MouseEvent, topic: string) => {
    e.stopPropagation();
    if (onTopicClick) {
      onTopicClick(topic);
    }
  };

  const handleCardClick = () => {
    if (!isInsideDetail && onOpenDetail) {
      onOpenDetail(tx);
    }
  };

  const handleReplyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onQuickReply) {
      onQuickReply(tx);
    } else if (onOpenDetail) {
      onOpenDetail(tx);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Hapus transmisi ini secara permanen?')) {
      onDeleteTransmission(tx.id);
    }
  };

  const cleanTopic = tx.tag ? tx.tag.replace(/^#+/, '') : '';

  return (
    <article 
      id={`transmission-${tx.id}`} 
      onClick={handleCardClick}
      className={`py-4 transition-colors ${
        !isInsideDetail 
          ? 'cursor-pointer hover:bg-surface/30 border-b border-border/70' 
          : 'border-b border-border/80 pb-5'
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Kolom Kiri: Avatar */}
        <div className="flex flex-col items-center shrink-0">
          <div
            onClick={handleAuthorClick}
            className={`w-10 h-10 rounded-full border flex items-center justify-center font-mono text-xs font-bold tracking-tighter cursor-pointer hover:border-accent transition-colors ${
              isMyPost
                ? 'border-accent/80 text-text-primary bg-accent/5'
                : 'border-border/90 bg-surface/80 text-text-primary'
            }`}
          >
            {getAvatarInitials(tx.authorId, tx.authorAlias)}
          </div>
        </div>

        {/* Kolom Kanan: Header, Isi Cerita, Aksi */}
        <div className="flex-1 min-w-0 pt-0.5 space-y-2">
          {/* Header Baris Tunggal: ID/Alias > Topik di kiri, Waktu di kanan */}
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
               <span
                onClick={handleAuthorClick}
                className="font-semibold text-text-primary truncate hover:underline cursor-pointer"
              >
                {primaryId}
              </span>

              {/* Tag Topik Tepat Pas di Samping ID/Alias > */}
              {cleanTopic && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <ChevronRight size={13} className="text-text-secondary/50 shrink-0" />
                  <span
                    onClick={(e) => handleTopicClick(e, cleanTopic)}
                    className="text-text-secondary hover:underline cursor-pointer font-semibold text-xs"
                    title={`Filter #${cleanTopic}`}
                  >
                    #{cleanTopic}
                  </span>
                </div>
              )}
            </div>

            {/* Sisi Kanan: Waktu Singkat */}
            <div className="flex items-center gap-2 text-[11px] font-mono text-text-secondary shrink-0 pl-2">
              <span className="text-text-secondary/80">{tx.timestamp}</span>
            </div>
          </div>

          {/* Isi Pesan */}
          <p className={`font-sans text-text-secondary leading-relaxed whitespace-pre-wrap ${
            isInsideDetail ? 'text-base text-text-primary' : 'text-sm sm:text-[15px]'
          }`}>
            {tx.content}
          </p>

          {/* Aksi Bawah */}
          <div className="flex items-center gap-4 pt-1 text-xs font-mono text-text-secondary">
            {/* Tombol Balas / Resonansi */}
            <button
              type="button"
              onClick={handleReplyClick}
              className="flex items-center gap-1.5 hover:text-accent transition-colors uppercase tracking-wider text-[11px] p-1 -ml-1"
            >
              <MessageSquare size={13} className="text-accent" />
              <span>
                {tx.replies.length > 0 ? `${tx.replies.length} Resonansi` : 'Balas'}
              </span>
            </button>

            {/* Indikator buka thread */}
            {!isInsideDetail && tx.replies.length > 0 && (
              <span className="text-[10px] text-text-secondary/50 font-mono">
                • ketuk untuk buka thread
              </span>
            )}

            {isMyPost && (
              <button
                type="button"
                onClick={handleDeleteClick}
                className="ml-auto text-text-secondary/40 hover:text-red-400 transition-colors p-1"
                title="Hapus transmisi ini"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
