'use client';

import React, { useState } from 'react';
import { AdminAuditLogDTO } from '@/lib/types/dashboard';
import { History, ShieldCheck, AlertTriangle, Bug } from 'lucide-react';
import * as Sentry from '@sentry/nextjs';

interface AuditLogsTabProps {
  initialLogs: AdminAuditLogDTO[];
}

export function AuditLogsTab({ initialLogs }: AuditLogsTabProps) {
  const [logs] = useState<AdminAuditLogDTO[]>(initialLogs);
  const [sentryTestMsg, setSentryTestMsg] = useState('');

  const triggerSentryTest = () => {
    try {
      Sentry.captureMessage('Almohands Admin Security Test Event', 'info');
      setSentryTestMsg('تم إرسال حدث اختباري آمن إلى منظومة مراقبة Sentry بنجاح ');
      setTimeout(() => setSentryTestMsg(''), 4000);
    } catch {
      setSentryTestMsg('تم تشغيل اختبار الأمان.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-chalk">
            سجل الأحداث والأمان (Audit Logs)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-chalk-muted mt-0.5">
            تتبع العمليات الحساسة، تسجيلات الدخول، وتعديلات النظام البرمجية
          </p>
        </div>

        <button
          type="button"
          onClick={triggerSentryTest}
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-800 dark:text-chalk bg-slate-100 dark:bg-slate-800 hover:border-cyan-electric border border-slate-300 dark:border-slate-700 transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Bug className="w-4 h-4 text-cyan-electric" />
          <span>اختبار إرسال تقرير Sentry</span>
        </button>
      </div>

      {sentryTestMsg && (
        <div className="p-4 rounded-2xl bg-cyan-electric/10 border border-cyan-electric/30 text-cyan-electric text-xs font-bold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          <span>{sentryTestMsg}</span>
        </div>
      )}

      {/* Logs Table */}
      <div className="chalk-card rounded-3xl p-6 bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-cyan-electric/15 overflow-x-auto">
        <table className="w-full text-right text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-black text-slate-500 dark:text-chalk-muted">
              <th className="pb-3 px-3">الحدث / الإجراء</th>
              <th className="pb-3 px-3">الجهة والنوع</th>
              <th className="pb-3 px-3">المستخدم</th>
              <th className="pb-3 px-3">الدور</th>
              <th className="pb-3 px-3 text-left">التاريخ والوقت</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors">
                <td className="py-4 px-3 font-bold text-slate-900 dark:text-chalk flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-electric shrink-0" />
                  <span>{log.action}</span>
                </td>

                <td className="py-4 px-3 font-mono text-slate-500 dark:text-chalk-muted">
                  {log.entityType}
                </td>

                <td className="py-4 px-3 font-semibold text-slate-800 dark:text-chalk">
                  {log.userName || 'مدير المنصة'}
                </td>

                <td className="py-4 px-3">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black ${
                      log.userRole === 'ADMIN'
                        ? 'bg-cyan-electric/15 text-cyan-electric'
                        : 'bg-emerald-500/15 text-emerald-500'
                    }`}
                  >
                    {log.userRole || 'ADMIN'}
                  </span>
                </td>

                <td className="py-4 px-3 text-left text-slate-500 dark:text-chalk-muted font-medium">
                  {new Date(log.createdAt).toLocaleDateString('ar-EG', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
