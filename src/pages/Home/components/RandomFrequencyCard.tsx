import React, { useState, useEffect, useMemo } from 'react';
import { Radio, Shuffle, MessageSquare, Tag } from 'lucide-react';
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
      if (nextIdx === selectedIndex && transmissions.length > 1) {
        nextIdx = (nextIdx + 1) % transmissions.length;
      }
      setSelectedIndex(nextIdx);
      setIsShuffling(false);
    }, 220);
  };

  return (
    <div className="space-y-3">
      {/* Sub Header / Metadata Bar */}
      <div className="flex items-center justify-between font-mono text-[10px] text-text-secondary uppercase">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-emerald-500 inline-block rounded-full animate-ping" />
          <span className="text-text-primary font-bold tracking-widest">CERITA TERPILIH</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="border border-border bg-surface px-2 py-0.5 tracking-widest text-text-secondary">
            TOTAL CERITA: <span className="text-text-primary font-bold">{transmissions.length}</span>
          </span>
          <span className="border border-border bg-surface px-2 py-0.5 tracking-widest text-emerald-500 font-semibold hidden sm:inline-block">
            LIVE BROADCAST
          </span>
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
        <div className="border border-border bg-surface hover:border-text-secondary transition-all p-5 sm:p-6 space-y-5 relative overflow-hidden group">
          {/* Subtle Background Frequency Tag */}
          <div className="absolute -right-4 -bottom-6 font-display text-8xl text-text-primary/[0.03] uppercase select-none pointer-events-none">
            FREQ
          </div>

          {/* Top Sender & Channel Bar */}
          <div className="flex items-center justify-between gap-3 text-xs font-mono border-b border-border/50 pb-3 relative z-10">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-accent/80 shrink-0" />
              <span className="font-bold text-text-primary truncate">
                {currentTx.authorAlias || currentTx.authorId}
              </span>
              {currentTx.tag && (
                <span className="inline-flex items-center gap-1 text-[10px] text-accent font-normal bg-accent/10 px-2 py-0.5 border border-accent/20">
                  <Tag className="w-2.5 h-2.5" />
                  #{currentTx.tag}
                </span>
              )}
            </div>

            <span className="text-[10px] text-text-secondary/80 shrink-0 font-mono">
              {currentTx.timestamp}
            </span>
          </div>

          {/* Story Quote Display with Smooth Transition */}
          <div className={`py-1 space-y-3 relative z-10 transition-opacity duration-200 ${isShuffling ? 'opacity-20' : 'opacity-100'}`}>
            <p className="text-base sm:text-lg text-text-primary font-sans leading-relaxed whitespace-pre-wrap italic">
              "{currentTx.content}"
            </p>
          </div>

          {/* Bottom Action Controls */}
          <div className="pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-3 relative z-10">
            {/* Stats */}
            <div className="flex items-center gap-3 text-xs font-mono text-text-secondary">
              <span className="inline-flex items-center gap-1.5 text-[11px]">
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{currentTx.replies?.length || 0} Resonansi</span>
              </span>
            </div>

            {/* Interactive Actions */}
            <div className="flex items-center gap-2 sm:gap-2.5">
              <button
                type="button"
                onClick={handleShuffle}
                disabled={isShuffling || transmissions.length <= 1}
                className="inline-flex items-center gap-1.5 bg-background hover:bg-surface-hover border border-border hover:border-text-primary px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-text-primary transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                title="Acak cerita lainnya"
              >
                <Shuffle className={`w-3 h-3 ${isShuffling ? 'animate-spin text-accent' : ''}`} />
                <span>{isShuffling ? 'MEMINDAI...' : 'ACAK CERITA'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

