'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RotateCcw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Next.js App Error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 font-arabic text-center">
      <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-black">حدث تنبيه طفيف في النظام</h2>
          <p className="text-xs text-slate-400">يرجى الضغط على زر إعادة المحاولة لاستعادة الصفحة فوراً</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => reset()}
            className="flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-cyan-400 text-black hover:bg-cyan-300 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>إعادة المحاولة</span>
          </button>
          <Link
            href="/"
            className="flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-slate-800 text-slate-200 hover:bg-slate-700 transition-all flex items-center justify-center"
          >
            الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
