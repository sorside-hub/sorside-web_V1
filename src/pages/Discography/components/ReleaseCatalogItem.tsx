import React from 'react';
import { Link } from 'react-router-dom';
import { Play, Pause } from 'lucide-react';
import { Release } from '../../../types/discography';
import { useAudioPlayer } from '../../../context/AudioPlayerContext';
import { RevealImage } from '../../../components/common/RevealImage';

interface ReleaseCatalogItemProps {
  release: Release;
  index: number;
}

export const ReleaseCatalogItem: React.FC<ReleaseCatalogItemProps> = ({ release }) => {
  const { playTrack, togglePlayPause, isCurrentTrackPlaying, currentTrack } = useAudioPlayer();

  const isSingle = release.type === 'Single' || release.tracks.length <= 1;

  const firstTrack = release.tracks[0];
  const isThisReleasePlaying =
    Boolean(firstTrack && currentTrack?.track.id && release.tracks.some((t) => t.id === currentTrack.track.id)) &&
    isCurrentTrackPlaying(currentTrack!.track.id);

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!firstTrack) return;

    if (isThisReleasePlaying) {
      togglePlayPause();
    } else {
      // If current track is already in this release but paused, resume it
      if (currentTrack && release.tracks.some((t) => t.id === currentTrack.track.id)) {
        togglePlayPause();
      } else {
        // For Single: plays single track with YouTube URL from release
        // For EP/Album: plays starting from track #1 with full album queue
        playTrack(firstTrack, {
          title: release.title,
          coverUrl: release.coverUrl,
          tracks: release.tracks
        });
      }
    }
  };

  return (
    <Link
      to={`/discography/${release.slug}`}
      className="group block border-b border-border py-4 sm:py-5 px-3 -mx-3 hover:bg-surface-hover/40 transition-all"
    >
      <div className="flex items-center gap-4 sm:gap-6">
        {/* Cover Art Thumbnail (Left) - Square with Play Button Overlay */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 aspect-square bg-surface border border-border overflow-hidden relative">
          <RevealImage
            src={release.coverUrl}
            alt={release.title}
            loading="lazy"
          />
          {/* Play Button Overlay */}
          {firstTrack && (
            <div className="absolute inset-0 flex items-center justify-center p-2 pointer-events-auto">
              <button
                type="button"
                onClick={handlePlayClick}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border flex items-center justify-center shadow-xs transition-all duration-200 active:scale-95 cursor-pointer ${
                  isThisReleasePlaying
                    ? 'bg-text-primary text-background border-transparent'
                    : 'bg-background/80 backdrop-blur-sm border-border/80 text-text-primary hover:bg-text-primary hover:text-background hover:border-transparent group-hover:scale-105'
                }`}
                title={isThisReleasePlaying ? `Pause ${release.title}` : `Play ${release.title}`}
                aria-label={isThisReleasePlaying ? `Pause ${release.title}` : `Play ${release.title}`}
              >
                {isThisReleasePlaying ? (
                  <Pause className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
                ) : (
                  <Play className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current ml-0.5" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* Release Info (Right) */}
        <div className="flex-1 min-w-0 space-y-1 sm:space-y-1.5">
          <h3 className="text-xl sm:text-2xl font-display uppercase tracking-wide text-text-primary group-hover:text-accent transition-colors truncate">
            {release.title}
          </h3>

          {/* Metadata info line */}
          <div className="flex items-center gap-2 text-[11px] sm:text-xs font-mono text-text-secondary uppercase tracking-wider">
            <span>{release.type}</span>
            <span>•</span>
            <span>{release.year}</span>
            {!isSingle && (
              <>
                <span>•</span>
                <span>{release.tracks.length} {release.tracks.length > 1 ? 'TRACKS' : 'TRACK'}</span>
              </>
            )}
          </div>

          <p className="text-xs font-sans text-text-secondary line-clamp-1 hidden sm:block">
            {release.description}
          </p>
        </div>
      </div>
    </Link>
  );
};
