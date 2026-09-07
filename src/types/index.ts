export interface FeedItem {
  id: string;
  category: 'Update' | 'Behind the Song' | 'Process' | 'Story';
  title: string;
  shortDescription: string;
  date: string;
  imageUrl?: string;
}

export interface DiscographyItem {
  id: string;
  category: 'Single' | 'EP' | 'Album';
  title: string;
  year: number;
  description: string;
  streamingUrl: string;
  behindTheSong: string;
  coverUrl: string;
}

export interface JournalItem {
  id: string;
  title: string;
  content: string;
  date: string;
  readingTime: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  category: string;
  content: string;
  created_at: string;
  published?: boolean;
  snippet?: string;
  release_date?: string;
  published_at?: string;
}

export * from './discography';
