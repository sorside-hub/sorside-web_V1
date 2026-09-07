import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Article } from '../../../types';
import { getCachedArticles, subscribeToArticles } from '../../../lib/articlesStore';

interface ArticleNavigationProps {
  currentSlug: string;
}

export const ArticleNavigation: React.FC<ArticleNavigationProps> = ({ currentSlug }) => {
  const [articles, setArticles] = useState<Article[]>(() => getCachedArticles());

  useEffect(() => {
    const unsubscribe = subscribeToArticles((updatedList) => {
      setArticles(updatedList);
    });
    return unsubscribe;
  }, []);

  if (!articles || articles.length <= 1) {
    return null;
  }

  const currentIndex = articles.findIndex((item) => item.slug === currentSlug);
  if (currentIndex === -1) {
    return null;
  }

  // Articles are ordered chronologically (newest first).
  // Previous in chronology (older) is currentIndex + 1, Next in chronology (newer) is currentIndex - 1.
  const prevArticle = currentIndex < articles.length - 1 ? articles[currentIndex + 1] : null;
  const nextArticle = currentIndex > 0 ? articles[currentIndex - 1] : null;

  return (
    <nav aria-label="Article navigation" className="mt-12 pt-8 border-t border-border">
      <div className="flex items-center justify-between mb-4">
        <span className="font-mono text-[10px] uppercase tracking-widest text-text-secondary">
          SEQUENCE // THE SIDE
        </span>
        <Link
          to="/the-side"
          className="font-mono text-[10px] uppercase tracking-widest text-text-secondary hover:text-text-primary transition-colors border-b border-transparent hover:border-text-primary"
        >
          [ ALL ARCHIVES ]
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Previous Article */}
        {prevArticle ? (
          <Link
            to={`/the-side/${prevArticle.slug}`}
            className="group flex flex-col justify-between p-4 sm:p-5 border border-border hover:border-text-primary transition-colors"
          >
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-text-secondary group-hover:text-accent transition-colors mb-3">
              <span className="inline-flex items-center gap-1">
                <ArrowLeft className="w-3 h-3 text-current transition-transform group-hover:-translate-x-0.5" />
                <span>PREV</span>
              </span>
              <span className="text-border">/</span>
              <span>{prevArticle.category}</span>
            </div>
            <h4 className="font-serif text-base sm:text-lg text-text-primary group-hover:text-accent transition-colors line-clamp-2 leading-snug">
              {prevArticle.title}
            </h4>
          </Link>
        ) : (
          <Link
            to="/the-side"
            className="group flex flex-col justify-between p-4 sm:p-5 border border-border/40 border-dashed hover:border-text-primary transition-colors"
          >
            <div className="text-[10px] font-mono uppercase tracking-widest text-text-secondary mb-3">
              ARCHIVE // END OF TIMELINE
            </div>
            <span className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-widest text-text-secondary group-hover:text-text-primary transition-colors">
              <ArrowLeft className="w-3.5 h-3.5 text-current transition-transform group-hover:-translate-x-0.5" />
              <span>Return to Archive</span>
            </span>
          </Link>
        )}

        {/* Next Article */}
        {nextArticle ? (
          <Link
            to={`/the-side/${nextArticle.slug}`}
            className="group flex flex-col justify-between p-4 sm:p-5 border border-border hover:border-text-primary transition-colors text-left sm:text-right"
          >
            <div className="flex items-center sm:justify-end gap-2 text-[10px] font-mono uppercase tracking-widest text-text-secondary group-hover:text-accent transition-colors mb-3">
              <span>{nextArticle.category}</span>
              <span className="text-border">/</span>
              <span className="inline-flex items-center gap-1">
                <span>NEXT</span>
                <ArrowRight className="w-3 h-3 text-current transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
            <h4 className="font-serif text-base sm:text-lg text-text-primary group-hover:text-accent transition-colors line-clamp-2 leading-snug">
              {nextArticle.title}
            </h4>
          </Link>
        ) : (
          <Link
            to="/the-side"
            className="group flex flex-col justify-between p-4 sm:p-5 border border-border/40 border-dashed hover:border-text-primary transition-colors text-left sm:text-right"
          >
            <div className="text-[10px] font-mono uppercase tracking-widest text-text-secondary mb-3">
              LATEST // CURRENT RECORD
            </div>
            <span className="inline-flex items-center sm:justify-end gap-1.5 font-mono text-xs uppercase tracking-widest text-text-secondary group-hover:text-text-primary transition-colors">
              <span>View All Entries</span>
              <ArrowRight className="w-3.5 h-3.5 text-current transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        )}
      </div>
    </nav>
  );
};
