import React, { useState } from 'react';
import { Copy, Check, X } from 'lucide-react';

const SUPABASE_SQL_SCRIPT = `-- 1. Hapus tabel lama jika ingin reset bersih (opsional)
drop table if exists public.articles cascade;

-- 2. Buat tabel articles
create table public.articles (
  id uuid not null default gen_random_uuid(),
  title text not null,
  slug text not null,
  category text not null, -- 'stories' | 'thoughts' | 'origins'
  snippet text,
  content text not null,
  published boolean not null default true,
  release_date timestamp with time zone,
  created_at timestamp with time zone not null default now(),
  constraint articles_pkey primary key (id),
  constraint articles_slug_key unique (slug)
);

-- 3. Aktifkan Row Level Security (RLS)
alter table public.articles enable row level security;

-- 4. Buat Policy Akses Lengkap (Read, Insert, Update, Delete)
create policy "Allow all actions on articles"
  on public.articles
  for all
  using (true)
  with check (true);

-- 5. Buat Index pada kolom slug untuk lookup instan
create index articles_slug_idx on public.articles (slug);

-- 6. Aktifkan Supabase Realtime untuk sinkronisasi langsung
alter publication supabase_realtime add table public.articles;`;

interface SetupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SetupModal: React.FC<SetupModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-surface border border-border max-w-2xl w-full p-6 relative max-h-[80vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-mono text-sm uppercase tracking-widest text-text-primary">Database Setup</h3>
          <button 
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-auto bg-background/50 border border-border p-4 mb-6">
          <pre className="font-mono text-xs text-text-secondary whitespace-pre-wrap">
            {SUPABASE_SQL_SCRIPT}
          </pre>
        </div>
        
        <button
          onClick={handleCopy}
          className="flex items-center justify-center gap-2 border border-text-primary px-8 py-4 font-mono text-xs tracking-widest uppercase hover:bg-text-primary hover:text-background transition-colors w-full"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          <span>{copied ? 'Copied' : 'Copy SQL'}</span>
        </button>
      </div>
    </div>
  );
};
