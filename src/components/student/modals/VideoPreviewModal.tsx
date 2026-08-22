'use client';

import React from 'react';
import { X, PlayCircle } from 'lucide-react';

import { parseMediaUrlHelper } from '@/lib/utils';

interface VideoPreviewModalProps {
  video: { title: string; url: string } | null;
  onClose: () => void;
}

export function VideoPreviewModal({ video, onClose }: VideoPreviewModalProps) {
  if (!video) return null;

  const parsed = parseMediaUrlHelper(video.url);

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
              <p className="text-xs text-cyan-electric font-bold">
                مشغل الفيديو التفاعلي لمنصة المهندس
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

        {/* Video Player Area */}
        <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
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
              src={parsed.src}
              controls
              autoPlay
              className="w-full h-full object-contain"
            >
              متصفحك لا يدعم تشغيل هذا الفيديو.
            </video>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/80">
          <span className="text-xs font-semibold text-slate-500 dark:text-chalk-muted">
            ملاحظة: يمكنك فتح المشغل الكامل للدرس مع المذكرات وشات الأسئلة 
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-chalk-muted hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
