'use client';

import React, { useState, useEffect } from 'react';

interface VideoWatermarkProps {
  studentName?: string;
  studentPhone?: string;
  customText?: string;
  intervalMs?: number;
}

export function VideoWatermark({
  studentName = 'طالب منصة المهندس',
  studentPhone = '',
  customText = 'منصة المهندس',
  intervalMs = 16000,
}: VideoWatermarkProps) {
  // Random coordinates for moving watermark (clamped between 8% and 75% so it stays within frame)
  const [coords, setCoords] = useState<{ top: number; right: number }>({ top: 15, right: 15 });
  const [opacity, setOpacity] = useState<number>(0.22);

  useEffect(() => {
    const updatePosition = () => {
      const randomTop = Math.floor(Math.random() * 65) + 10;
      const randomRight = Math.floor(Math.random() * 65) + 10;
      const randomOpacity = Math.random() * 0.12 + 0.18; // Subtle: 0.18 to 0.30
      setCoords({ top: randomTop, right: randomRight });
      setOpacity(randomOpacity);
    };

    const timer = setInterval(updatePosition, intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return (
    <div
      className="absolute pointer-events-none select-none z-30 transition-all duration-1000 ease-in-out px-2.5 py-1 rounded-lg bg-black/25 backdrop-blur-[1px] border border-white/5 text-white/50 text-[10px] sm:text-[11px] font-mono font-medium tracking-wide flex items-center gap-1.5 max-w-[90%]"
      style={{
        top: `${coords.top}%`,
        right: `${coords.right}%`,
        opacity,
      }}
    >
      <span className="truncate">{studentName}</span>
      {studentPhone && (
        <>
          <span className="opacity-40">•</span>
          <span className="shrink-0">{studentPhone}</span>
        </>
      )}
      <span className="opacity-40 hidden sm:inline">•</span>
      <span className="text-[9px] opacity-60 hidden sm:inline truncate">{customText}</span>
    </div>
  );
}
