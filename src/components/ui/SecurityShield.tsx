'use client';

import React, { useEffect, useState } from 'react';
import { ShieldAlert, X } from 'lucide-react';

export function SecurityShield() {
  const [showDevToolsWarning, setShowDevToolsWarning] = useState(false);

  useEffect(() => {
    // 1. Disable Right Click Context Menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // 2. Prevent Developer Tools & Screenshot Key Combinations
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const ctrlKey = isMac ? e.metaKey : e.ctrlKey;

      // F12
      if (e.key === 'F12') {
        e.preventDefault();
        setShowDevToolsWarning(true);
        return;
      }

      // Ctrl+Shift+I / J / C (DevTools)
      if (
        ctrlKey &&
        e.shiftKey &&
        (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')
      ) {
        e.preventDefault();
        setShowDevToolsWarning(true);
        return;
      }

      // Ctrl+U (View Source)
      if (ctrlKey && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        return;
      }

      // Ctrl+S / Ctrl+P (Save / Print)
      if (ctrlKey && (e.key === 's' || e.key === 'S' || e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        return;
      }

      // PrintScreen Key
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText('محتوى محمي - منصة المهندس م/ رضا خيرت');
        }
      }
    };

    // 3. Image Dragging Prevention
    const handleDragStart = (e: DragEvent) => {
      if ((e.target as HTMLElement).tagName === 'IMG') {
        e.preventDefault();
      }
    };

    // 4. DevTools Open Detection Heuristic
    const devToolsCheck = setInterval(() => {
      const threshold = 160;
      const widthDiff = window.outerWidth - window.innerWidth > threshold;
      const heightDiff = window.outerHeight - window.innerHeight > threshold;
      if (widthDiff || heightDiff) {
        setShowDevToolsWarning(true);
      }
    }, 4000);

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('dragstart', handleDragStart);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('dragstart', handleDragStart);
      clearInterval(devToolsCheck);
    };
  }, []);

  return (
    <>
      {/* DevTools Warning Banner */}
      {showDevToolsWarning && (
        <div className="fixed bottom-4 left-4 z-[999] max-w-sm p-4 rounded-2xl bg-slate-900/95 border border-red-500/40 text-chalk shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5 font-arabic text-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-400 font-black">
              <ShieldAlert className="w-4 h-4" />
              <span>تنبيه أمان المحتوى</span>
            </div>
            <button
              onClick={() => setShowDevToolsWarning(false)}
              className="text-slate-400 hover:text-chalk p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-slate-300 leading-relaxed font-semibold">
            جميع المواد التعليمية والامتحانات في منصة المهندس محمية بحقوق النشر. يرجى إغلاق أدوات المطورين لمتابعة التصفح بأمان.
          </p>
        </div>
      )}

      {/* Global CSS Anti-Copy Shield & Video Protection */}
      <style jsx global>{`
        body {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
        img {
          -webkit-user-drag: none;
          -khtml-user-drag: none;
          -moz-user-drag: none;
          -o-user-drag: none;
          pointer-events: auto;
        }
        video {
          -webkit-touch-callout: none;
          -webkit-user-select: none;
          -khtml-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
      `}</style>
    </>
  );
}
