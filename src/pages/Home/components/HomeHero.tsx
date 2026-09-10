import React from 'react';
import { ArrowRight } from 'lucide-react';

export const HomeHero: React.FC = () => {
  return (
    <section className="space-y-6 pt-2 pb-8 border-b border-border">
      {/* Main Title & Editorial Headline */}
      <div className="space-y-3">
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-display tracking-wider uppercase text-text-primary leading-none">
          SORSIDE
        </h1>
        <p className="text-base sm:text-lg text-text-secondary leading-relaxed max-w-xl font-normal">
          Ruang pelepasan isi kepala. Tempat bagi hal-hal yang selama ini cuma dipendam, lalu perlahan menemukan bentuknya.
        </p>
      </div>

      {/* Decorative Exploration Button */}
      <div className="pt-2">
        <button
          type="button"
          className="inline-flex items-center gap-2 bg-text-primary text-background px-5 py-2.5 font-mono text-xs tracking-wider uppercase font-semibold hover:bg-accent transition-colors cursor-default"
        >
          <span>Jelajahi Sorside</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </section>
  );
};

