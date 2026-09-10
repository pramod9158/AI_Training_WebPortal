'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Play, 
  Pause, 
  CheckCircle2, 
  RotateCcw, 
  FastForward, 
  ListVideo, 
  X, 
  Download, 
  Sparkles, 
  Clock, 
  ChevronRight, 
  ExternalLink,
  Sliders,
  Volume2
} from 'lucide-react';
import { VideoChapter } from '@/data/seedModules';
import { generateAndDownloadTopicPdf } from '@/lib/pdfNotesGenerator';

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
  const [showJumpMenu, setShowJumpMenu] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [resumedFrom, setResumedFrom] = useState<number | null>(null);
  const [showResumeToast, setShowResumeToast] = useState(false);
  const [completionCelebration, setCompletionCelebration] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const storageKey = useMemo(() => `waynautic_video_pos_${topicId || encodeURIComponent(url)}`, [topicId, url]);

  // Load saved speed and saved playback position
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const savedSpeed = localStorage.getItem('waynautic_playback_speed');
      if (savedSpeed) {
        const parsed = parseFloat(savedSpeed);
        if (SPEED_OPTIONS.includes(parsed)) {
          setPlaybackSpeed(parsed);
        }
      }

      const savedPos = localStorage.getItem(storageKey);
      if (savedPos) {
        const parsedPos = parseFloat(savedPos);
        if (parsedPos > 5) {
          setResumedFrom(parsedPos);
          setCurrentTime(parsedPos);
        }
      }
    } catch (e) {
      console.warn('Could not read video storage data:', e);
    }
  }, [storageKey]);

  // Direct video format check
  const isDirectVideo = 
    url.toLowerCase().endsWith('.mp4') || 
    url.toLowerCase().endsWith('.webm') || 
    url.toLowerCase().endsWith('.ogg') || 
    url.startsWith('blob:') || 
    url.startsWith('data:video');

  // Convert watch URL to embed URL with enablejsapi=1 and start time
  const getEmbedUrl = (rawUrl: string, startTime = 0) => {
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
    if (startTime > 5) {
      params.set('start', Math.floor(startTime).toString());
    }

    return `${baseEmbed}?${params.toString()}`;
  };

  const embedUrl = useMemo(() => {
    return getEmbedUrl(url, resumedFrom || 0);
  }, [url, resumedFrom]);

  // YouTube postMessage control
  const sendYouTubeCommand = (func: string, args: any[] = []) => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func, args }),
        '*'
      );
    }
  };

  // Check 90% threshold
  const checkCompletion = (curr: number, dur: number) => {
    if (dur > 0 && curr / dur >= 0.9 && !hasWatched90) {
      setHasWatched90(true);
      setCompletionCelebration(true);
      if (onProgress90) {
        onProgress90();
      }
      setTimeout(() => setCompletionCelebration(false), 8000);
    }
  };

  // Seek handler (works for both HTML5 and YouTube)
  const handleSeekTo = (seconds: number) => {
    setCurrentTime(seconds);
    if (isDirectVideo && videoRef.current) {
      videoRef.current.currentTime = seconds;
      videoRef.current.play().catch(() => {});
    } else {
      sendYouTubeCommand('seekTo', [seconds, true]);
      sendYouTubeCommand('playVideo');
    }
    setShowJumpMenu(false);
  };

  // Change playback speed
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
    handleSeekTo(0);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(storageKey);
    }
  };

  // Launch playback
  const handleLaunchPlayer = () => {
    setIsPlaying(true);
    if (resumedFrom && resumedFrom > 5) {
      setShowResumeToast(true);
    }
  };

  // Periodic position saver and YouTube postMessage listener
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

        if (data.event === 'infoDelivery' && data.info) {
          if (typeof data.info.currentTime === 'number') {
            const time = data.info.currentTime;
            setCurrentTime(time);
            if (time > 3 && typeof window !== 'undefined') {
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

    // Ping YouTube for updates
    const pollInterval = setInterval(() => {
      if (!isDirectVideo && iframeRef.current?.contentWindow) {
        sendYouTubeCommand('listening');
      }
    }, 1500);

    return () => {
      window.removeEventListener('message', handleMessage);
      clearInterval(pollInterval);
    };
  }, [isPlaying, isDirectVideo, playbackSpeed, storageKey, hasWatched90]);

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
        
        {isPlaying ? (
          isDirectVideo ? (
            <video
              ref={videoRef}
              src={url}
              controls
              autoPlay
              className="w-full h-full object-contain bg-black"
              onLoadedMetadata={(e) => {
                const dur = e.currentTarget.duration;
                setDuration(dur);
                if (resumedFrom && resumedFrom > 5) {
                  e.currentTarget.currentTime = resumedFrom;
                  setShowResumeToast(true);
                }
                e.currentTarget.playbackRate = playbackSpeed;
              }}
              onTimeUpdate={(e) => {
                const v = e.currentTarget;
                const time = v.currentTime;
                setCurrentTime(time);
                if (time > 3 && typeof window !== 'undefined') {
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

            {/* Play Button Trigger with Duolingo Style 3D Press */}
            <button
              aria-label="Play Lesson Video"
              className="relative z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#58CC02] hover:bg-[#61E002] border-4 border-[#58A700] shadow-[0_6px_0_0_#58A700] active:translate-y-1.5 active:shadow-none transition-all duration-150 flex items-center justify-center group-hover:scale-105"
            >
              <Play className="w-9 h-9 sm:w-11 sm:h-11 text-white fill-white ml-1.5" />
            </button>

            <h3 className="relative z-10 mt-5 text-base sm:text-xl font-extrabold text-white max-w-xl px-4 drop-shadow-md">
              {title}
            </h3>

            {/* Resume or Chapter info */}
            {resumedFrom && resumedFrom > 5 ? (
              <div className="relative z-10 mt-3 inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-sky-500/20 border border-sky-400/40 text-sky-300 text-xs font-bold backdrop-blur-md">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                <span>Resume from {formatTime(resumedFrom)}</span>
              </div>
            ) : (
              <p className="relative z-10 text-xs text-slate-300 mt-2 font-medium">
                Click to launch interactive 16:9 adaptive video player
              </p>
            )}

            {chapters.length > 1 && (
              <div className="relative z-10 mt-2.5 inline-flex items-center space-x-1 text-[11px] text-cyan-300/80 font-mono">
                <ListVideo className="w-3 h-3 text-cyan-400" />
                <span>{chapters.length} chapters & topics available in Jump Menu</span>
              </div>
            )}
          </div>
        )}

        {/* Resumed From Toast Overlay */}
        {showResumeToast && resumedFrom && (
          <div className="absolute top-4 left-4 z-30 flex items-center space-x-3 px-3.5 py-2 rounded-2xl bg-slate-900/95 border border-sky-500/40 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-3">
            <Clock className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="text-xs text-slate-200 font-medium">
              Resumed from <strong className="text-sky-400 font-mono">{formatTime(resumedFrom)}</strong>
            </span>
            <button
              onClick={handleStartOver}
              className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-sky-300 transition-colors flex items-center space-x-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Start Over</span>
            </button>
            <button 
              onClick={() => setShowResumeToast(false)}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 90% Watched Celebration Banner */}
        {completionCelebration && (
          <div className="absolute top-4 right-4 z-30 flex items-center space-x-2.5 px-4 py-2.5 rounded-2xl bg-emerald-950/95 border-2 border-emerald-500/70 shadow-2xl backdrop-blur-md text-emerald-300 animate-in zoom-in-95 duration-300">
            <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 animate-bounce" />
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-emerald-300">Topic Completed! 🎉</div>
              <div className="text-[11px] text-emerald-200/80 font-medium">Over 90% watched. Progress automatically saved.</div>
            </div>
          </div>
        )}

        {/* Jump Menu Drawer Overlay */}
        {showJumpMenu && (
          <div className="absolute inset-0 z-40 bg-slate-950/95 backdrop-blur-md p-4 sm:p-6 flex flex-col justify-between animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <ListVideo className="w-5 h-5 text-cyan-400" />
                <h4 className="text-sm font-extrabold text-white">Video Jump Menu ({chapters.length} points)</h4>
              </div>
              <button
                onClick={() => setShowJumpMenu(false)}
                className="p-1 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                title="Close jump menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chapters & Topics List */}
            <div className="overflow-y-auto space-y-2 my-3 pr-1 max-h-[70%] scrollbar-thin">
              {chapters.map((chapter, idx) => {
                const isActive = activeChapterIndex === idx;
                return (
                  <div
                    key={chapter.id || idx}
                    onClick={() => handleSeekTo(chapter.timestamp)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group/item ${
                      isActive
                        ? 'bg-cyan-950/70 border-cyan-500/60 text-white shadow-md'
                        : 'bg-slate-900/70 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3 truncate mr-2">
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold shrink-0 ${
                        isActive ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-cyan-400'
                      }`}>
                        {formatTime(chapter.timestamp)}
                      </span>
                      <div className="truncate text-left">
                        <div className="text-xs font-bold truncate group-hover/item:text-cyan-300">
                          {chapter.title}
                        </div>
                        {chapter.description && (
                          <div className="text-[11px] text-slate-400 truncate max-w-md">
                            {chapter.description}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      {chapter.topicSlug && onNavigateTopic && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigateTopic(chapter.topicSlug!);
                          }}
                          className="px-2 py-1 rounded-lg bg-sky-900/60 hover:bg-sky-800 border border-sky-600/40 text-[10px] text-sky-200 font-bold flex items-center space-x-1"
                          title="Open dedicated topic workspace"
                        >
                          <span>Open Topic</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      )}
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover/item:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>Click any chapter to jump the video directly to that section</span>
              <button
                onClick={() => setShowJumpMenu(false)}
                className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold"
              >
                Back to Video
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modern High-Performance Controls & Jump Bar */}
      <div className="px-4 py-3 bg-slate-50 dark:bg-[#0B101E] border-t-2 border-slate-200 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5 text-xs text-slate-600 dark:text-slate-300">
        
        {/* Left Side: Jump Menu & Status */}
        <div className="flex items-center flex-wrap gap-2">
          
          {/* Jump Menu Trigger */}
          {chapters.length > 0 && (
            <button
              onClick={() => setShowJumpMenu(!showJumpMenu)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-cyan-100 hover:bg-cyan-200 dark:bg-cyan-950/70 dark:hover:bg-cyan-900 border border-cyan-300 dark:border-cyan-500/40 text-cyan-800 dark:text-cyan-300 font-bold transition-all shadow-sm active:scale-95"
              title="Open Jump Menu to jump between topics and chapters"
            >
              <ListVideo className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>Jump Menu</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-bold">
                {chapters.length}
              </span>
            </button>
          )}

          {/* Restart Button */}
          {currentTime > 5 && (
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
