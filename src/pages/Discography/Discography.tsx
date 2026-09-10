import React, { useEffect, useState } from 'react';
import { Release, ReleaseType } from '../../types/discography';
import { ReleaseFilter } from './components/ReleaseFilter';
import { ReleaseCatalogItem } from './components/ReleaseCatalogItem';
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
      <header className="mb-8 md:mb-10 text-center md:text-left">
        <h2 className="text-4xl md:text-5xl font-display uppercase tracking-widest">
          Discography
        </h2>
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
            {allReleases.length === 0 ? 'Coming soon.' : 'No releases match your query.'}
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
    </div>
  );
};

