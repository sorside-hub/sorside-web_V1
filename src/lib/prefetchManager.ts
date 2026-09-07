import { revalidateArticles, initRealtime as initArticlesRealtime } from './articlesStore';

type PrefetchTask = () => Promise<void> | void;

const customPrefetchTasks: PrefetchTask[] = [];

let hasPrefetchedStarted = false;
let isPrefetchedComplete = false;

/**
 * Register any additional prefetch tasks (e.g. discography, feeds)
 */
export const registerPrefetchTask = (task: PrefetchTask): void => {
  customPrefetchTasks.push(task);
  if (hasPrefetchedStarted) {
    // If prefetch already ran, execute this newly registered task during idle time
    scheduleIdle(task);
  }
};

/**
 * Helper to execute callbacks during browser idle time to ensure 0 ms impact on first paint
 */
const scheduleIdle = (callback: () => void): void => {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    (window as any).requestIdleCallback(() => callback(), { timeout: 1500 });
  } else {
    setTimeout(callback, 200);
  }
};

/**
 * Initialize silent background prefetching for the whole app
 * Runs during browser idle time right after the initial page (Home) renders.
 */
export const initBackgroundPrefetch = (): void => {
  if (hasPrefetchedStarted) return;
  hasPrefetchedStarted = true;

  scheduleIdle(async () => {
    try {
      // 1. Prefetch Articles & start Realtime listener
      initArticlesRealtime();
      await revalidateArticles().catch((err) => {
        // Silent catch: network or table not created yet, doesn't block the app
        console.debug('[Prefetch] Articles sync status:', err?.message || 'ready');
      });

      // 2. Execute any registered future prefetchers (Discography, Feed, etc.)
      for (const task of customPrefetchTasks) {
        try {
          await task();
        } catch (err) {
          console.debug('[Prefetch] Custom task error:', err);
        }
      }

      isPrefetchedComplete = true;
    } catch (err) {
      console.debug('[Prefetch] Background prefetch encountered an error:', err);
    }
  });
};

/**
 * Check if the background prefetch has finished
 */
export const isBackgroundPrefetchComplete = (): boolean => isPrefetchedComplete;
