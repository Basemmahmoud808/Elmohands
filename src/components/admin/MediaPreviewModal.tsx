'use client';

import React from 'react';
import { X, PlayCircle, FileText, Download } from 'lucide-react';

import { parseMediaUrlHelper } from '@/lib/utils';

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

  const parsed = media.type === 'video' ? parseMediaUrlHelper(media.url) : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-cyan-electric/30 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-electric/15 flex items-center justify-center text-cyan-electric">
              {media.type === 'video' ? (
                <PlayCircle className="w-5 h-5" />
              ) : (
                <FileText className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-chalk truncate max-w-md">
                {media.title}
              </h3>
              <p className="text-xs text-cyan-electric font-bold">
                {media.type === 'video' ? 'معاينة الفيديو المرفوع' : 'معاينة ملف المستند المرفق'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-chalk hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 flex items-center justify-center bg-black/40">
          {media.type === 'video' && parsed ? (
            <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-lg">
              {parsed.type === 'iframe' ? (
                <iframe
                  src={parsed.src}
                  title={media.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              ) : (
                <video
                  src={parsed.src}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                >
                  متصفحك لا يدعم تشغيل هذا الفيديو.
                </video>
              )}
            </div>
          ) : (
            <div className="w-full max-w-lg p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-5">
              <FileText className="w-16 h-16 text-cyan-electric mx-auto" />
              <div className="space-y-1">
                <h4 className="text-lg font-black text-chalk">{media.title}</h4>
                <p className="text-xs text-slate-400">ملف مستند PDF / ورقة امتحان مرفوعة</p>
              </div>

              <a
                href={media.url}
                target="_blank"
                rel="noreferrer"
                download
                className="w-full py-3.5 rounded-2xl text-xs font-black text-black bg-cyan-electric hover:bg-cyan-electric-hover shadow-cyan-glow transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>تحميل وفتح الملف في نافذة جديدة</span>
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end bg-slate-50 dark:bg-slate-950/80">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-chalk-muted hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            إغلاق المعاينة
          </button>
        </div>
      </div>
    </div>
  );
}
