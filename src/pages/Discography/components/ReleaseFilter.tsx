import React, { useRef, useEffect } from 'react';
import { Search, X, ArrowDownWideNarrow, ArrowUpNarrowWide } from 'lucide-react';
import { ReleaseType } from '../../../types/discography';

interface ReleaseFilterProps {
  selectedType: ReleaseType | null;
  onSelectType: (type: ReleaseType | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isSearchOpen: boolean;
  onToggleSearch: () => void;
  sortOrder: 'desc' | 'asc';
  onToggleSort: () => void;
}

export const ReleaseFilter: React.FC<ReleaseFilterProps> = ({
  selectedType,
  onSelectType,
  searchQuery,
  onSearchChange,
  isSearchOpen,
  onToggleSearch,
  sortOrder,
  onToggleSort,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchOpen]);

  const filterOptions: { label: string; value: ReleaseType | null }[] = [
    { label: 'All', value: null },
    { label: 'Singles', value: 'Single' },
    { label: 'EP', value: 'EP' },
    { label: 'Albums', value: 'Album' }
  ];

  return (
    <div className="relative border-b border-border pb-3.5 mb-8 flex items-center min-h-[42px]">
      {isSearchOpen ? (
        /* Mode Input Pencarian Aktif */
        <div className="flex items-center w-full gap-3">
          <Search size={16} className="text-text-secondary shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="SEARCH RELEASES OR TRACKS..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="flex-1 bg-transparent py-1 text-xs font-mono uppercase tracking-widest text-text-primary placeholder:text-text-secondary/50 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => {
              onSearchChange('');
              onToggleSearch();
            }}
            className="p-1 text-text-secondary hover:text-text-primary transition-colors shrink-0"
            title="Tutup Pencarian"
            aria-label="Tutup Pencarian"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        /* Mode Filter Normal: Tombol Search di Kiri, Tab Filter Center, Tombol Sort di Kanan */
        <div className="relative w-full flex items-center justify-between">
          {/* Tombol Search di Pojok Kiri */}
          <button
            type="button"
            onClick={onToggleSearch}
            className={`p-1.5 transition-colors shrink-0 z-10 ${
              searchQuery
                ? 'text-accent'
                : 'text-text-secondary hover:text-text-primary'
            }`}
            title="Cari rilisan"
            aria-label="Cari rilisan"
          >
            <Search size={16} />
          </button>

          {/* Tab Filter Tetap Center Presisi */}
          <div className="absolute inset-0 flex justify-center items-center gap-4 sm:gap-6 md:gap-8 pointer-events-none">
            {filterOptions.map((opt) => {
              const isActive = selectedType === opt.value;
              return (
                <button
                  key={opt.label}
                  onClick={() => onSelectType(opt.value)}
                  className={`pointer-events-auto font-mono text-[11px] sm:text-xs uppercase tracking-widest transition-colors py-1 ${
                    isActive
                      ? 'text-text-primary border-b border-text-primary font-semibold'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Tombol Sort (Terbaru / Terlama) di Pojok Kanan */}
          <button
            type="button"
            onClick={onToggleSort}
            className={`p-1.5 transition-colors shrink-0 z-10 ${
              sortOrder === 'asc'
                ? 'text-accent'
                : 'text-text-secondary hover:text-text-primary'
            }`}
            title={sortOrder === 'desc' ? 'Urutan: Terbaru (klik untuk terlama)' : 'Urutan: Terlama (klik untuk terbaru)'}
            aria-label="Ubah urutan tanggal rilisan"
          >
            {sortOrder === 'desc' ? (
              <ArrowDownWideNarrow size={16} />
            ) : (
              <ArrowUpNarrowWide size={16} />
            )}
          </button>
        </div>
      )}
    </div>
  );
};
