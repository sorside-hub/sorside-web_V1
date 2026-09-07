import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Settings, Check, Copy, X, Database } from 'lucide-react';

export const AboutSqlSetup: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const sqlCode = `-- 1. Create table
create table public.about_glossary (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  order_index integer not null default 0,
  published boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS (Row Level Security)
alter table public.about_glossary enable row level security;

-- 3. Policy untuk publik/website (Hanya boleh baca yang statusnya published = true)
create policy "Allow public read access"
  on public.about_glossary
  for select
  using (published = true);

-- 4. Policy untuk Noesis Studio / Admin (Full Access CRUD)
-- Ini memungkinkan aplikasi Noesis membaca Draft, Membuat baru, Mengedit, dan Menghapus
create policy "Allow Noesis CMS full access"
  on public.about_glossary
  for all
  using (true)
  with check (true);`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Trigger Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="text-text-secondary hover:text-accent transition-colors"
        title="DB Setup"
      >
        <Settings size={16} />
      </button>

      {/* Modal */}
      {isOpen && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <div className="bg-surface border border-border w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-border flex justify-between items-center bg-background/50">
              <div className="flex items-center gap-3">
                <Database size={16} className="text-accent" />
                <h3 className="font-mono text-sm tracking-widest uppercase text-text-primary">
                  Setup Supabase Table
                </h3>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="space-y-2 text-sm text-text-secondary font-sans leading-relaxed">
                <p>Run the SQL command below in your Supabase SQL Editor to create the <strong>about_glossary</strong> table.</p>
                <p>This table allows you to manage the About page Glossary timeline dynamically from your CMS.</p>
              </div>

              <div className="relative group">
                <div className="absolute right-2 top-2">
                  <button 
                    onClick={copyToClipboard}
                    className="bg-background border border-border p-2 text-text-secondary hover:text-accent transition-colors rounded-sm"
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                  </button>
                </div>
                <pre className="bg-background border border-border p-4 text-xs font-mono text-text-secondary overflow-x-auto">
                  <code>{sqlCode}</code>
                </pre>
              </div>
            </div>
            
            <div className="p-4 border-t border-border bg-background/50 text-right">
              <button 
                onClick={() => setIsOpen(false)}
                className="font-mono text-xs uppercase tracking-widest text-text-primary hover:text-accent transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
