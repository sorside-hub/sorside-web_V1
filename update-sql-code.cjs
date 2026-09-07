const fs = require('fs');

const targetFile = 'src/pages/About/components/AboutSqlSetup.tsx';
let code = fs.readFileSync(targetFile, 'utf-8');

const newSql = `-- 1. Create table
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

// The old sql code to replace
const oldSqlRegex = /const sqlCode = `-- Create table[\s\S]*?using \(published = true\);`;/;
code = code.replace(oldSqlRegex, `const sqlCode = \`${newSql}\`;`);

fs.writeFileSync(targetFile, code);
console.log('SQL code updated.');
