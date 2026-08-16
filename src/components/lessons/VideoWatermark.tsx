'use client';

import React, { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';

interface VideoWatermarkProps {
  studentName?: string;
  studentPhone?: string;
  customText?: string;
  intervalMs?: number;
}

export function VideoWatermark({
  studentName = 'طالب منصة المهندس',
  studentPhone = '',
  customText = 'منصة المهندس • م/ رضا خيرت',
  intervalMs = 6000,
}: VideoWatermarkProps) {
  // Random coordinates for moving watermark (clamped between 8% and 75% so it's always visible and not clipped)
  const [coords, setCoords] = useState<{ top: number; right: number }>({ top: 15, right: 15 });
  const [opacity, setOpacity] = useState<number>(0.75);

  useEffect(() => {
    const updatePosition = () => {
      const randomTop = Math.floor(Math.random() * 65) + 10;
      const randomRight = Math.floor(Math.random() * 65) + 10;
      const randomOpacity = Math.random() * 0.3 + 0.55; // 0.55 to 0.85
      setCoords({ top: randomTop, right: randomRight });
      setOpacity(randomOpacity);
    };

    const timer = setInterval(updatePosition, intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return (
    <div
      className="absolute pointer-events-none select-none z-30 transition-all duration-1000 ease-in-out px-3 py-1.5 rounded-xl bg-black/65 backdrop-blur-md border border-cyan-electric/30 text-cyan-electric text-[11px] sm:text-xs font-mono font-bold shadow-lg shadow-cyan-electric/10 flex items-center gap-1.5 max-w-[90%]"
      style={{
        top: `${coords.top}%`,
        right: `${coords.right}%`,
        opacity,
      }}
    >
      <Shield className="w-3.5 h-3.5 text-cyan-electric shrink-0" />
      <span className="truncate">{studentName}</span>
      {studentPhone && (
        <>
          <span className="text-chalk-muted">•</span>
          <span className="shrink-0">{studentPhone}</span>
        </>
      )}
      <span className="text-chalk-muted hidden sm:inline">•</span>
      <span className="text-chalk-muted text-[10px] hidden sm:inline truncate">{customText}</span>
    </div>
  );
}
