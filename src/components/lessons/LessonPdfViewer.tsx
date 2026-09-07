'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize,
  Minimize,
  FileText,
  Lock,
  ShieldCheck,
} from 'lucide-react';

interface LessonPdfViewerProps {
  pdfUrl: string;
  title: string;
  studentName?: string;
  studentPhone?: string;
  allowDownload?: boolean;
}

export function LessonPdfViewer({
  pdfUrl,
  title,
  studentName = 'طالب منصة المهندس',
  studentPhone = '',
  allowDownload = false,
}: LessonPdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFitWidth, setIsFitWidth] = useState(true);
  const [secureUrl, setSecureUrl] = useState<string | null>(null);
  const [loadingUrl, setLoadingUrl] = useState(true);

  // Fetch a signed (time-limited) URL from server for private bucket files
  useEffect(() => {
    let cancelled = false;

    async function getSignedUrl() {
      setLoadingUrl(true);
      try {
        // If pdfUrl is already a signed URL or non-supabase URL, use it directly
        if (!pdfUrl.includes('supabase.co/storage') || pdfUrl.includes('/object/sign/')) {
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
          // Fallback to original URL if signed URL generation fails
          if (!cancelled) setSecureUrl(pdfUrl);
        }
      } catch {
        if (!cancelled) setSecureUrl(pdfUrl);
      } finally {
        if (!cancelled) setLoadingUrl(false);
      }
    }

    getSignedUrl();
    return () => { cancelled = true; };
  }, [pdfUrl]);

  // Block Print (Ctrl+P / Cmd+P)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Block Ctrl+P (Print)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        alert('طباعة المحتوى محظورة لحماية حقوق النشر الخاصة بـ م/ رضا خيرت.');
      }
      // Block Ctrl+S (Save)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        alert('تحميل المحتوى محظور. المحتوى محمي بحقوق النشر لـ م/ رضا خيرت.');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Block print via window.print()
  useEffect(() => {
    const handleBeforePrint = (e: Event) => {
      e.preventDefault();
    };
    window.addEventListener('beforeprint', handleBeforePrint);
    return () => window.removeEventListener('beforeprint', handleBeforePrint);
  }, []);

  const handleZoomIn = () => {
    setIsFitWidth(false);
    setZoom((prev) => Math.min(200, prev + 20));
  };

  const handleZoomOut = () => {
    setIsFitWidth(false);
    setZoom((prev) => Math.max(60, prev - 20));
  };

  const handleResetZoom = () => {
    setIsFitWidth(false);
    setZoom(100);
  };

  const handleToggleFitWidth = () => {
    setIsFitWidth(!isFitWidth);
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

  // Build the iframe src with maximum toolbar suppression
  const iframeSrc = secureUrl
    ? `${secureUrl}${secureUrl.includes('?') ? '&' : '#'}toolbar=0&navpanes=0&scrollbar=1&view=FitH&statusbar=0&messages=0&download=0&print=0`
    : '';

  return (
    <div
      ref={containerRef}
      onContextMenu={(e) => e.preventDefault()}
      className="relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl flex flex-col w-full min-h-[600px] h-[75vh]"
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
      <div className="bg-slate-900/90 border-b border-slate-800 p-3 sm:p-4 flex flex-wrap items-center justify-between gap-2.5 z-20 backdrop-blur-md">
        {/* Title & Badge */}
        <div className="flex items-center gap-2 max-w-sm truncate">
          <div className="p-1.5 rounded-lg bg-cyan-electric/15 text-cyan-electric">
            <FileText className="w-4 h-4" />
          </div>
          <div className="truncate">
            <h4 className="text-xs sm:text-sm font-bold text-chalk truncate">{title}</h4>
            <span className="text-[10px] text-chalk-muted font-medium">مذكرة الشرح والتدريبات المحلولة</span>
          </div>
        </div>

        {/* Toolbar Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* Zoom controls */}
          <div className="flex items-center bg-slate-800/80 rounded-xl p-0.5 border border-slate-700">
            <button
              onClick={handleZoomOut}
              className="p-1.5 rounded-lg text-slate-300 hover:text-cyan-electric hover:bg-slate-700/60 transition-colors"
              title="تصغير (-20%)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono px-2 text-slate-300 font-bold select-none">
              {isFitWidth ? 'ملء' : `${zoom}%`}
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1.5 rounded-lg text-slate-300 hover:text-cyan-electric hover:bg-slate-700/60 transition-colors"
              title="تكبير (+20%)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors border-r border-slate-700"
              title="إعادة ضبط (100%)"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>

          {/* Fit Width toggle */}
          <button
            onClick={handleToggleFitWidth}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              isFitWidth
                ? 'bg-cyan-electric/20 text-cyan-electric border border-cyan-electric/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            ملء العرض
          </button>

          {/* Fullscreen button */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:text-cyan-electric hover:bg-slate-700 border border-slate-700 transition-colors"
            title={isFullscreen ? 'خروج من ملء الشاشة' : 'ملء الشاشة'}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          {/* Protected Badge — always shown, no download button */}
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            <span>محتوى محمي</span>
          </div>
        </div>
      </div>

      {/* Main Document Frame Area */}
      <div className="flex-1 relative overflow-auto bg-slate-900 flex items-start justify-center p-2 sm:p-4">
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

        {/* Loading State */}
        {loadingUrl && (
          <div className="absolute inset-0 flex items-center justify-center z-20 bg-slate-900/80">
            <div className="text-center space-y-3">
              <div className="w-10 h-10 border-4 border-cyan-electric border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-bold text-chalk-muted">جاري تحميل المذكرة المحمية...</p>
            </div>
          </div>
        )}

        {/* Embedded Iframe with zoom scaling — no toolbar, no download */}
        {secureUrl && (
          <div
            className="w-full h-full rounded-2xl overflow-hidden bg-white shadow-2xl transition-transform duration-200 origin-top"
            style={{
              transform: isFitWidth ? 'none' : `scale(${zoom / 100})`,
              width: isFitWidth ? '100%' : `${zoom}%`,
              minHeight: '100%',
            }}
          >
            <iframe
              src={iframeSrc}
              className="w-full h-full min-h-[500px] border-0"
              title={title}
              sandbox="allow-same-origin allow-scripts"
              loading="lazy"
            />
          </div>
        )}
      </div>

      {/* Footer Info — no external link */}
      <div className="bg-slate-900/90 border-t border-slate-800 px-4 py-2 flex items-center justify-between text-[11px] text-chalk-muted">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>محتوى تعليمي محمي ومخصص لـ: <strong className="text-chalk">{studentName}</strong></span>
        </div>
        <span className="text-amber-400/80 flex items-center gap-1 font-semibold">
          <Lock className="w-3 h-3" />
          <span>التحميل والنسخ محظور</span>
        </span>
      </div>
    </div>
  );
}
