import type React from 'react';
import { cn } from '@/lib/utils';

interface DarkGradientBgProps {
  children?: React.ReactNode;
  className?: string;
}

export function DarkGradientBg({ children, className }: DarkGradientBgProps) {
  return (
    <div className={cn('relative min-h-screen w-full bg-blackboard text-chalk overflow-hidden', className)}>
      {/* Background Gradient & Streaks */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-100"
          style={{
            background: 'radial-gradient(100% 100% at 0% 0%, rgb(46, 66, 56) 0%, rgb(24, 36, 30) 100%)',
            maskImage: 'radial-gradient(125% 100% at 0% 0%, rgb(0, 0, 0) 0%, rgba(0, 0, 0, 0.3) 88%, rgba(0, 0, 0, 0) 100%)',
            WebkitMaskImage: 'radial-gradient(125% 100% at 0% 0%, rgb(0, 0, 0) 0%, rgba(0, 0, 0, 0.3) 88%, rgba(0, 0, 0, 0) 100%)',
          }}
        >
          {/* Skewed fading streaks (Brass Compass & Ink Blue) */}
          <div
            className="absolute inset-0 opacity-25"
            style={{
              background: 'linear-gradient(rgb(173, 138, 78) 0%, rgba(31, 58, 95, 0) 100%)',
              maskImage: 'linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 20%, rgba(0, 0, 0, 0) 36%, rgb(0, 0, 0) 55%, rgba(0, 0, 0, 0.13) 67%, rgb(0, 0, 0) 78%, rgba(0, 0, 0, 0) 97%)',
              WebkitMaskImage: 'linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 20%, rgba(0, 0, 0, 0) 36%, rgb(0, 0, 0) 55%, rgba(0, 0, 0, 0.13) 67%, rgb(0, 0, 0) 78%, rgba(0, 0, 0, 0) 97%)',
              transform: 'skewX(45deg)',
            }}
          />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background: 'linear-gradient(rgb(31, 58, 95) 0%, rgba(173, 138, 78, 0) 100%)',
              maskImage: 'linear-gradient(90deg, rgba(0, 0, 0, 0) 11%, rgb(0, 0, 0) 25%, rgba(0, 0, 0, 0.55) 41%, rgba(0, 0, 0, 0.13) 67%, rgb(0, 0, 0) 78%, rgba(0, 0, 0, 0) 97%)',
              WebkitMaskImage: 'linear-gradient(90deg, rgba(0, 0, 0, 0) 11%, rgb(0, 0, 0) 25%, rgba(0, 0, 0, 0.55) 41%, rgba(0, 0, 0, 0.13) 67%, rgb(0, 0, 0) 78%, rgba(0, 0, 0, 0) 97%)',
              transform: 'skewX(45deg)',
            }}
          />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background: 'linear-gradient(rgb(173, 138, 78) 0%, rgba(31, 58, 95, 0) 100%)',
              maskImage: 'linear-gradient(90deg, rgba(0, 0, 0, 0) 9%, rgb(0, 0, 0) 20%, rgba(0, 0, 0, 0.55) 28%, rgba(0, 0, 0, 0.424) 40%, rgb(0, 0, 0) 48%, rgba(0, 0, 0, 0.267) 54%, rgba(0, 0, 0, 0.13) 78%, rgb(0, 0, 0) 88%, rgba(0, 0, 0, 0) 97%)',
              WebkitMaskImage: 'linear-gradient(90deg, rgba(0, 0, 0, 0) 9%, rgb(0, 0, 0) 20%, rgba(0, 0, 0, 0.55) 28%, rgba(0, 0, 0, 0.424) 40%, rgb(0, 0, 0) 48%, rgba(0, 0, 0, 0.267) 54%, rgba(0, 0, 0, 0.13) 78%, rgb(0, 0, 0) 88%, rgba(0, 0, 0, 0) 97%)',
              transform: 'skewX(45deg)',
            }}
          />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background: 'linear-gradient(rgb(31, 58, 95) 0%, rgba(173, 138, 78, 0) 100%)',
              maskImage: 'linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 17%, rgba(0, 0, 0, 0.55) 26%, rgb(0, 0, 0) 35%, rgba(0, 0, 0, 0) 47%, rgba(0, 0, 0, 0.13) 69%, rgb(0, 0, 0) 79%, rgba(0, 0, 0, 0) 97%)',
              WebkitMaskImage: 'linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 17%, rgba(0, 0, 0, 0.55) 26%, rgb(0, 0, 0) 35%, rgba(0, 0, 0, 0) 47%, rgba(0, 0, 0, 0.13) 69%, rgb(0, 0, 0) 79%, rgba(0, 0, 0, 0) 97%)',
              transform: 'skewX(45deg)',
            }}
          />
        </div>
      </div>

      {/* Subtle dot pattern overlay */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(231,226,211,0.4) 1px, transparent 0)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* Subtle radial highlight */}
      <div className="absolute inset-0 bg-gradient-radial from-brass-compass/10 via-transparent to-transparent pointer-events-none" />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
