'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 font-arabic text-center">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
          <h2 className="text-xl font-bold">حدث خطأ عام غير متوقع</h2>
          <button
            onClick={() => reset()}
            className="w-full py-3 px-4 rounded-xl text-xs font-bold bg-cyan-400 text-black hover:bg-cyan-300 transition-all"
          >
            تحديث وإعادة التجميع
          </button>
        </div>
      </body>
    </html>
  );
}
