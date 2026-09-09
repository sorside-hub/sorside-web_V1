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
    <header className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border/80 -mx-4 md:-mx-12 -mt-4 md:-mt-12 px-4 md:px-12 py-1.5 mb-1 transition-all duration-200 shadow-sm">
      <div className="max-w-xl mx-auto relative flex items-center justify-between min-h-[36px]">
        {/* Tombol Kiri: Search / Jelajah (Mepet Kiri, Frameless Clean) */}
        <button
          onClick={onToggleSearch}
          className={`p-1.5 transition-colors flex items-center justify-center shrink-0 ${
            isSearchOpen 
              ? 'text-accent' 
              : 'text-text-secondary hover:text-text-primary'
          }`}
          title={isSearchOpen ? 'Tutup Eksplorasi' : 'Eksplorasi'}
          aria-label={isSearchOpen ? 'Tutup Eksplorasi' : 'Eksplorasi'}
        >
          {isSearchOpen ? <X size={19} /> : <Search size={19} />}
        </button>

        {/* Judul Tengah: Presisi Center, Bersih & Minimalis */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <h2 className="text-lg sm:text-xl font-display uppercase tracking-[0.22em] text-text-primary leading-tight">
            Frequency
          </h2>
        </div>

        {/* Tombol Kanan: Menu Garis Tiga / Hamburger (Mepet Kanan, Frameless Clean) */}
        <button
          onClick={onOpenMenu}
          className="p-1.5 text-text-secondary hover:text-text-primary transition-colors flex items-center justify-center shrink-0"
          title="Buka Menu"
          aria-label="Buka Menu Frekuensi"
        >
          <Menu size={19} />
        </button>
      </div>
    </header>
  );
};

