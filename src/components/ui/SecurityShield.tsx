'use client';

import React, { useEffect, useState } from 'react';
import { ShieldAlert } from 'lucide-react';

export function SecurityShield() {
  const [warningMsg, setWarningMsg] = useState<string | null>(null);

  const triggerWarning = (msg: string) => {
    setWarningMsg(msg);
    setTimeout(() => {
      setWarningMsg(null);
    }, 3000);
  };

  useEffect(() => {
    // 1. Disable Right Click Context Menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      triggerWarning('عفواً، تفعيل حماية المحتوى يمنع النقر بالأزرار الإضافية 🛡️');
    };

    // 2. Prevent Developer Tools & Screenshot Key Combinations
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const ctrlKey = isMac ? e.metaKey : e.ctrlKey;

      // F12
      if (e.key === 'F12') {
        e.preventDefault();
        triggerWarning('تأمين المنصة: أدوات التطوير معطلة لمنع تسريب الفيديو 🛡️');
        return;
      }

      // Ctrl+Shift+I / J / C (DevTools)
      if (ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) {
        e.preventDefault();
        triggerWarning('تأمين المنصة: أدوات التفتيش معطلة لحماية المحتوى 🛡️');
        return;
      }

      // Ctrl+U (View Source)
      if (ctrlKey && (e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        triggerWarning('تأمين المنصة: عرض المصدر معطل 🛡️');
        return;
      }

      // Ctrl+S / Ctrl+P (Save / Print)
      if (ctrlKey && (e.key === 's' || e.key === 'S' || e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        triggerWarning('تأمين المنصة: الحفظ والطباعة معطلة لحماية المذكرات 🛡️');
        return;
      }

      // PrintScreen Key
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        triggerWarning('تأمين المنصة: تصوير الشاشة معطل 🛡️');
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
      {/* Global CSS Anti-Copy Shield */}
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
      `}</style>

      {/* Floating Warning Toast */}
      {warningMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-2xl bg-slate-950/95 text-chalk border border-cyan-electric/40 shadow-cyan-glow flex items-center gap-3 text-xs font-black animate-in fade-in slide-in-from-bottom duration-200">
          <ShieldAlert className="w-5 h-5 text-cyan-electric shrink-0" />
          <span>{warningMsg}</span>
        </div>
      )}
    </>
  );
}
