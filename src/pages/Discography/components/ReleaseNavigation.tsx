import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { getCachedReleases } from '../../../lib/discographyStore';

interface ReleaseNavigationProps {
  currentSlug: string;
}

export const ReleaseNavigation: React.FC<ReleaseNavigationProps> = ({ currentSlug }) => {
  const releases = getCachedReleases();
  const currentIndex = releases.findIndex((r) => r.slug === currentSlug || r.id === currentSlug);
  if (currentIndex === -1) return null;

  const prevRelease = currentIndex > 0 ? releases[currentIndex - 1] : null;
  const nextRelease = currentIndex < releases.length - 1 ? releases[currentIndex + 1] : null;

  if (!prevRelease && !nextRelease) return null;

  return (
    <nav className="mt-16 pt-8 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-6">
      {/* Previous Release */}
      {prevRelease ? (
        <Link
          to={`/discography/${prevRelease.slug}`}
          className="group flex flex-col p-4 border border-border hover:border-text-primary transition-colors text-left"
        >
          <div className="flex items-center gap-2 text-[10px] font-mono text-text-secondary uppercase tracking-widest mb-1 group-hover:text-accent transition-colors">
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Previous Release</span>
          </div>
          <span className="font-display text-lg uppercase tracking-wide text-text-primary truncate">
            {prevRelease.title}
          </span>
          <span className="text-[10px] font-mono text-text-secondary uppercase tracking-widest mt-0.5">
            [{prevRelease.type} · {prevRelease.year}]
          </span>
        </Link>
      ) : (
        <div className="hidden sm:block" />
      )}

      {/* Next Release */}
      {nextRelease ? (
        <Link
          to={`/discography/${nextRelease.slug}`}
          className="group flex flex-col p-4 border border-border hover:border-text-primary transition-colors text-right sm:text-right"
        >
          <div className="flex items-center justify-end gap-2 text-[10px] font-mono text-text-secondary uppercase tracking-widest mb-1 group-hover:text-accent transition-colors">
            <span>Next Release</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </div>
          <span className="font-display text-lg uppercase tracking-wide text-text-primary truncate">
            {nextRelease.title}
          </span>
          <span className="text-[10px] font-mono text-text-secondary uppercase tracking-widest mt-0.5">
            [{nextRelease.type} · {nextRelease.year}]
          </span>
        </Link>
      ) : null}
    </nav>
  );
};
