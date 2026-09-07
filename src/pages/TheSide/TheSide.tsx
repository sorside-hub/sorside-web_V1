import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Article } from '../../types';
import { Settings, Search } from 'lucide-react';
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
  const [showSetup, setShowSetup] = useState(false);

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

  const filteredArticles = allArticles.filter((article) => {
    const matchesCategory = filter ? article.category === filter : true;
    const matchesSearch = searchQuery.trim()
      ? article.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
      : true;
    return matchesCategory && matchesSearch;
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

      {/* Filters */}
      <div className="flex justify-center md:justify-start items-center gap-5 sm:gap-6 md:gap-8 border-b border-border pb-4 mb-6">
        <button 
          onClick={() => setFilter(null)}
          className={`font-mono text-[11px] sm:text-xs uppercase tracking-widest transition-colors py-1 ${!filter ? 'text-text-primary border-b border-text-primary' : 'text-text-secondary hover:text-text-primary'}`}
        >
          All
        </button>
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => setFilter(cat)}
            className={`font-mono text-[11px] sm:text-xs uppercase tracking-widest transition-colors py-1 ${filter === cat ? 'text-text-primary border-b border-text-primary' : 'text-text-secondary hover:text-text-primary'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="mb-8 relative max-w-sm mx-auto md:mx-0">
        <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none text-text-secondary">
          <Search size={14} />
        </div>
        <input
          type="text"
          placeholder="Search archive..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent border-b border-border py-2 pl-8 pr-4 text-[10px] sm:text-xs font-mono uppercase tracking-widest text-text-primary placeholder:text-text-secondary focus:outline-none focus:border-text-primary transition-colors"
        />
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
