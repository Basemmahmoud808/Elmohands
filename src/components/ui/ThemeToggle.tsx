'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
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

  const currentTheme = theme === 'system' ? resolvedTheme : theme;
  const isDark = currentTheme === 'dark';

  const handleToggle = () => {
    const nextTheme = isDark ? 'light' : 'dark';
    setTheme(nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="p-2.5 rounded-xl border border-slate-300 dark:border-cyan-electric/30 bg-slate-100 dark:bg-slate-900/80 text-slate-800 dark:text-cyan-electric hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors shadow-sm flex items-center justify-center cursor-pointer"
      aria-label="تغيير الوضع الداكن/الفاتح"
      title={isDark ? 'التحويل للوضع الفاتح' : 'التحويل للوضع الداكن'}
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-amber-400" />
      ) : (
        <Moon className="w-5 h-5 text-indigo-600" />
      )}
    </button>
  );
}
