import React, { useState } from 'react';
import { HomeRadarNav } from './components/HomeRadarNav';
import { LoneTransmissionCard } from './components/LoneTransmissionCard';
import { ThoughtFragments } from './components/ThoughtFragments';
import { RandomFrequencyCard } from './components/RandomFrequencyCard';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const Home: React.FC = () => {
  const [activeSector, setActiveSector] = useState<string>('section-discography');

  return (
    <div className="-mt-4 md:-mt-12 space-y-4 pb-20">
      {/* 1. Radar Header / Blueprint Index (Sticky Flush) */}
      <HomeRadarNav 
        activeSector={activeSector} 
        onSelectSector={setActiveSector} 
      />

      {/* 2. Blueprint Sectors (Editorial Two-Column Layout) */}
      <div className="space-y-16">
        {/* SECTOR 01: DISCOGRAPHY */}
        <section id="section-discography" className="scroll-mt-24 pt-2">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Sector Manifesto & Narrative */}
            <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
              <div className="font-mono text-[11px] text-accent uppercase tracking-widest font-semibold flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                <span>[01 // SECTOR_AUDIO]</span>
              </div>
              
              <h2 className="text-3xl sm:text-4xl font-display uppercase tracking-wider text-text-primary leading-tight">
                Discography
              </h2>

              <p className="font-sans text-sm sm:text-base text-text-secondary leading-relaxed">
                Keresahan yang menemukan bentuknya. Di sini musik bukan sekadar susunan nada yang rapi, melainkan arsip rekaman mentah dari apa yang terjadi di dalam kepala—rilisan single, EP, hingga eksperimen suara yang diracik tanpa kompromi.
              </p>

              <div className="pt-2">
                <Link
                  to="/discography"
                  className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-text-primary hover:text-accent font-semibold transition-all group border-b border-text-primary/30 hover:border-accent pb-1"
                >
                  <span>Buka Seluruh Katalog Audio</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Right Column: Live Interactive Preview */}
            <div className="lg:col-span-7">
              <LoneTransmissionCard />
            </div>
          </div>
        </section>

        {/* SECTOR 02: THE SIDE */}
        <section id="section-the-side" className="scroll-mt-24 pt-8 border-t border-border">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Sector Manifesto & Narrative */}
            <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
              <div className="font-mono text-[11px] text-accent uppercase tracking-widest font-semibold flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-text-primary rounded-full" />
                <span>[02 // SECTOR_ARCHIVE]</span>
              </div>
              
              <h2 className="text-3xl sm:text-4xl font-display uppercase tracking-wider text-text-primary leading-tight">
                The Side
              </h2>

              <p className="font-sans text-sm sm:text-base text-text-secondary leading-relaxed">
                Ruang bagi sisi lain yang belum sempat tersampaikan. Wadah tulisan, esai personal, dan catatan proses di balik layar. Menangkap fragmen pemikiran yang terlalu mentah dan jujur untuk dibiarkan hilang begitu saja.
              </p>

              <div className="pt-2">
                <Link
                  to="/the-side"
                  className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-text-primary hover:text-accent font-semibold transition-all group border-b border-text-primary/30 hover:border-accent pb-1"
                >
                  <span>Buka Arsip</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Right Column: Live Interactive Preview */}
            <div className="lg:col-span-7">
              <ThoughtFragments />
            </div>
          </div>
        </section>

        {/* SECTOR 03: FREQUENCY */}
        <section id="section-frequency" className="scroll-mt-24 pt-8 border-t border-border">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Sector Manifesto & Narrative */}
            <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
              <div className="font-mono text-[11px] text-accent uppercase tracking-widest font-semibold flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                <span>[03 // SECTOR_UNLOAD]</span>
              </div>
              
              <h2 className="text-3xl sm:text-4xl font-display uppercase tracking-wider text-text-primary leading-tight">
                Frequency
              </h2>

              <p className="font-sans text-sm sm:text-base text-text-secondary leading-relaxed">
                Sinyal anonim tanpa filter dari berbagai sudut kepala. Ruang transmisi bebas tanpa identitas di mana siapa pun bisa melepas keresahan, unek-unek, atau cerita yang selama ini cuma dipendam sendirian.
              </p>

              <div className="pt-2">
                <Link
                  to="/frequency"
                  className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-text-primary hover:text-accent font-semibold transition-all group border-b border-text-primary/30 hover:border-accent pb-1"
                >
                  <span>Buka Frequency</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Right Column: Live Interactive Preview */}
            <div className="lg:col-span-7">
              <RandomFrequencyCard />
            </div>
          </div>
        </section>

        {/* SECTOR 04: ABOUT / THE CORE */}
        <section id="section-about" className="scroll-mt-24 pt-8 border-t border-border">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Sector Manifesto & Narrative */}
            <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
              <div className="font-mono text-[11px] text-accent uppercase tracking-widest font-semibold flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-text-primary rounded-full" />
                <span>[04 // SECTOR_ORIGIN]</span>
              </div>
              
              <h2 className="text-3xl sm:text-4xl font-display uppercase tracking-wider text-text-primary leading-tight">
                About
              </h2>

              <p className="font-sans text-sm sm:text-base text-text-secondary leading-relaxed">
                Ruang pelepasan isi kepala. Tempat bagi hal-hal yang selama ini cuma dipendam, lalu perlahan menemukan bentuknya—lahir dari kamar tidur dan kepala yang bising sebagai wadah karya jujur tanpa kompromi.
              </p>

              <div className="pt-2">
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-text-primary hover:text-accent font-semibold transition-all group border-b border-text-primary/30 hover:border-accent pb-1"
                >
                  <span>Baca Cerita Lengkap Sorside</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Right Column: Manifesto Card */}
            <div className="lg:col-span-7">
              <div className="border border-border bg-surface hover:border-text-secondary transition-all p-6 sm:p-8 space-y-6 relative overflow-hidden group">
                {/* Subtle Background Tag */}
                <div className="absolute -right-4 -bottom-6 font-display text-8xl text-text-primary/[0.03] uppercase select-none pointer-events-none">
                  CORE
                </div>

                <div className="space-y-4 relative z-10">
                  <div className="flex items-center justify-between border-b border-border/50 pb-3 font-mono text-[10px] text-text-secondary uppercase">
                    <span className="text-accent font-semibold">// MANIFESTO & HEADSPACE</span>
                    <span>ORIGIN: BEDROOM STUDIOS</span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-serif text-text-primary leading-snug">
                    "Setiap lagu, catatan arsip tulisan, dan frekuensi anonim yang terkirim adalah bagian dari satu kesatuan: merayakan apa yang nyata dan tidak disensor."
                  </h3>

                  <p className="text-xs sm:text-sm font-sans text-text-secondary leading-relaxed max-w-xl">
                    Sorside dibangun bukan untuk mengejar kesempurnaan algoritma, melainkan sebagai ruang pelepasan mandiri—tempat ide-ide yang belum selesai di kepala bisa menemukan rumah dan beresonansi dengan siapa saja yang membutuhkan.
                  </p>

                  {/* Specs & Pillars */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                    <div className="border border-border bg-background p-2.5 space-y-1">
                      <div className="text-[9px] font-mono text-text-secondary uppercase">MEDIUM</div>
                      <div className="text-xs font-mono font-bold text-text-primary">SONIC & TEXT</div>
                    </div>
                    <div className="border border-border bg-background p-2.5 space-y-1">
                      <div className="text-[9px] font-mono text-text-secondary uppercase">ETHOS</div>
                      <div className="text-xs font-mono font-bold text-text-primary">UNFILTERED RAW</div>
                    </div>
                    <div className="border border-border bg-background p-2.5 space-y-1">
                      <div className="text-[9px] font-mono text-text-secondary uppercase">TRANSMISSION</div>
                      <div className="text-xs font-mono font-bold text-accent">OPEN COMMUNITY</div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-between border-t border-border/60 font-mono text-[11px] text-text-secondary uppercase tracking-wider relative z-10">
                  <span>EST. 2024</span>
                  <Link
                    to="/about"
                    className="inline-flex items-center gap-1.5 text-text-primary hover:text-accent font-semibold transition-colors group/link"
                  >
                    <span>SELENGKAPNYA</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/link:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Minimalist Footer */}
      <footer className="pt-12 border-t border-border/60 text-center space-y-2">
        <div className="font-mono text-[11px] text-text-primary uppercase tracking-widest font-semibold">
          SORSIDE // ATLAS & BEDROOM ARCHIVE
        </div>
        <p className="font-mono text-[10px] text-text-secondary tracking-widest uppercase">
          01 DISCOGRAPHY • 02 THE SIDE • 03 FREQUENCY • 04 ABOUT
        </p>
      </footer>
    </div>
  );
};

