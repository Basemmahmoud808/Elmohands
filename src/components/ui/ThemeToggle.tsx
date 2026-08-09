'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        type="button"
        className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 opacity-60 cursor-not-allowed"
        aria-label="تغيير الوضع"
      >
        <div className="w-5 h-5" />
      </button>
    );
  }

  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="p-2.5 rounded-xl border border-slate-300 dark:border-cyan-electric/30 bg-slate-100 dark:bg-slate-900/80 text-slate-800 dark:text-cyan-electric hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors shadow-sm hover:shadow-cyan-glow flex items-center justify-center cursor-pointer"
      aria-label="تغيير الوضع الداكن/الفاتح"
      title={isDark ? 'التحويل للوضع الفاتح' : 'التحويل للوضع الداكن'}
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
      ) : (
        <Moon className="w-5 h-5 text-indigo-600 group-hover:-rotate-12 transition-transform duration-300" />
      )}
    </button>
  );
}
