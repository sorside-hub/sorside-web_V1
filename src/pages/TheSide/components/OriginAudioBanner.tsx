import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Pause, ArrowUpRight } from 'lucide-react';
import { Release, Track } from '../../../types/discography';
import {
  getCachedReleases,
  subscribeToReleases,
  revalidateReleases
} from '../../../lib/discographyStore';
import { useAudioPlayer } from '../../../context/AudioPlayerContext';
import { ImageWithFallback } from '../../../components/common/ImageWithFallback';

interface OriginAudioBannerProps {
  articleSlug: string;
}

export const OriginAudioBanner: React.FC<OriginAudioBannerProps> = ({ articleSlug }) => {
  const [releases, setReleases] = useState<Release[]>(() => getCachedReleases());
  const { playTrack, togglePlayPause, isCurrentTrackPlaying, currentTrack } = useAudioPlayer();

  useEffect(() => {
    const unsubscribe = subscribeToReleases((updatedList) => {
      setReleases(updatedList);
    });

    revalidateReleases()
      .then((fresh) => {
        setReleases(fresh);
      })
      .catch((err) => {
        console.warn('Error revalidating releases for OriginAudioBanner:', err);
      });

    return unsubscribe;
  }, []);

  // Find matching track or release based on articleSlug
  let matchedTrack: Track | null = null;
  let matchedRelease: Release | null = null;

  for (const rel of releases) {
    // 1. Check if individual track in this release points to this originSlug
    const foundTrack = rel.tracks.find((t) => t.originSlug === articleSlug);
    if (foundTrack) {
      matchedTrack = foundTrack;
      matchedRelease = rel;
      break;
    }
  }

  // 2. If no track matched, check if the release itself points to this originSlug (e.g. Single or Album Origin)
  if (!matchedRelease || !matchedTrack) {
    const foundRel = releases.find((r) => r.originSlug === articleSlug || r.slug === articleSlug);
    if (foundRel && foundRel.tracks.length > 0) {
      matchedRelease = foundRel;
      matchedTrack = foundRel.tracks[0];
    }
  }

  // If no match found at all, do not render banner
  if (!matchedRelease || !matchedTrack) {
    return null;
  }

  const isTrackPlaying =
    Boolean(currentTrack?.track.id === matchedTrack.id) &&
    isCurrentTrackPlaying(matchedTrack.id);

  const handlePlayClick = () => {
    if (!matchedTrack || !matchedRelease) return;

    if (isTrackPlaying) {
      togglePlayPause();
    } else {
      if (currentTrack?.track.id === matchedTrack.id) {
        togglePlayPause();
      } else {
        playTrack(matchedTrack, {
          title: matchedRelease.title,
          coverUrl: matchedRelease.coverUrl,
          tracks: matchedRelease.tracks
        });
      }
    }
  };

  const isSingle = matchedRelease.type === 'Single' || matchedRelease.tracks.length <= 1;
  const releaseTypeLabel = isSingle
    ? 'SINGLE'
    : `${matchedRelease.type.toUpperCase()}: ${matchedRelease.title}`;

  return (
    <div className="mb-10 p-3.5 sm:p-4 border border-border bg-surface relative overflow-hidden transition-all shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        {/* Track & Cover info */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 sm:w-12 sm:h-12 shrink-0 bg-background border border-border overflow-hidden relative">
            <ImageWithFallback
              src={matchedRelease.coverUrl}
              alt={matchedRelease.title}
              className="w-full h-full object-cover grayscale contrast-125"
            />
          </div>

          <div className="min-w-0 space-y-0.5">
            <h4 className="font-sans text-sm sm:text-base font-medium text-text-primary uppercase tracking-wide truncate">
              {matchedTrack.title}
            </h4>
            <p className="font-mono text-[11px] text-text-secondary uppercase tracking-widest truncate">
              {releaseTypeLabel}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handlePlayClick}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 sm:px-4 py-1.5 border font-mono text-[11px] uppercase tracking-widest transition-all cursor-pointer ${
              isTrackPlaying
                ? 'bg-text-primary text-background border-transparent font-semibold'
                : 'border-border text-text-primary hover:bg-text-primary hover:text-background hover:border-transparent'
            }`}
          >
            {isTrackPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>PAUSE</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                <span>PLAY</span>
              </>
            )}
          </button>

          <Link
            to={`/discography/${matchedRelease.slug}`}
            className="group flex-1 sm:flex-initial flex items-center justify-center gap-1 px-3 sm:px-3.5 py-1.5 border border-border text-text-secondary hover:text-text-primary hover:border-text-primary font-mono text-[11px] uppercase tracking-widest transition-all"
            title={`View ${matchedRelease.title} in Discography`}
          >
            <span>OPEN</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
