'use client';

import React, { useState, useEffect } from 'react';

interface ExamWatermarkProps {
  studentName?: string;
  studentPhone?: string;
  customText?: string;
  intervalMs?: number;
}

export function ExamWatermark({
  studentName = 'طالب منصة المهندس',
  studentPhone = '',
  customText = 'امتحان مؤمّن',
  intervalMs = 18000,
}: ExamWatermarkProps) {
  const [coords, setCoords] = useState<{ top: number; right: number }>({ top: 20, right: 20 });
  const [opacity, setOpacity] = useState<number>(0.20);

  useEffect(() => {
    const updatePosition = () => {
      const randomTop = Math.floor(Math.random() * 70) + 10;
      const randomRight = Math.floor(Math.random() * 70) + 10;
      const randomOpacity = Math.random() * 0.10 + 0.16; // Subtle: 0.16 to 0.26
      setCoords({ top: randomTop, right: randomRight });
      setOpacity(randomOpacity);
    };

    const timer = setInterval(updatePosition, intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return (
    <div
      className="fixed pointer-events-none select-none z-50 transition-all duration-1000 ease-in-out px-2.5 py-1 rounded-lg bg-black/20 backdrop-blur-[1px] border border-white/5 text-slate-300/45 text-[10px] sm:text-[11px] font-mono font-medium tracking-wide flex items-center gap-1.5"
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
