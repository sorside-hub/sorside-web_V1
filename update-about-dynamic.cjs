const fs = require('fs');

const code = `import React, { useState, useEffect } from 'react';
import { getCachedArticles, subscribeToArticles, revalidateArticles } from '../../lib/articlesStore';
import { getCachedReleases, subscribeToReleases, revalidateReleases } from '../../lib/discographyStore';
import { Article } from '../../types';
import { Release } from '../../types/discography';

export const About: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>(getCachedArticles());
  const [releases, setReleases] = useState<Release[]>(getCachedReleases());

  useEffect(() => {
    const unsubscribeArticles = subscribeToArticles((newArticles) => {
      setArticles(newArticles);
    });
    
    const unsubscribeReleases = subscribeToReleases((newReleases) => {
      setReleases(newReleases);
    });

    // Fire revalidations to ensure we have the freshest data from Supabase
    revalidateArticles();
    revalidateReleases();

    return () => {
      unsubscribeArticles();
      unsubscribeReleases();
    };
  }, []);

  const totalTracks = releases.reduce((sum, release) => sum + (release.tracks?.length || 0), 0);
  const totalLogs = articles.length;

  // Format to 2 digits (01, 02, etc.)
  const formattedTracks = totalTracks.toString().padStart(2, '0');
  const formattedLogs = totalLogs.toString().padStart(2, '0');

  return (
    <div className="pb-16 md:pb-24 space-y-12 max-w-4xl mx-auto">
      {/* Header */}
      <header className="space-y-3 relative z-10 bg-background pb-4">
        <h2 className="text-4xl md:text-5xl font-display uppercase tracking-widest text-text-primary">
          About
        </h2>
        <div className="flex items-center gap-3">
          <span className="w-8 h-[1px] bg-accent" />
          <p className="font-mono text-xs text-text-secondary uppercase tracking-widest">
            // System.Glossary
          </p>
        </div>
      </header>

      {/* Glossary Timeline Approach */}
      <div className="relative">
        
        {/* Garis Putus-putus Vertikal di Tengah (Root Line) */}
        <div className="absolute left-[24px] sm:left-1/2 top-0 bottom-0 w-[1px] border-l-2 border-dashed border-border/60 -translate-x-1/2 z-0" />

        <div className="space-y-12 relative z-10">
          
          {/* Item 1 */}
          <div className="relative flex flex-col sm:flex-row items-center group">
            <div className="absolute left-[24px] sm:left-1/2 top-1/2 w-3 h-3 bg-accent rounded-sm -translate-x-1/2 -translate-y-1/2 z-20 group-hover:scale-150 transition-transform duration-300 shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
            <div className="w-full sm:w-1/2 sm:pr-12 pl-16 sm:pl-0 text-left sm:text-right hidden sm:block">
              <div className="text-text-secondary/20 font-display text-8xl uppercase tracking-tighter select-none pointer-events-none group-hover:text-text-secondary/40 transition-colors duration-500">01</div>
            </div>
            <div className="w-full sm:w-1/2 sm:pl-12 pl-16">
              <div className="border border-border bg-surface p-6 sm:p-8 relative overflow-hidden transition-all duration-300 hover:border-text-secondary">
                <div className="sm:hidden absolute right-4 -top-2 text-text-secondary/10 font-display text-6xl uppercase tracking-tighter select-none pointer-events-none">01</div>
                <h3 className="font-mono text-sm tracking-widest uppercase text-text-primary mb-4 flex items-center gap-2 font-semibold">
                  <span className="w-2 h-2 bg-accent inline-block sm:hidden" />
                  [ THE_ORIGIN ]
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed font-sans">
                  Bukan sebuah pergerakan, bukan sebuah kolektif. Hanya ekstensi dari sebuah kamar tidur. Sebuah server lokal untuk menampung data yang tidak muat lagi di kepala.
                </p>
              </div>
            </div>
          </div>

          {/* Item 2 */}
          <div className="relative flex flex-col sm:flex-row items-center group">
            <div className="absolute left-[24px] sm:left-1/2 top-1/2 w-3 h-3 bg-background border-2 border-accent rounded-sm -translate-x-1/2 -translate-y-1/2 z-20 group-hover:bg-accent transition-colors duration-300" />
            <div className="w-full sm:w-1/2 sm:pr-12 pl-16 sm:pl-0 order-2 sm:order-1">
              <div className="border border-border bg-surface p-6 sm:p-8 relative overflow-hidden transition-all duration-300 hover:border-text-secondary">
                <div className="sm:hidden absolute right-4 -top-2 text-text-secondary/10 font-display text-6xl uppercase tracking-tighter select-none pointer-events-none">02</div>
                <h3 className="font-mono text-sm tracking-widest uppercase text-text-primary mb-4 flex sm:justify-end items-center gap-2 font-semibold">
                  [ THE_SOUND ]
                  <span className="w-2 h-2 bg-accent inline-block sm:hidden" />
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed font-sans sm:text-right">
                  Direkam dalam satu kali ambil (<i>one-take</i>), sering bocor suara dari luar, dan tidak disempurnakan. Kebisingan (<i>noise</i>) tidak dihapus, ia dibiarkan sebagai bukti nyata bahwa ruangan itu hidup.
                </p>
              </div>
            </div>
            <div className="w-full sm:w-1/2 sm:pl-12 hidden sm:flex items-center order-1 sm:order-2">
              <div className="text-text-secondary/20 font-display text-8xl uppercase tracking-tighter select-none pointer-events-none group-hover:text-text-secondary/40 transition-colors duration-500">02</div>
            </div>
          </div>

          {/* Item 3 */}
          <div className="relative flex flex-col sm:flex-row items-center group">
            <div className="absolute left-[24px] sm:left-1/2 top-1/2 w-3 h-3 bg-background border-2 border-accent rounded-sm -translate-x-1/2 -translate-y-1/2 z-20 group-hover:bg-accent transition-colors duration-300" />
            <div className="w-full sm:w-1/2 sm:pr-12 pl-16 sm:pl-0 text-left sm:text-right hidden sm:block">
              <div className="text-text-secondary/20 font-display text-8xl uppercase tracking-tighter select-none pointer-events-none group-hover:text-text-secondary/40 transition-colors duration-500">03</div>
            </div>
            <div className="w-full sm:w-1/2 sm:pl-12 pl-16">
              <div className="border border-border bg-surface p-6 sm:p-8 relative overflow-hidden transition-all duration-300 hover:border-text-secondary">
                <div className="sm:hidden absolute right-4 -top-2 text-text-secondary/10 font-display text-6xl uppercase tracking-tighter select-none pointer-events-none">03</div>
                <h3 className="font-mono text-sm tracking-widest uppercase text-text-primary mb-4 flex items-center gap-2 font-semibold">
                  <span className="w-2 h-2 bg-accent inline-block sm:hidden" />
                  [ THE_SIDE ]
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed font-sans">
                  Teks yang terlalu panjang untuk sekadar jadi <i>caption</i> sosial media, tapi terlalu pendek untuk jadi buku. Catatan-catatan monolog tanpa konklusi pasti.
                </p>
              </div>
            </div>
          </div>

          {/* Item 4 */}
          <div className="relative flex flex-col sm:flex-row items-center group">
            <div className="absolute left-[24px] sm:left-1/2 top-1/2 w-3 h-3 bg-accent rotate-45 -translate-x-1/2 -translate-y-1/2 z-20 shadow-[0_0_15px_rgba(255,255,255,0.6)]" />
            <div className="w-full sm:w-1/2 sm:pr-12 pl-16 sm:pl-0 order-2 sm:order-1">
              <div className="border border-border bg-surface p-6 sm:p-8 relative overflow-hidden transition-all duration-300 hover:border-text-secondary">
                <div className="sm:hidden absolute right-4 -top-2 text-text-secondary/10 font-display text-6xl uppercase tracking-tighter select-none pointer-events-none">04</div>
                <h3 className="font-mono text-sm tracking-widest uppercase text-text-primary mb-4 flex sm:justify-end items-center gap-2 font-semibold">
                  [ THE_INTENT ]
                  <span className="w-2 h-2 bg-accent inline-block sm:hidden" />
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed font-sans sm:text-right">
                  Tidak sedang mencari validasi apalagi pasar. Jika frekuensinya pas dan resonansinya sampai ke telingamu, selamat datang. Jika tidak masuk di akal, silakan tutup halaman ini.
                </p>
              </div>
            </div>
            <div className="w-full sm:w-1/2 sm:pl-12 hidden sm:flex items-center order-1 sm:order-2">
              <div className="text-text-secondary/20 font-display text-8xl uppercase tracking-tighter select-none pointer-events-none group-hover:text-text-secondary/40 transition-colors duration-500">04</div>
            </div>
          </div>
        </div>
        
        {/* Terminal/Log Footer */}
        <div className="mt-16 sm:mt-24 text-center font-mono text-[10px] text-text-secondary uppercase tracking-widest">
          <p>END OF GLOSSARY // [EOF]</p>
        </div>
      </div>

      {/* SYSTEM OUTPUT / DATA PANEL */}
      <div className="pt-16 sm:pt-24 space-y-8 relative z-10">
        
        {/* Pembatas Terminal */}
        <div className="flex items-center gap-4">
          <span className="h-[1px] flex-1 bg-border/60"></span>
          <span className="font-mono text-[10px] text-text-secondary uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-accent/50 rounded-full animate-pulse" />
            SYSTEM_DIAGNOSTICS // [EOF]
          </span>
          <span className="h-[1px] flex-1 bg-border/60"></span>
        </div>

        {/* 1. Panel Statistik */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="border border-border bg-surface/50 p-4 text-center hover:bg-surface transition-colors">
            <p className="font-mono text-[10px] text-text-secondary uppercase mb-2">EST.</p>
            <p className="font-display text-2xl text-text-primary">2025</p>
          </div>
          <div className="border border-border bg-surface/50 p-4 text-center hover:bg-surface transition-colors">
            <p className="font-mono text-[10px] text-text-secondary uppercase mb-2">Audio_Archives</p>
            <p className="font-display text-2xl text-text-primary">{formattedTracks}</p>
          </div>
          <div className="border border-border bg-surface/50 p-4 text-center hover:bg-surface transition-colors">
            <p className="font-mono text-[10px] text-text-secondary uppercase mb-2">Text_Logs</p>
            <p className="font-display text-2xl text-text-primary">{formattedLogs}</p>
          </div>
          <div className="border border-border bg-surface/50 p-4 text-center hover:bg-surface transition-colors flex flex-col justify-center">
            <p className="font-mono text-[10px] text-text-secondary uppercase mb-2">Status</p>
            <p className="font-mono text-xs text-accent uppercase tracking-widest animate-pulse">Online</p>
          </div>
        </div>

        {/* 2. Hardware / Environment Specs */}
        <div className="border border-border bg-surface p-5 sm:p-6 font-mono text-[11px] sm:text-xs text-text-secondary space-y-3 leading-relaxed">
          <div className="flex justify-between border-b border-border/50 pb-3 mb-4">
            <span className="uppercase text-text-primary">Environment_Specs</span>
            <span className="text-text-secondary/50">v1.0.0</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-4">
            <span className="sm:col-span-3 text-text-primary">LOC:</span>
            <span className="sm:col-span-9">3x3 Bedroom Workspace</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-4">
            <span className="sm:col-span-3 text-text-primary">INPUT_DEVICE:</span>
            <span className="sm:col-span-9">Standard Interface / Direct Line</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-4">
            <span className="sm:col-span-3 text-text-primary">NOISE_LEVEL:</span>
            <span className="sm:col-span-9">High (Unfiltered room tone, occasional traffic)</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-4">
            <span className="sm:col-span-3 text-text-primary">WORK_HOURS:</span>
            <span className="sm:col-span-9">23:00 - 04:00 (Peak Resonance)</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-4 pt-2">
            <span className="sm:col-span-3 text-text-primary opacity-50">SYNC:</span>
            <span className="sm:col-span-9 opacity-50">Connecting to outer atmosphere...</span>
          </div>
        </div>

      </div>
    </div>
  );
};
`
fs.writeFileSync('src/pages/About/About.tsx', code);
console.log('Update success');
