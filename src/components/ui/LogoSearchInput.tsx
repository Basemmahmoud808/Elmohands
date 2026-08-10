'use client';

import React, { useState } from 'react';
import { Search, GraduationCap, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoSearchInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClear?: () => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  size?: 'sm' | 'md' | 'lg';
  autoFocus?: boolean;
}

export function LogoSearchIcon({ className = 'w-9 h-9', iconSize = 'w-4 h-4' }: { className?: string; iconSize?: string }) {
  return (
    <div className={cn(
      'relative shrink-0 rounded-xl bg-gradient-to-br from-cyan-electric via-cyan-400 to-blue-ink p-0.5 shadow-cyan-glow group-hover:scale-105 transition-all duration-200 flex items-center justify-center',
      className
    )}>
      <div className="w-full h-full rounded-[10px] bg-slate-950/90 dark:bg-black/90 flex items-center justify-center relative overflow-hidden">
        {/* Main Logo GraduationCap */}
        <GraduationCap className={cn('text-cyan-electric font-black transition-transform group-hover:rotate-12 duration-300', iconSize)} />
        {/* Micro Search Magnifying Glass Badge */}
        <div className="absolute -bottom-0.5 -left-0.5 w-4 h-4 rounded-full bg-cyan-electric text-black flex items-center justify-center border border-slate-950 shadow-sm">
          <Search className="w-2.5 h-2.5 stroke-[3]" />
        </div>
      </div>
    </div>
  );
}

export function LogoSearchInput({
  value,
  onChange,
  onClear,
  placeholder = 'بحث في دروس ومواضيع المنصة...',
  className,
  inputClassName,
  size = 'md',
  autoFocus = false,
}: LogoSearchInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    if (onClear) {
      onClear();
    } else {
      const event = {
        target: { value: '' },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(event);
    }
  };

  const heightClasses = {
    sm: 'h-10 py-1.5 text-xs',
    md: 'h-12 py-2 text-sm',
    lg: 'h-14 py-3 text-base',
  };

  const iconSizes = {
    sm: { box: 'w-7 h-7', icon: 'w-3.5 h-3.5' },
    md: { box: 'w-8 h-8', icon: 'w-4 h-4' },
    lg: { box: 'w-10 h-10', icon: 'w-5 h-5' },
  };

  return (
    <div
      className={cn(
        'relative group flex items-center rounded-2xl transition-all duration-300',
        'bg-slate-100/90 dark:bg-slate-900/90 border border-slate-300 dark:border-slate-800',
        isFocused ? 'border-cyan-electric shadow-cyan-glow ring-2 ring-cyan-electric/20 bg-white dark:bg-slate-950' : 'hover:border-cyan-electric/50',
        className
      )}
    >
      {/* Website Logo + Search Badge Icon */}
      <div className="pr-3 pl-2 flex items-center pointer-events-none">
        <LogoSearchIcon className={iconSizes[size].box} iconSize={iconSizes[size].icon} />
      </div>

      {/* Input Field */}
      <input
        type="text"
        value={value}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={cn(
          'w-full bg-transparent text-slate-900 dark:text-chalk placeholder-slate-400 dark:placeholder-chalk-muted font-bold outline-none pr-1 pl-3',
          heightClasses[size],
          inputClassName
        )}
      />

      {/* Clear Button */}
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="pl-3 pr-2 text-slate-400 hover:text-cyan-electric transition-colors focus:outline-none"
          title="مسح البحث"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
