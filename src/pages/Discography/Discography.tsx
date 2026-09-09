import React, { useEffect, useState } from 'react';
import { Search, Settings } from 'lucide-react';
import { Release, ReleaseType } from '../../types/discography';
import { ReleaseFilter } from './components/ReleaseFilter';
import { ReleaseCatalogItem } from './components/ReleaseCatalogItem';
import { DiscographySetupModal } from './components/DiscographySetupModal';
import {
  getCachedReleases,
  subscribeToReleases,
  revalidateReleases,
  initDiscographyRealtime
} from '../../lib/discographyStore';

export const Discography: React.FC = () => {
  const [allReleases, setAllReleases] = useState<Release[]>(() => getCachedReleases());
  const [selectedType, setSelectedType] = useState<ReleaseType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    // Initialize Realtime channel
    initDiscographyRealtime();

    // Subscribe to state changes (both local & realtime)
    const unsubscribe = subscribeToReleases((updatedList) => {
      setAllReleases(updatedList);
    });

    // Stale-While-Revalidate: fetch in background
    revalidateReleases()
      .then((freshList) => {
        setAllReleases(freshList);
      })
      .catch((err) => {
        console.warn('Background sync for releases failed:', err);
      });

    return unsubscribe;
  }, []);

  const filteredReleases = allReleases
    .filter((release) => {
      const matchesType = selectedType ? release.type === selectedType : true;
      const matchesSearch = searchQuery.trim()
        ? release.title.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
          release.tracks.some((t) =>
            t.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
          )
        : true;
      return matchesType && matchesSearch;
    })
    .sort((a, b) => {
      const dateA = new Date(a.releaseDate).getTime();
      const dateB = new Date(b.releaseDate).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

  return (
    <div className="pb-12">
      {/* Header */}
      <header className="mb-10 md:mb-12 text-center md:text-left relative">
        <h2 className="text-4xl md:text-5xl font-display uppercase tracking-widest mb-4">
          Discography
        </h2>
        <p className="text-sm font-mono text-text-secondary uppercase tracking-widest">
          Sonic catalog · Singles, EPs & Albums
        </p>

        {/* DEV ONLY: Supabase Setup Button */}
        <button
          onClick={() => setShowSetup(true)}
          className="absolute right-0 top-0 p-2 text-text-secondary hover:text-text-primary transition-colors"
          title="Supabase Setup (Dev Only)"
        >
          <Settings size={18} />
        </button>
      </header>

      {/* Filter Tabs & Integrated Collapsible Search */}
      <ReleaseFilter
        selectedType={selectedType}
        onSelectType={setSelectedType}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isSearchOpen={isSearchOpen}
        onToggleSearch={() => setIsSearchOpen((prev) => !prev)}
        sortOrder={sortOrder}
        onToggleSort={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
      />

      {/* Catalog List */}
      <div className="space-y-0">
        {filteredReleases.length === 0 ? (
          <div className="py-16 text-center text-xs font-mono text-text-secondary uppercase tracking-widest">
            No releases match your query.
          </div>
        ) : (
          filteredReleases.map((release, index) => (
            <ReleaseCatalogItem
              key={release.id}
              release={release}
              index={index}
            />
          ))
        )}
      </div>

      {/* Supabase Schema Modal */}
      <DiscographySetupModal
        isOpen={showSetup}
        onClose={() => setShowSetup(false)}
      />
    </div>
  );
};

