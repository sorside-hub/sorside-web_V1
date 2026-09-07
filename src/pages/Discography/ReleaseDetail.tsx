import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Disc3, ArrowUpRight, Play, Pause, FileText } from 'lucide-react';
import { getCachedReleaseBySlug, subscribeToReleases, revalidateReleases } from '../../lib/discographyStore';
import { TrackItem } from './components/TrackItem';
import { ReleaseNavigation } from './components/ReleaseNavigation';
import { ReleaseCredits } from './components/ReleaseCredits';
import { LyricsModal } from './components/LyricsModal';
import { IconSpotify, IconAppleMusic, IconYoutube } from '../../components/icons/BrandIcons';
import { useAudioPlayer } from '../../context/AudioPlayerContext';
import { ImageWithFallback } from '../../components/common/ImageWithFallback';
import { RevealImage } from '../../components/common/RevealImage';

export const ReleaseDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [release, setRelease] = useState(() => (slug ? getCachedReleaseBySlug(slug) : undefined));
  const [isHeaderLyricsOpen, setIsHeaderLyricsOpen] = useState(false);

  const { currentTrack, isPlaying, playTrack, togglePlayPause } = useAudioPlayer();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    if (!slug) return;
    setRelease(getCachedReleaseBySlug(slug));

    const unsubscribe = subscribeToReleases(() => {
      setRelease(getCachedReleaseBySlug(slug));
    });

    revalidateReleases().catch((err) =>
      console.warn('Background revalidation error in ReleaseDetail:', err)
    );

    return unsubscribe;
  }, [slug]);

  if (!release) {
    return (
      <div className="flex flex-col items-center py-32 text-center space-y-6">
        <p className="font-mono text-xs uppercase tracking-widest text-text-secondary">
          Release record not found.
        </p>
        <Link
          to="/discography"
          className="text-xs font-mono uppercase tracking-widest border-b border-text-primary pb-1 hover:text-accent hover:border-accent transition-colors"
        >
          Return to Discography
        </Link>
      </div>
    );
  }

  const isSingle = release.type === 'Single' || release.tracks.length <= 1;

  // Origin Story for Header (Under tagline/description - strictly from releases table)
  const releaseOriginSlug = release.originSlug;

  // Audio Play State for Release
  const isReleasePlaying = Boolean(
    currentTrack &&
      isPlaying &&
      release.tracks.some((t) => t.id === currentTrack.track.id)
  );

  const isReleaseSelected = Boolean(
    currentTrack && release.tracks.some((t) => t.id === currentTrack.track.id)
  );

  const handleMainPlayClick = () => {
    if (isReleaseSelected) {
      togglePlayPause();
    } else if (release.tracks.length > 0) {
      playTrack(release.tracks[0], {
        title: release.title,
        coverUrl: release.coverUrl,
        tracks: release.tracks
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-12">
      {/* Back Button - Desktop only */}
      <Link
        to="/discography"
        className="group hidden md:inline-flex items-center gap-2 mb-8 md:mb-10 text-xs font-mono uppercase tracking-widest text-text-secondary hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
        <span>Back to Discography</span>
      </Link>

      {/* Main Release Header */}
      <header className="space-y-6 mb-10">
        {/* Big Cover Art */}
        <div className="w-full aspect-square bg-surface border border-border overflow-hidden relative group">
          <RevealImage
            src={release.coverUrl}
            alt={release.title}
            isHeroTop={true}
          />
        </div>

        {/* Title & Metadata */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs font-mono text-text-secondary uppercase tracking-wider">
            <span>{release.type}</span>
            <span>•</span>
            <span>{release.releaseDate || release.year}</span>
            {release.catalogNumber && (
              <>
                <span>•</span>
                <span>{release.catalogNumber}</span>
              </>
            )}
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display uppercase tracking-wide leading-tight text-text-primary">
            {release.title}
          </h1>

          {release.description && (
            <p className="text-sm font-sans text-text-secondary leading-relaxed pt-1">
              {release.description}
            </p>
          )}

          {/* Origins Story & Lyrics Under Tagline / Description */}
          {(releaseOriginSlug || release.lyrics) && (
            <div className="pt-2 flex flex-wrap items-center gap-2">
              {release.lyrics && (
                <button
                  type="button"
                  onClick={() => setIsHeaderLyricsOpen(true)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 border border-border hover:border-text-primary bg-surface hover:bg-surface-hover text-text-primary transition-all text-xs font-mono uppercase tracking-wider rounded-sm shadow-2xs cursor-pointer group/lyrics"
                  title="View Lyrics"
                >
                  <FileText className="w-3 h-3 text-text-secondary group-hover/lyrics:text-accent transition-colors" />
                  <span>Lyrics</span>
                </button>
              )}

              {releaseOriginSlug && (
                <Link
                  to={`/the-side/${releaseOriginSlug}`}
                  className="inline-flex items-center gap-1 px-2.5 py-1 border border-accent/40 bg-accent/5 hover:bg-accent text-accent hover:text-white transition-all text-xs font-mono uppercase tracking-wider rounded-sm shadow-2xs group/origin"
                  title="Origin Story"
                >
                  <span>Origin Story</span>
                  <ArrowUpRight className="w-3 h-3 transition-transform group-hover/origin:translate-x-0.5 group-hover/origin:-translate-y-0.5" />
                </Link>
              )}
            </div>
          )}

          {/* Play Button + Icon-Only Streaming Hub Row */}
          <div className="pt-3 flex items-center justify-between sm:justify-start gap-3">
            {/* Play/Pause Rectangular Button */}
            {release.tracks.length > 0 && (
              <button
                onClick={handleMainPlayClick}
                className={`px-4 py-2 sm:px-5 sm:py-2.5 border font-mono text-xs uppercase tracking-widest font-bold flex items-center gap-2 transition-all active:scale-95 shadow-xs cursor-pointer ${
                  isReleasePlaying
                    ? 'bg-accent border-accent text-white hover:bg-accent/90'
                    : 'bg-text-primary border-text-primary text-background hover:bg-text-primary/90'
                }`}
                title={isReleasePlaying ? 'Pause Release' : 'Play Release'}
                aria-label={isReleasePlaying ? 'Pause Release' : 'Play Release'}
              >
                {isReleasePlaying ? (
                  <>
                    <Pause size={14} className="fill-current" />
                    <span>PAUSE</span>
                  </>
                ) : (
                  <>
                    <Play size={14} className="fill-current ml-0.5" />
                    <span>PLAY</span>
                  </>
                )}
              </button>
            )}

            {/* Icon-Only Streaming Platform Links */}
            <div className="flex items-center gap-2">
              {release.streamingLinks.spotify && (
                <a
                  href={release.streamingLinks.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 sm:w-10 sm:h-10 border border-border hover:border-text-primary text-text-secondary hover:text-accent flex items-center justify-center transition-colors group"
                  title="Listen on Spotify"
                  aria-label="Listen on Spotify"
                >
                  <IconSpotify className="w-4 h-4 text-text-secondary group-hover:text-accent transition-colors" />
                </a>
              )}
              {release.streamingLinks.appleMusic && (
                <a
                  href={release.streamingLinks.appleMusic}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 sm:w-10 sm:h-10 border border-border hover:border-text-primary text-text-secondary hover:text-accent flex items-center justify-center transition-colors group"
                  title="Listen on Apple Music"
                  aria-label="Listen on Apple Music"
                >
                  <IconAppleMusic className="w-4 h-4 text-text-secondary group-hover:text-accent transition-colors" />
                </a>
              )}
              {release.streamingLinks.youtube && (
                <a
                  href={release.streamingLinks.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 sm:w-10 sm:h-10 border border-border hover:border-text-primary text-text-secondary hover:text-accent flex items-center justify-center transition-colors group"
                  title="Watch on YouTube"
                  aria-label="Watch on YouTube"
                >
                  <IconYoutube className="w-4 h-4 text-text-secondary group-hover:text-accent transition-colors" />
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Tracks Section: EP / Album Only (Singles go straight to Credits) */}
      {!isSingle && (
        <section className="mt-12 pt-8 border-t border-border">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <Disc3 size={16} className="text-accent" />
              <h2 className="font-mono text-xs uppercase tracking-widest text-text-primary font-semibold">
                Tracklist ({release.tracks.length})
              </h2>
            </div>
          </div>

          {/* List of Track Items */}
          <div className="space-y-3">
            {release.tracks.map((track, idx) => (
              <TrackItem
                key={track.id}
                track={track}
                index={idx}
                releaseTitle={release.title}
                coverUrl={release.coverUrl}
                tracks={release.tracks}
              />
            ))}
          </div>
        </section>
      )}

      {/* Production Credits & Liner Notes */}
      {release.credits && (
        <ReleaseCredits credits={release.credits} catalogNumber={release.catalogNumber} />
      )}

      {/* Sequential Release Navigation */}
      <ReleaseNavigation currentSlug={release.slug} />

      {/* Header / Single Lyrics Modal */}
      {release.lyrics && (
        <LyricsModal
          isOpen={isHeaderLyricsOpen}
          onClose={() => setIsHeaderLyricsOpen(false)}
          title={release.title}
          releaseTitle={release.type === 'Single' ? 'Single Release' : release.title}
          lyrics={release.lyrics}
          originSlug={release.originSlug}
        />
      )}
    </div>
  );
};
