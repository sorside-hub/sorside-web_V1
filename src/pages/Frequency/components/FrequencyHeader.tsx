import React from 'react';
import { Search, Menu, X } from 'lucide-react';

interface FrequencyHeaderProps {
  onToggleSearch: () => void;
  isSearchOpen: boolean;
  onOpenMenu: () => void;
}

export const FrequencyHeader: React.FC<FrequencyHeaderProps> = ({
  onToggleSearch,
  isSearchOpen,
  onOpenMenu,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border/80 -mx-4 md:-mx-12 -mt-4 md:-mt-12 px-4 md:px-12 py-3 mb-2 transition-all duration-200 shadow-sm">
      <div className="max-w-xl mx-auto relative flex items-center justify-between min-h-[44px]">
        {/* Tombol Kiri: Search / Jelajah (Mepet Kiri) */}
        <button
          onClick={onToggleSearch}
          className={`p-2 border transition-colors flex items-center justify-center rounded-none shrink-0 ${
            isSearchOpen 
              ? 'border-accent bg-accent/10 text-accent' 
              : 'border-border text-text-secondary hover:text-accent hover:border-accent bg-surface/80'
          }`}
          title={isSearchOpen ? 'Tutup Eksplorasi' : 'Eksplorasi'}
          aria-label={isSearchOpen ? 'Tutup Eksplorasi' : 'Eksplorasi'}
        >
          {isSearchOpen ? <X size={16} /> : <Search size={16} />}
        </button>

        {/* Judul Tengah: Presisi Center, Ukuran Ramping ala Threads */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <h2 className="text-xl sm:text-2xl font-display uppercase tracking-[0.22em] text-text-primary leading-tight">
            Frequency
          </h2>
          <p className="text-[10px] font-mono text-text-secondary uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse inline-block" />
            2-Way Open Signal
          </p>
        </div>

        {/* Tombol Kanan: Menu Garis Tiga / Hamburger (Mepet Kanan) */}
        <button
          onClick={onOpenMenu}
          className="p-2 border border-border text-text-secondary hover:text-text-primary hover:border-text-primary transition-colors flex items-center justify-center bg-surface/80 rounded-none shrink-0 group"
          title="Buka Menu"
          aria-label="Buka Menu Frekuensi"
        >
          <Menu size={16} className="text-text-secondary group-hover:text-accent transition-colors" />
        </button>
      </div>
    </header>
  );
};

