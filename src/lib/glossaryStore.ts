import { supabase } from './supabase';
import { GlossaryItem } from '../types/glossary';

const STORAGE_KEY = 'sorside_glossary_v1';

let memoryGlossary: GlossaryItem[] = [];
let isCacheLoaded = false;
let isRealtimeStarted = false;

type Listener = (items: GlossaryItem[]) => void;
const listeners = new Set<Listener>();

const notifyListeners = () => {
  listeners.forEach((listener) => {
    try {
      listener([...memoryGlossary]);
    } catch (e) {
      console.error('Error notifying glossary listener:', e);
    }
  });
};

export const loadGlossaryFromStorage = (): GlossaryItem[] => {
  if (isCacheLoaded && memoryGlossary.length > 0) {
    return memoryGlossary;
  }
  
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      memoryGlossary = JSON.parse(cached);
      isCacheLoaded = true;
    }
  } catch (error) {
    console.error('Failed to load glossary from localStorage', error);
  }
  return memoryGlossary;
};

export const getCachedGlossary = (): GlossaryItem[] => {
  if (!isCacheLoaded) {
    loadGlossaryFromStorage();
  }
  return memoryGlossary;
};

export const setCachedGlossary = (items: GlossaryItem[]): void => {
  memoryGlossary = items.sort((a, b) => a.order_index - b.order_index);
  isCacheLoaded = true;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryGlossary));
  } catch (error) {
    console.error('Failed to save glossary to localStorage', error);
  }
  notifyListeners();
};

export const subscribeToGlossary = (listener: Listener): (() => void) => {
  listeners.add(listener);
  listener([...getCachedGlossary()]);
  return () => {
    listeners.delete(listener);
  };
};

export const revalidateGlossary = async (): Promise<GlossaryItem[]> => {
  try {
    const { data, error } = await supabase
      .from('about_glossary')
      .select('*')
      .eq('published', true)
      .order('order_index', { ascending: true });

    if (error) {
      // Silently fail if table doesn't exist yet (PGRST205)
      if (error.code !== 'PGRST205') {
        console.error('Error fetching glossary:', error);
      }
      return memoryGlossary;
    }

    if (data) {
      setCachedGlossary(data as GlossaryItem[]);
      if (!isRealtimeStarted) {
        initGlossaryRealtime();
      }
      return data as GlossaryItem[];
    }
  } catch (error) {
    console.error('Error in revalidateGlossary:', error);
  }
  return memoryGlossary;
};

export const initGlossaryRealtime = (): void => {
  if (isRealtimeStarted) return;
  isRealtimeStarted = true;

  supabase
    .channel('public:about_glossary')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'about_glossary' },
      () => {
        revalidateGlossary();
      }
    )
    .subscribe();
};
