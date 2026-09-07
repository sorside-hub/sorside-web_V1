import { FeedItem, DiscographyItem, JournalItem } from '../types';

export const feedData: FeedItem[] = [
  {
    id: 'f1',
    category: 'Update',
    title: 'Studio Sessions Vol. 2',
    shortDescription: 'Late night recordings. Raw vocals, no overthinking.',
    date: '2023-11-12',
    imageUrl: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: 'f2',
    category: 'Behind the Song',
    title: 'Anatomy of "Rebel Yell"',
    shortDescription: 'How a broken guitar string led to the main riff.',
    date: '2023-10-28',
  },
  {
    id: 'f3',
    category: 'Story',
    title: 'The empty venues',
    shortDescription: 'Playing for 5 people taught me more than playing for 500.',
    date: '2023-09-15',
    imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=2070&auto=format&fit=crop'
  }
];

export const discographyData: DiscographyItem[] = [
  {
    id: 'd1',
    category: 'Album',
    title: 'Static Noise',
    year: 2023,
    description: 'A collection of thoughts recorded in a basement.',
    streamingUrl: '#',
    behindTheSong: 'It started as a joke, but the anger was real. We recorded this in two days.',
    coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=2070&auto=format&fit=crop'
  },
  {
    id: 'd2',
    category: 'Single',
    title: 'Broken Strings',
    year: 2022,
    description: 'Stripped down acoustic version.',
    streamingUrl: '#',
    behindTheSong: 'I wrote this after the first tour. I was exhausted.',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=2074&auto=format&fit=crop'
  }
];

export const journalData: JournalItem[] = [
  {
    id: 'j1',
    title: 'On selling out vs growing up',
    content: 'People say you change when you start making money from this. But the truth is, the music changes because your life changes. I can\'t write about being broke when I\'m not anymore. Honesty is the only punk thing left.',
    date: '2023-12-01',
    readingTime: '3 min read'
  },
  {
    id: 'j2',
    title: 'The myth of the muse',
    content: 'Waiting for inspiration is a luxury. Most days, it\'s just showing up to the studio and playing terrible riffs until one of them sounds slightly less terrible.',
    date: '2023-11-05',
    readingTime: '2 min read'
  }
];
