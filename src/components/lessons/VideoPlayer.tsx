'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { VideoWatermark } from './VideoWatermark';
import { updateLessonProgressAction } from '@/lib/actions/progress';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  CheckCircle2,
  Tv,
  Settings,
  Sparkles,
  Clock,
} from 'lucide-react';

interface VideoPlayerProps {
  lessonId: string;
  lessonTitle: string;
  media: { type: 'video' | 'iframe'; src: string };
  poster?: string;
  initialPosition?: number;
  initialWatchPercentage?: number;
  studentName?: string;
  studentPhone?: string;
  onProgressUpdate?: (watchPercentage: number, position: number, isCompleted: boolean) => void;
  onCompleted?: () => void;
}

export function VideoPlayer({
  lessonId,
  lessonTitle,
  media,
  poster,
  initialPosition = 0,
  initialWatchPercentage = 0,
  studentName,
  studentPhone,
  onProgressUpdate,
  onCompleted,
}: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTheater, setIsTheater] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  // Progress state
  const [watchPercentage, setWatchPercentage] = useState(initialWatchPercentage);
  const [isCompleted, setIsCompleted] = useState(initialWatchPercentage >= 90);
  const [showCompletedBanner, setShowCompletedBanner] = useState(false);

  // Max watched timestamp to prevent skipping manipulation
  const maxWatchedTimeRef = useRef<number>(initialPosition);
  const lastSavedPositionRef = useRef<number>(initialPosition);
  const hideControlsTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Format seconds to MM:SS or HH:MM:SS
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Check both initialPosition and localStorage for most recent progress
  const getEffectiveStartPosition = useCallback(() => {
    let pos = initialPosition;
    if (typeof window !== 'undefined' && lessonId) {
      const localData = localStorage.getItem(`almohands_vid_${lessonId}`);
      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          if (parsed.pos && parsed.pos > pos) {
            pos = parsed.pos;
          }
        } catch {}
      }
    }
    return pos;
  }, [initialPosition, lessonId]);

  const [resumedPosition, setResumedPosition] = useState<number>(0);
  const [showResumedBadge, setShowResumedBadge] = useState<boolean>(false);

  useEffect(() => {
    const startPos = getEffectiveStartPosition();
    setResumedPosition(startPos);
    maxWatchedTimeRef.current = Math.max(maxWatchedTimeRef.current, startPos);
    lastSavedPositionRef.current = startPos;
    if (startPos > 5) {
      setShowResumedBadge(true);
      const timer = setTimeout(() => setShowResumedBadge(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [getEffectiveStartPosition]);

  // Debounced progress saving to server
  const saveProgressToServer = useCallback(
    async (pos: number, dur: number) => {
      if (!dur || dur <= 0 || !lessonId) return;

      const calculatedPct = Math.min(100, Math.round((Math.max(pos, maxWatchedTimeRef.current) / dur) * 100));
      const newPct = Math.max(watchPercentage, calculatedPct);
      const newlyCompleted = newPct >= 90;

      setWatchPercentage(newPct);
      if (newlyCompleted && !isCompleted) {
        setIsCompleted(true);
        setShowCompletedBanner(true);
        if (onCompleted) onCompleted();
      }

      if (onProgressUpdate) {
        onProgressUpdate(newPct, pos, newlyCompleted);
      }

      // Save locally to localStorage
      if (typeof window !== 'undefined' && lessonId) {
        localStorage.setItem(`almohands_vid_${lessonId}`, JSON.stringify({ pos: Math.round(pos), pct: newPct, updatedAt: Date.now() }));
      }

      // Avoid spamming DB if position change is minor
      if (Math.abs(pos - lastSavedPositionRef.current) >= 4 || newlyCompleted) {
        lastSavedPositionRef.current = pos;
        try {
          await updateLessonProgressAction(lessonId, pos, newPct);
        } catch (e) {
          console.warn('Progress update error:', e);
        }
      }
    },
    [lessonId, watchPercentage, isCompleted, onProgressUpdate, onCompleted]
  );

  // Auto-save on page close, back button, or unmount
  useEffect(() => {
    const handleUnload = () => {
      if (videoRef.current && lessonId) {
        const cur = videoRef.current.currentTime;
        const dur = videoRef.current.duration || 1;
        saveProgressToServer(cur, dur);
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('pagehide', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('pagehide', handleUnload);
      handleUnload();
    };
  }, [lessonId, saveProgressToServer]);

  // Initial resume setup
  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    const vid = videoRef.current;
    const dur = vid.duration || 0;
    setDuration(dur);

    const startPos = resumedPosition > 0 ? resumedPosition : getEffectiveStartPosition();
    if (startPos > 0 && startPos < dur - 5) {
      vid.currentTime = startPos;
      setCurrentTime(startPos);
      maxWatchedTimeRef.current = Math.max(maxWatchedTimeRef.current, startPos);
    }
  };

  const effectiveIframeSrc = useMemo(() => {
    if (media.type !== 'iframe' || !media.src) return media.src;
    const startSec = Math.floor(resumedPosition > 0 ? resumedPosition : getEffectiveStartPosition());
    if (startSec <= 0) return media.src;

    let url = media.src;
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      if (!url.includes('start=')) {
        url += (url.includes('?') ? '&' : '?') + `start=${startSec}`;
      }
    } else if (url.includes('vimeo.com')) {
      if (!url.includes('#t=')) {
        url += `#t=${startSec}s`;
      }
    } else if (url.includes('bunnycdn.com') || url.includes('mediadelivery.net')) {
      if (!url.includes('t=')) {
        url += (url.includes('?') ? '&' : '?') + `t=${startSec}`;
      }
    }
    return url;
  }, [media, resumedPosition, getEffectiveStartPosition]);

  // Time update handler
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const vid = videoRef.current;
    const cur = vid.currentTime;
    const dur = vid.duration || duration || 1;

    setCurrentTime(cur);
    if (cur > maxWatchedTimeRef.current) {
      maxWatchedTimeRef.current = cur;
    }

    // Save every 8 seconds of playback
    if (Math.floor(cur) % 8 === 0) {
      saveProgressToServer(cur, dur);
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      saveProgressToServer(videoRef.current.currentTime, videoRef.current.duration);
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (delta: number) => {
    if (!videoRef.current) return;
    const newTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + delta));
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    saveProgressToServer(newTime, duration);
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current || !videoRef.current || !duration) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    // In RTL, 0 is at right or left depending on direction. Calculate percentage from left to right.
    const clickRatio = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = clickRatio * duration;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    saveProgressToServer(newTime, duration);
  };

  const handleSpeedSelect = (speed: number) => {
    setPlaybackSpeed(speed);
    setShowSpeedMenu(false);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.muted = false;
      setIsMuted(false);
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  // Fullscreen change listener
  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // Controls auto-hide on inactivity
  const handleMouseMove = () => {
    setShowControls(true);
    if (hideControlsTimerRef.current) clearTimeout(hideControlsTimerRef.current);
    if (isPlaying) {
      hideControlsTimerRef.current = setTimeout(() => {
        setShowControls(false);
        setShowSpeedMenu(false);
      }, 3500);
    }
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleSeek(5);
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handleSeek(-5);
      } else if (e.code === 'KeyF') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.code === 'KeyM') {
        e.preventDefault();
        toggleMute();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, duration]);

  const currentPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      className={`relative rounded-3xl overflow-hidden bg-black border-2 border-slate-800 shadow-2xl transition-all duration-300 select-none group ${
        isTheater ? 'w-full max-w-full aspect-[21/9]' : 'w-full aspect-video'
      }`}
    >
      {/* 1. Dynamic Moving Anti-Recording Watermark */}
      <VideoWatermark studentName={studentName} studentPhone={studentPhone} />

      {/* 2. Completed Lesson Notification Toast */}
      {showCompletedBanner && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-2xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-400 text-xs font-bold shadow-lg shadow-emerald-950/50 flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>أحسنت! تم إكمال 90% من الدرس وتسجيله كـ "مكتمل" بنجاح </span>
          <button
            onClick={() => setShowCompletedBanner(false)}
            className="text-emerald-300 hover:text-white mr-1 text-sm font-bold"
          >
            
          </button>
        </div>
      )}

      {/* 2b. Resumed Position Notification Badge */}
      {showResumedBadge && (resumedPosition > 5) && (
        <div className="absolute top-4 left-4 z-40 bg-slate-900/90 text-chalk px-3 py-1.5 rounded-xl border border-cyan-electric/40 text-xs font-bold shadow-lg backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
          <Clock className="w-3.5 h-3.5 text-cyan-electric" />
          <span>تم استئناف الدرس من {formatTime(resumedPosition)}</span>
          <button
            onClick={() => {
              if (videoRef.current) {
                videoRef.current.currentTime = 0;
              }
              setResumedPosition(0);
              setShowResumedBadge(false);
              saveProgressToServer(0, duration);
            }}
            className="mr-1 text-[11px] text-cyan-electric hover:underline flex items-center gap-1 border-r border-slate-700 pr-2"
            title="البدء من الأول"
          >
            <RotateCcw className="w-3 h-3" />
            <span>من البداية</span>
          </button>
        </div>
      )}

      {/* 3. Media Rendering */}
      {media.type === 'iframe' ? (
        <iframe
          src={effectiveIframeSrc}
          className="w-full h-full border-0 bg-black"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          title={lessonTitle}
        />
      ) : (
        <>
          <video
            ref={videoRef}
            src={media.src}
            poster={poster || '/teacher_reda_kheyrat.jpg'}
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => {
              setIsPlaying(false);
              saveProgressToServer(duration, duration);
            }}
            onContextMenu={(e) => e.preventDefault()}
            controlsList="nodownload noremoteplayback"
            disablePictureInPicture
            className="w-full h-full object-contain bg-black cursor-pointer"
            onClick={togglePlay}
          />

          {/* Big Center Play Button Overlay when Paused */}
          {!isPlaying && (
            <div
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer transition-opacity group-hover:bg-black/30"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-cyan-electric/20 border-2 border-cyan-electric/60 backdrop-blur-md flex items-center justify-center text-cyan-electric shadow-xl shadow-cyan-electric/20 hover:scale-110 transition-transform">
                <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-cyan-electric translate-x-0.5" />
              </div>
            </div>
          )}

          {/* Custom Video Controls Bar */}
          <div
            className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-3 sm:p-4 z-30 space-y-2.5 transition-opacity duration-300 ${
              showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            {/* Scrubbable Progress Bar */}
            <div
              ref={progressBarRef}
              onClick={handleProgressBarClick}
              className="relative w-full h-2 group/prog cursor-pointer flex items-center"
            >
              <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden group-hover/prog:h-2 transition-all">
                <div
                  className="h-full bg-gradient-to-r from-cyan-electric to-blue-400 rounded-full shadow-cyan-glow relative"
                  style={{ width: `${currentPercent}%` }}
                />
              </div>
              {/* Scrub thumb */}
              <div
                className="absolute w-3.5 h-3.5 bg-white rounded-full shadow-md scale-0 group-hover/prog:scale-100 transition-transform pointer-events-none"
                style={{ left: `calc(${currentPercent}% - 7px)` }}
              />
            </div>

            {/* Buttons & Time Row */}
            <div className="flex items-center justify-between text-white text-xs font-bold gap-2">
              {/* Right/Playback Controls (RTL) */}
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={togglePlay}
                  className="p-2 rounded-xl bg-white/10 hover:bg-cyan-electric hover:text-black transition-all text-cyan-electric shrink-0"
                  title={isPlaying ? 'إيقاف مؤقت (المسافة)' : 'تشغيل (المسافة)'}
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                </button>

                <button
                  onClick={() => handleSeek(-10)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-colors shrink-0"
                  title="إرجاع 10 ثوانٍ (السهم الأيسر)"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleSeek(10)}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white transition-colors shrink-0"
                  title="تقديم 10 ثوانٍ (السهم الأيمن)"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>

                {/* Volume slider */}
                <div className="hidden sm:flex items-center gap-1.5 group/vol">
                  <button
                    onClick={toggleMute}
                    className="p-1.5 rounded-lg text-slate-300 hover:text-cyan-electric transition-colors"
                  >
                    {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-cyan-electric"
                  />
                </div>

                {/* Time Display */}
                <div className="text-[11px] font-mono text-slate-300 dir-ltr select-none">
                  <span>{formatTime(currentTime)}</span>
                  <span className="mx-1 text-slate-500">/</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Left Utilities (Speed, Theater, Fullscreen) */}
              <div className="flex items-center gap-2 relative">
                {/* Speed Selector Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                    className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-cyan-electric text-[11px] font-bold transition-colors flex items-center gap-1"
                  >
                    <span>{playbackSpeed}x</span>
                    <Settings className="w-3 h-3 text-slate-400" />
                  </button>

                  {showSpeedMenu && (
                    <div className="absolute bottom-full left-0 mb-2 py-1.5 rounded-xl bg-slate-900/95 border border-slate-700 backdrop-blur-xl shadow-2xl z-50 flex flex-col min-w-[80px]">
                      {[0.75, 1, 1.25, 1.5, 1.75, 2].map((s) => (
                        <button
                          key={s}
                          onClick={() => handleSpeedSelect(s)}
                          className={`px-3 py-1 text-right text-xs font-bold transition-colors ${
                            playbackSpeed === s
                              ? 'bg-cyan-electric text-black'
                              : 'text-slate-200 hover:bg-white/10'
                          }`}
                        >
                          {s}x {s === 1 && '(عادي)'}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Theater Mode Toggle */}
                <button
                  onClick={() => setIsTheater(!isTheater)}
                  className={`hidden md:flex p-1.5 rounded-lg transition-colors ${
                    isTheater ? 'text-cyan-electric bg-white/15' : 'text-slate-300 hover:bg-white/10'
                  }`}
                  title="وضع المسرح"
                >
                  <Tv className="w-4 h-4" />
                </button>

                {/* Fullscreen Toggle */}
                <button
                  onClick={toggleFullscreen}
                  className="p-1.5 rounded-lg text-slate-300 hover:text-cyan-electric hover:bg-white/10 transition-colors"
                  title={isFullscreen ? 'خروج من ملء الشاشة' : 'ملء الشاشة (F)'}
                >
                  {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
