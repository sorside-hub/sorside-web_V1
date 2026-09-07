import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Track } from '../types/discography';
import { extractYouTubeId, isDirectAudioUrl, loadYouTubeIframeAPI } from '../lib/youtubeHelper';

export interface CurrentPlayingTrack {
  track: Track;
  releaseTitle: string;
  coverUrl: string;
  videoId: string | null;
  directAudioUrl: string | null;
}

interface AudioPlayerContextType {
  currentTrack: CurrentPlayingTrack | null;
  playlist: Track[];
  isPlaying: boolean;
  isReady: boolean;
  currentTime: number;
  duration: number;
  errorMessage: string | null;
  isVideoDrawerOpen: boolean;
  setIsVideoDrawerOpen: React.Dispatch<React.SetStateAction<boolean>>;
  toggleVideoDrawer: () => void;
  playTrack: (
    track: Track,
    releaseInfo: { title: string; coverUrl: string; tracks?: Track[] }
  ) => void;
  togglePlayPause: () => void;
  pause: () => void;
  resume: () => void;
  playNext: () => void;
  playPrev: () => void;
  seek: (seconds: number) => void;
  closePlayer: () => void;
  isCurrentTrackPlaying: (trackId: string) => boolean;
  isCurrentTrackSelected: (trackId: string) => boolean;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export const AudioPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTrack, setCurrentTrack] = useState<CurrentPlayingTrack | null>(null);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isVideoDrawerOpen, setIsVideoDrawerOpen] = useState<boolean>(false);

  // References
  const ytPlayerRef = useRef<any>(null);
  const audioHtmlRef = useRef<HTMLAudioElement | null>(null);
  const isYtApiReadyRef = useRef<boolean>(false);
  const activeModeRef = useRef<'youtube' | 'html5' | null>(null);
  const timeUpdateIntervalRef = useRef<any>(null);

  // 1. Initialize HTML5 Audio Element
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';

    audio.onplay = () => setIsPlaying(true);
    audio.onpause = () => setIsPlaying(false);
    audio.onended = () => {
      setIsPlaying(false);
      handleNextAuto();
    };
    audio.ontimeupdate = () => {
      if (activeModeRef.current === 'html5') {
        setCurrentTime(audio.currentTime);
        if (audio.duration && !isNaN(audio.duration)) {
          setDuration(audio.duration);
        }
      }
    };
    audio.onerror = (e) => {
      console.warn('[AudioPlayer HTML5] error:', e);
      setErrorMessage('Failed to stream audio file.');
      setIsPlaying(false);
    };

    audioHtmlRef.current = audio;

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  // 2. Load YouTube API
  useEffect(() => {
    let isMounted = true;

    loadYouTubeIframeAPI()
      .then(() => {
        if (!isMounted) return;
        isYtApiReadyRef.current = true;
        setIsReady(true);
      })
      .catch((err) => {
        console.warn('[AudioPlayer] Could not load YouTube IFrame API:', err);
      });

    return () => {
      isMounted = false;
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
      if (ytPlayerRef.current && typeof ytPlayerRef.current.destroy === 'function') {
        try {
          ytPlayerRef.current.destroy();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  // 3. Polling for YouTube time updates
  useEffect(() => {
    if (isPlaying && activeModeRef.current === 'youtube') {
      timeUpdateIntervalRef.current = setInterval(() => {
        if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
          try {
            const cur = ytPlayerRef.current.getCurrentTime() || 0;
            const dur = ytPlayerRef.current.getDuration() || 0;
            setCurrentTime(cur);
            if (dur > 0) {
              setDuration(dur);
            }
          } catch (e) {
            // ignore
          }
        }
      }, 350);
    } else {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
    }

    return () => {
      if (timeUpdateIntervalRef.current) {
        clearInterval(timeUpdateIntervalRef.current);
      }
    };
  }, [isPlaying]);

  // YouTube Player Initiator
  const setupYouTubePlayer = (videoId: string) => {
    setErrorMessage(null);
    const YT = (window as any).YT;
    if (!YT || !YT.Player) {
      // Retry in 300ms if script is still downloading
      setTimeout(() => setupYouTubePlayer(videoId), 300);
      return;
    }

    const hostElem = document.getElementById('sorside-yt-iframe-slot');
    if (!hostElem) {
      setTimeout(() => setupYouTubePlayer(videoId), 200);
      return;
    }

    if (ytPlayerRef.current && typeof ytPlayerRef.current.loadVideoById === 'function') {
      try {
        ytPlayerRef.current.loadVideoById(videoId);
        ytPlayerRef.current.playVideo();
        setIsPlaying(true);
        return;
      } catch (e) {
        console.warn('[AudioPlayer] loadVideoById error, recreating player:', e);
      }
    }

    try {
      ytPlayerRef.current = new YT.Player('sorside-yt-iframe-slot', {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          enablejsapi: 1
        },
        events: {
          onReady: (event: any) => {
            try {
              event.target.playVideo();
              setIsPlaying(true);
            } catch (e) {
              // ignore
            }
          },
          onStateChange: (event: any) => {
            // 0: Ended, 1: Playing, 2: Paused, 3: Buffering
            if (event.data === 1) {
              setIsPlaying(true);
              setErrorMessage(null);
            } else if (event.data === 2) {
              setIsPlaying(false);
            } else if (event.data === 0) {
              setIsPlaying(false);
              handleNextAuto();
            }
          },
          onError: (event: any) => {
            console.warn('[AudioPlayer] YouTube Player onError code:', event.data);
            setIsPlaying(false);
            if (event.data === 150 || event.data === 101) {
              setErrorMessage(
                'Playback restricted by copyright owner on external websites (Error 150).'
              );
            } else if (event.data === 100) {
              setErrorMessage('YouTube video not found or has been removed (Error 100).');
            } else {
              setErrorMessage('Playback error on YouTube stream (Code ' + event.data + ').');
            }
          }
        }
      });
    } catch (err) {
      console.warn('[AudioPlayer] Error instantiating YT.Player:', err);
    }
  };

  // Play Track Handler
  const playTrack = (
    track: Track,
    releaseInfo: { title: string; coverUrl: string; tracks?: Track[] }
  ) => {
    setErrorMessage(null);
    setCurrentTime(0);
    setDuration(0);

    const rawUrl = track.youtubeUrl || track.streamingUrl || '';
    const videoId = extractYouTubeId(rawUrl);
    const isDirect = isDirectAudioUrl(rawUrl);

    setCurrentTrack({
      track,
      releaseTitle: releaseInfo.title,
      coverUrl: releaseInfo.coverUrl,
      videoId: videoId || null,
      directAudioUrl: isDirect ? rawUrl : null
    });

    if (releaseInfo.tracks && releaseInfo.tracks.length > 0) {
      setPlaylist(releaseInfo.tracks);
    }

    // Stop current HTML5 audio
    if (audioHtmlRef.current) {
      audioHtmlRef.current.pause();
    }

    if (isDirect) {
      activeModeRef.current = 'html5';
      if (audioHtmlRef.current) {
        audioHtmlRef.current.src = rawUrl;
        audioHtmlRef.current.play().catch((err) => {
          console.warn('[AudioPlayer] HTML5 autoplay blocked:', err);
        });
      }
    } else if (videoId) {
      activeModeRef.current = 'youtube';
      setupYouTubePlayer(videoId);
    } else {
      setErrorMessage('No valid YouTube URL or Audio link found for this track.');
    }
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      pause();
    } else {
      resume();
    }
  };

  const pause = () => {
    if (activeModeRef.current === 'html5' && audioHtmlRef.current) {
      audioHtmlRef.current.pause();
    } else if (activeModeRef.current === 'youtube' && ytPlayerRef.current) {
      try {
        ytPlayerRef.current.pauseVideo();
      } catch (e) {
        // ignore
      }
    }
    setIsPlaying(false);
  };

  const resume = () => {
    if (activeModeRef.current === 'html5' && audioHtmlRef.current) {
      audioHtmlRef.current.play().catch((e) => console.warn(e));
    } else if (activeModeRef.current === 'youtube' && ytPlayerRef.current) {
      try {
        ytPlayerRef.current.playVideo();
      } catch (e) {
        // ignore
      }
    }
    setIsPlaying(true);
  };

  const handleNextAuto = () => {
    if (!currentTrack || playlist.length === 0) return;
    const currentIndex = playlist.findIndex((t) => t.id === currentTrack.track.id);
    if (currentIndex !== -1 && currentIndex < playlist.length - 1) {
      const nextTrack = playlist[currentIndex + 1];
      playTrack(nextTrack, {
        title: currentTrack.releaseTitle,
        coverUrl: currentTrack.coverUrl,
        tracks: playlist
      });
    }
  };

  const playNext = () => {
    if (!currentTrack || playlist.length === 0) return;
    const currentIndex = playlist.findIndex((t) => t.id === currentTrack.track.id);
    if (currentIndex !== -1 && currentIndex < playlist.length - 1) {
      const nextTrack = playlist[currentIndex + 1];
      playTrack(nextTrack, {
        title: currentTrack.releaseTitle,
        coverUrl: currentTrack.coverUrl,
        tracks: playlist
      });
    }
  };

  const playPrev = () => {
    if (!currentTrack || playlist.length === 0) return;
    if (currentTime > 3) {
      seek(0);
      return;
    }
    const currentIndex = playlist.findIndex((t) => t.id === currentTrack.track.id);
    if (currentIndex > 0) {
      const prevTrack = playlist[currentIndex - 1];
      playTrack(prevTrack, {
        title: currentTrack.releaseTitle,
        coverUrl: currentTrack.coverUrl,
        tracks: playlist
      });
    } else {
      seek(0);
    }
  };

  const seek = (seconds: number) => {
    if (activeModeRef.current === 'html5' && audioHtmlRef.current) {
      audioHtmlRef.current.currentTime = seconds;
      setCurrentTime(seconds);
    } else if (activeModeRef.current === 'youtube' && ytPlayerRef.current) {
      try {
        ytPlayerRef.current.seekTo(seconds, true);
        setCurrentTime(seconds);
      } catch (e) {
        // ignore
      }
    }
  };

  const toggleVideoDrawer = () => {
    setIsVideoDrawerOpen((prev) => !prev);
  };

  const closePlayer = () => {
    pause();
    setCurrentTrack(null);
    setCurrentTime(0);
    setIsVideoDrawerOpen(false);
    setErrorMessage(null);
    if (audioHtmlRef.current) {
      audioHtmlRef.current.src = '';
    }
  };

  const isCurrentTrackPlaying = (trackId: string) => {
    return currentTrack?.track.id === trackId && isPlaying;
  };

  const isCurrentTrackSelected = (trackId: string) => {
    return currentTrack?.track.id === trackId;
  };

  return (
    <AudioPlayerContext.Provider
      value={{
        currentTrack,
        playlist,
        isPlaying,
        isReady,
        currentTime,
        duration,
        errorMessage,
        isVideoDrawerOpen,
        setIsVideoDrawerOpen,
        toggleVideoDrawer,
        playTrack,
        togglePlayPause,
        pause,
        resume,
        playNext,
        playPrev,
        seek,
        closePlayer,
        isCurrentTrackPlaying,
        isCurrentTrackSelected
      }}
    >
      {children}
    </AudioPlayerContext.Provider>
  );
};

export const useAudioPlayer = (): AudioPlayerContextType => {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error('useAudioPlayer must be used within an AudioPlayerProvider');
  }
  return context;
};
