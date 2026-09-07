import React, { useState } from 'react';
import { Copy, Check, X } from 'lucide-react';

const SUPABASE_DISCOGRAPHY_SQL = `-- =========================================================
-- SORSIDE DISCOGRAPHY SCHEMA (Supabase SQL Script)
-- =========================================================

-- 1. Create the releases table (Master Table)
create table if not exists public.releases (
  id uuid not null default gen_random_uuid(),
  slug text not null,
  title text not null,
  tagline text,
  type text not null default 'Single', -- 'Single' | 'EP' | 'Album'
  release_date date not null default current_date,
  catalog_number text,
  cover_url text not null default 'https://res.cloudinary.com/sorside/image/upload/v1784875625/cover-all.webp',
  origin_slug text, -- Origin Story slug for Single / EP / Album
  lyrics text, -- Song lyrics for Single release
  spotify_url text, -- Full album/single link on Spotify
  apple_music_url text, -- Full album/single link on Apple Music
  youtube_url text, -- Web Player stream link for Single / Album video
  credits jsonb,
  published boolean not null default false, -- Default DRAFT
  order_index int default 0,
  created_at timestamp with time zone not null default now(),
  constraint releases_pkey primary key (id),
  constraint releases_slug_key unique (slug)
);

-- Pastikan default value published adalah false jika tabel sudah ada sebelumnya
alter table public.releases alter column published set default false;

-- 2. Create the tracks table (Detail Table for EPs/Albums)
create table if not exists public.tracks (
  id uuid not null default gen_random_uuid(),
  release_id uuid not null references public.releases(id) on delete cascade,
  track_number int not null default 1,
  title text not null,
  youtube_url text, -- Web player audio/video link per track
  lyrics text, -- Song lyrics per track (EP/Album)
  origin_slug text, -- Track-specific Origin Story slug
  created_at timestamp with time zone not null default now(),
  constraint tracks_pkey primary key (id)
);

-- 3. Enable Row Level Security (RLS)
alter table public.releases enable row level security;
alter table public.tracks enable row level security;

-- 4. Create Policies for Full Read/Write Access (Public & Anon)
drop policy if exists "Allow public read access on releases" on public.releases;
drop policy if exists "Allow public all access on releases" on public.releases;
create policy "Allow public all access on releases"
  on public.releases
  for all
  to public
  using (true)
  with check (true);

drop policy if exists "Allow public read access on tracks" on public.tracks;
drop policy if exists "Allow public all access on tracks" on public.tracks;
create policy "Allow public all access on tracks"
  on public.tracks
  for all
  to public
  using (true)
  with check (true);

-- 5. Create Performance Indexes
create index if not exists releases_slug_idx on public.releases (slug);
create index if not exists releases_order_idx on public.releases (order_index desc, release_date desc);
create index if not exists tracks_release_id_idx on public.tracks (release_id, track_number asc);

-- 6. Enable Realtime Live Sync
alter publication supabase_realtime add table public.releases;
alter publication supabase_realtime add table public.tracks;`;

interface DiscographySetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DiscographySetupModal: React.FC<DiscographySetupModalProps> = ({
  isOpen,
  onClose
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(SUPABASE_DISCOGRAPHY_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-surface border border-border max-w-2xl w-full p-6 relative max-h-[85vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-mono text-sm uppercase tracking-widest text-text-primary">
              Discography Supabase Setup
            </h3>
            <p className="font-mono text-[11px] text-text-secondary mt-0.5">
              Copy and execute this script in the Supabase SQL Editor.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-auto bg-background/50 border border-border p-4 mb-4">
          <pre className="font-mono text-xs text-text-secondary whitespace-pre-wrap">
            {SUPABASE_DISCOGRAPHY_SQL}
          </pre>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center justify-center gap-2 border border-text-primary px-8 py-3.5 font-mono text-xs tracking-widest uppercase hover:bg-text-primary hover:text-background transition-colors w-full"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          <span>{copied ? 'Copied to Clipboard' : 'Copy SQL Script'}</span>
        </button>
      </div>
    </div>
  );
};
