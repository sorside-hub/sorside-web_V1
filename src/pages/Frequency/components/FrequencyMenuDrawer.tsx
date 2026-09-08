import React, { useRef } from 'react';
import { X, User, Info, Radio, ChevronRight, Key } from 'lucide-react';

interface FrequencyMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  myId: string;
  myAlias?: string;
  myPasskey?: string;
  avatarInitials: string;
  onOpenProfile: () => void;
  onOpenInfo: () => void;
  onOpenRecoveryModal: () => void;
}

export const FrequencyMenuDrawer: React.FC<FrequencyMenuDrawerProps> = ({
  isOpen,
  onClose,
  myId,
  myAlias,
  myPasskey,
  avatarInitials,
  onOpenProfile,
  onOpenInfo,
  onOpenRecoveryModal,
}) => {
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);

  if (!isOpen) return null;

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

      // Usap ke kanan (->) pada drawer kanan untuk menutupnya
      if (deltaX > 60 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Drawer Panel */}
      <aside 
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative w-full max-w-xs sm:max-w-sm h-full bg-surface/95 border-l border-border shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-250 ease-out"
        role="dialog"
        aria-modal="true"
        aria-label="Menu Frekuensi"
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-border/80 flex items-center justify-between bg-surface">
          <div className="flex items-center gap-2 font-mono text-xs text-text-primary uppercase tracking-wider font-semibold">
            <Radio size={14} className="text-accent" />
            <span>Sinyal Kontrol</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 border border-border text-text-secondary hover:text-text-primary hover:border-text-primary transition-colors"
            aria-label="Tutup Menu"
          >
            <X size={16} />
          </button>
        </div>

        {/* User Mini Profile Card */}
        <div className="p-5 border-b border-border/70 bg-surface/50 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full border border-border/90 bg-surface flex items-center justify-center font-mono text-xs text-text-primary font-bold shrink-0 tracking-tighter shadow-sm">
              {avatarInitials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-text-primary truncate text-sm">
                {myAlias || myId}
              </div>
              <div className="font-mono text-[11px] text-text-secondary/70 flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse inline-block" />
                <span>Frekuensi Aktif</span>
              </div>
            </div>
          </div>

          {/* Quick Info Alias/ID */}
          {myAlias && (
            <div className="pt-1 font-mono text-[11px] text-text-secondary/60">
              ID: <span className="text-text-secondary font-mono">{myId}</span>
            </div>
          )}
        </div>

        {/* Menu Navigation Items */}
        <div className="flex-1 p-3 space-y-1.5 overflow-y-auto">
          {/* 1. Menu Profil */}
          <button
            onClick={onOpenProfile}
            className="w-full p-3.5 flex items-center justify-between text-left group hover:bg-surface border border-transparent hover:border-border/80 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 border border-border bg-background text-text-secondary group-hover:text-accent group-hover:border-accent transition-colors">
                <User size={16} />
              </div>
              <div>
                <div className="text-xs font-semibold text-text-primary group-hover:text-accent transition-colors">
                  Profil Saya
                </div>
                <div className="text-[11px] text-text-secondary/70 font-sans mt-0.5">
                  Arsip cerita, resonansi, & atur alias
                </div>
              </div>
            </div>
            <ChevronRight size={14} className="text-text-secondary/50 group-hover:text-text-primary group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* 2. Menu Kunci & Pemulihan Akun */}
          <button
            onClick={onOpenRecoveryModal}
            className="w-full p-3.5 flex items-center justify-between text-left group hover:bg-surface border border-transparent hover:border-border/80 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 border border-border bg-background text-text-secondary group-hover:text-accent group-hover:border-accent transition-colors">
                <Key size={16} />
              </div>
              <div>
                <div className="text-xs font-semibold text-text-primary group-hover:text-accent transition-colors flex items-center gap-1.5">
                  <span>Kunci & Pemulihan</span>
                  <span className="text-[9px] font-mono px-1 py-0.2 bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 font-semibold uppercase">
                    Aktif
                  </span>
                </div>
                <div className="text-[11px] text-text-secondary/70 font-sans mt-0.5">
                  Salin kunci rahasia atau pulihkan ID lama
                </div>
              </div>
            </div>
            <ChevronRight size={14} className="text-text-secondary/50 group-hover:text-text-primary group-hover:translate-x-0.5 transition-all" />
          </button>

          {/* 3. Menu Tentang Frekuensi */}
          <button
            onClick={onOpenInfo}
            className="w-full p-3.5 flex items-center justify-between text-left group hover:bg-surface border border-transparent hover:border-border/80 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 border border-border bg-background text-text-secondary group-hover:text-accent group-hover:border-accent transition-colors">
                <Info size={16} />
              </div>
              <div>
                <div className="text-xs font-semibold text-text-primary group-hover:text-accent transition-colors">
                  Tentang Frekuensi
                </div>
                <div className="text-[11px] text-text-secondary/70 font-sans mt-0.5">
                  Manifesto, aturan, & filosofi ruang
                </div>
              </div>
            </div>
            <ChevronRight size={14} className="text-text-secondary/50 group-hover:text-text-primary group-hover:translate-x-0.5 transition-all" />
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border/80 bg-surface/60 font-mono text-[10px] text-text-secondary/60 flex items-center justify-between">
          <span>FREQUENCY SPECTRUM</span>
          <span>v2.4</span>
        </div>
      </aside>
    </div>
  );
};
