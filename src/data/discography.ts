import { Release } from '../types/discography';

/**
 * Static fallback dataset (now empty, live data is managed through Supabase)
 */
export const releasesData: Release[] = [];

export const getReleaseBySlug = (slug: string): Release | undefined => {
  return releasesData.find((r) => r.slug === slug || r.id === slug);
};

