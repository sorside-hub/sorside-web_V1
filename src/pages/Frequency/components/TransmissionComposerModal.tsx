import React, { useEffect, useRef } from 'react';
import { X, Send } from 'lucide-react';

interface TransmissionComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string, tag: string) => void;
  myId: string;
  myAlias?: string;
  draftContent: string;
  onDraftChange: (text: string) => void;
  selectedTag: string;
  onTagChange: (tag: string) => void;
  tagOptions: string[];
  avatarInitials?: string;
}

export const TransmissionComposerModal: React.FC<TransmissionComposerModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  myId,
  myAlias,
  draftContent,
  onDraftChange,
  selectedTag,
  onTagChange,
  tagOptions,
  avatarInitials
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Dukungan tombol Back browser/HP (history popstate)
  useEffect(() => {
    if (!isOpen) return;

    // Push state saat modal terbuka
    window.history.pushState({ composerOpen: true }, '');

    const handlePopState = () => {
      onClose();
    };

    window.addEventListener('popstate', handlePopState);

    // Auto-focus instan tanpa animasi delay
    const timer = setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 50);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      clearTimeout(timer);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleClose = () => {
    // Kembalikan riwayat history jika ditutup manual lewat tombol
    if (window.history.state?.composerOpen) {
      window.history.back();
    } else {
      onClose();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftContent.trim()) return;
    onSubmit(draftContent.trim(), selectedTag);
    // Tutup modal
    if (window.history.state?.composerOpen) {
      window.history.back();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col md:items-center md:justify-center md:bg-background/90 md:backdrop-blur-md md:p-4">
      {/* Container Menulis: Fullscreen di Mobile, Modal Elegan di Desktop */}
      <div className="w-full h-full md:h-auto md:max-w-xl md:border md:border-border bg-background flex flex-col justify-between">
        
        {/* TOP BAR MODAL */}
        <div className="border-b border-border/80 px-4 py-3 flex items-center justify-between shrink-0 bg-surface/40">
          <button
            type="button"
            onClick={handleClose}
            className="text-xs font-mono text-text-secondary hover:text-text-primary uppercase tracking-wider flex items-center gap-1 py-1 px-2 border border-transparent hover:border-border transition-colors"
          >
            <X size={15} />
            <span>Batal</span>
          </button>

          <div className="flex flex-col items-center">
            <span className="font-display text-sm uppercase tracking-[0.2em] text-text-primary">
              Transmisi Baru
            </span>
            <span className="font-mono text-[9px] text-text-secondary uppercase">
              // NO_LOGS_ACTIVE
            </span>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!draftContent.trim()}
            className="px-4 py-1.5 bg-text-primary text-background hover:bg-accent hover:text-background font-mono text-xs uppercase tracking-widest font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            <span>Post</span>
            <Send size={11} />
          </button>
        </div>

        {/* IDENTITY & CONTENT AREA */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Identitas Penulis */}
          <div className="flex items-center gap-2.5 pb-2 border-b border-border/40">
            <div className="w-8 h-8 rounded-full border border-border bg-surface flex items-center justify-center font-mono text-[11px] text-text-primary font-bold tracking-tighter">
              {avatarInitials || (myAlias ? myAlias[0].toUpperCase() : myId.slice(3))}
            </div>
            <div className="flex items-baseline gap-1.5 font-mono text-xs">
              <span className="font-semibold text-text-primary">
                {myAlias || myId}
              </span>
              {myAlias && (
                <span className="text-[10px] text-text-secondary">
                  [{myId}]
                </span>
              )}
              <span className="text-[9px] text-accent px-1 border border-accent/60 uppercase ml-1">
                Anonim
              </span>
            </div>
          </div>

          {/* Text Area Menulis Zen */}
          <textarea
            ref={textareaRef}
            value={draftContent}
            onChange={(e) => onDraftChange(e.target.value)}
            placeholder="Mulai bercerita tentang sisi yang belum pernah terlihat..."
            maxLength={500}
            className="w-full h-64 sm:h-72 bg-transparent text-base font-sans text-text-primary placeholder:text-text-secondary/40 focus:outline-none resize-none leading-relaxed"
          />
        </div>

        {/* BOTTOM TOOLS BAR */}
        <div className="border-t border-border/80 p-4 shrink-0 bg-surface/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Tag Suasana (Vibe) */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-mono text-text-secondary uppercase mr-1">
              Vibe:
            </span>
            {tagOptions.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onTagChange(tag)}
                className={`text-[10px] font-mono px-2 py-0.5 uppercase tracking-wider transition-colors border ${
                  selectedTag === tag
                    ? 'border-accent text-accent font-semibold bg-accent/10'
                    : 'border-border/60 text-text-secondary hover:text-text-primary'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Karakter Counter */}
          <div className="text-right font-mono text-[10px] text-text-secondary/70">
            {draftContent.length}/500 karakter
          </div>
        </div>

      </div>
    </div>
  );
};
