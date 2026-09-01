'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, PlayCircle, Clock, CheckCircle2, RotateCcw } from 'lucide-react';
import { VideoWatermark } from '@/components/lessons/VideoWatermark';
import { parseMediaUrlHelper } from '@/lib/utils';
import { updateLessonProgressAction } from '@/lib/actions/progress';
import { syncLessonDurationAction } from '@/lib/actions/lessons';

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
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [resumedPosition, setResumedPosition] = useState<number>(0);
  const [showResumedBadge, setShowResumedBadge] = useState<boolean>(false);
  const [currentWatchPct, setCurrentWatchPct] = useState<number>(video?.watchPercentage || 0);

  const lastSavedPosRef = useRef<number>(0);
  const currentPosRef = useRef<number>(0);
  const durationRef = useRef<number>(0);
  const hasSeekedHtml5Ref = useRef<boolean>(false);

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

  // Helper to extract YouTube video ID
  const getYouTubeId = (rawUrl?: string): string | null => {
    if (!rawUrl) return null;
    const match = rawUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
    return match ? match[1] : null;
  };

  // Determine starting position from DB or LocalStorage (checks all possible keys)
  const getSavedStartPosition = useCallback(() => {
    if (!video) return 0;
    let bestPos = video.lastPosition || 0;

    if (typeof window !== 'undefined') {
      const keysToCheck: string[] = [];
      if (video.lessonId) keysToCheck.push(`almohands_vid_${video.lessonId}`);
      if (video.url) keysToCheck.push(`almohands_vid_${video.url}`);

      const ytId = getYouTubeId(video.url);
      if (ytId) keysToCheck.push(`almohands_yt_${ytId}`);

      for (const key of keysToCheck) {
        try {
          const raw = localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed && typeof parsed.pos === 'number' && parsed.pos > bestPos) {
              bestPos = Math.round(parsed.pos);
            }
          }
        } catch {}
      }
    }
    return bestPos;
  }, [video]);

  // Synchronously write to LocalStorage under all matching keys
  const saveToLocalStorage = useCallback(
    (pos: number, pct: number, dur: number) => {
      if (typeof window === 'undefined' || !video) return;
      const cleanPos = Math.max(0, Math.round(pos));
      const payload = JSON.stringify({ pos: cleanPos, pct, dur, updatedAt: Date.now() });

      if (video.lessonId) {
        localStorage.setItem(`almohands_vid_${video.lessonId}`, payload);
      }
      if (video.url) {
        localStorage.setItem(`almohands_vid_${video.url}`, payload);
        const ytId = getYouTubeId(video.url);
        if (ytId) {
          localStorage.setItem(`almohands_yt_${ytId}`, payload);
        }
      }
    },
    [video]
  );

  // Save progress handler (updates localStorage immediately, then DB)
  const saveProgress = useCallback(
    async (pos: number, dur: number) => {
      if (!video) return;
      const cleanPos = Math.max(0, Math.round(pos));
      if (cleanPos <= 0 && currentPosRef.current > 0) return;

      currentPosRef.current = cleanPos;
      const cleanDur = dur > 0 ? dur : (video.durationMinutes ? video.durationMinutes * 60 : 2700);
      const pct = Math.min(100, Math.max(0, Math.round((cleanPos / cleanDur) * 100)));

      setCurrentWatchPct(pct);

      // Instant local persistence
      saveToLocalStorage(cleanPos, pct, cleanDur);

      // Persist to database if lessonId exists and position has changed significantly
      if (video.lessonId && (Math.abs(cleanPos - lastSavedPosRef.current) >= 3 || pct >= 90)) {
        lastSavedPosRef.current = cleanPos;
        try {
          await updateLessonProgressAction(video.lessonId, cleanPos, pct);
          if (dur > 0) {
            syncLessonDurationAction(video.lessonId, dur).catch(() => {});
          }
          if (onProgressSaved) {
            onProgressSaved(video.lessonId, pct, cleanPos);
          }
        } catch (err) {
          console.warn('Failed to save progress in modal:', err);
        }
      }
    },
    [video, onProgressSaved, saveToLocalStorage]
  );

  // Initial resume setup
  useEffect(() => {
    if (!video) return;
    const startPos = getSavedStartPosition();
    setResumedPosition(startPos);
    currentPosRef.current = startPos;
    lastSavedPosRef.current = startPos;
    hasSeekedHtml5Ref.current = false;

    if (startPos > 5) {
      setShowResumedBadge(true);
      const timer = setTimeout(() => setShowResumedBadge(false), 6000);
      return () => clearTimeout(timer);
    }
  }, [video, getSavedStartPosition]);

  // YouTube / Iframe postMessage listener to track real-time position
  useEffect(() => {
    if (!video) return;

    // Send handshake listening message to iframe
    const handshakeInterval = setInterval(() => {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        try {
          iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'listening' }), '*');
        } catch {}
      }
    }, 1500);

    const handleWindowMessage = (event: MessageEvent) => {
      try {
        let payload = event.data;
        if (typeof payload === 'string' && payload.startsWith('{')) {
          payload = JSON.parse(payload);
        }

        // YouTube IFrame API infoDelivery
        if (payload && payload.event === 'infoDelivery' && payload.info) {
          if (typeof payload.info.currentTime === 'number') {
            const cur = Math.round(payload.info.currentTime);
            const dur = Math.round(payload.info.duration || durationRef.current);
            if (cur > 0) {
              currentPosRef.current = cur;
              if (dur > 0) durationRef.current = dur;
              saveProgress(cur, dur);
            }
          }
        }
      } catch {}
    };

    window.addEventListener('message', handleWindowMessage);

    return () => {
      clearInterval(handshakeInterval);
      window.removeEventListener('message', handleWindowMessage);
    };
  }, [video, saveProgress]);

  // Save on unmount / modal close / window close
  useEffect(() => {
    const handleUnload = () => {
      if (currentPosRef.current > 0) {
        saveProgress(currentPosRef.current, durationRef.current);
      }
    };
    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('pagehide', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('pagehide', handleUnload);
      handleUnload();
    };
  }, [saveProgress]);

  if (!video) return null;

  const startSec = resumedPosition > 0 ? resumedPosition : getSavedStartPosition();
  const parsed = parseMediaUrlHelper(video.url, startSec);

  // HTML5 Video Handlers with guaranteed seek
  const applyHtml5Seek = (targetSec: number) => {
    if (!videoRef.current || targetSec <= 0 || hasSeekedHtml5Ref.current) return;
    try {
      videoRef.current.currentTime = targetSec;
      hasSeekedHtml5Ref.current = true;
    } catch {}
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    const dur = videoRef.current.duration || 0;
    durationRef.current = dur;
    applyHtml5Seek(startSec);
  };

  const handleCanPlay = () => {
    applyHtml5Seek(startSec);
  };

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const cur = videoRef.current.currentTime;
    const dur = videoRef.current.duration || durationRef.current;
    currentPosRef.current = cur;
    durationRef.current = dur;

    if (Math.abs(cur - lastSavedPosRef.current) >= 3) {
      saveProgress(cur, dur);
    }
  };

  const handleRestartFromBeginning = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'seekTo', args: [0, true] }),
          '*'
        );
      } catch {}
    }
    currentPosRef.current = 0;
    setResumedPosition(0);
    setShowResumedBadge(false);
    saveProgress(0, durationRef.current);
  };

  const handleCloseModal = () => {
    if (currentPosRef.current > 0) {
      saveToLocalStorage(currentPosRef.current, currentWatchPct, durationRef.current);
      saveProgress(currentPosRef.current, durationRef.current);
    }
    onClose();
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
                    <span className="text-emerald-500 font-bold">
                      تمت مشاهدة {currentWatchPct}%
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={handleCloseModal}
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
            <div className="absolute top-4 left-4 z-40 bg-slate-900/95 text-chalk px-3.5 py-2 rounded-xl border border-cyan-electric/50 text-xs font-bold shadow-2xl backdrop-blur-md flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 duration-300">
              <Clock className="w-4 h-4 text-cyan-electric" />
              <span>تم استئناف الفيديو من {formatTime(startSec)}</span>
              <button
                onClick={handleRestartFromBeginning}
                className="mr-1 text-[11px] text-cyan-electric hover:underline flex items-center gap-1 border-r border-slate-700 pr-2 font-bold"
                title="البدء من الأول"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>من البداية</span>
              </button>
            </div>
          )}

          {parsed.type === 'iframe' ? (
            <iframe
              ref={iframeRef}
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
              onCanPlay={handleCanPlay}
              onPlay={() => applyHtml5Seek(startSec)}
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
            onClick={handleCloseModal}
            className="px-5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-chalk-muted hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
