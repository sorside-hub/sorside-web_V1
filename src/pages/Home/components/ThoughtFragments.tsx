import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCachedArticles, subscribeToArticles, revalidateArticles } from '../../../lib/articlesStore';
import { resolveImageUrl } from '../../../lib/imageHelper';
import { ArrowRight, Clock, BookOpen, ExternalLink } from 'lucide-react';
import { RevealImage } from '../../../components/common/RevealImage';

export const ThoughtFragments: React.FC = () => {
  const [articles, setArticles] = useState(getCachedArticles());

  useEffect(() => {
    revalidateArticles().then(setArticles);
    const unsubscribe = subscribeToArticles(setArticles);
    return () => unsubscribe();
  }, []);

  const latestArticle = articles.length > 0 ? articles[0] : null;

  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-text-primary inline-block" />
          <h2 className="font-mono text-xs uppercase tracking-widest text-text-primary font-semibold">
            02 // The Side Update
          </h2>
        </div>
        <Link
          to="/the-side"
          className="font-mono text-[11px] text-text-secondary hover:text-accent flex items-center gap-1 transition-colors uppercase"
        >
          <span>LIHAT SEMUA TULISAN ({articles.length})</span>
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Featured Article Card */}
      {!latestArticle ? (
        <div className="border border-border bg-surface p-12 flex items-center justify-center">
          <p className="font-mono text-sm tracking-widest text-text-secondary uppercase text-center">
            // TIDAK ADA TULISAN TERBARU
          </p>
        </div>
      ) : (
        <Link
          to={`/the-side/${latestArticle.slug}`}
          className="group block border border-border bg-surface hover:border-text-primary transition-all p-5 sm:p-6 space-y-4"
        >
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            {/* Article Image / Poster (if available) */}
            {(latestArticle as any).cover_url && (
              <div className="relative w-full sm:w-44 h-36 shrink-0 bg-background border border-border overflow-hidden">
                <RevealImage
                  src={resolveImageUrl((latestArticle as any).cover_url)}
                  alt={latestArticle.title}
                />
                <div className="absolute top-2 left-2 bg-black/80 px-2 py-0.5 text-[9px] font-mono tracking-widest text-white uppercase border border-white/20">
                  {latestArticle.category || 'ARTICLE'}
                </div>
              </div>
            )}

            {/* Content Details */}
            <div className="flex-1 space-y-2 min-w-0">
              <div className="flex items-center justify-between gap-3 text-[10px] font-mono uppercase tracking-wider text-text-secondary">
                <span className="text-accent font-semibold border border-accent/40 px-2 py-0.5">
                  {latestArticle.category || 'ESSAY & MONOLOGUE'}
                </span>
                <span className="flex items-center gap-1.5 text-text-secondary">
                  <Clock className="w-3 h-3" />
                  {(latestArticle as any).read_time || '3 min read'} • {latestArticle.release_date || latestArticle.created_at?.split('T')[0] || (latestArticle as any).date}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-display uppercase tracking-wide text-text-primary group-hover:text-accent transition-colors leading-snug">
                {latestArticle.title}
              </h3>

              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-sans line-clamp-3">
                {latestArticle.snippet}
              </p>
            </div>
          </div>

          {/* Card Footer Action */}
          <div className="pt-3 border-t border-border/50 flex items-center justify-between gap-3 text-xs font-mono uppercase tracking-wider text-text-primary group-hover:text-accent transition-colors">
            <span className="inline-flex items-center gap-2 font-semibold">
              <BookOpen className="w-3.5 h-3.5" />
              <span>BACA TULISAN LENGKAP</span>
            </span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
          </div>
        </Link>
      )}
    </section>
  );
};
