'use client';

import React from 'react';
import { UploadCloud, CheckCircle2 } from 'lucide-react';

interface UploadProgressBarProps {
  progress: number; // 0 to 100
  label: string;
}

export function UploadProgressBar({ progress, label }: UploadProgressBarProps) {
  const isComplete = progress >= 100;

  return (
    <div className="p-4 rounded-2xl bg-slate-900 border border-cyan-electric/30 shadow-lg space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex items-center justify-between text-xs font-bold">
        <div className="flex items-center gap-2 text-cyan-electric">
          <UploadCloud className="w-4 h-4 animate-bounce" />
          <span>{label}</span>
        </div>
        <span className="font-mono text-chalk font-black">{progress}%</span>
      </div>

      <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden p-0.5 border border-slate-700">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isComplete
              ? 'bg-emerald-500 shadow-emerald-glow'
              : 'bg-gradient-to-r from-cyan-electric to-blue-ink shadow-cyan-glow'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400">
        <span>جاري المعالجة والرفع إلى سحابة التخزين الآمنة...</span>
        {isComplete && (
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>اكتمل الرفع بنجاح!</span>
          </span>
        )}
      </div>
    </div>
  );
}
