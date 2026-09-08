import React, { useState, useMemo, useEffect, useRef } from 'react';
import { X, Search, Hash, Radio, Flame, Sparkles, ChevronRight, CornerDownRight } from 'lucide-react';
import { Transmission } from './TransmissionItem';

interface TopicStat {
  name: string;
  count: number;
}

interface FrequencySearchDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  transmissions: Transmission[];
  onSelectTopic: (topic: string) => void;
  onSelectAuthor: (authorId: string, authorAlias?: string) => void;
  onSelectTransmission: (tx: Transmission) => void;
  currentSearchQuery: string;
  onApplySearchQuery: (query: string) => void;
}

export const FrequencySearchDrawer: React.FC<FrequencySearchDrawerProps> = ({
  isOpen,
  onClose,
  transmissions,
  onSelectTopic,
  onSelectAuthor,
  onSelectTransmission,
  currentSearchQuery,
  onApplySearchQuery,
}) => {
  const [query, setQuery] = useState(currentSearchQuery);
  const inputRef = useRef<HTMLInputElement>(null);
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);

  // Sync internal search input with incoming prop without auto-forcing keyboard
  useEffect(() => {
    if (isOpen) {
      setQuery(currentSearchQuery);
    }
  }, [isOpen, currentSearchQuery]);

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

      // Usap ke kiri (<-) pada drawer kiri untuk menutupnya
      if (deltaX < -60 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
        onClose();
      }
    }
  };

  // Agregasi Topik & Hitung Statistik Jumlah Sinyal / Cerita (ala Threads)
  const topicStats: TopicStat[] = useMemo(() => {
    const counts: Record<string, number> = {};

    transmissions.forEach((tx) => {
      if (tx.tag) {
        const cleanTag = tx.tag.trim().replace(/^#+/, '').toLowerCase();
        if (cleanTag) {
          counts[cleanTag] = (counts[cleanTag] || 0) + 1;
        }
      }
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count); // Urutkan dari yang paling banyak sinyal (trending)
  }, [transmissions]);

  // Filter topik sesuai ketikan
  const filteredTopics = useMemo(() => {
    const q = query.toLowerCase().trim().replace(/^#+/, '');
    if (!q) return topicStats;
    return topicStats.filter((t) => t.name.toLowerCase().includes(q));
  }, [topicStats, query]);

  // Cari Transmisi & Penulis langsung di drawer
  const searchResults = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return { transmissions: [], authors: [] };

    // Cari transmisi yang mengandung kata kunci
    const matchedTx = transmissions.filter((tx) => {
      const contentMatch = tx.content.toLowerCase().includes(q);
      const tagMatch = tx.tag && tx.tag.toLowerCase().includes(q);
      return contentMatch || tagMatch;
    }).slice(0, 8); // Batasi 8 teratas agar ringan

    // Cari sinyal author / alias
    const authorMap = new Map<string, { id: string; alias?: string; count: number }>();
    transmissions.forEach((tx) => {
      const matchId = tx.authorId.toLowerCase().includes(q);
      const matchAlias = tx.authorAlias && tx.authorAlias.toLowerCase().includes(q);
      if (matchId || matchAlias) {
        const existing = authorMap.get(tx.authorId);
        if (existing) {
          existing.count += 1;
        } else {
          authorMap.set(tx.authorId, {
            id: tx.authorId,
            alias: tx.authorAlias,
            count: 1,
          });
        }
      }
    });

    return {
      transmissions: matchedTx,
      authors: Array.from(authorMap.values()).slice(0, 4),
    };
  }, [transmissions, query]);

  if (!isOpen) return null;

  const handlePickTopic = (topicName: string) => {
    const formatted = `#${topicName.replace(/^#+/, '')}`;
    onSelectTopic(formatted);
    onClose();
  };

  const handlePickAuthor = (authorId: string, authorAlias?: string) => {
    onSelectAuthor(authorId, authorAlias);
    onClose();
  };

  const handlePickTransmission = (tx: Transmission) => {
    onSelectTransmission(tx);
    onClose();
  };

  const handleFullSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onApplySearchQuery(query.trim());
      onClose();
    }
  };

  const isQueryEmpty = !query.trim();

  return (
    <div className="fixed inset-0 z-50 flex justify-start animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel (Slide dari Kiri) */}
      <div 
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative w-full max-w-sm sm:max-w-md bg-background border-r border-border h-full flex flex-col shadow-2xl z-10 animate-in slide-in-from-left duration-200"
      >
        
        {/* Header Drawer */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-surface/50 shrink-0">
          <div className="flex items-center gap-2">
            <Radio size={16} className="text-accent animate-pulse" />
            <span className="font-mono text-xs uppercase tracking-wider text-text-primary font-bold">
              Eksplorasi Sinyal
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 border border-border text-text-secondary hover:text-text-primary hover:border-text-primary transition-colors"
            aria-label="Tutup Pencarian"
          >
            <X size={15} />
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="p-4 border-b border-border/80 bg-surface/20 shrink-0">
          <form onSubmit={handleFullSearchSubmit} className="relative flex items-center">
            <Search size={15} className="absolute left-3 text-text-secondary/70 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari topic #, sinyal ID, kata..."
              className="w-full bg-surface border border-border/90 pl-9 pr-9 py-2.5 font-mono text-xs text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:border-accent transition-all"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 p-0.5 text-text-secondary hover:text-text-primary transition-colors"
                title="Bersihkan"
              >
                <X size={13} />
              </button>
            )}
          </form>

          {query.trim() && (
            <button
              type="button"
              onClick={() => {
                onApplySearchQuery(query.trim());
                onClose();
              }}
              className="mt-2.5 w-full py-1.5 px-2.5 border border-border/70 bg-surface/60 hover:bg-surface hover:border-accent text-left font-mono text-[11px] text-text-secondary hover:text-text-primary flex items-center justify-between transition-colors"
            >
              <span className="truncate">Filter feed dengan: &quot;{query.trim()}&quot;</span>
              <ChevronRight size={13} className="text-accent shrink-0 ml-1" />
            </button>
          )}
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          
          {/* JIKA ADA KETIKAN & DITEMUKAN PENULIS */}
          {!isQueryEmpty && searchResults.authors.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 font-mono text-[11px] text-text-secondary uppercase tracking-wider font-semibold">
                <Sparkles size={13} className="text-accent" />
                <span>Penulis Ditemukan</span>
              </div>
              <div className="space-y-1.5">
                {searchResults.authors.map((auth) => (
                  <button
                    key={auth.id}
                    onClick={() => handlePickAuthor(auth.id, auth.alias)}
                    className="w-full p-2.5 text-left border border-border/60 hover:border-accent hover:bg-surface/80 flex items-center justify-between transition-all group"
                  >
                    <div>
                      <div className="font-mono text-xs font-bold text-text-primary group-hover:text-accent">
                        {auth.alias || auth.id}
                      </div>
                      <div className="font-mono text-[10px] text-text-secondary">
                        {auth.id} • {auth.count} sinyal
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-text-secondary/50 group-hover:text-accent transition-colors" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SEKSI TOPIK (TRENDING / FILTERED ALIKASI THREADS) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between font-mono text-[11px] text-text-secondary uppercase tracking-wider font-semibold">
              <div className="flex items-center gap-1.5">
                <Flame size={13} className="text-accent" />
                <span>{isQueryEmpty ? 'Topic Hangat (Frekuensi)' : 'Topic Sesuai'}</span>
              </div>
              <span className="text-[10px] font-normal text-text-secondary/70">
                {filteredTopics.length} topic
              </span>
            </div>

            {filteredTopics.length === 0 ? (
              <div className="p-4 border border-dashed border-border text-center">
                <p className="font-mono text-xs text-text-secondary">Tidak ada topic &quot;{query}&quot;</p>
              </div>
            ) : (
              <div className="divide-y divide-border/40 border border-border/70 bg-surface/20">
                {filteredTopics.map((top, idx) => (
                  <button
                    key={top.name}
                    onClick={() => handlePickTopic(top.name)}
                    className="w-full p-3 text-left hover:bg-surface flex items-center justify-between group transition-colors"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-mono text-xs font-semibold text-text-primary group-hover:text-accent transition-colors flex items-center gap-1">
                        <span className="text-accent/80 font-bold">#</span>
                        <span className="truncate">{top.name}</span>
                        {idx === 0 && isQueryEmpty && (
                          <span className="ml-1.5 px-1.5 py-0.2 text-[9px] font-mono uppercase bg-accent/15 text-accent border border-accent/30 rounded-none">
                            Populer
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-[10px] text-text-secondary mt-0.5">
                        {top.count} sinyal / cerita
                      </div>
                    </div>
                    <ChevronRight size={13} className="text-text-secondary/40 group-hover:text-accent transition-colors shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* JIKA ADA KETIKAN & DITEMUKAN TRANSMISI COCOK */}
          {!isQueryEmpty && searchResults.transmissions.length > 0 && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-1.5 font-mono text-[11px] text-text-secondary uppercase tracking-wider font-semibold">
                <CornerDownRight size={13} className="text-accent" />
                <span>Sinyal & Cerita Cocok</span>
              </div>
              <div className="space-y-2">
                {searchResults.transmissions.map((tx) => (
                  <div
                    key={tx.id}
                    onClick={() => handlePickTransmission(tx)}
                    className="p-3 border border-border/70 bg-surface/40 hover:bg-surface hover:border-accent cursor-pointer transition-all space-y-1.5"
                  >
                    <div className="flex items-center justify-between font-mono text-[10px] text-text-secondary">
                      <span className="font-bold text-text-primary truncate">
                        {tx.authorAlias || tx.authorId}
                      </span>
                      {tx.tag && (
                        <span className="shrink-0 ml-2 font-mono font-semibold flex items-center gap-0.5">
                          <span className="text-accent font-bold">#</span>
                          <span className="text-text-primary lowercase">{tx.tag.replace(/^#+/, '').toLowerCase()}</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-primary/90 font-sans line-clamp-2 leading-relaxed">
                      {tx.content}
                    </p>
                    <div className="font-mono text-[9px] text-text-secondary/60 text-right">
                      {tx.replies && tx.replies.length > 0 ? `${tx.replies.length} balasan` : 'Buka sinyal'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
