import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Pause, ExternalLink, Disc, Disc3, Mic2, Sparkles } from 'lucide-react';
import { getCachedReleases, subscribeToReleases, revalidateReleases } from '../../../lib/discographyStore';
import { resolveImageUrl } from '../../../lib/imageHelper';
import { useAudioPlayer } from '../../../context/AudioPlayerContext';
import { RevealImage } from '../../../components/common/RevealImage';

export const LoneTransmissionCard: React.FC = () => {
  const [releases, setReleases] = useState(getCachedReleases());
  
  useEffect(() => {
    revalidateReleases().then(setReleases);
    const unsubscribe = subscribeToReleases(setReleases);
    return () => unsubscribe();
  }, []);

  const latestRelease = releases.length > 0 ? releases[0] : null;

  const { currentTrack, isPlaying, playTrack, togglePlayPause } = useAudioPlayer();

  // Extract release details or fallback
  const title = latestRelease?.title || 'First Transmission';
  const catalogNumber = latestRelease?.catalogNumber || 'SS-001';
  const releaseType = latestRelease?.type || 'Single';
  const coverUrl = resolveImageUrl(latestRelease?.coverUrl);
  const releaseSlug = latestRelease?.slug || 'first-transmission';

  // Check if there is an audio track to play
  const firstTrack = latestRelease?.tracks && latestRelease.tracks.length > 0 ? latestRelease.tracks[0] : null;
  const isThisPlaying = Boolean(
    firstTrack && currentTrack?.track.id === firstTrack.id && isPlaying
  );

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!firstTrack) return;
    if (currentTrack?.track.id === firstTrack.id) {
      togglePlayPause();
    } else {
      playTrack(firstTrack, {
        title,
        coverUrl,
        tracks: latestRelease?.tracks,
      });
    }
  };

  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-accent inline-block" />
          <h2 className="font-mono text-xs uppercase tracking-widest text-text-primary font-semibold">
            01 // Release Update
          </h2>
        </div>
        <span className="font-mono text-[10px] text-text-secondary uppercase border border-border px-2 py-0.5">
          {catalogNumber}
        </span>
      </div>

      {/* Cassette / Vinyl Style Capsule */}
      <div className="border border-border bg-surface hover:border-text-secondary transition-colors p-4 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 items-start">
          {/* Cover Art with subtle vinyl ring effect */}
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 shrink-0 bg-background border border-border overflow-hidden group">
            <RevealImage
              src={coverUrl}
              alt={title}
            />
            {/* Corner Badge */}
            <div className="absolute top-1.5 left-1.5 bg-black/80 px-1.5 py-0.5 text-[9px] font-mono tracking-widest text-white border border-white/20 uppercase">
              {releaseType}
            </div>

            {/* Play Button Overlay (if track has audio) */}
            {firstTrack && (
              <button
                type="button"
                onClick={handlePlayClick}
                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                title={isThisPlaying ? 'Jeda Lagu' : 'Putar Lagu'}
              >
                <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform">
                  {isThisPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                </div>
              </button>
            )}
          </div>

          {/* Release Metadata & Story */}
          <div className="flex-1 space-y-3 min-w-0">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[10px] font-mono tracking-wider text-accent uppercase">
                <span>[ RAW BEDROOM AUDIO ]</span>
                <span className="text-text-secondary">•</span>
                <span className="text-text-secondary">ONE-TAKE RECORDING</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-display uppercase tracking-wide text-text-primary">
                {title}
              </h3>
            </div>

            {/* Technical Specs Tags */}
            <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-text-secondary">
              <span className="bg-background border border-border px-2 py-0.5">
                RECORDED AT: KAMAR
              </span>
              <span className="bg-background border border-border px-2 py-0.5">
                LABEL: SORSIDE RECORDS
              </span>
            </div>

            {/* Liner Note Quote from Band */}
            <div className="border-l-2 border-accent/70 pl-3 py-1 bg-surface/50">
              <p className="text-xs sm:text-sm text-text-secondary italic font-mono leading-relaxed">
                {latestRelease?.tagline ? `"${latestRelease.tagline}"` : latestRelease?.description ? `"${latestRelease.description.substring(0, 100)}..."` : '"Lagu ini dibuat untuk menemani malam-malam panjang kalian."'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-4 border-t border-border/50 flex flex-wrap items-center justify-between gap-3">
          <div className="text-[11px] font-mono text-text-secondary">
            CATALOG // {catalogNumber}
          </div>

          <div className="flex items-center gap-3">
            {firstTrack && (
              <button
                type="button"
                onClick={handlePlayClick}
                className="inline-flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-text-primary hover:text-accent transition-colors"
              >
                {isThisPlaying ? <Pause className="w-3.5 h-3.5 text-accent" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isThisPlaying ? 'PAUSE' : 'QUICK LISTEN'}</span>
              </button>
            )}

            <Link
              to={`/discography/${releaseSlug}`}
              className="inline-flex items-center gap-1.5 bg-background border border-border px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-text-primary hover:border-accent hover:text-accent transition-colors"
            >
              <span>BUKA DETAIL & LIRIK</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
