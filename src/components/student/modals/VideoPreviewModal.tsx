'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, PlayCircle, Clock, CheckCircle2, RotateCcw } from 'lucide-react';
import { VideoWatermark } from '@/components/lessons/VideoWatermark';
import { parseMediaUrlHelper } from '@/lib/utils';
import { updateLessonProgressAction } from '@/lib/actions/progress';

interface VideoPreviewModalProps {
  video: {
    title: string;
    url: string;
    lessonId?: string;
    lastPosition?: number;
    watchPercentage?: number;
    durationMinutes?: number;
  } | null;
  onClose: () => void;
  studentName?: string;
  studentPhone?: string;
  onProgressSaved?: (lessonId: string, watchPercentage: number, lastPosition: number) => void;
}

export function VideoPreviewModal({
  video,
  onClose,
  studentName,
  studentPhone,
  onProgressSaved,
}: VideoPreviewModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [resumedPosition, setResumedPosition] = useState<number>(0);
  const [showResumedBadge, setShowResumedBadge] = useState<boolean>(false);
  const [currentWatchPct, setCurrentWatchPct] = useState<number>(video?.watchPercentage || 0);
  const lastSavedPosRef = useRef<number>(0);
  const currentPosRef = useRef<number>(0);
  const durationRef = useRef<number>(0);

  // Format seconds to MM:SS or HH:MM:SS
  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds <= 0) return '00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Determine starting position from DB or LocalStorage
  const getSavedStartPosition = useCallback(() => {
    if (!video) return 0;
    let pos = video.lastPosition || 0;

    if (typeof window !== 'undefined') {
      const storageKey = `almohands_vid_${video.lessonId || video.url}`;
      const localData = localStorage.getItem(storageKey);
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
  }, [video]);

  // Initial resume setup
  useEffect(() => {
    if (!video) return;
    const startPos = getSavedStartPosition();
    setResumedPosition(startPos);
    currentPosRef.current = startPos;
    lastSavedPosRef.current = startPos;

    if (startPos > 5) {
      setShowResumedBadge(true);
      const timer = setTimeout(() => setShowResumedBadge(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [video, getSavedStartPosition]);

  // Save progress handler
  const saveProgress = useCallback(
    async (pos: number, dur: number) => {
      if (!video) return;
      const cleanPos = Math.max(0, Math.round(pos));
      const cleanDur = dur > 0 ? dur : (video.durationMinutes ? video.durationMinutes * 60 : 2700);
      const pct = Math.min(100, Math.max(0, Math.round((cleanPos / cleanDur) * 100)));

      setCurrentWatchPct(pct);

      // Save locally
      if (typeof window !== 'undefined') {
        const storageKey = `almohands_vid_${video.lessonId || video.url}`;
        localStorage.setItem(storageKey, JSON.stringify({ pos: cleanPos, pct, updatedAt: Date.now() }));
      }

      // Save to database
      if (video.lessonId && Math.abs(cleanPos - lastSavedPosRef.current) >= 3) {
        lastSavedPosRef.current = cleanPos;
        try {
          await updateLessonProgressAction(video.lessonId, cleanPos, pct);
          if (onProgressSaved) {
            onProgressSaved(video.lessonId, pct, cleanPos);
          }
        } catch (err) {
          console.warn('Failed to save progress in modal:', err);
        }
      }
    },
    [video, onProgressSaved]
  );

  // Save on unmount / modal close
  useEffect(() => {
    return () => {
      if (currentPosRef.current > 0) {
        saveProgress(currentPosRef.current, durationRef.current);
      }
    };
  }, [saveProgress]);

  if (!video) return null;

  const startSec = resumedPosition > 0 ? resumedPosition : getSavedStartPosition();
  const parsed = parseMediaUrlHelper(video.url, startSec);

  // HTML5 Video Handlers
  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    const dur = videoRef.current.duration || 0;
    durationRef.current = dur;

    if (startSec > 0 && startSec < dur - 5) {
      videoRef.current.currentTime = startSec;
    }
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const cur = videoRef.current.currentTime;
    const dur = videoRef.current.duration || durationRef.current;
    currentPosRef.current = cur;
    durationRef.current = dur;

    if (Math.abs(cur - lastSavedPosRef.current) >= 5) {
      saveProgress(cur, dur);
    }
  };

  const handleRestartFromBeginning = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
    currentPosRef.current = 0;
    setResumedPosition(0);
    setShowResumedBadge(false);
    saveProgress(0, durationRef.current);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-cyan-electric/30 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-electric/15 flex items-center justify-center text-cyan-electric">
              <PlayCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-chalk truncate max-w-md">
                {video.title}
              </h3>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-cyan-electric font-bold">
                  مشغل الفيديو الذكي
                </span>
                {currentWatchPct > 0 && (
                  <>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500 dark:text-slate-400 font-medium">
                      تمت مشاهدة {currentWatchPct}%
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              saveProgress(currentPosRef.current, durationRef.current);
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-chalk hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player Area with Subtle Watermark & Resume Indicator */}
        <div
          onContextMenu={(e) => e.preventDefault()}
          className="relative aspect-video bg-black flex items-center justify-center overflow-hidden select-none group"
        >
          {/* Subtle Anti-Piracy Floating Watermark */}
          <VideoWatermark studentName={studentName} studentPhone={studentPhone} />

          {/* Resume Playback Toast Badge */}
          {showResumedBadge && startSec > 5 && (
            <div className="absolute top-4 left-4 z-40 bg-slate-900/90 text-chalk px-3 py-1.5 rounded-xl border border-cyan-electric/40 text-xs font-bold shadow-lg backdrop-blur-md flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
              <Clock className="w-3.5 h-3.5 text-cyan-electric" />
              <span>تم استئناف الفيديو من {formatTime(startSec)}</span>
              <button
                onClick={handleRestartFromBeginning}
                className="mr-1 text-[11px] text-cyan-electric hover:underline flex items-center gap-1 border-r border-slate-700 pr-2"
                title="البدء من الأول"
              >
                <RotateCcw className="w-3 h-3" />
                <span>من البداية</span>
              </button>
            </div>
          )}

          {parsed.type === 'iframe' ? (
            <iframe
              src={parsed.src}
              title={video.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
            />
          ) : (
            <video
              ref={videoRef}
              src={parsed.src}
              controls
              autoPlay
              onLoadedMetadata={handleLoadedMetadata}
              onTimeUpdate={handleTimeUpdate}
              onPause={() => saveProgress(currentPosRef.current, durationRef.current)}
              onEnded={() => saveProgress(durationRef.current, durationRef.current)}
              controlsList="nodownload noremoteplayback"
              disablePictureInPicture
              className="w-full h-full object-contain"
            >
              متصفحك لا يدعم تشغيل هذا الفيديو.
            </video>
          )}
        </div>

        {/* Modal Footer with Progress indicator */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/80">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-chalk-muted">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>يتم حفظ موضع ونسبة مشاهدتك تلقائياً للرجوع إليها في أي وقت.</span>
          </div>
          <button
            onClick={() => {
              saveProgress(currentPosRef.current, durationRef.current);
              onClose();
            }}
            className="px-5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-chalk-muted hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
