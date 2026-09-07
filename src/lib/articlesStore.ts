import { supabase } from './supabase';
import { Article } from '../types';

const STORAGE_KEY = 'sorside_articles_v2';

let memoryArticles: Article[] = [];
let isCacheLoaded = false;
let isRealtimeStarted = false;

type Listener = (articles: Article[]) => void;
const listeners = new Set<Listener>();

const notifyListeners = () => {
  listeners.forEach((listener) => {
    try {
      listener([...memoryArticles]);
    } catch (e) {
      console.error('Error notifying articles listener:', e);
    }
  });
};

/**
 * Load cache from localStorage into memory on startup
 */
export const loadArticlesFromStorage = (): Article[] => {
  if (isCacheLoaded && memoryArticles.length > 0) {
    return memoryArticles;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        memoryArticles = parsed;
        isCacheLoaded = true;
        return memoryArticles;
      }
    }
  } catch (err) {
    console.warn('Failed to parse cached articles from localStorage:', err);
  }

  isCacheLoaded = true;
  return memoryArticles;
};

/**
 * Get all cached articles synchronously (0 ms, from memory/storage)
 */
export const getCachedArticles = (): Article[] => {
  if (!isCacheLoaded) {
    return loadArticlesFromStorage();
  }
  return memoryArticles;
};

/**
 * Get single cached article by slug (0 ms)
 */
export const getCachedArticleBySlug = (slug: string): Article | undefined => {
  const all = getCachedArticles();
  return all.find((item) => item.slug === slug);
};

/**
 * Save full articles list to memory and localStorage, notifying subscribers
 */
export const setCachedArticles = (articles: Article[]): void => {
  memoryArticles = [...articles];
  isCacheLoaded = true;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
  } catch (err) {
    console.warn('Failed to write articles to localStorage:', err);
  }
  notifyListeners();
};

/**
 * Update or insert a single article (used by Realtime & background sync)
 */
export const upsertCachedArticle = (article: Article): void => {
  // If article is unpublished, remove it from cache
  if (article.published === false) {
    removeCachedArticle(article.id);
    return;
  }

  const current = getCachedArticles();
  const index = current.findIndex((a) => a.id === article.id || a.slug === article.slug);

  let updated: Article[];
  if (index >= 0) {
    updated = [...current];
    updated[index] = { ...updated[index], ...article };
  } else {
    // Prepend new article
    updated = [article, ...current];
  }

  setCachedArticles(updated);
};

/**
 * Remove an article from cache (used by Realtime DELETE)
 */
export const removeCachedArticle = (id: string): void => {
  const current = getCachedArticles();
  const filtered = current.filter((a) => a.id !== id);
  if (filtered.length !== current.length) {
    setCachedArticles(filtered);
  }
};

/**
 * Subscribe to realtime updates from cache & Supabase
 */
export const subscribeToArticles = (listener: Listener): (() => void) => {
  listeners.add(listener);
  // Ensure realtime channel is active
  initRealtime();
  return () => {
    listeners.delete(listener);
  };
};

/**
 * Initialize Supabase Realtime WebSocket channel for the articles table
 */
export const initRealtime = (): void => {
  if (isRealtimeStarted) return;
  if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) return;

  try {
    isRealtimeStarted = true;
    supabase
      .channel('public:articles-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'articles' },
        (payload) => {
          if (payload.eventType === 'INSERT' && payload.new) {
            upsertCachedArticle(payload.new as Article);
          } else if (payload.eventType === 'UPDATE' && payload.new) {
            upsertCachedArticle(payload.new as Article);
          } else if (payload.eventType === 'DELETE' && payload.old && payload.old.id) {
            removeCachedArticle(payload.old.id);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Supabase Realtime] Subscribed to articles table changes.');
        }
      });
  } catch (err) {
    console.warn('Could not initialize Supabase Realtime:', err);
  }
};

/**
 * Background fetcher (Stale-While-Revalidate)
 * Returns latest articles from Supabase while automatically updating cache
 */
export const revalidateArticles = async (): Promise<Article[]> => {
  if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    return getCachedArticles();
  }

  try {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .or('published.eq.true,published.is.null')
      .order('created_at', { ascending: false });

    if (error) {
      // Fallback: try fetching without published filter if column doesn't exist yet
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('articles')
        .select('*')
        .order('created_at', { ascending: false });

      if (fallbackError) throw fallbackError;
      if (fallbackData) {
        setCachedArticles(fallbackData);
        return fallbackData;
      }
    }

    if (data) {
      setCachedArticles(data);
      return data;
    }
  } catch (err) {
    console.warn('Error fetching articles from Supabase:', err);
  }

  return getCachedArticles();
};
