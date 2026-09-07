import React from 'react';
import { HomeHero } from './components/HomeHero';
import { LoneTransmissionCard } from './components/LoneTransmissionCard';
import { ThoughtFragments } from './components/ThoughtFragments';
import { SanctuaryManifesto } from './components/SanctuaryManifesto';
import { AtmosphereArtifacts } from './components/AtmosphereArtifacts';

export const Home: React.FC = () => {
  return (
    <div className="space-y-12 pb-16">
      {/* 1. The Monologue & Frequency Header */}
      <HomeHero />

      {/* 2. The Lone Transmission from Bedroom */}
      <LoneTransmissionCard />

      {/* 3. Fragmen Pikiran dari "The Side" */}
      <ThoughtFragments />

      {/* 4. Ruang Diri Sendiri / Personal Manifesto */}
      <SanctuaryManifesto />

      {/* 5. Artifak Visual & Suasana */}
      <AtmosphereArtifacts />

      {/* Subtle Closure */}
      <footer className="pt-8 border-t border-border/40 text-center font-mono text-[10px] text-text-secondary tracking-widest uppercase">
        SORSIDE // ARCHIVED FROM THE BEDROOM // NO PRETEXTS
      </footer>
    </div>
  );
};

