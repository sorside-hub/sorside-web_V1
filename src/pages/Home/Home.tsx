import React from 'react';
import { HomeHero } from './components/HomeHero';
import { LoneTransmissionCard } from './components/LoneTransmissionCard';
import { ThoughtFragments } from './components/ThoughtFragments';
import { RandomFrequencyCard } from './components/RandomFrequencyCard';

export const Home: React.FC = () => {
  return (
    <div className="space-y-12 pb-16">
      {/* 1. Header Hero */}
      <HomeHero />

      {/* 2. Release Update */}
      <LoneTransmissionCard />

      {/* 3. The Side Update */}
      <ThoughtFragments />

      {/* 4. Cerita Random dari Frequency */}
      <RandomFrequencyCard />

      {/* Minimalist Footer */}
      <footer className="pt-8 border-t border-border/40 text-center font-mono text-[10px] text-text-secondary tracking-widest uppercase">
        SORSIDE // RELEASES • ESSAYS • ANONYMOUS FREQUENCY
      </footer>
    </div>
  );
};
