export type ReleaseType = 'Single' | 'EP' | 'Album';

export interface CreditItem {
  role?: string;
  name?: string;
  label?: string;
  value?: string;
}

export interface LegacyReleaseCredits {
  /** Performance and songwriting credits */
  performance?: string;
  /** Production details */
  production?: string;
  /** Recording and audio engineering */
  engineering?: string;
  /** Mastering details */
  mastering?: string;
  /** Artwork, photography, and design */
  artwork?: string;
  /** Liner notes, stories, or special thanks */
  notes?: string;
  [key: string]: any;
}

export type ReleaseCredits =
  | string
  | CreditItem[]
  | LegacyReleaseCredits
  | Record<string, any>;

export interface Track {
  id: string;
  releaseId?: string;
  trackNumber: number;
  title: string;
  youtubeUrl?: string;
  streamingUrl?: string;
  /** Song lyrics (optional) */
  lyrics?: string;
  /** Slug of the article in The Side (Origins) */
  originSlug?: string;
  originTitle?: string;
}

export interface ReleaseStreamingLinks {
  spotify?: string;
  appleMusic?: string;
  youtube?: string;
  bandcamp?: string;
}

export interface Release {
  id: string;
  slug: string;
  title: string;
  type: ReleaseType;
  year: number;
  releaseDate: string;
  coverUrl: string;
  catalogNumber?: string;
  tagline?: string;
  description: string;
  credits?: string | ReleaseCredits;
  streamingLinks: ReleaseStreamingLinks;
  tracks: Track[];
  published?: boolean;
  orderIndex?: number;
  originSlug?: string;
  originTitle?: string;
  youtubeUrl?: string;
  /** Song lyrics for single release or overall release */
  lyrics?: string;
}
