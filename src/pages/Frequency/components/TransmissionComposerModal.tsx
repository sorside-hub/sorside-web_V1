import React, { useEffect, useRef } from 'react';
import { X, Send, ChevronRight, Plus } from 'lucide-react';
import { TopicSearchModal, TopicItem } from './TopicSearchModal';

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
  tagOptions: (string | TopicItem)[];
  avatarInitials?: string;
  isTopicModalOpen: boolean;
  onOpenTopicModal: () => void;
  onCloseTopicModal: () => void;
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
  isTopicModalOpen,
  onOpenTopicModal,
  onCloseTopicModal,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-fokus textarea saat modal terbuka
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const len = textareaRef.current.value.length;
        textareaRef.current.setSelectionRange(len, len);
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftContent.trim()) return;
    onSubmit(draftContent.trim(), selectedTag);
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col md:items-center md:justify-center md:bg-background/90 md:backdrop-blur-md md:p-4">
      {/* Container Menulis: Fullscreen di Mobile, Modal Elegan di Desktop */}
      <div className="w-full h-full md:h-auto md:max-w-xl md:border md:border-border bg-background flex flex-col justify-between">
        
        {/* TOP BAR MODAL */}
        <div className="border-b border-border/80 px-4 py-3 flex items-center justify-between shrink-0 bg-surface/40">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-mono text-text-secondary hover:text-text-primary uppercase tracking-wider flex items-center gap-1 py-1 px-2 border border-transparent hover:border-border transition-colors"
          >
            <X size={15} />
            <span>Batal</span>
          </button>

          <div className="flex flex-col items-center">
            <span className="font-display text-sm uppercase tracking-[0.2em] text-text-primary">
              Cerita Baru
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
          {/* Identitas Penulis & Pilihan Topik Pas Samping ID/Alias */}
          <div className="flex items-center gap-2 pb-2 border-b border-border/40 flex-wrap">
            <div className="w-8 h-8 rounded-full border border-border bg-surface flex items-center justify-center font-mono text-[11px] text-text-primary font-bold tracking-tighter shrink-0">
              {avatarInitials || (myAlias ? myAlias[0].toUpperCase() : myId.slice(3))}
            </div>

            <div className="flex items-center gap-1.5 font-mono text-xs flex-wrap">
              <span className="font-semibold text-text-primary">
                {myAlias || myId}
              </span>

              <ChevronRight size={13} className="text-text-secondary/50 shrink-0" />

              {/* Tombol Pilih / Tampil Topik */}
              {selectedTag ? (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={onOpenTopicModal}
                    className="font-mono text-xs hover:underline font-semibold flex items-center gap-0.5"
                    title="Ganti topic"
                  >
                    <span className="text-accent font-bold">#</span>
                    <span className="text-text-primary lowercase">{selectedTag.replace(/^#+/, '').toLowerCase()}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onTagChange('')}
                    className="p-0.5 text-text-secondary/60 hover:text-text-primary transition-colors"
                    title="Hapus topic"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onOpenTopicModal}
                  className="flex items-center gap-1 font-mono text-xs text-text-secondary hover:text-text-primary transition-colors"
                >
                  <Plus size={11} className="text-accent" />
                  <span>Tambah Topic</span>
                </button>
              )}
            </div>
          </div>

          {/* Area Teks Utama: Fokus dan Nyaman Tanpa Batas Kotak */}
          <textarea
            ref={textareaRef}
            value={draftContent}
            onChange={(e) => onDraftChange(e.target.value)}
            placeholder="Tuliskan apa yang sedang melintas di pikiranmu... tanpa jejak identitas, tanpa penghakiman."
            rows={7}
            maxLength={2000}
            className="w-full bg-transparent font-sans text-base text-text-primary placeholder:text-text-secondary/40 focus:outline-none resize-none leading-relaxed"
          />
        </div>

        {/* BOTTOM CONTROLS: HANYA COUNTER KARAKTER */}
        <div className="border-t border-border/80 px-4 py-2 bg-surface/30 flex justify-end shrink-0">
          <span className="font-mono text-xs text-text-secondary">
            {draftContent.length}/2000
          </span>
        </div>

      </div>

      {/* MODAL SEARCH & CREATION TOPIK */}
      <TopicSearchModal
        isOpen={isTopicModalOpen}
        onClose={onCloseTopicModal}
        onSelectTopic={(topic) => onTagChange(topic)}
        existingTopics={tagOptions}
        currentTopic={selectedTag}
      />
    </div>
  );
};
