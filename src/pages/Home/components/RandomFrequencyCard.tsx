import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Radio, Shuffle, ArrowRight, MessageSquare, Tag, Sparkles } from 'lucide-react';
import { subscribeTransmissions } from '../../../services/frequencyService';
import { Transmission } from '../../Frequency/components/TransmissionItem';

export const RandomFrequencyCard: React.FC = () => {
  const [transmissions, setTransmissions] = useState<Transmission[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isShuffling, setIsShuffling] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeTransmissions((list) => {
      setTransmissions(list || []);
    });
    return () => unsubscribe();
  }, []);

  // Pick an initial random index when transmissions arrive
  useEffect(() => {
    if (transmissions.length > 0 && selectedIndex === null) {
      const randIdx = Math.floor(Math.random() * transmissions.length);
      setSelectedIndex(randIdx);
    }
  }, [transmissions, selectedIndex]);

  const currentTx = useMemo(() => {
    if (transmissions.length === 0 || selectedIndex === null) return null;
    const safeIdx = Math.min(Math.max(0, selectedIndex), transmissions.length - 1);
    return transmissions[safeIdx];
  }, [transmissions, selectedIndex]);

  const handleShuffle = () => {
    if (transmissions.length <= 1) return;
    setIsShuffling(true);

    setTimeout(() => {
      let nextIdx = Math.floor(Math.random() * transmissions.length);
      // Ensure we don't pick the exact same item if there are multiple items
      if (nextIdx === selectedIndex && transmissions.length > 1) {
        nextIdx = (nextIdx + 1) % transmissions.length;
      }
      setSelectedIndex(nextIdx);
      setIsShuffling(false);
    }, 200);
  };

  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-accent inline-block rounded-full animate-ping" />
          <h2 className="font-mono text-xs uppercase tracking-widest text-text-primary font-semibold">
            03 // Cerita Random Frequency
          </h2>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] text-text-secondary uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
          <span>ANONYMOUS FEED</span>
        </div>
      </div>

      {/* Main Random Signal Box */}
      {!currentTx ? (
        <div className="border border-border bg-surface p-12 flex flex-col items-center justify-center space-y-3">
          <Radio className="w-8 h-8 text-text-secondary/40 animate-pulse" />
          <p className="font-mono text-xs tracking-widest text-text-secondary uppercase text-center">
            // MENCARI FREKUENSI SINYAL...
          </p>
        </div>
      ) : (
        <div className="border border-border bg-surface hover:border-text-secondary transition-all p-5 sm:p-7 space-y-5 relative overflow-hidden group">
          {/* Subtle Background Frequency Tag */}
          <div className="absolute -right-4 -bottom-6 font-display text-8xl text-text-primary/[0.03] uppercase select-none pointer-events-none">
            FREQ
          </div>

          {/* Top Meta Info */}
          <div className="flex items-center justify-between gap-3 text-xs font-mono border-b border-border/50 pb-3">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-accent/80 shrink-0" />
              <span className="font-bold text-text-primary truncate">
                {currentTx.authorAlias || currentTx.authorId}
              </span>
              {currentTx.tag && (
                <span className="inline-flex items-center gap-1 text-[11px] text-accent font-normal bg-accent/10 px-2 py-0.5 border border-accent/20">
                  <Tag className="w-3 h-3" />
                  #{currentTx.tag}
                </span>
              )}
            </div>

            <span className="text-[11px] text-text-secondary/70 shrink-0">
              {currentTx.timestamp}
            </span>
          </div>

          {/* Story Quote Display */}
          <div className="py-2 space-y-3">
            <p className="text-base sm:text-lg text-text-primary font-sans leading-relaxed whitespace-pre-wrap italic">
              "{currentTx.content}"
            </p>
          </div>

          {/* Bottom Action Controls */}
          <div className="pt-4 border-t border-border/50 flex flex-wrap items-center justify-between gap-3">
            {/* Stats */}
            <div className="flex items-center gap-3 text-xs font-mono text-text-secondary">
              <span className="inline-flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{currentTx.replies?.length || 0} Resonansi</span>
              </span>
            </div>

            {/* Interactive Actions */}
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <button
                type="button"
                onClick={handleShuffle}
                disabled={isShuffling || transmissions.length <= 1}
                className="inline-flex items-center gap-1.5 bg-background border border-border px-3.5 py-2 text-xs font-mono uppercase tracking-wider text-text-primary hover:border-accent hover:text-accent transition-all active:scale-95 disabled:opacity-50"
                title="Acak sinyal cerita lainnya"
              >
                <Shuffle className={`w-3.5 h-3.5 ${isShuffling ? 'animate-spin text-accent' : ''}`} />
                <span>ACAK SINYAL LAIN</span>
              </button>

              <Link
                to="/frequency"
                className="inline-flex items-center gap-1.5 bg-text-primary text-background px-4 py-2 text-xs font-mono uppercase tracking-wider font-semibold hover:bg-accent hover:text-white transition-colors"
              >
                <span>RESONANSI / BUKA FREQUENCY</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
