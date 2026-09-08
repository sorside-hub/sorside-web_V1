import React, { useEffect, useRef } from 'react';
import { X, Send } from 'lucide-react';

interface TransmissionComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string, tag: string) => void;
  myId: string;
  myAlias?: string;
  draftContent: string;
  onDraftChange: (content: string) => void;
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
  avatarInitials,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fokus otomatis dan dukungan popstate (tombol Back HP / Browser)
  useEffect(() => {
    if (!isOpen) return;

    // Tambahkan state ke history agar tombol Back menutup modal, bukan keluar dari web
    window.history.pushState({ composerOpen: true }, '');

    const handlePopState = () => {
      onClose();
    };

    window.addEventListener('popstate', handlePopState);

    // Auto fokus textarea
    const timer = setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        // Taruh kursor di ujung teks draft
        const len = textareaRef.current.value.length;
        textareaRef.current.setSelectionRange(len, len);
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
          {/* Identitas Penulis: Sembunyikan ID jika punya Alias, tanpa badge anonim */}
          <div className="flex items-center gap-2.5 pb-2 border-b border-border/40">
            <div className="w-8 h-8 rounded-full border border-border bg-surface flex items-center justify-center font-mono text-[11px] text-text-primary font-bold tracking-tighter">
              {avatarInitials || (myAlias ? myAlias[0].toUpperCase() : myId.slice(3))}
            </div>
            <div className="flex items-baseline font-mono text-xs">
              <span className="font-semibold text-text-primary">
                {myAlias || myId}
              </span>
            </div>
          </div>

          {/* Area Teks Utama: Fokus dan Nyaman Tanpa Batas Kotak */}
          <textarea
            ref={textareaRef}
            value={draftContent}
            onChange={(e) => onDraftChange(e.target.value)}
            placeholder="Tuliskan apa yang sedang melintas di pikiranmu... tanpa jejak identitas, tanpa penghakiman."
            rows={7}
            maxLength={1000}
            className="w-full bg-transparent font-sans text-base text-text-primary placeholder:text-text-secondary/40 focus:outline-none resize-none leading-relaxed"
          />
        </div>

        {/* BOTTOM CONTROLS: PILIHAN VIBE TAG & COUNTER KARAKTER */}
        <div className="border-t border-border/80 p-4 bg-surface/30 space-y-3 shrink-0">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] uppercase tracking-wider text-text-secondary">
              Vibe Frekuensi:
            </span>
            <span className="font-mono text-[11px] text-text-secondary">
              {draftContent.length}/1000
            </span>
          </div>

          {/* Pilihan Tag Frekuensi */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {tagOptions.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => onTagChange(tag)}
                className={`px-2.5 py-1 text-[11px] font-mono uppercase tracking-wider border transition-all ${
                  selectedTag === tag
                    ? 'border-accent bg-accent text-background font-bold'
                    : 'border-border/70 text-text-secondary hover:border-border hover:text-text-primary bg-surface/40'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
