'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  CheckCircle2, 
  RotateCcw, 
  FastForward, 
  X, 
  Download, 
  Sparkles, 
  Clock, 
  ChevronRight, 
  ExternalLink,
  Sliders,
  Volume2,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { VideoChapter } from '@/data/seedModules';
import { generateAndDownloadTopicPdf } from '@/lib/pdfNotesGenerator';
import { trackVideoStarted } from '@/lib/analytics';

interface VideoPlayerProps {
  url: string;
  title: string;
  topicId?: string;
  chapters?: VideoChapter[];
  onProgress90?: () => void;
  onNavigateTopic?: (topicSlug: string) => void;
  notesContent?: string;
  moduleTitle?: string;
}

const SPEED_OPTIONS = [0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0];

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const hrs = Math.floor(mins / 60);
  if (hrs > 0) {
    const remMins = mins % 60;
    return `${hrs}:${remMins < 10 ? '0' : ''}${remMins}:${secs < 10 ? '0' : ''}${secs}`;
  }
  return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  url,
  title,
  topicId,
  chapters = [],
  onProgress90,
  onNavigateTopic,
  notesContent,
  moduleTitle
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasWatched90, setHasWatched90] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [resumedFrom, setResumedFrom] = useState<number | null>(null);
  const [showResumeToast, setShowResumeToast] = useState(false);
  const [completionCelebration, setCompletionCelebration] = useState(false);
  const [hasVideoError, setHasVideoError] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const currentTimeRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(false);
  const hasSeekedResumeRef = useRef<boolean>(false);

  const storageKey = useMemo(
    () => `waynautic_video_pos_${topicId || encodeURIComponent(url)}`,
    [topicId, url]
  );

  // Keep refs in sync for reliable unmount/unload saving
  currentTimeRef.current = currentTime;
  isPlayingRef.current = isPlaying;

  // Load saved speed and saved playback position on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const savedSpeed = localStorage.getItem('waynautic_playback_speed');
      if (savedSpeed) {
        const parsed = parseFloat(savedSpeed);
        if (parsed > 0 && !isNaN(parsed)) {
          setPlaybackSpeed(parsed);
        }
      }

      const savedPos = localStorage.getItem(storageKey);
      if (savedPos) {
        const parsedPos = parseFloat(savedPos);
        if (parsedPos > 2) {
          setResumedFrom(parsedPos);
          setCurrentTime(parsedPos);
          currentTimeRef.current = parsedPos;
        }
      }
    } catch (e) {
      console.warn('Could not read video storage data:', e);
    }
  }, [storageKey]);

  // Persist position on window unload, tab hide, or unmount
  useEffect(() => {
    const saveCurrentPosition = () => {
      if (currentTimeRef.current > 2 && typeof window !== 'undefined') {
        try {
          localStorage.setItem(storageKey, currentTimeRef.current.toString());
        } catch {}
      }
    };

    window.addEventListener('beforeunload', saveCurrentPosition);
    window.addEventListener('pagehide', saveCurrentPosition);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        saveCurrentPosition();
      }
    });

    return () => {
      saveCurrentPosition();
      window.removeEventListener('beforeunload', saveCurrentPosition);
      window.removeEventListener('pagehide', saveCurrentPosition);
    };
  }, [storageKey]);

  // Direct video format check
  const isDirectVideo = 
    url.toLowerCase().endsWith('.mp4') || 
    url.toLowerCase().endsWith('.webm') || 
    url.toLowerCase().endsWith('.ogg') || 
    url.startsWith('blob:') || 
    url.startsWith('data:video');

  // Convert watch URL to embed URL with enablejsapi=1 and initial start time
  const getEmbedUrl = useCallback((rawUrl: string, startTime = 0) => {
    let baseEmbed = 'https://www.youtube.com/embed/zxQyTK8ckyY';
    if (!rawUrl) return `${baseEmbed}?enablejsapi=1&autoplay=1&rel=0`;

    if (rawUrl.includes('youtube.com/watch?v=')) {
      const videoId = rawUrl.split('v=')[1]?.split('&')[0];
      baseEmbed = `https://www.youtube.com/embed/${videoId}`;
    } else if (rawUrl.includes('youtu.be/')) {
      const videoId = rawUrl.split('youtu.be/')[1]?.split('?')[0];
      baseEmbed = `https://www.youtube.com/embed/${videoId}`;
    } else if (rawUrl.includes('youtube.com/embed/')) {
      baseEmbed = rawUrl.split('?')[0];
    } else {
      return rawUrl;
    }

    const params = new URLSearchParams();
    params.set('enablejsapi', '1');
    params.set('autoplay', '1');
    params.set('rel', '0');
    if (startTime > 2) {
      params.set('start', Math.floor(startTime).toString());
    }

    return `${baseEmbed}?${params.toString()}`;
  }, []);

  const embedUrl = useMemo(() => {
    return getEmbedUrl(url, resumedFrom || 0);
  }, [url, resumedFrom, getEmbedUrl]);

  // YouTube postMessage command dispatcher
  const sendYouTubeCommand = useCallback((func: string, args: any[] = []) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func, args }),
        '*'
      );
    }
  }, []);

  // Send YouTube API listener registration
  const pingYouTubeListening = useCallback(() => {
    if (iframeRef.current?.contentWindow) {
      // Standard YouTube IFrame listening registration
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'listening' }),
        '*'
      );
    }
  }, []);

  // Check 90% threshold
  const checkCompletion = useCallback((curr: number, dur: number) => {
    if (dur > 0 && curr / dur >= 0.9 && !hasWatched90) {
      setHasWatched90(true);
      setCompletionCelebration(true);
      if (onProgress90) {
        onProgress90();
      }
      setTimeout(() => setCompletionCelebration(false), 8000);
    }
  }, [hasWatched90, onProgress90]);

  // Seek handler (works for both HTML5 and YouTube)
  const handleSeekTo = (seconds: number) => {
    setCurrentTime(seconds);
    currentTimeRef.current = seconds;
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey, seconds.toString());
    }

    if (isDirectVideo && videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play().catch(() => {});
    } else {
      sendYouTubeCommand('seekTo', [seconds, true]);
      sendYouTubeCommand('playVideo');
    }
  };

  // Change playback speed from platform controls
  const handleSetSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    setShowSpeedMenu(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('waynautic_playback_speed', speed.toString());
    }

    if (isDirectVideo && videoRef.current) {
      videoRef.current.playbackRate = speed;
    } else {
      sendYouTubeCommand('setPlaybackRate', [speed]);
    }
  };

  // Start Over handler
  const handleStartOver = () => {
    setResumedFrom(null);
    setShowResumeToast(false);
    hasSeekedResumeRef.current = true;
    handleSeekTo(0);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(storageKey);
    }
  };

  // Launch playback
  const handleLaunchPlayer = () => {
    setIsPlaying(true);
    hasSeekedResumeRef.current = false;
    trackVideoStarted(topicId || title);

    if (resumedFrom && resumedFrom > 2) {
      setShowResumeToast(true);
    }
  };

  // YouTube postMessage event listener & speed synchronization
  useEffect(() => {
    if (!isPlaying) return;

    // Apply speed once playing
    if (isDirectVideo && videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    } else {
      sendYouTubeCommand('setPlaybackRate', [playbackSpeed]);
    }

    const handleMessage = (event: MessageEvent) => {
      try {
        if (!event.data) return;
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;

        // 1. Synchronize playback speed if changed from YouTube player's built-in gear settings
        let incomingSpeed: number | null = null;
        if (data.event === 'onPlaybackRateChange') {
          incomingSpeed = typeof data.info === 'number' ? data.info : Number(data.info);
        } else if (data.event === 'infoDelivery' && typeof data.info?.playbackRate === 'number') {
          incomingSpeed = data.info.playbackRate;
        }

        if (incomingSpeed && typeof incomingSpeed === 'number' && !isNaN(incomingSpeed) && incomingSpeed > 0) {
          setPlaybackSpeed((current) => {
            if (Math.abs(current - incomingSpeed!) > 0.05) {
              if (typeof window !== 'undefined') {
                localStorage.setItem('waynautic_playback_speed', incomingSpeed!.toString());
              }
              return incomingSpeed!;
            }
            return current;
          });
        }

        // 2. Handle YouTube onReady / onStateChange to guarantee resume from saved time
        if (
          (data.event === 'onReady' || data.event === 'initialDelivery' || (data.event === 'onStateChange' && data.info === 1)) &&
          !hasSeekedResumeRef.current &&
          resumedFrom &&
          resumedFrom > 2
        ) {
          sendYouTubeCommand('seekTo', [resumedFrom, true]);
          hasSeekedResumeRef.current = true;
          setShowResumeToast(true);
        }

        // 3. Track current playback time from YouTube infoDelivery
        if (data.event === 'infoDelivery' && data.info) {
          if (typeof data.info.currentTime === 'number') {
            const time = data.info.currentTime;
            setCurrentTime(time);
            currentTimeRef.current = time;
            if (time > 2 && typeof window !== 'undefined') {
              localStorage.setItem(storageKey, time.toString());
            }
          }
          if (typeof data.info.duration === 'number' && data.info.duration > 0) {
            setDuration(data.info.duration);
            if (typeof data.info.currentTime === 'number') {
              checkCompletion(data.info.currentTime, data.info.duration);
            }
          }
        }
      } catch (err) {
        // Ignore unparseable cross-window messages
      }
    };

    window.addEventListener('message', handleMessage);

    // Subscribe to YouTube events immediately and keep pinging periodically
    pingYouTubeListening();
    const pollInterval = setInterval(() => {
      if (!isDirectVideo) {
        pingYouTubeListening();
      }
    }, 1000);

    return () => {
      window.removeEventListener('message', handleMessage);
      clearInterval(pollInterval);
    };
  }, [
    isPlaying, 
    isDirectVideo, 
    playbackSpeed, 
    storageKey, 
    resumedFrom, 
    checkCompletion, 
    pingYouTubeListening, 
    sendYouTubeCommand
  ]);

  // Active chapter lookup based on current time
  const activeChapterIndex = useMemo(() => {
    if (!chapters || chapters.length === 0) return -1;
    for (let i = chapters.length - 1; i >= 0; i--) {
      if (currentTime >= chapters[i].timestamp) {
        return i;
      }
    }
    return 0;
  }, [chapters, currentTime]);

  return (
    <div className="w-full rounded-3xl overflow-hidden bg-white dark:bg-[#070B14] border-2 border-slate-200 dark:border-slate-800 shadow-2xl relative group">
      
      {/* 16:9 Adaptive Video Viewport */}
      <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
        
        {hasVideoError ? (
          /* Graceful Video Load Error Fallback UI */
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-950 border-2 border-rose-500/40 rounded-2xl space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-950/80 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-lg">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div className="space-y-1 max-w-md">
              <h4 className="text-base sm:text-lg font-extrabold text-white">Video Stream Unavailable</h4>
              <p className="text-xs sm:text-sm text-slate-300">
                The video stream could not be loaded due to a network connection issue or restricted video provider embedding.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
              <button
                onClick={() => {
                  setHasVideoError(false);
                  setIsPlaying(true);
                }}
                className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-extrabold text-xs transition-colors flex items-center space-x-1.5 min-h-[38px]"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Video</span>
              </button>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-xs transition-colors flex items-center space-x-1.5 min-h-[38px]"
              >
                <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                <span>Open Link Directly</span>
              </a>
              {notesContent && (
                <button
                  onClick={() => {
                    generateAndDownloadTopicPdf({
                      title,
                      slug: topicId || 'topic',
                      textContent: notesContent,
                      estimatedMinutes: 15,
                      moduleTitle: moduleTitle || 'Module'
                    });
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-xs transition-colors flex items-center space-x-1.5 min-h-[38px]"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Download Notes PDF</span>
                </button>
              )}
            </div>
          </div>
        ) : isPlaying ? (
          isDirectVideo ? (
            <video
              ref={videoRef}
              src={url}
              controls
              autoPlay
              className="w-full h-full object-contain bg-black"
              onError={() => setHasVideoError(true)}
              onLoadedMetadata={(e) => {
                const dur = e.currentTarget.duration;
                setDuration(dur);
                if (resumedFrom && resumedFrom > 2) {
                  e.currentTarget.currentTime = resumedFrom;
                  setShowResumeToast(true);
                }
                e.currentTarget.playbackRate = playbackSpeed;
              }}
              onTimeUpdate={(e) => {
                const v = e.currentTarget;
                const time = v.currentTime;
                setCurrentTime(time);
                currentTimeRef.current = time;
                if (time > 2 && typeof window !== 'undefined') {
                  localStorage.setItem(storageKey, time.toString());
                }
                checkCompletion(time, v.duration);
              }}
            />
          ) : (
            <iframe
              ref={iframeRef}
              src={embedUrl}
              title={title}
              loading="eager"
              onLoad={() => {
                pingYouTubeListening();
                if (resumedFrom && resumedFrom > 2) {
                  setTimeout(() => {
                    sendYouTubeCommand('seekTo', [resumedFrom, true]);
                  }, 500);
                }
              }}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          )
        ) : (
          /* Cover & Launch Screen */
          <div 
            className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-slate-900/90 via-[#0A0F1E] to-[#04060B] cursor-pointer" 
            onClick={handleLaunchPlayer}
          >
            {/* Ambient Animated Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/15 via-cyan-500/10 to-indigo-600/15 backdrop-blur-[2px] pointer-events-none" />

            {/* Play Button Trigger */}
            <button
              aria-label="Play Lesson Video"
              className="relative z-10 w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-white/95 hover:bg-white text-slate-900 shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center ring-4 ring-white/20"
            >
              <Play className="w-6 h-6 sm:w-8 sm:h-8 fill-slate-900 ml-0.5" />
            </button>

            <h3 className="relative z-10 mt-4 text-sm sm:text-xl font-extrabold text-white max-w-xl px-4 drop-shadow-md">
              {title}
            </h3>

            {/* Resume or Chapter info */}
            {resumedFrom && resumedFrom > 2 ? (
              <div className="relative z-10 mt-3 inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-sky-500/25 border-2 border-sky-400/50 text-sky-200 text-xs font-extrabold backdrop-blur-md shadow-lg animate-pulse">
                <Clock className="w-4 h-4 text-sky-300" />
                <span>Click to Resume from {formatTime(resumedFrom)}</span>
              </div>
            ) : (
              <p className="relative z-10 text-xs text-slate-300 mt-2 font-medium">
                Click to launch interactive 16:9 adaptive video player
              </p>
            )}
          </div>
        )}

        {/* Resumed From Toast Overlay */}
        {showResumeToast && resumedFrom && (
          <div className="absolute top-3 left-3 right-3 sm:right-auto sm:max-w-md z-30 flex items-center justify-between space-x-2 px-3 py-1.5 rounded-2xl bg-slate-900/95 border border-sky-500/40 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-3">
            <Clock className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="text-xs text-slate-200 font-medium">
              Resumed from <strong className="text-sky-400 font-mono">{formatTime(resumedFrom)}</strong>
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleStartOver();
              }}
              className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-sky-300 transition-colors flex items-center space-x-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Start Over</span>
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowResumeToast(false);
              }}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 90% Watched Celebration Banner */}
        {completionCelebration && (
          <div className="absolute top-3 left-3 right-3 sm:left-auto sm:right-4 sm:max-w-md z-30 flex items-center space-x-2.5 px-3.5 py-2 rounded-2xl bg-emerald-950/95 border-2 border-emerald-500/70 shadow-2xl backdrop-blur-md text-emerald-300 animate-in zoom-in-95 duration-300">
            <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 animate-bounce" />
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-emerald-300">Topic Completed! 🎉</div>
              <div className="text-[11px] text-emerald-200/80 font-medium">Over 90% watched. Progress automatically saved.</div>
            </div>
          </div>
        )}
      </div>

      {/* Modern High-Performance Controls Bar */}
      <div className="px-4 py-3 bg-slate-50 dark:bg-[#0B101E] border-t-2 border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5 text-xs text-slate-600 dark:text-slate-300">
        
        {/* Left Side: Restart & Status */}
        <div className="flex items-center flex-wrap gap-2">
          
          {/* Restart Button */}
          {currentTime > 2 && (
            <button
              onClick={handleStartOver}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold transition-all"
              title="Restart video from beginning"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Restart</span>
            </button>
          )}

          {/* Current Chapter Pill */}
          {chapters.length > 0 && activeChapterIndex >= 0 && (
            <div className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-400 truncate max-w-[200px]">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shrink-0" />
              <span className="truncate">{chapters[activeChapterIndex].title}</span>
            </div>
          )}

        </div>

        {/* Right Side: Speed Toggle, Notes PDF & Quality Badge */}
        <div className="flex items-center flex-wrap gap-2 relative">
          
          {/* Playback Speed Toggle Popover */}
          <div className="relative">
            <button
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 transition-all active:scale-95 shadow-sm"
              title="Select playback speed (0.5x - 2.0x)"
            >
              <Sliders className="w-3 h-3 text-sky-500 dark:text-cyan-400" />
              <span className="font-mono">{playbackSpeed}x</span>
            </button>

            {showSpeedMenu && (
              <div className="absolute bottom-full right-0 mb-2 z-50 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col space-y-1 min-w-[110px] animate-in fade-in zoom-in-95">
                <div className="px-2 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
                  Speed
                </div>
                {SPEED_OPTIONS.map((speed) => (
                  <button
                    key={speed}
                    onClick={() => handleSetSpeed(speed)}
                    className={`w-full text-left px-2.5 py-1 rounded-xl text-xs font-mono font-bold transition-colors flex items-center justify-between ${
                      playbackSpeed === speed
                        ? 'bg-sky-100 dark:bg-cyan-950 text-sky-700 dark:text-cyan-400'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{speed}x</span>
                    {playbackSpeed === speed && <span className="text-[10px] font-bold">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick PDF Notes Download */}
          {notesContent && (
            <button
              onClick={() => {
                generateAndDownloadTopicPdf({
                  title,
                  textContent: notesContent,
                  moduleTitle
                });
              }}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 transition-all shadow-sm"
              title="Download topic notes PDF"
            >
              <Download className="w-3 h-3 text-sky-500 dark:text-cyan-400" />
              <span>PDF Notes</span>
            </button>
          )}

          {/* Watched Status Badge */}
          {hasWatched90 ? (
            <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/90 border border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-400 text-[11px] font-bold">
              <CheckCircle2 className="w-3 h-3" />
              <span>90% Watched</span>
            </div>
          ) : (
            <div className="hidden lg:flex items-center space-x-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
              <span>16:9 Adaptive Stream</span>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
