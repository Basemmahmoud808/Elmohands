'use client';

import React from 'react';
import { X, PlayCircle, ShieldCheck } from 'lucide-react';
import { parseMediaUrlHelper } from '@/lib/utils';
import { LessonPdfViewer } from '@/components/lessons/LessonPdfViewer';

interface MediaPreviewModalProps {
  media: {
    type: 'video' | 'pdf' | 'exam';
    title: string;
    url: string;
    fileType?: string;
  } | null;
  onClose: () => void;
}

export function MediaPreviewModal({ media, onClose }: MediaPreviewModalProps) {
  if (!media) return null;

  const isVideo = media.type === 'video';
  const parsed = isVideo ? parseMediaUrlHelper(media.url) : null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col h-[92vh] max-h-[95vh] animate-in zoom-in-95 duration-200">
        {isVideo ? (
          <>
            {/* Header for Video */}
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/95 backdrop-blur-md shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-cyan-electric/15 flex items-center justify-center text-cyan-electric border border-cyan-electric/25 shrink-0">
                  <PlayCircle className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm sm:text-base font-black text-chalk truncate">
                    {media.title}
                  </h3>
                    <span className="text-[11px] text-cyan-electric font-bold">
                      معاينة فيديو الشرح التفاعلي
                    </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all"
                title="إغلاق المعاينة"
                aria-label="إغلاق المعاينة"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player */}
            <div className="flex-1 overflow-hidden flex items-center justify-center p-4 bg-black/60">
              <div className="w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
                {parsed?.type === 'iframe' ? (
                  <iframe
                    src={parsed.src}
                    title={media.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={parsed?.src}
                    controls
                    autoPlay
                    className="w-full h-full object-contain"
                  >
                    متصفحك لا يدعم تشغيل هذا الفيديو.
                  </video>
                )}
              </div>
            </div>

            {/* Footer for Video */}
            <div className="px-5 py-3 border-t border-slate-800/80 flex items-center justify-between bg-slate-900/90 shrink-0 text-xs">
              <div className="text-[11px] text-chalk-muted flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>مشغل فيديو منصة المهندس التفاعلي</span>
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-all"
              >
                إغلاق النافذة
              </button>
            </div>
          </>
        ) : (
          /* Single unified LessonPdfViewer: no duplicate header, seamless integration */
          <div className="w-full h-full flex-1 flex flex-col overflow-hidden">
            <LessonPdfViewer
              pdfUrl={media.url}
              title={media.title}
              studentName="إدارة منصة المهندس"
              studentPhone="م/ رضا خيرت"
              allowDownload={false}
              onClose={onClose}
            />
          </div>
        )}
      </div>
    </div>
  );
}
