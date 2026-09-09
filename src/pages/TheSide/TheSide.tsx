import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Article } from '../../types';
import { Settings, Search, X, ArrowDownWideNarrow, ArrowUpNarrowWide } from 'lucide-react';
import { SetupModal } from './components/SetupModal';
import {
  getCachedArticles,
  subscribeToArticles,
  revalidateArticles,
  initRealtime
} from '../../lib/articlesStore';

export const TheSide: React.FC = () => {
  const [allArticles, setAllArticles] = useState<Article[]>(() => getCachedArticles());
  const [loading, setLoading] = useState(() => getCachedArticles().length === 0);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [showSetup, setShowSetup] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    // Initialize Supabase Realtime channel
    initRealtime();

    // Subscribe to realtime & cache changes
    const unsubscribe = subscribeToArticles((updatedList) => {
      setAllArticles(updatedList);
      setLoading(false);
      setError(null);
    });

    // Stale-While-Revalidate: fetch in background
    revalidateArticles()
      .then((freshList) => {
        setAllArticles(freshList);
        setLoading(false);
        setError(null);
      })
      .catch((err) => {
        console.error('Error syncing articles in background:', err);
        if (getCachedArticles().length === 0) {
          setError('Failed to load archive. The "articles" table might not exist yet.');
        }
        setLoading(false);
      });

    return unsubscribe;
  }, []);

  const categories = ['Stories', 'Thoughts', 'Origins'];

  const filteredArticles = allArticles
    .filter((article) => {
      const matchesCategory = filter ? article.category === filter : true;
      const matchesSearch = searchQuery.trim()
        ? article.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
        : true;
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      const dateA = new Date(a.release_date || a.published_at || a.created_at).getTime();
      const dateB = new Date(b.release_date || b.published_at || b.created_at).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  const formatDate = (isoDate: string) => {
    return new Date(isoDate).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '.');
  };

  return (
    <div className="pb-12">
      <header className="mb-10 md:mb-12 text-center md:text-left relative">
        <h2 className="text-4xl md:text-5xl font-display uppercase tracking-widest mb-4">The Side</h2>
        <p className="text-sm font-mono text-text-secondary uppercase tracking-widest">
          The unseen side of every creation.
        </p>
        
        {/* DEV ONLY: Settings Button */}
        <button
          onClick={() => setShowSetup(true)}
          className="absolute right-0 top-0 p-2 text-text-secondary hover:text-text-primary transition-colors"
          title="Supabase Setup (Dev Only)"
        >
          <Settings size={18} />
        </button>
      </header>

      {/* Filters & Integrated Collapsible Search */}
      <div className="relative border-b border-border pb-3.5 mb-8 flex items-center min-h-[42px]">
        {isSearchOpen ? (
          /* Mode Input Pencarian Aktif */
          <div className="flex items-center w-full gap-3">
            <Search size={16} className="text-text-secondary shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="SEARCH ARCHIVE..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent py-1 text-xs font-mono uppercase tracking-widest text-text-primary placeholder:text-text-secondary/50 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setIsSearchOpen(false);
              }}
              className="p-1 text-text-secondary hover:text-text-primary transition-colors shrink-0"
              title="Tutup Pencarian"
              aria-label="Tutup Pencarian"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          /* Mode Filter Normal: Tombol Search di Pojok Kiri, Tab Filter Center, Tombol Sort di Pojok Kanan */
          <div className="relative w-full flex items-center justify-between">
            {/* Tombol Search di Pojok Kiri */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className={`p-1.5 transition-colors shrink-0 z-10 ${
                searchQuery
                  ? 'text-accent'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
              title="Cari artikel"
              aria-label="Cari artikel"
            >
              <Search size={16} />
            </button>

            {/* Tab Filter Tetap Center Presisi */}
            <div className="absolute inset-0 flex justify-center items-center gap-3 sm:gap-6 md:gap-8 pointer-events-none">
              <button 
                onClick={() => setFilter(null)}
                className={`pointer-events-auto font-mono text-[11px] sm:text-xs uppercase tracking-widest transition-colors py-1 ${
                  !filter 
                    ? 'text-text-primary border-b border-text-primary font-semibold' 
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button 
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`pointer-events-auto font-mono text-[11px] sm:text-xs uppercase tracking-widest transition-colors py-1 ${
                    filter === cat 
                      ? 'text-text-primary border-b border-text-primary font-semibold' 
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Tombol Sort (Terbaru / Terlama) di Pojok Kanan */}
            <button
              type="button"
              onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
              className={`p-1.5 transition-colors shrink-0 z-10 ${
                sortOrder === 'asc'
                  ? 'text-accent'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
              title={sortOrder === 'desc' ? 'Urutan: Terbaru (klik untuk terlama)' : 'Urutan: Terlama (klik untuk terbaru)'}
              aria-label="Ubah urutan tanggal"
            >
              {sortOrder === 'desc' ? (
                <ArrowDownWideNarrow size={16} />
              ) : (
                <ArrowUpNarrowWide size={16} />
              )}
            </button>
          </div>
        )}
      </div>

      {/* Archival List */}
      <div className="space-y-0">
        {loading ? (
          <div className="py-12 text-center text-xs font-mono text-text-secondary uppercase tracking-widest">
            Loading archive...
          </div>
        ) : error ? (
          <div className="py-12 text-center text-xs font-mono text-text-secondary uppercase tracking-widest text-red-500/80">
            {error}
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="py-12 text-center text-xs font-mono text-text-secondary uppercase tracking-widest">
            No records found.
          </div>
        ) : (
          filteredArticles.map((article) => {
            const articleDate = article.release_date || article.published_at || article.created_at;
            return (
              <Link 
                to={`/the-side/${article.slug}`} 
                key={article.id} 
                className="group block border-b border-border py-6 hover:bg-surface-hover/30 transition-colors px-4 -mx-4"
              >
                <div className="flex flex-col md:flex-row md:items-baseline gap-2 md:gap-6">
                  {/* Mobile: Category & Date Row | Desktop: Category Only */}
                  <div className="flex items-center justify-between md:block shrink-0 md:w-32">
                    <span className="text-xs font-mono text-text-secondary uppercase tracking-widest">
                      {article.category}
                    </span>
                    <span className="text-xs font-mono text-text-secondary uppercase tracking-widest md:hidden">
                      {formatDate(articleDate)}
                    </span>
                  </div>
                  
                  {/* Title & Snippet */}
                  <div className="flex-1 min-w-0 mt-1 md:mt-0">
                    <h3 className="text-xl md:text-2xl font-serif text-text-primary group-hover:text-accent transition-colors">
                      {article.title}
                    </h3>
                    {article.snippet && (
                      <p className="mt-2 text-xs sm:text-sm text-text-secondary/80 font-sans line-clamp-2 leading-relaxed">
                        {article.snippet}
                      </p>
                    )}
                  </div>
                  
                  {/* Desktop: Date Only */}
                  <div className="hidden md:block text-xs font-mono text-text-secondary uppercase tracking-widest text-right shrink-0 md:w-28">
                    {formatDate(articleDate)}
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>

      <SetupModal isOpen={showSetup} onClose={() => setShowSetup(false)} />
    </div>
  );
};
