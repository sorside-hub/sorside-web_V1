import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCachedArticles, subscribeToArticles, revalidateArticles } from '../../../lib/articlesStore';
import { resolveImageUrl } from '../../../lib/imageHelper';
import { ArrowRight, Clock, BookOpen, FileText } from 'lucide-react';
import { RevealImage } from '../../../components/common/RevealImage';

export const ThoughtFragments: React.FC = () => {
  const [articles, setArticles] = useState(getCachedArticles());

  useEffect(() => {
    revalidateArticles().then(setArticles);
    const unsubscribe = subscribeToArticles(setArticles);
    return () => unsubscribe();
  }, []);

  const latestArticle = articles.length > 0 ? articles[0] : null;
  const secondaryArticles = articles.length > 1 ? articles.slice(1, 3) : [];

  return (
    <div className="space-y-3">
      {/* Sub Header / Metadata Bar */}
      <div className="flex items-center justify-between font-mono text-[10px] text-text-secondary uppercase">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-text-primary inline-block rounded-full" />
          <span className="text-text-primary font-bold tracking-widest">TERBARU DARI THE SIDE</span>
        </div>
        <Link
          to="/the-side"
          className="font-mono text-[10px] text-text-secondary hover:text-accent flex items-center gap-1 transition-colors uppercase"
        >
          <span>TOTAL ARSIP: {articles.length}</span>
          <ArrowRight className="w-2.5 h-2.5" />
        </Link>
      </div>

      {/* Featured Article Card */}
      {!latestArticle ? (
        <div className="border border-border bg-surface p-12 flex flex-col items-center justify-center space-y-2">
          <FileText className="w-8 h-8 text-text-secondary/40" />
          <p className="font-mono text-xs tracking-widest text-text-secondary uppercase text-center">
            // BELUM ADA CATATAN TULISAN
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Main Primary Article Card */}
          <Link
            to={`/the-side/${latestArticle.slug}`}
            className="group block border border-border bg-surface hover:border-text-primary transition-all p-5 sm:p-6 space-y-4"
          >
            <div className="flex flex-col sm:flex-row gap-5 items-start">
              {/* Article Image / Poster */}
              {(latestArticle as any).cover_url && (
                <div className="relative w-full sm:w-40 h-32 shrink-0 bg-background border border-border overflow-hidden">
                  <RevealImage
                    src={resolveImageUrl((latestArticle as any).cover_url)}
                    alt={latestArticle.title}
                  />
                  <div className="absolute top-1.5 left-1.5 bg-black/85 px-1.5 py-0.5 text-[8px] font-mono tracking-widest text-white uppercase border border-white/20">
                    {latestArticle.category || 'ESSAY'}
                  </div>
                </div>
              )}

              {/* Content Details */}
              <div className="flex-1 space-y-2 min-w-0">
                <div className="flex items-center justify-between gap-3 text-[10px] font-mono uppercase tracking-wider text-text-secondary">
                  <span className="text-accent font-semibold">
                    {latestArticle.category || 'ESSAYS & THOUGHTS'}
                  </span>
                  <span className="flex items-center gap-1 text-text-secondary">
                    <Clock className="w-3 h-3" />
                    {(latestArticle as any).read_time || '3 min read'}
                  </span>
                </div>

                <h3 className="text-lg sm:text-xl font-display uppercase tracking-wide text-text-primary group-hover:text-accent transition-colors leading-snug">
                  {latestArticle.title}
                </h3>

                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-sans line-clamp-2">
                  {latestArticle.snippet}
                </p>
              </div>
            </div>

            {/* Card Footer Action */}
            <div className="pt-3 border-t border-border/60 flex items-center justify-between gap-3 text-xs font-mono uppercase tracking-wider text-text-primary group-hover:text-accent transition-colors">
              <span className="inline-flex items-center gap-1.5 font-semibold text-[11px]">
                <BookOpen className="w-3.5 h-3.5" />
                <span>BACA TULISAN LENGKAP</span>
              </span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </Link>

          {/* Secondary Quick Archive Ledger (if more articles exist) */}
          {secondaryArticles.length > 0 && (
            <div className="border border-border/80 bg-background divide-y divide-border/60">
              {secondaryArticles.map((item, idx) => (
                <Link
                  key={item.slug || idx}
                  to={`/the-side/${item.slug}`}
                  className="flex items-center justify-between gap-3 px-4 py-2.5 text-xs font-mono text-text-secondary hover:text-text-primary hover:bg-surface transition-colors group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-accent text-[10px] font-bold shrink-0">
                      [0{idx + 2}]
                    </span>
                    <span className="truncate uppercase group-hover:text-accent transition-colors">
                      {item.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-text-secondary/70 shrink-0 uppercase">
                    {item.category || 'ESSAY'} →
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

