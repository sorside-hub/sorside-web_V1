import React, { useState, useEffect, useMemo } from 'react';
import { Shuffle, BookOpen, ArrowRight, BookMarked } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getCachedGlossary, subscribeToGlossary, revalidateGlossary } from '../../../lib/glossaryStore';
import { GlossaryItem } from '../../../types/glossary';

export const RandomGlossaryCard: React.FC = () => {
  const [glossary, setGlossary] = useState<GlossaryItem[]>(() => getCachedGlossary());
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isShuffling, setIsShuffling] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = subscribeToGlossary((items) => {
      setGlossary(items);
    });

    revalidateGlossary();

    return () => {
      unsubscribe();
    };
  }, []);

  // Pick a random term on initial mount or when data changes
  useEffect(() => {
    if (glossary.length > 0) {
      const randomIndex = Math.floor(Math.random() * glossary.length);
      setSelectedIndex(randomIndex);
    }
  }, [glossary.length]);

  const activeItem = useMemo(() => {
    if (glossary.length === 0) return null;
    return glossary[selectedIndex % glossary.length];
  }, [glossary, selectedIndex]);

  const handleShuffle = () => {
    if (glossary.length <= 1) return;
    setIsShuffling(true);

    setTimeout(() => {
      let nextIndex = Math.floor(Math.random() * glossary.length);
      while (nextIndex === selectedIndex && glossary.length > 1) {
        nextIndex = Math.floor(Math.random() * glossary.length);
      }
      setSelectedIndex(nextIndex);
      setIsShuffling(false);
    }, 200);
  };

  const currentIndexStr = glossary.length > 0 
    ? ((selectedIndex % glossary.length) + 1).toString().padStart(2, '0') 
    : '00';
  const totalCountStr = glossary.length.toString().padStart(2, '0');

  return (
    <div className="space-y-3">
      {/* Sub Header / Metadata Bar */}
      <div className="flex items-center justify-between font-mono text-[10px] text-text-secondary uppercase">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-accent inline-block rounded-full" />
          <span className="text-text-primary font-bold tracking-widest">FRAGMENT</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="border border-border bg-surface px-2 py-0.5 tracking-widest text-accent font-semibold">
            LEXICON
          </span>
        </div>
      </div>

      {/* Main Interactive Glossary Card */}
      <div className="border border-border bg-surface hover:border-text-secondary transition-all p-5 sm:p-7 relative overflow-hidden group">
        {/* Subtle Background Large Index Number */}
        <div className="absolute right-3 -bottom-4 font-display text-8xl text-text-primary/[0.04] uppercase select-none pointer-events-none group-hover:text-text-primary/[0.07] transition-colors">
          {currentIndexStr}
        </div>

        {activeItem ? (
          <div className="space-y-4 relative z-10">
            {/* Top Identifier & Index Pill */}
            <div className="flex items-center justify-between font-mono text-xs border-b border-border/50 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-accent inline-block" />
                <span className="font-bold text-text-primary tracking-widest uppercase text-xs sm:text-sm">
                  [ {activeItem.title} ]
                </span>
              </div>
              <div className="text-[10px] text-text-secondary font-mono bg-background border border-border px-2 py-0.5">
                INDEX <span className="text-accent font-bold">{currentIndexStr}</span>/{totalCountStr}
              </div>
            </div>

            {/* Term Definition Body */}
            <div className="min-h-[72px] sm:min-h-[80px] flex items-center">
              <div 
                className={`text-xs sm:text-sm text-text-secondary leading-relaxed font-sans max-w-xl transition-opacity duration-200 ${
                  isShuffling ? 'opacity-30 blur-[1px]' : 'opacity-100 blur-0'
                } prose prose-invert max-w-none prose-p:my-0 prose-p:mb-2 prose-a:text-accent hover:prose-a:text-text-primary`}
                dangerouslySetInnerHTML={{ __html: activeItem.content }}
              />
            </div>

            {/* Action Bar */}
            <div className="pt-3 flex items-center justify-between border-t border-border/60">
              <button
                type="button"
                onClick={handleShuffle}
                disabled={isShuffling || glossary.length <= 1}
                className="inline-flex items-center gap-1.5 bg-background hover:bg-surface-hover border border-border hover:border-text-primary px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-text-primary transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                title="Acak istilah lainnya"
              >
                <Shuffle className={`w-3 h-3 ${isShuffling ? 'animate-spin text-accent' : ''}`} />
                <span>{isShuffling ? 'MEMINDAI...' : 'ACAK ISTILAH'}</span>
              </button>

              <Link
                to="/about"
                className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-text-primary hover:text-accent font-semibold transition-colors group/link"
              >
                <BookOpen className="w-3 h-3 text-text-secondary group-hover/link:text-accent" />
                <span>SEMUA ISTILAH</span>
                <ArrowRight className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-3 relative z-10 py-2">
            <div className="flex items-center gap-2 font-mono text-xs text-text-secondary">
              <BookMarked className="w-4 h-4 text-text-secondary" />
              <span className="uppercase tracking-widest">[ ARSIP GLOSARIUM KOSONG ]</span>
            </div>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              Belum ada istilah atau catatan glosarium yang terpublikasi dari database.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
