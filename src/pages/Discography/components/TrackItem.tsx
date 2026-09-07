import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Pause, ArrowUpRight, FileText } from 'lucide-react';
import { Track } from '../../../types/discography';
import { useAudioPlayer } from '../../../context/AudioPlayerContext';
import { LyricsModal } from './LyricsModal';

interface TrackItemProps {
  track: Track;
  index: number;
  releaseTitle: string;
  coverUrl: string;
  tracks?: Track[];
}

export const TrackItem: React.FC<TrackItemProps> = ({
  track,
  releaseTitle,
  coverUrl,
  tracks
}) => {
  const [isLyricsOpen, setIsLyricsOpen] = useState(false);
  const { playTrack, togglePlayPause, isCurrentTrackPlaying, isCurrentTrackSelected } =
    useAudioPlayer();

  const formattedNumber = String(track.trackNumber).padStart(2, '0');
  const isPlayingThis = isCurrentTrackPlaying(track.id);
  const isSelectedThis = isCurrentTrackSelected(track.id);
  const hasPlayableUrl = Boolean(track.youtubeUrl || track.streamingUrl);

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!hasPlayableUrl) return;

    if (isSelectedThis) {
      togglePlayPause();
    } else {
      playTrack(track, {
        title: releaseTitle,
        coverUrl,
        tracks
      });
    }
  };

  return (
    <>
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Independent Track Number OUTSIDE the card list on the left */}
        <div className="w-6 sm:w-7 shrink-0 text-right font-mono text-xs sm:text-sm tracking-wider">
          <span
            className={`transition-colors ${
              isPlayingThis
                ? 'text-accent font-bold'
                : isSelectedThis
                ? 'text-text-primary font-semibold'
                : 'text-text-secondary/80'
            }`}
          >
            {formattedNumber}.
          </span>
        </div>

        {/* Card Item Container */}
        <div
          onClick={hasPlayableUrl ? handlePlayClick : undefined}
          className={`group relative overflow-hidden flex-1 flex items-center justify-between p-3.5 sm:p-4 border transition-all duration-300 select-none rounded-xs shadow-2xs ${
            hasPlayableUrl ? 'cursor-pointer' : 'cursor-default'
          } ${
            isPlayingThis
              ? 'border-accent shadow-md ring-1 ring-accent/30'
              : isSelectedThis
              ? 'border-text-primary/70'
              : 'border-border/70 hover:border-text-primary/50'
          }`}
        >
          {/* Cover Art Image Background: Crisp Grayscale when off, Full Color when playing or on hover */}
          {coverUrl && (
            <div
              className={`absolute inset-0 bg-cover bg-right contrast-125 transition-all duration-500 pointer-events-none ${
                isPlayingThis
                  ? 'grayscale-0 opacity-80 sm:opacity-85'
                  : 'grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-75'
              }`}
              style={{ backgroundImage: `url(${coverUrl})` }}
            />
          )}

          {/* Horizontal Gradient Overlay: Dark on left (for text readability), Clearer on right */}
          <div
            className={`absolute inset-0 bg-gradient-to-r transition-colors duration-300 pointer-events-none ${
              isPlayingThis
                ? 'from-background/90 via-background/60 to-transparent'
                : 'from-background/92 via-background/65 to-transparent group-hover:from-background/85 group-hover:via-background/45 group-hover:to-transparent'
            }`}
          />

          {/* Content Layer */}
          <div className="relative z-10 flex items-center justify-between w-full">
            {/* Left Side: Song Title & Lyrics/Origin Links */}
            <div className="min-w-0 flex-1 pr-3">
              {/* Song Title */}
              <div className="flex items-baseline">
                <span
                  className={`font-sans text-sm sm:text-base font-semibold truncate transition-colors ${
                    isPlayingThis
                      ? 'text-accent font-bold'
                      : isSelectedThis
                      ? 'text-text-primary font-semibold'
                      : 'text-text-primary group-hover:text-accent'
                  }`}
                >
                  {track.title}
                </span>
              </div>

              {/* Sub-row: Lyrics & Origin Story links */}
              {(track.lyrics || track.originSlug) && (
                <div className="mt-1.5 flex flex-wrap items-center gap-2 sm:gap-3">
                  {track.lyrics && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsLyricsOpen(true);
                      }}
                      className="inline-flex items-center gap-1 px-2 py-0.5 bg-surface/90 hover:bg-surface border border-border/80 group-hover:border-text-primary hover:border-text-primary text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-text-secondary group-hover:text-text-primary hover:text-text-primary transition-all rounded-2xs cursor-pointer group/lyrics shadow-2xs"
                      title={`View Lyrics for ${track.title}`}
                    >
                      <FileText className="w-3 h-3 text-text-secondary group-hover/lyrics:text-accent transition-colors" />
                      <span>Lyrics</span>
                    </button>
                  )}

                  {track.originSlug && (
                    <Link
                      to={`/the-side/${track.originSlug}`}
                      onClick={(e) => e.stopPropagation()}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 border text-[10px] sm:text-[11px] font-mono uppercase tracking-wider transition-all rounded-2xs group/origin shadow-2xs ${
                        isPlayingThis
                          ? 'bg-accent border-accent text-white shadow-xs'
                          : 'bg-accent/20 group-hover:bg-accent hover:bg-accent border-accent/50 group-hover:border-accent hover:border-accent text-accent group-hover:text-white hover:text-white'
                      }`}
                      title={track.originTitle || 'Origin Story'}
                    >
                      <span>Origin Story</span>
                      <ArrowUpRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Right Side: Symmetrical Play/Pause Button */}
            <div className="flex items-center shrink-0">
              {hasPlayableUrl ? (
                <button
                  type="button"
                  onClick={handlePlayClick}
                  className={`w-9 h-9 sm:w-10 sm:h-10 shrink-0 flex items-center justify-center border transition-all cursor-pointer rounded-xs ${
                    isPlayingThis
                      ? 'bg-accent text-white border-accent shadow-sm'
                      : isSelectedThis
                      ? 'bg-text-primary text-background border-text-primary'
                      : 'bg-surface/90 border-border text-text-secondary group-hover:text-text-primary group-hover:border-text-primary group-hover:bg-surface'
                  }`}
                  title={isPlayingThis ? `Pause ${track.title}` : `Play ${track.title}`}
                  aria-label={isPlayingThis ? `Pause ${track.title}` : `Play ${track.title}`}
                >
                  {isPlayingThis ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  )}
                </button>
              ) : (
                <div
                  className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 flex items-center justify-center border border-border/40 bg-surface/40 text-text-secondary/40 font-mono text-xs rounded-xs"
                  title="Audio not available"
                >
                  --
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lyrics Modal */}
      {track.lyrics && (
        <LyricsModal
          isOpen={isLyricsOpen}
          onClose={() => setIsLyricsOpen(false)}
          title={track.title}
          releaseTitle={releaseTitle}
          trackNumber={track.trackNumber}
          lyrics={track.lyrics}
          originSlug={track.originSlug}
        />
      )}
    </>
  );
};
