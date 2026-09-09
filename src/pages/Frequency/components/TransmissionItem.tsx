import React from 'react';
import { MessageSquare, Trash2, ChevronRight, Flag } from 'lucide-react';

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
  getAvatarInitials: (id: string, alias?: string) => React.ReactNode;
  onOpenDetail?: (tx: Transmission) => void;
  onQuickReply?: (tx: Transmission, targetReply?: Reply) => void;
  onDeleteTransmission: (id: string) => void;
  onReportTransmission?: (tx: Transmission) => void;
  onAuthorClick?: (authorId: string, authorAlias?: string) => void;
  onTopicClick?: (topic: string) => void;
  isInsideDetail?: boolean;
  originIds?: string[];
}

export const TransmissionItem: React.FC<TransmissionItemProps> = ({
  transmission: tx,
  myId,
  myAlias,
  getAvatarInitials,
  onOpenDetail,
  onQuickReply,
  onDeleteTransmission,
  onReportTransmission,
  onAuthorClick,
  onTopicClick,
  isInsideDetail = false,
  originIds = [],
}) => {
  const isMyPost = tx.authorId === myId;
  const isOriginAuthor = originIds.includes(tx.authorId) || tx.authorId === 'Freq-999';
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
    onDeleteTransmission(tx.id);
  };

  const handleReportClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onReportTransmission) {
      onReportTransmission(tx);
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
            className={`w-10 h-10 rounded-full border flex items-center justify-center cursor-pointer hover:border-accent transition-colors overflow-hidden ${
              isMyPost
                ? 'border-accent/80 bg-accent/5'
                : 'border-border/90 bg-surface/80'
            }`}
          >
            {getAvatarInitials(tx.authorId, tx.authorAlias)}
          </div>
        </div>

        {/* Kolom Kanan: Header, Isi Cerita, Aksi */}
        <div className="flex-1 min-w-0 pt-0.5 space-y-2">
          {/* Header Baris: ID/Alias + ID Handle > Topik di kiri, Waktu di kanan */}
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
              {/* Jika punya alias: Tampilkan Nama Alias saja, jika tidak: tampilkan ID */}
              <span
                onClick={handleAuthorClick}
                className="font-bold text-text-primary truncate hover:underline cursor-pointer"
              >
                {tx.authorAlias || tx.authorId}
              </span>

              {/* Lencana Bintang ✦ (Origin Creator) Tanpa Box */}
              {isOriginAuthor && (
                <span 
                  className="text-amber-400 text-xs font-bold leading-none inline-flex items-center shrink-0 select-none ml-0.5"
                  title="Origin Creator"
                >
                  ✦
                </span>
              )}

              {/* Tag Topik Tepat Pas di Samping ID/Alias > */}
              {cleanTopic && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <ChevronRight size={13} className="text-text-secondary/50 shrink-0" />
                  <button
                    type="button"
                    onClick={(e) => handleTopicClick(e, cleanTopic.toLowerCase())}
                    className="hover:underline cursor-pointer font-mono font-semibold text-xs flex items-center gap-0.5"
                    title={`Filter #${cleanTopic.toLowerCase()}`}
                  >
                    <span className="text-accent font-bold">#</span>
                    <span className="text-text-primary lowercase">{cleanTopic.toLowerCase()}</span>
                  </button>
                </div>
              )}
              
              {/* Waktu di samping ID/Topik */}
              <span className="text-text-secondary/60 text-[11px] ml-1">{tx.timestamp}</span>
            </div>

            {/* Sisi Kanan: Tombol Hapus */}
            <div className="flex items-center text-[11px] font-mono text-text-secondary shrink-0 pl-2">
              {isMyPost && (
                <button
                  type="button"
                  onClick={handleDeleteClick}
                  className="text-text-secondary/40 hover:text-red-400 transition-colors p-1 -mr-1"
                  title="Hapus transmisi ini"
                >
                  <Trash2 size={12} />
                </button>
              )}
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
            {/* Tombol Balas / Jumlah Resonansi */}
            <button
              type="button"
              onClick={handleReplyClick}
              className="flex items-center gap-1.5 hover:text-accent transition-colors text-[11px] p-1 -ml-1 font-mono"
              title="Resonansi balasan"
            >
              <MessageSquare size={13} className="text-accent" />
              <span>{tx.replies.length}</span>
            </button>

            {!isMyPost && (
              <button
                type="button"
                onClick={handleReportClick}
                className="ml-auto text-text-secondary/40 hover:text-amber-500 transition-colors p-1"
                title="Laporkan sinyal ini"
              >
                <Flag size={12} />
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
