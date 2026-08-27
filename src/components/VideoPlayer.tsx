'use client';

import React, { useState, useEffect } from 'react';
import { Play, CheckCircle2, Volume2, ShieldAlert } from 'lucide-react';

interface VideoPlayerProps {
  url: string;
  title: string;
  onProgress90?: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ url, title, onProgress90 }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasWatched, setHasWatched] = useState(false);

  // Helper to convert standard YouTube watch URL to embed URL if needed
  const getEmbedUrl = (rawUrl: string) => {
    if (!rawUrl) return 'https://www.youtube.com/embed/zxQyTK8ckyY';
    if (rawUrl.includes('youtube.com/watch?v=')) {
      const videoId = rawUrl.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    }
    if (rawUrl.includes('youtu.be/')) {
      const videoId = rawUrl.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
    }
    return rawUrl;
  };

  const embedUrl = getEmbedUrl(url);

  // Simulate progress watching callback when user clicks play
  const handlePlayClick = () => {
    setIsPlaying(true);
    // Mark progress 90% reached after a delay or user interaction
    const timer = setTimeout(() => {
      setHasWatched(true);
      if (onProgress90) onProgress90();
    }, 5000);
    return () => clearTimeout(timer);
  };

  return (
    <div className="w-full rounded-2xl overflow-hidden bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 shadow-xl relative group">
      
      {/* Aspect Ratio 16:9 Container */}
      <div className="relative w-full aspect-video bg-slate-100 dark:bg-[#05070D] flex items-center justify-center">
        
        {isPlaying ? (
          <iframe
            src={embedUrl}
            title={title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900/60 dark:to-[#070A12] cursor-pointer" onClick={handlePlayClick}>
            
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-blue-600/5 to-violet-600/10 backdrop-blur-sm pointer-events-none" />

            {/* Play Button Trigger */}
            <button
              aria-label="Play Lesson Video"
              className="relative z-10 w-20 h-20 rounded-full bg-[#58CC02] hover:bg-[#61E002] border-2 border-[#58A700] shadow-[0_4px_0_0_#58A700] active:translate-y-1 active:shadow-none transition-all duration-150 flex items-center justify-center"
            >
              <Play className="w-8 h-8 text-white fill-white ml-1" />
            </button>

            <h3 className="relative z-10 mt-4 text-lg font-extrabold text-slate-900 dark:text-white max-w-lg">
              {title}
            </h3>
            <p className="relative z-10 text-xs text-slate-600 dark:text-slate-400 mt-1 font-medium">
              Click to launch interactive video player
            </p>

            {hasWatched && (
              <div className="relative z-10 mt-3 inline-flex items-center space-x-1.5 px-3 py-1 bg-emerald-100 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-400 text-xs rounded-full font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Video completed</span>
              </div>
            )}

          </div>
        )}
      </div>

      {/* Video Footer Metadata */}
      <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-cyan-500 animate-ping" />
          <span className="font-mono text-[11px] uppercase tracking-wider text-slate-700 dark:text-slate-300 font-bold">HD Stream (1080p)</span>
        </div>
        <div className="flex items-center space-x-3 text-slate-500 dark:text-slate-400 font-medium">
          <span>External Host: {url.includes('youtube') ? 'YouTube' : 'Bunny Stream'}</span>
        </div>
      </div>
    </div>
  );
};
