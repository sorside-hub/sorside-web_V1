import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Markdown from 'react-markdown';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Article } from '../../types';
import {
  getCachedArticleBySlug,
  upsertCachedArticle,
  subscribeToArticles,
  initRealtime
} from '../../lib/articlesStore';
import { ArticleNavigation } from './components/ArticleNavigation';
import { OriginAudioBanner } from './components/OriginAudioBanner';

export const ArticleDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(() => (slug ? getCachedArticleBySlug(slug) || null : null));
  const [loading, setLoading] = useState(() => (slug ? !getCachedArticleBySlug(slug) : false));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    if (!slug) return;

    // Instantly sync from cache if slug changed
    const currentCached = getCachedArticleBySlug(slug);
    if (currentCached) {
      setArticle(currentCached);
      setLoading(false);
      setError(null);
    } else {
      setLoading(true);
    }

    initRealtime();

    // Listen for realtime updates while user is reading this article
    const unsubscribe = subscribeToArticles((all) => {
      const updated = all.find((a) => a.slug === slug);
      if (updated) {
        setArticle(updated);
        setLoading(false);
      }
    });

    const fetchArticle = async () => {
      try {
        if (!currentCached) {
          setLoading(true);
        }
        if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
          if (!currentCached) {
            setError('Supabase is not configured yet. Please add credentials.');
          }
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('articles')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error) throw error;
        if (data) {
          setArticle(data);
          upsertCachedArticle(data);
          setError(null);
        }
      } catch (err: any) {
        console.error('Error fetching article:', err.message);
        if (!currentCached) {
          setError('Article not found or failed to load.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();

    return unsubscribe;
  }, [slug]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <span className="font-mono text-xs uppercase tracking-widest text-text-secondary">Loading...</span>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="flex flex-col items-center py-32 text-center space-y-6">
        <p className="font-mono text-xs uppercase tracking-widest text-text-secondary">{error}</p>
        <Link to="/the-side" className="text-xs font-mono uppercase tracking-widest border-b border-text-primary pb-1 hover:text-accent hover:border-accent transition-colors">
          Return to Archive
        </Link>
      </div>
    );
  }

  const articleDate = article.release_date || article.published_at || article.created_at;
  const formattedDate = new Date(articleDate).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).replace(/\//g, '.');

  return (
    <div className="max-w-2xl mx-auto pb-10">
      <Link
        to="/the-side"
        className="group hidden md:inline-flex items-center gap-2 mb-12 text-xs font-mono uppercase tracking-widest text-text-secondary hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        <span>Back to The Side</span>
      </Link>
      
      <header className="mb-12">
        <div className="flex items-center gap-4 text-xs font-mono text-text-secondary uppercase tracking-widest mb-6">
          <span>{article.category}</span>
          <span className="w-1 h-1 bg-border rounded-full" />
          <span>{formattedDate}</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-display leading-tight">{article.title}</h1>
      </header>

      {/* Audio Connection Banner (If this Origin story matches a Discography track/release) */}
      <OriginAudioBanner articleSlug={article.slug} />

      <article className="markdown-body space-y-6 text-text-secondary leading-relaxed font-sans">
        <Markdown>{article.content}</Markdown>
      </article>

      {/* Editorial Sequence: Prev & Next Article Navigation */}
      <ArticleNavigation currentSlug={article.slug} />
    </div>
  );
};
