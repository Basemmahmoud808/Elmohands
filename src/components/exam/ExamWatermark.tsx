'use client';

import React, { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';

interface ExamWatermarkProps {
  studentName?: string;
  studentPhone?: string;
  customText?: string;
  intervalMs?: number;
}

export function ExamWatermark({
  studentName = 'طالب منصة المهندس',
  studentPhone = '',
  customText = 'منصة المهندس • م/ رضا خيرت',
  intervalMs = 8000,
}: ExamWatermarkProps) {
  const [coords, setCoords] = useState<{ top: number; right: number }>({ top: 20, right: 20 });
  const [opacity, setOpacity] = useState<number>(0.65);

  useEffect(() => {
    const updatePosition = () => {
      const randomTop = Math.floor(Math.random() * 70) + 10;
      const randomRight = Math.floor(Math.random() * 70) + 10;
      const randomOpacity = Math.random() * 0.3 + 0.5; // 0.5 to 0.8
      setCoords({ top: randomTop, right: randomRight });
      setOpacity(randomOpacity);
    };

    const timer = setInterval(updatePosition, intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return (
    <div
      className="fixed pointer-events-none select-none z-50 transition-all duration-1000 ease-in-out px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-sm border border-cyan-electric/25 text-cyan-electric text-[11px] sm:text-xs font-mono font-bold shadow-lg shadow-cyan-electric/10 flex items-center gap-1.5"
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
