import React, { useEffect, useState } from 'react';
import { X, Copy, Check, FileText, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface LyricsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  releaseTitle?: string;
  trackNumber?: number;
  lyrics?: string;
  originSlug?: string;
}

export const LyricsModal: React.FC<LyricsModalProps> = ({
  isOpen,
  onClose,
  title,
  releaseTitle,
  trackNumber,
  lyrics,
  originSlug
}) => {
  const [copied, setCopied] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleCopy = async () => {
    if (!lyrics) return;
    try {
      await navigator.clipboard.writeText(lyrics);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy lyrics:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lyrics-modal-title"
      className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-surface border border-border w-full max-w-md max-h-[82vh] sm:max-h-[85vh] flex flex-col shadow-2xl rounded-xs overflow-hidden"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-border/80 flex items-start justify-between bg-surface/90 gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-3.5 h-3.5 text-accent shrink-0" />
              <span className="font-mono text-[10px] tracking-widest uppercase text-text-secondary">
                {trackNumber ? `Track ${String(trackNumber).padStart(2, '0')} • Lyrics` : 'Lyrics Archive'}
              </span>
            </div>
            <h2
              id="lyrics-modal-title"
              className="text-lg sm:text-xl font-display uppercase tracking-wide text-text-primary truncate"
            >
              {title}
            </h2>
            {releaseTitle && (
              <p className="text-xs font-sans text-text-secondary truncate mt-0.5">
                {releaseTitle}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 border border-border/60 hover:border-text-primary text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors shrink-0 cursor-pointer"
            title="Close"
            aria-label="Close lyrics modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body - Scrollable Lyrics */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 font-mono text-xs sm:text-sm leading-relaxed text-text-primary/90 whitespace-pre-wrap selection:bg-accent selection:text-white">
          {lyrics ? (
            <div className="space-y-4">
              {lyrics}
            </div>
          ) : (
            <div className="py-12 text-center text-text-secondary font-mono text-xs">
              <p>No official lyrics registered for this track yet.</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 border-t border-border/80 bg-surface/90 flex items-center justify-between gap-2">
          {originSlug ? (
            <Link
              to={`/the-side/${originSlug}`}
              onClick={onClose}
              className="inline-flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider text-text-secondary hover:text-accent transition-colors group/origin"
            >
              <span>Origin Story</span>
              <ArrowUpRight className="w-3 h-3 transition-transform group-hover/origin:translate-x-0.5 group-hover/origin:-translate-y-0.5" />
            </Link>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            {lyrics && (
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border hover:border-text-primary bg-surface hover:bg-surface-hover text-text-primary text-xs font-mono uppercase tracking-wider transition-all cursor-pointer"
                title="Copy Lyrics"
              >
                {copied ? (
                  <>
                    <Check size={12} className="text-accent" />
                    <span>COPIED</span>
                  </>
                ) : (
                  <>
                    <Copy size={12} />
                    <span>COPY</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 border border-text-primary bg-text-primary text-background hover:bg-text-primary/90 text-xs font-mono uppercase tracking-wider font-bold transition-colors cursor-pointer"
            >
              DONE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
