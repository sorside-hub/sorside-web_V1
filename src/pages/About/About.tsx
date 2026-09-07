import React, { useState, useEffect } from 'react';
import { getCachedArticles, subscribeToArticles, revalidateArticles } from '../../lib/articlesStore';
import { getCachedReleases, subscribeToReleases, revalidateReleases } from '../../lib/discographyStore';
import { getCachedGlossary, subscribeToGlossary, revalidateGlossary } from '../../lib/glossaryStore';
import { Article } from '../../types';
import { Release } from '../../types/discography';
import { GlossaryItem } from '../../types/glossary';
import { AboutSqlSetup } from './components/AboutSqlSetup';
import { Settings } from 'lucide-react';

export const About: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>(getCachedArticles());
  const [releases, setReleases] = useState<Release[]>(getCachedReleases());
  const [glossary, setGlossary] = useState<GlossaryItem[]>(getCachedGlossary());

  useEffect(() => {
    const unsubscribeArticles = subscribeToArticles(setArticles);
    const unsubscribeReleases = subscribeToReleases(setReleases);
    const unsubscribeGlossary = subscribeToGlossary(setGlossary);

    // Fetch freshest data
    revalidateArticles();
    revalidateReleases();
    revalidateGlossary();

    return () => {
      unsubscribeArticles();
      unsubscribeReleases();
      unsubscribeGlossary();
    };
  }, []);

  const totalTracks = releases.reduce((sum, release) => sum + (release.tracks?.length || 0), 0);
  const totalLogs = articles.length;

  const formattedTracks = totalTracks.toString().padStart(2, '0');
  const formattedLogs = totalLogs.toString().padStart(2, '0');

  // Helper untuk membersihkan tags p bawaan wysiwyg yang tidak perlu, 
  // karena konten teks di-render di dalam tag p pada box
  const formatContent = (htmlContent: string) => {
    // Basic fallback render
    return { __html: htmlContent };
  };

  return (
    <div className="pb-16 md:pb-24 space-y-12 max-w-4xl mx-auto">
      {/* Header */}
      <header className="space-y-3 relative z-10 bg-background pb-4">
        <h2 className="text-4xl md:text-5xl font-display uppercase tracking-widest text-text-primary">
          About
        </h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-8 h-[1px] bg-accent" />
            <p className="font-mono text-xs text-text-secondary uppercase tracking-widest">
              // System.Glossary
            </p>
          </div>
          <AboutSqlSetup />
        </div>
      </header>

      {/* Glossary Timeline Approach */}
      <div className="relative">
        
        {/* Garis Putus-putus Vertikal di Tengah (Root Line) */}
        {glossary.length > 0 && (
          <div className="absolute left-[24px] sm:left-1/2 top-0 bottom-0 w-[1px] border-l-2 border-dashed border-border/60 -translate-x-1/2 z-0" />
        )}

        <div className="space-y-12 relative z-10">
          
          {glossary.length === 0 ? (
            <div className="text-center border border-border bg-surface p-12 text-text-secondary font-mono text-sm tracking-widest uppercase">
              No Glossary Data Found in Server.
            </div>
          ) : (
            glossary.map((item, index) => {
              const numStr = (index + 1).toString().padStart(2, '0');
              const isEven = index % 2 === 0;

              if (isEven) {
                // Layout Kanan (Kotak di kanan, Angka di kiri)
                return (
                  <div key={item.id} className="relative flex flex-col sm:flex-row items-center group">
                    {/* Dot */}
                    <div className="absolute left-[24px] sm:left-1/2 top-1/2 w-3 h-3 bg-accent rounded-sm -translate-x-1/2 -translate-y-1/2 z-20 group-hover:scale-150 transition-transform duration-300 shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
                    
                    {/* Konten Kiri (Angka Desktop) */}
                    <div className="w-full sm:w-1/2 sm:pr-12 pl-16 sm:pl-0 text-left sm:text-right hidden sm:block">
                      <div className="text-text-secondary/20 font-display text-8xl uppercase tracking-tighter select-none pointer-events-none group-hover:text-text-secondary/40 transition-colors duration-500">
                        {numStr}
                      </div>
                    </div>

                    {/* Konten Kanan (Card) */}
                    <div className="w-full sm:w-1/2 sm:pl-12 pl-16">
                      <div className="border border-border bg-surface p-6 sm:p-8 relative overflow-hidden transition-all duration-300 hover:border-text-secondary">
                        <div className="sm:hidden absolute right-4 -top-2 text-text-secondary/10 font-display text-6xl uppercase tracking-tighter select-none pointer-events-none">
                          {numStr}
                        </div>
                        <h3 className="font-mono text-sm tracking-widest uppercase text-text-primary mb-4 flex items-center sm:justify-center gap-2 font-semibold">
                          <span className="w-2 h-2 bg-accent inline-block sm:hidden" />
                          [ {item.title} ]
                        </h3>
                        <div 
                          className="text-sm text-text-secondary leading-relaxed font-sans text-left prose prose-invert max-w-none prose-p:my-0 prose-p:mb-2 prose-a:text-accent hover:prose-a:text-text-primary"
                          dangerouslySetInnerHTML={formatContent(item.content)} 
                        />
                      </div>
                    </div>
                  </div>
                );
              } else {
                // Layout Kiri (Kotak di kiri, Angka di kanan)
                return (
                  <div key={item.id} className="relative flex flex-col sm:flex-row items-center group">
                    {/* Dot */}
                    <div className="absolute left-[24px] sm:left-1/2 top-1/2 w-3 h-3 bg-background border-2 border-accent rounded-sm -translate-x-1/2 -translate-y-1/2 z-20 group-hover:bg-accent transition-colors duration-300" />
                    
                    {/* Konten Kiri (Card Desktop) */}
                    <div className="w-full sm:w-1/2 sm:pr-12 pl-16 sm:pl-0 order-2 sm:order-1">
                      <div className="border border-border bg-surface p-6 sm:p-8 relative overflow-hidden transition-all duration-300 hover:border-text-secondary">
                        <div className="sm:hidden absolute right-4 -top-2 text-text-secondary/10 font-display text-6xl uppercase tracking-tighter select-none pointer-events-none">
                          {numStr}
                        </div>
                        <h3 className="font-mono text-sm tracking-widest uppercase text-text-primary mb-4 flex items-center sm:justify-center gap-2 font-semibold">
                          <span className="w-2 h-2 bg-accent inline-block sm:hidden" />
                          [ {item.title} ]
                        </h3>
                        <div 
                          className="text-sm text-text-secondary leading-relaxed font-sans text-left prose prose-invert max-w-none prose-p:my-0 prose-p:mb-2 prose-a:text-accent hover:prose-a:text-text-primary"
                          dangerouslySetInnerHTML={formatContent(item.content)} 
                        />
                      </div>
                    </div>

                    {/* Konten Kanan (Angka Desktop) */}
                    <div className="w-full sm:w-1/2 sm:pl-12 hidden sm:flex items-center order-1 sm:order-2">
                      <div className="text-text-secondary/20 font-display text-8xl uppercase tracking-tighter select-none pointer-events-none group-hover:text-text-secondary/40 transition-colors duration-500">
                        {numStr}
                      </div>
                    </div>
                  </div>
                );
              }
            })
          )}
        </div>
        
        {glossary.length > 0 && (
          <div className="mt-16 sm:mt-24 text-center font-mono text-[10px] text-text-secondary uppercase tracking-widest">
            <p>END OF GLOSSARY // [EOF]</p>
          </div>
        )}
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
            <p className="font-mono text-xs text-accent uppercase tracking-widest animate-pulse">Evolving</p>
          </div>
        </div>

      </div>
    </div>
  );
};
