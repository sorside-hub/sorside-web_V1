import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Pause, ExternalLink, Disc3, Volume2, Radio } from 'lucide-react';
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
    <div className="space-y-3">
      {/* Sub Header / Metadata Bar */}
      <div className="flex items-center justify-between font-mono text-[10px] text-text-secondary uppercase">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-accent inline-block rounded-full" />
          <span className="text-text-primary font-bold tracking-widest">RILISAN TERBARU</span>
        </div>
        {latestRelease && (
          <div className="flex items-center gap-2">
            <span className="border border-border bg-surface px-2 py-0.5 tracking-widest font-bold text-text-primary">
              {catalogNumber}
            </span>
            <span className="border border-border bg-surface px-2 py-0.5 tracking-widest">
              {releaseType}
            </span>
          </div>
        )}
      </div>

      {/* Cassette / Vinyl Style Capsule */}
      {!latestRelease ? (
        <div className="border border-border bg-surface p-12 flex flex-col items-center justify-center space-y-2">
          <Disc3 className="w-8 h-8 text-text-secondary/40 animate-spin" />
          <p className="font-mono text-xs tracking-widest text-text-secondary uppercase text-center">
            // BELUM ADA RILISAN TERSEDIA
          </p>
        </div>
      ) : (
        <div className="border border-border bg-surface hover:border-text-secondary transition-all p-5 sm:p-6 space-y-5 relative overflow-hidden group">
          {/* Subtle Background Vinyl Indicator */}
          <div className="absolute -right-8 -bottom-10 opacity-5 pointer-events-none select-none">
            <Disc3 className={`w-48 h-48 text-text-primary ${isThisPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '8s' }} />
          </div>

          <div className="flex flex-col sm:flex-row gap-5 items-start relative z-10">
            {/* Cover Art Box with Play Trigger */}
            <div className="relative w-32 h-32 sm:w-36 sm:h-36 shrink-0 bg-background border border-border overflow-hidden group/cover">
              <RevealImage
                src={coverUrl}
                alt={title}
              />

              {/* Status Badge */}
              <div className="absolute top-1.5 left-1.5 bg-black/85 px-1.5 py-0.5 text-[8px] font-mono tracking-widest text-white border border-white/20 uppercase">
                {releaseType}
              </div>

              {/* Play / Pause Overlay Button */}
              {firstTrack && (
                <button
                  type="button"
                  onClick={handlePlayClick}
                  className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover/cover:opacity-100 transition-opacity"
                  title={isThisPlaying ? 'Jeda Audio' : 'Putar Audio'}
                >
                  <div className="w-11 h-11 rounded-full bg-accent text-white flex items-center justify-center shadow-xl transform group-hover/cover:scale-110 transition-transform">
                    {isThisPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                  </div>
                </button>
              )}
            </div>

            {/* Release Info & Liner Note */}
            <div className="flex-1 space-y-3 min-w-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-[10px] font-mono tracking-wider text-accent uppercase">
                  <span>RAW BEDROOM AUDIO</span>
                  <span className="text-text-secondary">•</span>
                  <span>{latestRelease.releaseDate || '2024'}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-display uppercase tracking-wide text-text-primary leading-tight">
                  {title}
                </h3>
              </div>

              {/* Liner Note Quote */}
              <div className="border-l-2 border-accent pl-3 py-1 bg-background/50">
                <p className="text-xs text-text-secondary italic font-mono leading-relaxed line-clamp-2">
                  {latestRelease?.tagline 
                    ? `"${latestRelease.tagline}"` 
                    : latestRelease?.description 
                      ? `"${latestRelease.description.substring(0, 110)}..."` 
                      : '"Arsip rekaman mentah yang diracik di kamar tidur."'}
                </p>
              </div>

              {/* Track status if playing */}
              {firstTrack && isThisPlaying && (
                <div className="flex items-center gap-2 font-mono text-[10px] text-accent">
                  <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                  <span>SEDANG MEMUTAR: {firstTrack.title}</span>
                </div>
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-3 border-t border-border/60 flex flex-wrap items-center justify-between gap-3 relative z-10">
            <div className="text-[10px] font-mono text-text-secondary uppercase tracking-wider">
              FORMAT: <span className="text-text-primary font-semibold">DIGITAL / STREAMING</span>
            </div>

            <div className="flex items-center gap-2.5">
              {firstTrack && (
                <button
                  type="button"
                  onClick={handlePlayClick}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono tracking-wider uppercase border transition-all ${
                    isThisPlaying
                      ? 'bg-accent text-white border-accent font-bold'
                      : 'bg-background hover:bg-surface-hover text-text-primary border-border hover:border-text-primary'
                  }`}
                >
                  {isThisPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  <span>{isThisPlaying ? 'JEDA' : 'PUTAR CEPAT'}</span>
                </button>
              )}
              
              <Link
                to={`/discography/${releaseSlug}`}
                className="inline-flex items-center gap-1.5 bg-background hover:bg-surface-hover border border-border hover:border-text-primary px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-text-primary transition-colors"
              >
                <span>LIHAT LIRIK & DETAIL</span>
                <ExternalLink className="w-3 h-3 opacity-70" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

