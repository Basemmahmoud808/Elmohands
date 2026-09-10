'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  ChevronsRight,
  ChevronsLeft,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize,
  Minimize,
  FileText,
  X,
  Loader2,
  CheckCircle2,
  Expand,
  AlertCircle,
} from 'lucide-react';
import { toggleLessonCompletedAction } from '@/lib/actions/progress';
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist';

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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<RenderTask | null>(null);

  // Document state
  const [pdfDoc, setPdfDoc] = useState<PDFDocumentProxy | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageInput, setPageInput] = useState<string>('1');

  // Display & Zoom state
  const [scale, setScale] = useState<number>(1.25);
  const [rotation, setRotation] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Loading & status
  const [secureUrl, setSecureUrl] = useState<string | null>(null);
  const [loadingDoc, setLoadingDoc] = useState<boolean>(true);
  const [renderingPage, setRenderingPage] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fallbackMode, setFallbackMode] = useState<boolean>(false);

  // Progress state
  const [isCompletedState, setIsCompletedState] = useState(initialCompleted);
  const [markingComplete, setMarkingComplete] = useState(false);

  // Touch swipe support
  const touchStartXRef = useRef<number | null>(null);

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

  // 1. Fetch signed URL if needed
  useEffect(() => {
    let cancelled = false;
    setLoadingDoc(true);
    setErrorMsg(null);
    setPdfDoc(null);
    setCurrentPage(1);
    setPageInput('1');

    async function resolveUrl() {
      try {
        if (!pdfUrl) {
          setErrorMsg('لم يتم توفير رابط ملف الـ PDF');
          setLoadingDoc(false);
          return;
        }

        if (isBlobUrl || !pdfUrl.includes('supabase.co/storage') || pdfUrl.includes('/object/sign/')) {
          if (!cancelled) setSecureUrl(pdfUrl);
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
      }
    }

    resolveUrl();
    return () => {
      cancelled = true;
    };
  }, [pdfUrl, isBlobUrl]);

  // 2. Load PDF Document via pdfjs-dist
  useEffect(() => {
    if (!secureUrl || isBlobUrl) return;

    let cancelled = false;
    let loadingTask: any = null;

    const targetUrl = secureUrl;
    async function loadPdf() {
      setLoadingDoc(true);
      setErrorMsg(null);

      try {
        const pdfjsLib = await import('pdfjs-dist');
        // Point to local worker copied into /public
        pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

        loadingTask = pdfjsLib.getDocument({
          url: targetUrl,
          withCredentials: false,
          cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
          cMapPacked: true,
        });

        const doc = await loadingTask.promise;
        if (!cancelled) {
          setPdfDoc(doc);
          setNumPages(doc.numPages);
          setCurrentPage(1);
          setPageInput('1');
          setLoadingDoc(false);
        }
      } catch (err: any) {
        if (cancelled) return;
        console.error('PDF.js loading error:', err);
        setErrorMsg('تعذر تحميل المستند مباشرة عبر محرك العرض السريع.');
        setLoadingDoc(false);
      }
    }

    loadPdf();

    return () => {
      cancelled = true;
      if (loadingTask) {
        try {
          loadingTask.destroy();
        } catch {
          // ignore
        }
      }
    };
  }, [secureUrl, isBlobUrl]);

  // 3. Render Current Page onto Canvas
  const renderPage = useCallback(
    async (pageNumber: number) => {
      if (!pdfDoc || !canvasRef.current) return;

      // Cancel ongoing render task to avoid collision
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // ignore
        }
      }

      setRenderingPage(true);

      try {
        const page = await pdfDoc.getPage(pageNumber);
        const canvas = canvasRef.current;
        if (!canvas) return;

        const viewport = page.getViewport({ scale, rotation });
        const pixelRatio = typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 2) : 1;

        canvas.width = Math.floor(viewport.width * pixelRatio);
        canvas.height = Math.floor(viewport.height * pixelRatio);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

        const renderContext = {
          canvasContext: ctx,
          viewport: viewport,
        };

        const task = page.render(renderContext);
        renderTaskRef.current = task;

        await task.promise;
        renderTaskRef.current = null;

        // Stamp secondary watermark directly onto canvas pixels for anti-tamper
        try {
          ctx.save();
          ctx.font = 'bold 14px sans-serif';
          ctx.fillStyle = 'rgba(6, 182, 212, 0.08)';
          ctx.textAlign = 'center';
          const watermarkText = `${studentName} • ${studentPhone} • م/ رضا خيرت`;
          const stepY = viewport.height / 5;
          for (let y = stepY; y < viewport.height; y += stepY) {
            ctx.fillText(watermarkText, viewport.width / 2, y);
          }
          ctx.restore();
        } catch {
          // watermark canvas draw is best-effort
        }

        setRenderingPage(false);
      } catch (err: any) {
        if (err?.name !== 'RenderingCancelledException') {
          console.error('Error rendering page:', err);
          setRenderingPage(false);
        }
      }
    },
    [pdfDoc, scale, rotation, studentName, studentPhone]
  );

  useEffect(() => {
    if (pdfDoc && currentPage >= 1 && currentPage <= numPages) {
      renderPage(currentPage);
    }
  }, [pdfDoc, currentPage, scale, rotation, renderPage, numPages]);

  // Page Navigation Handlers
  const goToPage = (p: number) => {
    const target = Math.max(1, Math.min(numPages, p));
    setCurrentPage(target);
    setPageInput(String(target));
  };

  const handleNextPage = () => {
    if (currentPage < numPages) {
      goToPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const handleFirstPage = () => goToPage(1);
  const handleLastPage = () => goToPage(numPages);

  const handlePageInputSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(pageInput, 10);
    if (!isNaN(val)) {
      goToPage(val);
    } else {
      setPageInput(String(currentPage));
    }
  };

  // Zoom handlers
  const handleZoomIn = () => setScale((s) => Math.min(2.5, +(s + 0.2).toFixed(2)));
  const handleZoomOut = () => setScale((s) => Math.max(0.6, +(s - 0.2).toFixed(2)));
  const handleResetZoom = () => setScale(1.0);

  // Fit Width handler
  const handleFitWidth = () => {
    if (!containerRef.current || !pdfDoc) return;
    pdfDoc.getPage(currentPage).then((page) => {
      const unscaled = page.getViewport({ scale: 1, rotation });
      const availableWidth = containerRef.current!.clientWidth - 48; // padding
      if (unscaled.width > 0) {
        const computed = +(availableWidth / unscaled.width).toFixed(2);
        setScale(Math.max(0.6, Math.min(2.5, computed)));
      }
    });
  };

  const handleRotate = () => {
    setRotation((r) => (r + 90) % 360);
  };

  // Fullscreen
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

  // Keyboard navigation (Arrow keys)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        alert('طباعة المحتوى محظورة لحماية حقوق النشر الخاصة بـ م/ رضا خيرت.');
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        alert('حفظ المحتوى محظور لحماية حقوق النشر الخاصة بـ م/ رضا خيرت.');
        return;
      }

      // Page Navigation with keyboard
      if (document.activeElement?.tagName === 'INPUT') return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        handleNextPage();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        handlePrevPage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, numPages]);

  // Touch Swipe for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartXRef.current = e.touches[0].clientX;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;
    // In RTL, swipe left (positive diff) -> next page; swipe right (negative diff) -> prev page
    if (diff > 60) {
      handleNextPage();
    } else if (diff < -60) {
      handlePrevPage();
    }
    touchStartXRef.current = null;
  };

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
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-cyan-600 dark:text-cyan-electric font-bold">
                عرض فوري عالي السرعة
              </span>
              {numPages > 0 && (
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                  ({numPages} صفحة)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center: Page Controls */}
        {numPages > 0 && (
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/90 rounded-xl p-1 border border-slate-200 dark:border-slate-700 gap-1 order-last sm:order-none mx-auto sm:mx-0">
            {/* First Page */}
            <button
              onClick={handleFirstPage}
              disabled={currentPage <= 1}
              className="p-1 rounded-lg text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-electric hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="الصفحة الأولى"
            >
              <ChevronsRight className="w-3.5 h-3.5" />
            </button>

            {/* Prev Page */}
            <button
              onClick={handlePrevPage}
              disabled={currentPage <= 1}
              className="px-2 py-1 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-cyan-600 dark:hover:text-cyan-electric hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1 transition-colors"
              title="الصفحة السابقة (سهم يسار)"
            >
              <ChevronRight className="w-3.5 h-3.5" />
              <span className="hidden md:inline">السابق</span>
            </button>

            {/* Page Jump Form */}
            <form onSubmit={handlePageInputSubmit} className="flex items-center gap-1 px-1">
              <input
                type="number"
                min={1}
                max={numPages}
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                onBlur={() => setPageInput(String(currentPage))}
                className="w-10 text-center text-xs font-black bg-white dark:bg-slate-900 text-slate-900 dark:text-chalk border border-slate-300 dark:border-slate-600 rounded-lg py-0.5 focus:outline-none focus:ring-1 focus:ring-cyan-electric"
              />
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">من {numPages}</span>
            </form>

            {/* Next Page */}
            <button
              onClick={handleNextPage}
              disabled={currentPage >= numPages}
              className="px-2 py-1 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-cyan-600 dark:hover:text-cyan-electric hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1 transition-colors"
              title="الصفحة التالية (سهم يمين)"
            >
              <span className="hidden md:inline">التالي</span>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            {/* Last Page */}
            <button
              onClick={handleLastPage}
              disabled={currentPage >= numPages}
              className="p-1 rounded-lg text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-electric hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
              title="الصفحة الأخيرة"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Right Tools: Zoom, Rotate, Complete, Fullscreen */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* Zoom controls */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/90 rounded-xl p-0.5 border border-slate-200 dark:border-slate-700">
            <button
              onClick={handleZoomOut}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-electric hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="تصغير (-20%)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="text-[11px] font-mono px-2 text-slate-700 dark:text-slate-300 font-bold hover:text-cyan-electric transition-colors"
              title="إعادة ضبط (100%)"
            >
              {Math.round(scale * 100)}%
            </button>
            <button
              onClick={handleZoomIn}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-electric hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              title="تكبير (+20%)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleFitWidth}
              className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border-r border-slate-200 dark:border-slate-700 hidden sm:block"
              title="ملاءمة العرض"
            >
              <Expand className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Rotate button */}
          <button
            onClick={handleRotate}
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-electric hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors"
            title="تدوير الصفحة (90 درجة)"
          >
            <RotateCw className="w-4 h-4" />
          </button>

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
      <div
        className="flex-1 relative overflow-auto bg-slate-100/90 dark:bg-slate-900/90 flex flex-col items-center justify-start p-3 sm:p-6 min-h-0 touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Blob URL Alert */}
        {isBlobUrl && (
          <div className="m-auto text-center space-y-3 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-amber-500/30 shadow-xl max-w-md">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto text-xl font-bold">
              ⚠️
            </div>
            <h4 className="text-sm font-black text-amber-600 dark:text-amber-400">الملف يحتاج لإعادة الرفع</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              تم حفظ هذا الملف سابقاً كرابط محلي مؤقت انتهت صلاحيته. يرجى إعادة رفع ملف الـ PDF من لوحة تحكم المعلم.
            </p>
          </div>
        )}

        {/* Loading Spinner */}
        {!isBlobUrl && loadingDoc && (
          <div className="m-auto text-center space-y-3 p-6 rounded-2xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl max-w-sm">
            <Loader2 className="w-9 h-9 text-cyan-electric animate-spin mx-auto" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-900 dark:text-chalk">جاري قراءة صفحات المذكرة...</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">العرض فوري عبر محرك الكانفاس المتطور</p>
            </div>
          </div>
        )}

        {/* Error Fallback Box */}
        {!isBlobUrl && !loadingDoc && errorMsg && !fallbackMode && (
          <div className="m-auto text-center space-y-3 p-6 rounded-2xl bg-white dark:bg-slate-900 border border-red-500/30 shadow-xl max-w-md">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
            <h4 className="text-sm font-black text-slate-900 dark:text-chalk">تعذر عرض الملف تلقائياً</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">{errorMsg}</p>
            <button
              onClick={() => setFallbackMode(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-electric text-slate-950 hover:bg-cyan-electric-hover transition-colors"
            >
              التبديل إلى العارض التوافقي البديل
            </button>
          </div>
        )}

        {/* Fallback Mode (iframe) if canvas engine fails */}
        {fallbackMode && secureUrl && (
          <div className="w-full h-full rounded-2xl overflow-hidden bg-white shadow-2xl">
            <iframe
              src={`${secureUrl}#toolbar=0&navpanes=0&scrollbar=1`}
              className="w-full h-full min-h-[500px] border-0"
              title={title}
            />
          </div>
        )}

        {/* Canvas Render Container */}
        {!loadingDoc && !errorMsg && !fallbackMode && (
          <div className="relative inline-block my-auto shadow-2xl rounded-xl overflow-hidden border border-slate-300 dark:border-slate-800 bg-white">
            {/* Page Rendering Overlay Spinner */}
            {renderingPage && (
              <div className="absolute inset-0 z-30 bg-white/60 dark:bg-slate-950/60 backdrop-blur-[1px] flex items-center justify-center transition-opacity">
                <Loader2 className="w-8 h-8 text-cyan-electric animate-spin" />
              </div>
            )}

            {/* Anti-Piracy Floating Watermark Layer */}
            <div
              className="absolute inset-0 pointer-events-none z-20 select-none overflow-hidden flex flex-col justify-around opacity-20 dark:opacity-25"
              aria-hidden="true"
            >
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="w-full flex justify-around text-slate-900 dark:text-cyan-electric text-[11px] sm:text-xs font-mono font-black -rotate-12 tracking-widest whitespace-nowrap"
                >
                  <span>{studentName} • {studentPhone} • م/ رضا خيرت</span>
                  <span className="hidden sm:inline">{studentName} • {studentPhone} • م/ رضا خيرت</span>
                </div>
              ))}
            </div>

            {/* HTML5 Canvas for PDF page */}
            <canvas ref={canvasRef} className="block transition-all duration-150" />
          </div>
        )}
      </div>

      {/* Bottom Page Scrubber Slider & Student Info Footer */}
      <div className="bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800 px-4 py-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-600 dark:text-chalk-muted shrink-0">
        {/* Page Scrubber Slider */}
        {numPages > 1 && (
          <div className="w-full sm:w-1/2 flex items-center gap-3">
            <span className="text-[10px] font-bold text-slate-400 shrink-0">ص 1</span>
            <input
              type="range"
              min={1}
              max={numPages}
              value={currentPage}
              onChange={(e) => goToPage(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 dark:accent-cyan-electric"
              title="التنقل السريع بين الصفحات"
            />
            <span className="text-[10px] font-bold text-slate-400 shrink-0">ص {numPages}</span>
          </div>
        )}

        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 text-[10px] sm:text-[11px]">
          <div className="flex items-center gap-1.5">
            <span>طالب: <strong className="text-slate-900 dark:text-chalk">{studentName}</strong></span>
            {studentPhone && <span className="text-slate-400 font-mono">({studentPhone})</span>}
          </div>
          <span className="text-slate-400 dark:text-slate-500">منصة المهندس التعليمية</span>
        </div>
      </div>
    </div>
  );
}
