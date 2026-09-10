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
  ExternalLink,
  Layers,
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
  const [loading, setLoading] = useState(true);
  const [isCompletedState, setIsCompletedState] = useState(initialCompleted);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [useGoogleViewer, setUseGoogleViewer] = useState(false);

  const isBlobUrl = pdfUrl?.startsWith('blob:');

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

  // Resolve signed URL quickly with immediate unblock
  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    async function resolveUrl() {
      try {
        if (!pdfUrl) {
          if (!cancelled) setLoading(false);
          return;
        }

        // Direct URLs (blobs, already signed, or public)
        if (isBlobUrl || !pdfUrl.includes('supabase.co/storage') || pdfUrl.includes('/object/sign/')) {
          if (!cancelled) {
            setSecureUrl(pdfUrl);
            // Brief 300ms transition so iframe mounts cleanly
            setTimeout(() => {
              if (!cancelled) setLoading(false);
            }, 300);
          }
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
          } else if (!cancelled) {
            setSecureUrl(pdfUrl);
          }
        } else {
          if (!cancelled) setSecureUrl(pdfUrl);
        }
      } catch {
        if (!cancelled) setSecureUrl(pdfUrl);
      } finally {
        // Unblock spinner quickly - DO NOT hang waiting for iframe onload!
        setTimeout(() => {
          if (!cancelled) setLoading(false);
        }, 400);
      }
    }

    resolveUrl();
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

  const handleZoomIn = () => setZoom((prev) => Math.min(180, prev + 15));
  const handleZoomOut = () => setZoom((prev) => Math.max(70, prev - 15));
  const handleResetZoom = () => setZoom(100);

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
    const onFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  // Build iframe source
  const nativeSrc = secureUrl
    ? `${secureUrl}#toolbar=0&navpanes=0&scrollbar=1&view=FitH`
    : '';

  const googleViewerSrc = secureUrl
    ? `https://docs.google.com/viewer?url=${encodeURIComponent(secureUrl)}&embedded=true`
    : '';

  const activeSrc = useGoogleViewer ? googleViewerSrc : nativeSrc;

  return (
    <div
      ref={containerRef}
      onContextMenu={(e) => e.preventDefault()}
      className="relative rounded-3xl overflow-hidden bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col w-full h-full min-h-[550px]"
      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
    >
      {/* CSS to protect content from printing */}
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
      <div className="bg-white/95 dark:bg-slate-900/95 border-b border-slate-200 dark:border-slate-800 px-3 py-2.5 sm:px-4 sm:py-3 flex flex-wrap items-center justify-between gap-2.5 z-20 backdrop-blur-md shrink-0">
        {/* Title & Badge */}
        <div className="flex items-center gap-2.5 max-w-xs sm:max-w-sm md:max-w-md truncate">
          <div className="p-2 rounded-xl bg-cyan-electric/15 text-cyan-electric border border-cyan-electric/20 shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="truncate">
            <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-chalk truncate">{title}</h4>
            <span className="text-[10px] text-cyan-600 dark:text-cyan-electric font-bold block">
              {useGoogleViewer ? 'عارض الطوارئ التوافقي' : 'العارض الأصلي فائق الدقة (Vector HD)'}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* Viewer Mode Toggle (Native vs Google) */}
          <button
            onClick={() => setUseGoogleViewer((v) => !v)}
            className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1"
            title="التبديل بين عارض المتصفح الأصلي وعارض Google المتوافق"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-500" />
            <span className="hidden sm:inline">
              {useGoogleViewer ? 'العارض الأصلي' : 'عارض بديل'}
            </span>
          </button>

          {/* Zoom controls */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/90 rounded-xl p-0.5 border border-slate-200 dark:border-slate-700">
            <button
              onClick={handleZoomOut}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-electric hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="تصغير"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="text-[11px] font-mono px-2 text-slate-700 dark:text-slate-300 font-bold hover:text-cyan-electric transition-colors"
              title="إعادة ضبط (100%)"
            >
              {zoom}%
            </button>
            <button
              onClick={handleZoomIn}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-electric hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="تكبير"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border-r border-slate-200 dark:border-slate-700"
              title="إعادة ضبط"
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
              <span className="hidden sm:inline">{isCompletedState ? 'تم إتمام المذاكرة ✓' : 'تحديد كمكتمل'}</span>
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

          {/* Optional Close Button */}
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
      <div className="flex-1 relative overflow-hidden bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-0 min-h-0">
        {/* Anti-Piracy Watermark Overlay (Light, Subtle, Non-Intrusive) */}
        <div
          className="absolute inset-0 pointer-events-none z-10 select-none overflow-hidden flex flex-col justify-around opacity-10 dark:opacity-15"
          aria-hidden="true"
        >
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="w-full flex justify-around text-slate-800 dark:text-cyan-electric text-xs font-mono font-black -rotate-12 tracking-widest whitespace-nowrap"
            >
              <span>{studentName} • {studentPhone} • م/ رضا خيرت</span>
              <span className="hidden sm:inline">{studentName} • {studentPhone} • م/ رضا خيرت</span>
            </div>
          ))}
        </div>

        {/* Blob URL Alert */}
        {isBlobUrl ? (
          <div className="m-auto text-center space-y-3 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-amber-500/30 shadow-xl max-w-md z-20">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto text-xl font-bold">
              ⚠️
            </div>
            <h4 className="text-sm font-black text-amber-600 dark:text-amber-400">الملف يحتاج لإعادة الرفع</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              تم حفظ هذا الملف سابقاً كرابط محلي مؤقت انتهت صلاحيته. يرجى إعادة رفع ملف الـ PDF من لوحة تحكم المعلم.
            </p>
          </div>
        ) : (
          <>
            {/* Brief Loading Spinner (auto-dismisses in <400ms without blocking) */}
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center z-20 bg-slate-950/60 backdrop-blur-sm pointer-events-none transition-opacity">
                <div className="text-center space-y-2.5 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl max-w-xs">
                  <Loader2 className="w-7 h-7 text-cyan-electric animate-spin mx-auto" />
                  <p className="text-xs font-bold text-slate-900 dark:text-chalk">جاري فتح المذكرة مباشرة...</p>
                </div>
              </div>
            )}

            {/* Native High-Fidelity Vector Frame */}
            {secureUrl && (
              <div
                className="w-full h-full overflow-hidden bg-white transition-transform duration-200 origin-top"
                style={{
                  transform: zoom === 100 ? 'none' : `scale(${zoom / 100})`,
                  width: zoom === 100 ? '100%' : `${zoom}%`,
                  height: zoom === 100 ? '100%' : `${zoom}%`,
                }}
              >
                <iframe
                  src={activeSrc}
                  className="w-full h-full border-0 block"
                  title={title}
                  loading="eager"
                  allow="fullscreen"
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer Info */}
      <div className="bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800 px-4 py-2 flex items-center justify-between text-[11px] text-slate-600 dark:text-chalk-muted shrink-0">
        <div className="flex items-center gap-1.5">
          <span>طالب: <strong className="text-slate-900 dark:text-chalk">{studentName}</strong></span>
          {studentPhone && <span className="text-slate-400 font-mono">({studentPhone})</span>}
        </div>
        <div className="flex items-center gap-2">
          {allowDownload && secureUrl && (
            <a
              href={secureUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-electric hover:underline text-[10px] flex items-center gap-1 font-bold"
            >
              <span>فتح بنافذة جديدة</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
          <span className="text-slate-400 dark:text-slate-500 text-[10px]">
            منصة المهندس التعليمية — م/ رضا خيرت
          </span>
        </div>
      </div>
    </div>
  );
}
