/**
 * Helper utilities for YouTube and Audio playback
 */

/**
 * Extracts the 11-character YouTube video ID from various YouTube URL formats
 */
export function extractYouTubeId(urlOrId?: string): string | null {
  if (!urlOrId) return null;
  const trimmed = urlOrId.trim();

  // If already an 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // Handle standard youtube links, shorts, embeds, youtu.be
  const regExp =
    /(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/;
  const match = trimmed.match(regExp);

  return match ? match[1] : null;
}

/**
 * Check if the URL is a direct audio file or storage stream (MP3, WAV, etc.)
 */
export function isDirectAudioUrl(url?: string): boolean {
  if (!url) return false;
  const clean = url.trim().toLowerCase();
  return (
    /\.(mp3|wav|ogg|m4a|aac|flac)(\?.*)?$/i.test(clean) ||
    clean.includes('/storage/v1/object/public/') ||
    clean.includes('audio/')
  );
}

/**
 * Formats seconds into MM:SS
 */
export function formatSeconds(sec: number): string {
  if (isNaN(sec) || sec < 0) return '00:00';
  const total = Math.floor(sec);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Loads the YouTube IFrame API script tag safely once
 */
let isApiLoading = false;
let apiPromise: Promise<void> | null = null;

export function loadYouTubeIframeAPI(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();

  if ((window as any).YT && (window as any).YT.Player) {
    return Promise.resolve();
  }

  if (apiPromise) return apiPromise;

  apiPromise = new Promise((resolve) => {
    if ((window as any).YT && (window as any).YT.Player) {
      resolve();
      return;
    }

    const previousOnReady = (window as any).onYouTubeIframeAPIReady;
    (window as any).onYouTubeIframeAPIReady = () => {
      if (typeof previousOnReady === 'function') {
        previousOnReady();
      }
      resolve();
    };

    if (!isApiLoading) {
      isApiLoading = true;
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag && firstScriptTag.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        document.head.appendChild(tag);
      }
    }
  });

  return apiPromise;
}
