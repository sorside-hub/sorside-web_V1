import { supabase } from './supabase';
import { Release, Track } from '../types/discography';
import { resolveImageUrl } from './imageHelper';

const STORAGE_KEY = 'sorside_discography_v3';

let memoryReleases: Release[] = [];
let isCacheLoaded = false;
let isRealtimeStarted = false;

type Listener = (releases: Release[]) => void;
const listeners = new Set<Listener>();

const notifyListeners = () => {
  listeners.forEach((listener) => {
    try {
      listener([...memoryReleases]);
    } catch (e) {
      console.error('Error notifying discography listener:', e);
    }
  });
};

/**
 * Load cache from localStorage (defaults to empty if not present)
 */
export const loadReleasesFromStorage = (): Release[] => {
  if (isCacheLoaded) {
    return memoryReleases;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        memoryReleases = parsed;
        isCacheLoaded = true;
        return memoryReleases;
      }
    }
  } catch (err) {
    console.warn('Failed to parse cached discography from localStorage:', err);
  }

  memoryReleases = [];
  isCacheLoaded = true;
  return memoryReleases;
};

/**
 * Get all cached releases synchronously (0 ms, from memory/storage)
 */
export const getCachedReleases = (): Release[] => {
  if (!isCacheLoaded) {
    return loadReleasesFromStorage();
  }
  return memoryReleases;
};

/**
 * Get single cached release by slug or id (0 ms)
 */
export const getCachedReleaseBySlug = (slug: string): Release | undefined => {
  const all = getCachedReleases();
  return all.find((item) => item.slug === slug || item.id === slug);
};

/**
 * Save full releases list to memory and localStorage, notifying subscribers
 */
export const setCachedReleases = (releases: Release[]): void => {
  memoryReleases = [...releases];
  isCacheLoaded = true;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(releases));
  } catch (err) {
    console.warn('Failed to write discography to localStorage:', err);
  }
  notifyListeners();
};

/**
 * Helper to transform raw Supabase releases + tracks into strongly-typed Release[]
 */
const transformSupabaseReleases = (rawReleases: any[]): Release[] => {
  return rawReleases.map((row) => {
    const rawTracks = Array.isArray(row.tracks) ? row.tracks : [];
    let tracks: Track[] = [];

    if (rawTracks.length > 0) {
      // Sort tracks by track_number ascending
      tracks = [...rawTracks]
        .sort((a, b) => (a.track_number || 1) - (b.track_number || 1))
        .map((t: any) => ({
          id: t.id,
          releaseId: t.release_id,
          trackNumber: t.track_number || 1,
          title: t.title || '',
          youtubeUrl: t.youtube_url || undefined,
          streamingUrl: t.youtube_url || undefined,
          lyrics: t.lyrics || undefined,
          originSlug: t.origin_slug || undefined,
          originTitle: t.origin_title || (t.origin_slug ? `Origins: ${t.title}` : undefined)
        }));
    } else {
      // If no tracks in tracks table (e.g. Single release entered only in releases table)
      tracks = [
        {
          id: `${row.id}-single-track`,
          releaseId: row.id,
          trackNumber: 1,
          title: row.title,
          youtubeUrl: row.youtube_url || undefined,
          streamingUrl: row.youtube_url || undefined,
          lyrics: row.lyrics || undefined,
          originSlug: row.origin_slug || undefined,
          originTitle: row.origin_title || (row.origin_slug ? `Origins: ${row.title}` : undefined)
        }
      ];
    }

    const releaseDate = row.release_date || (row.created_at ? row.created_at.split('T')[0] : '2023-01-01');
    const year = releaseDate ? parseInt(releaseDate.split('-')[0], 10) : new Date().getFullYear();

    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      type: row.type || 'Single',
      year: isNaN(year) ? 2023 : year,
      releaseDate: releaseDate.replace(/-/g, '.'),
      coverUrl: resolveImageUrl(row.cover_url),
      catalogNumber: row.catalog_number || undefined,
      tagline: row.tagline || undefined,
      description: row.tagline || row.description || '',
      credits: row.credits || undefined,
      published: row.published ?? true,
      orderIndex: row.order_index ?? 0,
      originSlug: row.origin_slug || undefined,
      originTitle: row.origin_title || (row.origin_slug ? `Origins: ${row.title}` : undefined),
      youtubeUrl: row.youtube_url || undefined,
      lyrics: row.lyrics || undefined,
      streamingLinks: {
        spotify: row.spotify_url || undefined,
        appleMusic: row.apple_music_url || undefined,
        youtube: row.youtube_url || undefined
      },
      tracks
    };
  });
};

/**
 * Subscribe to realtime updates from cache & Supabase
 */
export const subscribeToReleases = (listener: Listener): (() => void) => {
  listeners.add(listener);
  // Ensure realtime channel is active
  initDiscographyRealtime();
  return () => {
    listeners.delete(listener);
  };
};

/**
 * Initialize Supabase Realtime WebSocket channel for releases & tracks
 */
export const initDiscographyRealtime = (): void => {
  if (isRealtimeStarted) return;
  if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) return;

  try {
    isRealtimeStarted = true;
    supabase
      .channel('public:discography-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'releases' },
        () => {
          revalidateReleases().catch((err) =>
            console.warn('[Supabase Realtime] Error refetching releases:', err)
          );
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tracks' },
        () => {
          revalidateReleases().catch((err) =>
            console.warn('[Supabase Realtime] Error refetching tracks:', err)
          );
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Supabase Realtime] Subscribed to discography table changes.');
        }
      });
  } catch (err) {
    console.warn('Could not initialize Supabase Realtime for discography:', err);
  }
};

/**
 * Background fetcher (Stale-While-Revalidate)
 * Returns latest releases joined with tracks from Supabase while automatically updating cache
 */
export const revalidateReleases = async (): Promise<Release[]> => {
  if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    return getCachedReleases();
  }

  try {
    const { data, error } = await supabase
      .from('releases')
      .select('*, tracks(*)')
      .eq('published', true)
      .order('order_index', { ascending: false })
      .order('release_date', { ascending: false });

    if (error) {
      console.warn('Supabase releases fetch returned error:', error.message);
      return getCachedReleases();
    }

    if (data) {
      const transformed = transformSupabaseReleases(data);
      setCachedReleases(transformed);
      return transformed;
    }
  } catch (err) {
    console.warn('Error fetching releases from Supabase:', err);
  }

  return getCachedReleases();
};

