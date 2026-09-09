import React, { useState } from 'react';
import { X, Search, Plus, Hash } from 'lucide-react';

export interface TopicItem {
  name: string;
  count: number;
}

interface TopicSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTopic: (topic: string) => void;
  existingTopics: (string | TopicItem)[];
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

  // Normalize existingTopics into TopicItem[]
  const normalizedTopics: TopicItem[] = existingTopics
    .map((item) => {
      if (typeof item === 'string') {
        const name = cleanFormat(item);
        return name ? { name, count: 1 } : null;
      }
      const name = cleanFormat(item.name);
      return name ? { name, count: item.count || 1 } : null;
    })
    .filter((t): t is TopicItem => t !== null && t.name.length > 0);

  // Dedup while preserving max count
  const topicMap = new Map<string, number>();
  normalizedTopics.forEach((t) => {
    topicMap.set(t.name, (topicMap.get(t.name) || 0) + t.count);
  });

  const allTopics: TopicItem[] = Array.from(topicMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Filter topik berdasarkan search query
  const filteredTopics = allTopics.filter((t) => t.name.includes(formattedSearch));

  // Cek apakah query persis sama dengan topik yang sudah ada
  const exactMatchExists = allTopics.some((t) => t.name === formattedSearch);

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
            <span>Pilih atau Buat Topik</span>
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
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/^#+/, ''))}
              placeholder="Cari atau ketik topik baru..."
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
              className="w-full p-2.5 border border-dashed border-border/70 hover:border-border bg-surface/30 hover:bg-surface/70 transition-colors flex items-center justify-between text-left font-mono text-xs text-text-primary group"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <Plus size={14} className="shrink-0 text-accent" />
                <span className="truncate text-text-primary">
                  Buat topik <span className="text-accent font-bold">#</span><strong className="font-bold text-text-primary">{formattedSearch}</strong>
                </span>
              </div>
              <span className="text-[10px] uppercase tracking-wider text-text-secondary group-hover:text-text-primary font-mono shrink-0 ml-2 transition-colors">
                + Gunakan
              </span>
            </button>
          )}

          {/* Topik Terdaftar */}
          <div className="space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-wider text-text-secondary/70 py-1 px-1 flex items-center justify-between">
              <span>{formattedSearch ? 'Hasil Pencarian Topik:' : 'Topik Aktif Saat Ini:'}</span>
              {allTopics.length > 0 && (
                <span className="text-text-secondary/50 font-normal">({filteredTopics.length} topik)</span>
              )}
            </div>

            {filteredTopics.length === 0 && exactMatchExists && (
              <p className="text-xs font-mono text-text-secondary/60 py-4 text-center">
                Topik #{formattedSearch} sudah terdaftar di bawah.
              </p>
            )}

            {allTopics.length === 0 && !formattedSearch && (
              <div className="py-8 px-4 text-center font-mono text-xs text-text-secondary border border-border/50 bg-surface/20">
                Belum ada topik yang dibuat
              </div>
            )}

            {allTopics.length > 0 && filteredTopics.length === 0 && formattedSearch && (
              <p className="text-xs font-mono text-text-secondary/60 py-4 text-center">
                Tidak ada topik terdaftar yang cocok dengan &quot;{formattedSearch}&quot;.
              </p>
            )}

            {filteredTopics.map((topic, index) => {
              const isSelected = cleanFormat(currentTopic || '') === topic.name;
              const isTop = index === 0 && topic.count > 1;

              return (
                <button
                  key={topic.name}
                  type="button"
                  onClick={() => handleChoose(topic.name)}
                  className={`w-full p-2.5 border text-left font-mono text-xs flex items-center justify-between transition-all group ${
                    isSelected
                      ? 'border-accent bg-accent/10 font-bold'
                      : 'border-border/60 hover:border-border bg-surface/30 hover:bg-surface/70'
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-accent font-bold">#</span>
                    <span className="text-text-primary lowercase font-semibold truncate">{topic.name}</span>
                    {isTop && (
                      <span className="text-[9px] font-mono px-1 py-0.2 bg-accent/15 text-accent border border-accent/30 rounded uppercase font-semibold shrink-0">
                        Populer
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="text-[11px] font-mono text-text-secondary/70 group-hover:text-text-primary transition-colors">
                      {topic.count} {topic.count === 1 ? 'cerita' : 'cerita'}
                    </span>
                    {isSelected && (
                      <span className="text-[10px] uppercase font-semibold text-accent px-1.5 py-0.5 border border-accent/40">
                        Terpilih
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
