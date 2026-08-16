'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize,
  Minimize,
  Download,
  FileText,
  Lock,
  ExternalLink,
  ShieldCheck,
  Printer,
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
  allowDownload = true,
}: LessonPdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<number>(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFitWidth, setIsFitWidth] = useState(true);

  // Prevent Print (Ctrl+P / Cmd+P)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        alert('طباعة المحتوى محظورة لحماية حقوق النشر الخاصة بـ م/ رضا خيرت.');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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

  return (
    <div
      ref={containerRef}
      onContextMenu={(e) => e.preventDefault()}
      className="relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl flex flex-col w-full min-h-[600px] h-[75vh]"
    >
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

          {/* Download Button or Locked Badge */}
          {allowDownload ? (
            <a
              href={pdfUrl}
              download
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-electric to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 hover:shadow-cyan-glow transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>تحميل المذكرة</span>
            </a>
          ) : (
            <div className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" />
              <span>التحميل للمشتركين</span>
            </div>
          )}
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

        {/* Embedded Iframe / Object with zoom scaling */}
        <div
          className="w-full h-full rounded-2xl overflow-hidden bg-white shadow-2xl transition-transform duration-200 origin-top"
          style={{
            transform: isFitWidth ? 'none' : `scale(${zoom / 100})`,
            width: isFitWidth ? '100%' : `${zoom}%`,
            minHeight: '100%',
          }}
        >
          <iframe
            src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1`}
            className="w-full h-full min-h-[500px] border-0"
            title={title}
          />
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-slate-900/90 border-t border-slate-800 px-4 py-2 flex items-center justify-between text-[11px] text-chalk-muted">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>محتوى تعليمي محمي ومخصص لـ: <strong className="text-chalk">{studentName}</strong></span>
        </div>
        <a
          href={pdfUrl}
          target="_blank"
          rel="noreferrer"
          className="text-cyan-electric hover:underline flex items-center gap-1 font-semibold"
        >
          <span>فتح في نافذة مستقلة</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
