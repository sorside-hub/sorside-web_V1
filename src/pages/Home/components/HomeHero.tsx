import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Disc3, BookOpen, Radio } from 'lucide-react';

export const HomeHero: React.FC = () => {
  return (
    <section className="space-y-6 pt-2 pb-8 border-b border-border">
      {/* Frequency & Status bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono tracking-widest uppercase">
        <div className="inline-flex items-center gap-2 bg-surface px-3 py-1.5 border border-border">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-text-primary font-semibold">CHANNEL 01 // BEDROOM HEADSPACE</span>
        </div>
        <div className="text-text-secondary text-[11px] hidden sm:block">
          STATUS: UNFILTERED & SOLITARY
        </div>
      </div>

      {/* Main Title & Editorial Headline */}
      <div className="space-y-3">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-display tracking-wider uppercase text-text-primary leading-none">
          SORSIDE
        </h1>
        <p className="text-base sm:text-lg text-text-secondary leading-relaxed max-w-xl font-normal">
          Ruang pelepasan isi kepala. Wadah tanpa filter untuk merilis apa yang tak selesai di pikiran—frekuensi malam, kebisingan kamar, dan catatan jujur untuk menjadi diri sendiri.
        </p>
      </div>

      {/* Quick Navigation Portals */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
        <Link
          to="/the-side"
          className="inline-flex items-center justify-between sm:justify-center gap-3 bg-text-primary text-background px-5 py-3 font-mono text-xs tracking-wider uppercase font-semibold hover:bg-accent hover:text-white transition-colors group"
        >
          <span className="inline-flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            <span>BACA ISI KEPALA (THE SIDE)</span>
          </span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          to="/discography"
          className="inline-flex items-center justify-between sm:justify-center gap-3 bg-surface border border-border text-text-primary px-5 py-3 font-mono text-xs tracking-wider uppercase font-semibold hover:bg-surface-hover hover:border-text-primary transition-colors group"
        >
          <span className="inline-flex items-center gap-2">
            <Disc3 className="w-4 h-4 text-accent" />
            <span>DENGARKAN REKAMAN</span>
          </span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  );
};
