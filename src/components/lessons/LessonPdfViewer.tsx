'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize,
  Minimize,
  FileText,
  X,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { toggleLessonCompletedAction } from '@/lib/actions/progress';

interface LessonPdfViewerProps {
  pdfUrl: string;
  title: string;
  lessonId?: string;
  isCompleted?: boolean;
  studentName?: string;
  studentPhone?: string;
  allowDownload?: boolean;
  onClose?: () => void;
  onToggleCompleted?: (completed: boolean) => void;
}

export function LessonPdfViewer({
  pdfUrl,
  title,
  lessonId,
  isCompleted: initialCompleted = false,
  studentName = 'طالب منصة المهندس',
  studentPhone = '',
  allowDownload = false,
  onClose,
  onToggleCompleted,
}: LessonPdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [secureUrl, setSecureUrl] = useState<string | null>(null);
  const [loadingUrl, setLoadingUrl] = useState(true);
  const [isIframeLoading, setIsIframeLoading] = useState(true);
  const [isCompletedState, setIsCompletedState] = useState(initialCompleted);
  const [markingComplete, setMarkingComplete] = useState(false);
  const isBlobUrl = pdfUrl.startsWith('blob:');

  useEffect(() => {
    setIsCompletedState(initialCompleted);
  }, [initialCompleted]);

  const handleToggleCompleted = async () => {
    if (!lessonId || markingComplete) return;
    setMarkingComplete(true);
    const nextState = !isCompletedState;
    setIsCompletedState(nextState);
    try {
      const res = await toggleLessonCompletedAction(lessonId, nextState);
      if (res.success) {
        onToggleCompleted?.(nextState);
      } else {
        setIsCompletedState(!nextState);
      }
    } catch {
      setIsCompletedState(!nextState);
    } finally {
      setMarkingComplete(false);
    }
  };

  // Fetch a signed (time-limited) URL from server for private bucket files
  useEffect(() => {
    let cancelled = false;
    setIsIframeLoading(true);

    async function getSignedUrl() {
      setLoadingUrl(true);
      try {
        if (isBlobUrl || !pdfUrl.includes('supabase.co/storage') || pdfUrl.includes('/object/sign/')) {
          setSecureUrl(pdfUrl);
          setLoadingUrl(false);
          return;
        }

        const res = await fetch('/api/media/signed-url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filePath: pdfUrl }),
        });

        if (res.ok) {
          const data = await res.json();
          if (!cancelled && data.signedUrl) {
            setSecureUrl(data.signedUrl);
          }
        } else {
          if (!cancelled) setSecureUrl(pdfUrl);
        }
      } catch {
        if (!cancelled) setSecureUrl(pdfUrl);
      } finally {
        if (!cancelled) setLoadingUrl(false);
      }
    }

    getSignedUrl();
    return () => {
      cancelled = true;
    };
  }, [pdfUrl, isBlobUrl]);

  // Block Print (Ctrl+P / Cmd+P) & Save (Ctrl+S / Cmd+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        alert('طباعة المحتوى محظورة لحماية حقوق النشر الخاصة بـ م/ رضا خيرت.');
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        alert('حفظ المحتوى محظور لحماية حقوق النشر الخاصة بـ م/ رضا خيرت.');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Block window.print()
  useEffect(() => {
    const handleBeforePrint = (e: Event) => {
      e.preventDefault();
    };
    window.addEventListener('beforeprint', handleBeforePrint);
    return () => window.removeEventListener('beforeprint', handleBeforePrint);
  }, []);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(200, prev + 20));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(60, prev - 20));
  };

  const handleResetZoom = () => {
    setZoom(100);
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

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // PDF open parameters via URL fragment (#)
  const iframeSrc = secureUrl
    ? `${secureUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`
    : '';

  return (
    <div
      ref={containerRef}
      onContextMenu={(e) => e.preventDefault()}
      className="relative rounded-3xl overflow-hidden bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col w-full h-full min-h-[500px]"
      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
    >
      {/* CSS to hide print and block selection */}
      <style>{`
        @media print {
          * { display: none !important; visibility: hidden !important; }
          body::after {
            content: 'طباعة المحتوى محظورة — م/ رضا خيرت';
            display: block !important;
            visibility: visible !important;
            font-size: 24px;
            text-align: center;
            padding: 100px;
          }
        }
      `}</style>

      {/* Top Toolbar */}
      <div className="bg-white/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 px-4 py-3 sm:px-5 sm:py-3.5 flex flex-wrap items-center justify-between gap-3 z-20 backdrop-blur-md shrink-0">
        {/* Title & Subtitle */}
        <div className="flex items-center gap-2.5 max-w-sm sm:max-w-md truncate">
          <div className="p-2 rounded-xl bg-cyan-electric/15 text-cyan-electric border border-cyan-electric/20 shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="truncate">
            <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-chalk truncate">{title}</h4>
            <span className="text-[10px] text-slate-500 dark:text-chalk-muted font-bold block">مذكرة الشرح والتدريبات المحلولة</span>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* Zoom controls */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/90 rounded-xl p-0.5 border border-slate-200 dark:border-slate-700">
            <button
              onClick={handleZoomOut}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-electric hover:bg-slate-200 dark:hover:bg-slate-700/60 transition-colors"
              title="تصغير (-20%)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono px-2.5 text-slate-700 dark:text-slate-300 font-bold select-none">
              {zoom === 100 ? '100%' : `${zoom}%`}
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-electric hover:bg-slate-200 dark:hover:bg-slate-700/60 transition-colors"
              title="تكبير (+20%)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700/60 transition-colors border-r border-slate-200 dark:border-slate-700"
              title="إعادة ضبط (100%)"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Mark Completed Button */}
          {lessonId && (
            <button
              onClick={handleToggleCompleted}
              disabled={markingComplete}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-sm ${
                isCompletedState
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/40 hover:bg-emerald-200 dark:hover:bg-emerald-500/30'
                  : 'bg-cyan-electric text-slate-950 hover:bg-cyan-electric-hover shadow-cyan-electric/20'
              }`}
              title="تحديد إتمام دراسة هذا المحتوى"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isCompletedState ? 'تم إتمام المذاكرة ✓' : 'تحديد كمكتمل'}</span>
            </button>
          )}

          {/* Fullscreen button */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-electric hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors"
            title={isFullscreen ? 'خروج من ملء الشاشة' : 'ملء الشاشة'}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          {/* Optional Close Button (when embedded in a modal) */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors mr-1"
              title="إغلاق المعاينة"
              aria-label="إغلاق المعاينة"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Document Frame Area */}
      <div className="flex-1 relative overflow-auto bg-slate-100 dark:bg-slate-900 flex items-start justify-center p-2 sm:p-4 min-h-0">
        {/* Anti-Piracy Watermark Grid */}
        <div className="absolute inset-0 pointer-events-none z-10 select-none overflow-hidden flex flex-col justify-around opacity-15">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="w-full flex justify-around text-cyan-electric text-xs font-mono font-black -rotate-12 tracking-widest whitespace-nowrap"
            >
              <span>{studentName} • {studentPhone} • م/ رضا خيرت</span>
              <span>{studentName} • {studentPhone} • م/ رضا خيرت</span>
            </div>
          ))}
        </div>

        {/* Blob URL Alert */}
        {isBlobUrl ? (
          <div className="absolute inset-0 flex items-center justify-center z-20 bg-slate-950/90 backdrop-blur-sm p-4">
            <div className="text-center space-y-3 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-amber-500/30 shadow-xl max-w-md">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto text-xl font-bold">
                ⚠️
              </div>
              <h4 className="text-sm font-black text-amber-600 dark:text-amber-400">الملف يحتاج لإعادة الرفع</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                تم حفظ هذا الملف سابقاً كرابط محلي مؤقت انتهت صلاحيته. يرجى إعادة رفع ملف الـ PDF من لوحة تحكم المعلم ليتم حفظه دائماً على السيرفر السحابي.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Loading State with animated spinner and informative text */}
            {(loadingUrl || isIframeLoading) && (
              <div className="absolute inset-0 flex items-center justify-center z-20 bg-slate-950/70 backdrop-blur-sm">
                <div className="text-center space-y-3 p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl max-w-sm">
                  <Loader2 className="w-8 h-8 text-cyan-500 dark:text-cyan-electric animate-spin mx-auto" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-chalk">جاري تجهيز وعرض صفحات المذكرة...</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      نظراً لدقة الصفحات العالية، يستغرق تنزيل البيانات بضع ثوانٍ
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Single clean iframe */}
            {secureUrl && (
              <div
                className="w-full h-full rounded-2xl overflow-hidden bg-white shadow-2xl transition-transform duration-200 origin-top"
                style={{
                  transform: zoom === 100 ? 'none' : `scale(${zoom / 100})`,
                  width: zoom === 100 ? '100%' : `${zoom}%`,
                  minHeight: '100%',
                }}
              >
                <iframe
                  src={iframeSrc}
                  className="w-full h-full min-h-[500px] border-0"
                  title={title}
                  loading="eager"
                  onLoad={() => setIsIframeLoading(false)}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer Info */}
      <div className="bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800 px-4 py-2.5 flex items-center justify-between text-[11px] text-slate-600 dark:text-chalk-muted shrink-0">
        <div className="flex items-center gap-2">
          <span>محتوى تعليمي مخصص لـ: <strong className="text-slate-900 dark:text-chalk">{studentName}</strong></span>
        </div>
        <span className="text-slate-400 dark:text-slate-500 text-[10px]">
          منصة المهندس التعليمية
        </span>
      </div>
    </div>
  );
}
