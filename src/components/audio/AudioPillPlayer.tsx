import React, { useRef } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  X,
  Tv,
  ChevronDown,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import { useAudioPlayer } from '../../context/AudioPlayerContext';
import { formatSeconds } from '../../lib/youtubeHelper';
import { ImageWithFallback } from '../common/ImageWithFallback';

export const AudioPillPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    errorMessage,
    isVideoDrawerOpen,
    toggleVideoDrawer,
    setIsVideoDrawerOpen,
    togglePlayPause,
    playNext,
    playPrev,
    seek,
    closePlayer
  } = useAudioPlayer();

  const progressBarRef = useRef<HTMLDivElement>(null);

  const { track, coverUrl, videoId } = currentTrack || {
    track: null,
    coverUrl: '',
    videoId: null
  };

  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || duration <= 0) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickRatio = Math.max(0, Math.min(1, clickX / rect.width));
    seek(clickRatio * duration);
  };

  const youtubeWatchUrl = videoId
    ? `https://www.youtube.com/watch?v=${videoId}`
    : track?.youtubeUrl || track?.streamingUrl;

  return (
    <aside
      aria-label="Audio and Video Player"
      className={`fixed bottom-16 md:bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md select-none transition-all duration-300 ${
        currentTrack ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-12 pointer-events-none'
      }`}
    >
      {/* 1. Error Banner (e.g., Copyright Embed Restrictions) */}
      {errorMessage && currentTrack && (
        <div className="mb-2 p-2.5 rounded-xl bg-surface/95 backdrop-blur-md border border-accent/40 text-text-primary shadow-xl flex items-start gap-2.5 text-xs animate-in fade-in slide-in-from-bottom-2">
          <AlertCircle size={15} className="text-accent shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="font-sans text-[11px] text-text-secondary leading-tight mb-1">
              {errorMessage}
            </p>
            {youtubeWatchUrl && (
              <a
                href={youtubeWatchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-mono text-[10px] text-accent hover:underline uppercase tracking-wider"
              >
                <span>Buka & Putar di YouTube</span>
                <ExternalLink size={10} />
              </a>
            )}
          </div>
        </div>
      )}

      {/* 2. Video Drawer (Pop-up Laci Video di Atas Pill) */}
      <div
        className={`transition-all duration-300 ease-out origin-bottom overflow-hidden ${
          isVideoDrawerOpen && currentTrack
            ? 'max-h-[380px] opacity-100 scale-100 pointer-events-auto mb-2'
            : 'max-h-0 opacity-0 scale-95 pointer-events-none mb-0'
        }`}
      >
        <div className="bg-surface/95 backdrop-blur-md border border-border shadow-2xl rounded-2xl p-2.5 sm:p-3">
          {/* Drawer Top Bar */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/50 text-text-secondary">
            <div className="flex items-center gap-2 min-w-0">
              <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-accent font-bold px-1.5 py-0.5 border border-accent/30 bg-accent/10 rounded-sm">
                <Tv size={10} />
                Video Mode
              </span>
              <span className="font-sans text-xs font-medium text-text-primary truncate">
                {track?.title}
              </span>
            </div>

            <button
              onClick={() => setIsVideoDrawerOpen(false)}
              className="p-1 text-text-secondary hover:text-text-primary transition-colors active:scale-95"
              title="Close Video Drawer"
              aria-label="Close Video Drawer"
            >
              <ChevronDown size={16} />
            </button>
          </div>

          {/* 16:9 Screen Slot (Permanen di DOM agar YouTube API tidak putus) */}
          <div className="w-full aspect-video rounded-xl overflow-hidden bg-black border border-border/50 shadow-inner relative">
            <div id="sorside-yt-iframe-slot" className="w-full h-full" />
          </div>
        </div>
      </div>

      {/* 3. Main Audio Pill */}
      {currentTrack && track && (
        <div className="relative bg-surface/95 backdrop-blur-md border border-border text-text-primary shadow-2xl rounded-full overflow-hidden transition-all duration-300">
          <div className="flex items-center justify-between px-3.5 py-2 sm:py-2.5 gap-2.5 sm:gap-3">
            {/* Left: Thumbnail Cover */}
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden shrink-0 border border-border bg-background">
              <ImageWithFallback
                src={coverUrl}
                alt={track.title}
                className="w-full h-full object-cover grayscale contrast-125"
              />
            </div>

            {/* Middle: Title & Duration Rata Kiri */}
            <div className="flex-1 min-w-0 pr-1">
              <h4 className="font-sans text-xs sm:text-sm font-medium text-text-primary truncate">
                {track.title}
              </h4>
              <div className="font-mono text-[11px] text-text-secondary">
                {formatSeconds(currentTime)} / {duration > 0 ? formatSeconds(duration) : '--:--'}
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              {/* Prev */}
              <button
                onClick={playPrev}
                className="p-1 text-text-secondary hover:text-text-primary transition-colors active:scale-95"
                title="Previous Track"
                aria-label="Previous Track"
              >
                <SkipBack size={14} className="fill-current" />
              </button>

              {/* Play / Pause */}
              <button
                onClick={togglePlayPause}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-text-primary text-background flex items-center justify-center hover:opacity-90 active:scale-95 transition-all shadow-xs"
                title={isPlaying ? 'Pause' : 'Play'}
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause size={13} className="fill-current" />
                ) : (
                  <Play size={13} className="fill-current ml-0.5" />
                )}
              </button>

              {/* Next */}
              <button
                onClick={playNext}
                className="p-1 text-text-secondary hover:text-text-primary transition-colors active:scale-95"
                title="Next Track"
                aria-label="Next Track"
              >
                <SkipForward size={14} className="fill-current" />
              </button>

              {/* Video Drawer Toggle */}
              {videoId && (
                <button
                  onClick={toggleVideoDrawer}
                  className={`p-1.5 rounded-full transition-all active:scale-95 border ${
                    isVideoDrawerOpen
                      ? 'bg-accent/15 border-accent text-accent'
                      : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                  }`}
                  title={isVideoDrawerOpen ? 'Hide Video Drawer' : 'Show Video Drawer'}
                  aria-label={isVideoDrawerOpen ? 'Hide Video Drawer' : 'Show Video Drawer'}
                >
                  <Tv size={14} />
                </button>
              )}

              {/* Close Player */}
              <button
                onClick={closePlayer}
                className="p-1 text-text-secondary/70 hover:text-text-primary transition-colors active:scale-95"
                title="Close Player"
                aria-label="Close Player"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Interactive Scrubbing Progress Bar */}
          <div
            ref={progressBarRef}
            onClick={handleProgressBarClick}
            className="h-1 bg-border/40 w-full cursor-pointer relative overflow-hidden group/bar"
            title="Scrub Track"
          >
            <div
              className="h-full bg-accent transition-all duration-150"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}
    </aside>
  );
};
