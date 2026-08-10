'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import { checkActiveSessionStatus, logoutUser } from '@/lib/actions/auth';

export function SecurityShield() {
  const router = useRouter();
  const [sessionLockTerminated, setSessionLockTerminated] = useState<string | null>(null);

  // 1. Real-time Heartbeat Polling to prevent account sharing
  useEffect(() => {
    const checkInterval = setInterval(async () => {
      const status = await checkActiveSessionStatus();
      if (!status.valid && status.reason) {
        setSessionLockTerminated(status.reason);
        await logoutUser();
        setTimeout(() => {
          window.location.href = '/sign-in';
        }, 3000);
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(checkInterval);
  }, [router]);

  // 2. Event Protections (Silent protection without warning toasts)
  useEffect(() => {
    // Disable Right Click Context Menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // Prevent Developer Tools & Screenshot Key Combinations
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const ctrlKey = isMac ? e.metaKey : e.ctrlKey;

      // F12
      if (e.key === 'F12') {
        e.preventDefault();
        return;
      }

      // Ctrl+Shift+I / J / C (DevTools)
      if (ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) {
        e.preventDefault();
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

    // Image Dragging Prevention
    const handleDragStart = (e: DragEvent) => {
      if ((e.target as HTMLElement).tagName === 'IMG') {
        e.preventDefault();
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('dragstart', handleDragStart);

    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('dragstart', handleDragStart);
    };
  }, []);

  return (
    <>
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

      {/* Account Session Terminated Modal */}
      {sessionLockTerminated && (
        <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center space-y-4 text-chalk animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-3xl bg-red-500/20 border-2 border-red-500/50 flex items-center justify-center text-red-500 shadow-lg animate-pulse">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-red-400">تنبيه أمان منصة المهندس 🛡️</h2>
          <p className="text-sm font-bold text-slate-300 max-w-md leading-relaxed">
            {sessionLockTerminated}
          </p>
          <div className="pt-2 text-xs font-mono text-cyan-electric animate-pulse">
            جاري توجيهك لصفحة الدخول خلال 3 ثواني...
          </div>
        </div>
      )}
    </>
  );
}
