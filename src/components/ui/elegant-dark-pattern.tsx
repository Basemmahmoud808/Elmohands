import type React from 'react';

interface DarkGradientBgProps {
  children?: React.ReactNode;
  className?: string;
}

export function DarkGradientBg({ children, className = '' }: DarkGradientBgProps) {
  return (
    <div className={`min-h-screen w-full bg-slate-50 dark:bg-black text-slate-900 dark:text-chalk transition-colors duration-200 ${className}`}>
      {children}
    </div>
  );
}
