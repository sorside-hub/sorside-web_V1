import React, { useState, useEffect, useRef } from 'react';
import { X, Search, Plus, Hash } from 'lucide-react';

interface TopicSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTopic: (topic: string) => void;
  existingTopics: string[];
  currentTopic?: string;
}

export const TopicSearchModal: React.FC<TopicSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectTopic,
  existingTopics,
  currentTopic,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  // Format helper: bersihkan dari spasi / hashtag ganda
  const cleanFormat = (text: string) => {
    return text.trim().replace(/^#+/, '').replace(/\s+/g, '-').toLowerCase();
  };

  const formattedSearch = cleanFormat(searchQuery);

  // Filter topik yang ada berdasarkan search query
  const filteredTopics = Array.from(
    new Set(
      existingTopics
        .map((t) => cleanFormat(t))
        .filter((t) => t.length > 0)
    )
  ).filter((t) => t.includes(formattedSearch));

  // Cek apakah query persis sama dengan topik yang sudah ada
  const exactMatchExists = filteredTopics.some((t) => t === formattedSearch);

  const handleChoose = (topicName: string) => {
    const clean = cleanFormat(topicName);
    if (clean) {
      onSelectTopic(clean);
      setSearchQuery('');
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-background/90 backdrop-blur-sm flex items-start pt-16 sm:items-center sm:pt-0 justify-center p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-background border border-border flex flex-col shadow-2xl max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* HEADER MODAL */}
        <div className="p-3.5 border-b border-border/80 flex items-center justify-between bg-surface/40">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-text-primary">
            <Hash size={15} className="text-accent" />
            <span>Pilih atau Buat Topic</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1 text-text-secondary hover:text-text-primary border border-transparent hover:border-border transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* INPUT SEARCH */}
        <div className="p-3 border-b border-border/60 bg-surface/20">
          <div className="relative flex items-center">
            <Search size={14} className="absolute left-3 text-text-secondary" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari atau ketik topic baru..."
              className="w-full bg-background border border-border pl-9 pr-8 py-2 font-mono text-xs text-text-primary placeholder:text-text-secondary/40 focus:outline-none focus:border-accent"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 text-text-secondary hover:text-text-primary p-0.5"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* DAFTAR TOPIK */}
        <div className="p-3 overflow-y-auto space-y-2 flex-1 min-h-[200px]">
          {/* Opsi Buat Topik Baru jika pengguna mengetik dan belum persis sama */}
          {formattedSearch.length > 0 && !exactMatchExists && (
            <button
              type="button"
              onClick={() => handleChoose(formattedSearch)}
              className="w-full p-2.5 border border-dashed border-border/60 hover:border-border bg-surface/30 hover:bg-surface/70 transition-colors flex items-center justify-between text-left font-mono text-xs text-text-primary group"
            >
              <div className="flex items-center gap-2">
                <Plus size={14} className="shrink-0 text-accent" />
                <span>Buat topic <strong className="font-bold">#{formattedSearch}</strong></span>
              </div>
              <span className="text-[10px] uppercase tracking-wider opacity-60 group-hover:opacity-100 text-text-secondary">
                + Tambah
              </span>
            </button>
          )}

          {/* Topik Terdaftar */}
          <div className="space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-wider text-text-secondary/70 py-1 px-1">
              {formattedSearch ? 'Hasil Pencarian Topic:' : 'Topic Populer saat ini:'}
            </div>

            {filteredTopics.length === 0 && exactMatchExists && (
              <p className="text-xs font-mono text-text-secondary/60 py-4 text-center">
                Topic #{formattedSearch} sudah terdaftar di bawah.
              </p>
            )}

            {filteredTopics.length === 0 && !formattedSearch && (
              <p className="text-xs font-mono text-text-secondary/60 py-4 text-center">
                Belum ada topic. Ketik untuk membuat topic baru.
              </p>
            )}

            {filteredTopics.map((topic) => {
              const isSelected = cleanFormat(currentTopic || '') === topic;

              return (
                <button
                  key={topic}
                  type="button"
                  onClick={() => handleChoose(topic)}
                  className={`w-full p-2.5 border text-left font-mono text-xs flex items-center justify-between transition-all ${
                    isSelected
                      ? 'border-accent bg-accent/10 text-accent font-bold'
                      : 'border-border/60 hover:border-border bg-surface/30 hover:bg-surface/70 text-text-primary'
                  }`}
                >
                  <span className="truncate">#{topic}</span>
                  {isSelected && (
                    <span className="text-[10px] uppercase font-semibold text-accent px-1.5 py-0.5 border border-accent/40">
                      Terpilih
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
