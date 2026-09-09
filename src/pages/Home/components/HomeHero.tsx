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
          RELEASES • ESSAYS • ANONYMOUS SIGNALS
        </div>
      </div>

      {/* Main Title & Editorial Headline */}
      <div className="space-y-3">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-display tracking-wider uppercase text-text-primary leading-none">
          SORSIDE
        </h1>
        <p className="text-base sm:text-lg text-text-secondary leading-relaxed max-w-xl font-normal">
          Ruang pelepasan isi kepala. Wadah tanpa filter untuk merilis apa yang tak selesai di pikiran—katalog musik, catatan tulisan, dan sinyal frekuensi anonim.
        </p>
      </div>

      {/* Quick Navigation Portals for the 3 Core Modules */}
      <div className="flex flex-wrap items-center gap-2.5 pt-2">
        <Link
          to="/discography"
          className="inline-flex items-center gap-2 bg-surface border border-border text-text-primary px-4 py-2.5 font-mono text-xs tracking-wider uppercase font-semibold hover:border-text-primary hover:text-accent transition-all group"
        >
          <Disc3 className="w-4 h-4 text-accent" />
          <span>RELEASES</span>
          <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-0.5 group-hover:opacity-100 transition-all" />
        </Link>

        <Link
          to="/the-side"
          className="inline-flex items-center gap-2 bg-surface border border-border text-text-primary px-4 py-2.5 font-mono text-xs tracking-wider uppercase font-semibold hover:border-text-primary hover:text-accent transition-all group"
        >
          <BookOpen className="w-4 h-4 text-accent" />
          <span>THE SIDE</span>
          <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-0.5 group-hover:opacity-100 transition-all" />
        </Link>

        <Link
          to="/frequency"
          className="inline-flex items-center gap-2 bg-surface border border-border text-text-primary px-4 py-2.5 font-mono text-xs tracking-wider uppercase font-semibold hover:border-text-primary hover:text-accent transition-all group"
        >
          <Radio className="w-4 h-4 text-accent" />
          <span>FREQUENCY</span>
          <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-0.5 group-hover:opacity-100 transition-all" />
        </Link>
      </div>
    </section>
  );
};
