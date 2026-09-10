import React, { useEffect, useState } from 'react';
import { Compass, Radio } from 'lucide-react';

export interface SectorItem {
  id: string;
  num: string;
  code: string;
  title: string;
  subtitle: string;
}

export const HOME_SECTORS: SectorItem[] = [
  {
    id: 'section-discography',
    num: '01',
    code: 'DISCO',
    title: 'Discography',
    subtitle: 'Katalog Audio',
  },
  {
    id: 'section-the-side',
    num: '02',
    code: 'SIDE',
    title: 'The Side',
    subtitle: 'Arsip Tulisan',
  },
  {
    id: 'section-frequency',
    num: '03',
    code: 'FREQ',
    title: 'Frequency',
    subtitle: 'Sinyal Anonim',
  },
  {
    id: 'section-about',
    num: '04',
    code: 'ABOUT',
    title: 'About',
    subtitle: 'Tentang Sorside',
  },
];

interface HomeRadarNavProps {
  activeSector?: string;
  onSelectSector?: (id: string) => void;
}

export const HomeRadarNav: React.FC<HomeRadarNavProps> = ({
  activeSector: controlledActive,
  onSelectSector,
}) => {
  const [internalActive, setInternalActive] = useState<string>(HOME_SECTORS[0].id);
  const currentActive = controlledActive !== undefined ? controlledActive : internalActive;
  const isClickScrollingRef = React.useRef(false);
  const clickTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Robust ScrollSpy observer based on viewport bounding box
    const handleScroll = () => {
      // If user clicked a sector button, ignore scroll events during the smooth animation
      if (isClickScrollingRef.current) return;

      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // If scrolled near the bottom of the page, activate the last sector (About)
      if (scrollY + windowHeight >= documentHeight - 120) {
        const lastSectorId = HOME_SECTORS[HOME_SECTORS.length - 1].id;
        setInternalActive(lastSectorId);
        onSelectSector?.(lastSectorId);
        return;
      }

      // Check sectors from top to bottom
      // Trigger threshold: 200px from top (just below header & radar bar)
      const triggerThreshold = 200;
      let matchedSectorId = HOME_SECTORS[0].id;

      for (let i = 0; i < HOME_SECTORS.length; i++) {
        const sector = HOME_SECTORS[i];
        const el = document.getElementById(sector.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          // If element top is at or above the threshold
          if (rect.top <= triggerThreshold) {
            matchedSectorId = sector.id;
          }
        }
      }

      setInternalActive(matchedSectorId);
      onSelectSector?.(matchedSectorId);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run initial detection after mounting
    const timer = setTimeout(handleScroll, 100);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    };
  }, [onSelectSector]);

  const handleSectorClick = (id: string) => {
    // Instantly lock active state to clicked item
    isClickScrollingRef.current = true;
    setInternalActive(id);
    onSelectSector?.(id);

    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);

    const element = document.getElementById(id);
    if (element) {
      const yOffset = -70; // Offset for sticky radar header
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }

    // Release scroll lock after smooth scrolling completes
    clickTimeoutRef.current = setTimeout(() => {
      isClickScrollingRef.current = false;
    }, 800);
  };

  const activeIndex = HOME_SECTORS.findIndex((s) => s.id === currentActive);
  const activeObj = HOME_SECTORS[activeIndex >= 0 ? activeIndex : 0];

  return (
    <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-md border-b border-border py-2.5 px-3 sm:px-4 -mx-4 sm:-mx-0 transition-all shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        {/* Radar Status Badge & Current Sector Coordinate */}
        <div className="flex items-center justify-between sm:justify-start gap-3">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-text-primary">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            <span className="font-semibold">SECTOR // HOME</span>
          </div>

          <div className="font-mono text-[10px] text-text-secondary uppercase tracking-widest bg-surface border border-border px-2 py-0.5">
            SECTOR: <span className="text-text-primary font-bold">{activeObj.num}</span> / 04 [
            <span className="text-accent font-bold">{activeObj.code}</span>]
          </div>
        </div>

        {/* Interactive Sector Nodes (4-column grid on mobile, flex row on desktop) */}
        <div className="grid grid-cols-4 sm:flex sm:items-center gap-1 sm:gap-1.5 w-full sm:w-auto">
          {HOME_SECTORS.map((sector) => {
            const isActive = currentActive === sector.id;
            return (
              <button
                key={sector.id}
                type="button"
                onClick={() => handleSectorClick(sector.id)}
                className={`flex items-center justify-center gap-1 px-2 sm:px-3 py-1.5 text-[10px] sm:text-[11px] font-mono uppercase tracking-wider transition-all border ${
                  isActive
                    ? 'bg-text-primary text-background border-text-primary font-bold shadow-sm'
                    : 'bg-surface/60 text-text-secondary border-border/80 hover:border-text-primary hover:text-text-primary'
                }`}
                title={`Lompat ke ${sector.title} (${sector.subtitle})`}
              >
                <span className={isActive ? 'text-background' : 'text-accent font-semibold'}>
                  {sector.num}
                </span>
                <span className="hidden md:inline">{sector.title}</span>
                <span className="inline md:hidden">{sector.code}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
