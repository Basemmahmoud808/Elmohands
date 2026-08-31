'use client';

import React, { useState } from 'react';
import { AdminSubscriptionDTO } from '@/lib/types/dashboard';
import { CreditCard, Search, ShieldCheck, Clock, XCircle, CheckCircle2 } from 'lucide-react';

interface SubscriptionsTabProps {
  initialSubscriptions: AdminSubscriptionDTO[];
}

export function SubscriptionsTab({ initialSubscriptions }: SubscriptionsTabProps) {
  const [subscriptions] = useState<AdminSubscriptionDTO[]>(initialSubscriptions);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'EXPIRED'>('ALL');

  const filteredSubs = subscriptions.filter((sub) => {
    const matchesSearch =
      !search.trim() ||
      sub.studentName.toLowerCase().includes(search.toLowerCase()) ||
      sub.studentPhone.includes(search) ||
      sub.planName.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || sub.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-chalk">
            سجل الاشتراكات والمدفوعات الفعالة
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-chalk-muted mt-0.5">
            تتبع اشتراكات الطلاب، تواريخ الانتهاء، ومصادر التفعيل
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 self-start sm:self-auto">
          <CreditCard className="w-4 h-4" />
          <span>إجمالي الاشتراكات: {subscriptions.length}</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="chalk-card rounded-2xl p-4 bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-cyan-electric/15 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
        <div className="sm:col-span-8 relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث باسم الطالب أو رقم الهاتف أو اسم الخطة..."
            className="w-full h-11 px-4 pl-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-chalk placeholder:text-slate-400 focus:outline-none focus:border-cyan-electric"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="sm:col-span-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'ACTIVE' | 'EXPIRED')}
            className="w-full h-11 px-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-chalk focus:outline-none focus:border-cyan-electric"
          >
            <option value="ALL">جميع الاشتراكات</option>
            <option value="ACTIVE">الاشتراكات النشطة فقط</option>
            <option value="EXPIRED">الاشتراكات المنتهية</option>
          </select>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="chalk-card rounded-3xl p-6 bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-cyan-electric/15 overflow-x-auto">
        <table className="w-full text-right text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-black text-slate-500 dark:text-chalk-muted">
              <th className="pb-3 px-3">الطالب</th>
              <th className="pb-3 px-3">الخطة والمدة</th>
              <th className="pb-3 px-3 text-center">الحالة</th>
              <th className="pb-3 px-3 text-center">المتبقي</th>
              <th className="pb-3 px-3">تاريخ البدء والانتهاء</th>
              <th className="pb-3 px-3 text-left">المصدر</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {filteredSubs.map((sub) => (
              <tr key={sub.id} className="hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors">
                <td className="py-4 px-3">
                  <span className="font-bold text-slate-900 dark:text-chalk block">
                    {sub.studentName}
                  </span>
                  <span className="font-mono text-xs text-slate-500 dark:text-chalk-muted">
                    {sub.studentPhone}
                  </span>
                </td>

                <td className="py-4 px-3 font-semibold text-slate-700 dark:text-chalk/90 text-xs">
                  <span>{sub.planName}</span>
                  <span className="text-[11px] text-slate-400 block">
                    {sub.durationDays} يوماً
                  </span>
                </td>

                <td className="py-4 px-3 text-center">
                  {sub.status === 'ACTIVE' ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>نشط</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-red-500/15 text-red-500 border border-red-500/30">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>منتهي</span>
                    </span>
                  )}
                </td>

                <td className="py-4 px-3 text-center font-bold text-xs">
                  {sub.daysRemaining > 0 ? (
                    <span className="text-emerald-500">{sub.daysRemaining} يوماً</span>
                  ) : (
                    <span className="text-slate-400">0 يوم</span>
                  )}
                </td>

                <td className="py-4 px-3 text-xs text-slate-600 dark:text-chalk-muted">
                  <div>بدأ: {new Date(sub.startsAt).toLocaleDateString('ar-EG')}</div>
                  <div>ينتهي: {new Date(sub.expiresAt).toLocaleDateString('ar-EG')}</div>
                </td>

                <td className="py-4 px-3 text-left">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-chalk">
                    {sub.source === 'CODE' ? 'كود سابق' : 'تفعيل الإدارة'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
