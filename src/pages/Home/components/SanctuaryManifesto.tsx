import React from 'react';
import { Quote } from 'lucide-react';

export const SanctuaryManifesto: React.FC = () => {
  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 bg-accent inline-block" />
        <h2 className="font-mono text-xs uppercase tracking-widest text-text-primary font-semibold">
          03 // RUANG DIRI SENDIRI
        </h2>
      </div>

      {/* Editorial Blockquote Card */}
      <div className="border border-border bg-surface p-6 sm:p-8 space-y-4 relative overflow-hidden">
        {/* Subtle background text watermark */}
        <div className="absolute right-3 -bottom-4 select-none pointer-events-none text-text-secondary/5 font-display text-8xl uppercase tracking-tighter">
          RAW
        </div>

        <div className="relative space-y-3">
          <p className="font-serif italic text-base sm:text-lg text-text-primary leading-relaxed">
            &ldquo;Aku membuat SORSIDE bukan untuk jadi musisi atau mengejar panggung. Tempat ini adalah ruang untuk merilis semua isi kepala yang berisik, ruang untuk jadi diri sendiri tanpa harus bersandiwara.&rdquo;
          </p>
          <p className="text-xs sm:text-sm text-text-secondary font-mono leading-relaxed">
            Kalau kamu membaca tulisan atau mendengarkan rekaman di sini saat malam sedang terasa terlalu berat, anggap ini teman di sudut kamar yang sedang mendengarkan hal yang sama.
          </p>
        </div>

        <div className="pt-4 border-t border-border/50 flex flex-wrap items-center justify-between gap-3 text-[10px] font-mono text-text-secondary uppercase">
          <span>ARCHIVED BY SORSIDE // BEDROOM PERSPECTIVE</span>
          <span>NO ALGORITHMS • JUST HEADSPACE</span>
        </div>
      </div>
    </section>
  );
};
