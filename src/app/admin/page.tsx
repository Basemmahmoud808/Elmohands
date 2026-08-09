'use client';

import React, { useState } from 'react';
import { DashboardSidebar } from '@/components/ui/dashboard-sidebar';
import { DarkGradientBg } from '@/components/ui/elegant-dark-pattern';
import {
  Users,
  BookOpen,
  Video,
  FileQuestion,
  KeyRound,
  CreditCard,
  History,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Download,
  UploadCloud,
  FileText,
  HelpCircle,
  TrendingUp,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function AdminDashboard() {
  const [selectedTab, setSelectedTab] = useState('dashboard');
  
  // Voucher Generator State
  const [planType, setPlanType] = useState('1month');
  const [codeCount, setCodeCount] = useState(5);
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);

  const handleGenerateCodes = (e: React.FormEvent) => {
    e.preventDefault();
    const newCodes: string[] = [];
    const prefix = planType === '1month' ? 'ALM-M1-' : planType === 'term' ? 'ALM-TR-' : 'ALM-YR-';
    for (let i = 0; i < codeCount; i++) {
      const randStr = Math.random().toString(36).substring(2, 8).toUpperCase();
      newCodes.push(`${prefix}${randStr}`);
    }
    setGeneratedCodes(newCodes);
  };

  return (
    <DarkGradientBg>
      <div className="flex min-h-screen w-full font-arabic">
        <DashboardSidebar
          role="ADMIN"
          userFullName="م/ رضا خيرت"
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-6 lg:p-10 overflow-y-auto space-y-8">
          
          {/* Top Admin Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-electric/10 text-cyan-electric text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>لوحة التحكم الكاملة للمدرس (Admin Control Center)</span>
              </div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-chalk">
                منصة المهندس — م/ رضا خيرت
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedTab('vouchers')}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-black bg-cyan-electric hover:bg-cyan-electric-hover shadow-cyan-glow transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>توليد أكواد شحن جديدة</span>
              </button>
            </div>
          </div>

          {/* Admin Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="chalk-card rounded-2xl p-5 space-y-2 bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-cyan-electric/15">
              <div className="flex items-center justify-between text-cyan-electric">
                <Users className="w-6 h-6" />
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-cyan-electric/10">+12% هذا الشهر</span>
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-chalk">1,480</div>
              <div className="text-xs text-slate-500 dark:text-chalk-muted font-medium">إجمالي الطلاب المسجلين</div>
            </div>

            <div className="chalk-card rounded-2xl p-5 space-y-2 bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-cyan-electric/15">
              <div className="flex items-center justify-between text-emerald-500">
                <CreditCard className="w-6 h-6" />
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/10">نشط</span>
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-chalk">1,240</div>
              <div className="text-xs text-slate-500 dark:text-chalk-muted font-medium">اشتراك فعال بأكواد الشحن</div>
            </div>

            <div className="chalk-card rounded-2xl p-5 space-y-2 bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-cyan-electric/15">
              <div className="flex items-center justify-between text-amber-500">
                <Video className="w-6 h-6" />
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/10">4 صفوف</span>
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-chalk">120</div>
              <div className="text-xs text-slate-500 dark:text-chalk-muted font-medium">درساً مرفوعاً (فيديو + PDF)</div>
            </div>

            <div className="chalk-card rounded-2xl p-5 space-y-2 bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-cyan-electric/15">
              <div className="flex items-center justify-between text-blue-500">
                <FileQuestion className="w-6 h-6" />
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-500/10">MCQ + KaTeX</span>
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-chalk">850</div>
              <div className="text-xs text-slate-500 dark:text-chalk-muted font-medium">سؤالاً في بنك الأسئلة</div>
            </div>
          </div>

          {/* Conditional Content by Active Tab */}

          {/* TAB 1: OVERVIEW & RECENT ACTIVATIONS */}
          {(selectedTab === 'dashboard' || selectedTab === 'students') && (
            <div className="space-y-6">
              <div className="chalk-card rounded-3xl p-6 bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-cyan-electric/15 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-chalk">آخر تفعيلات الأكواد والطلاب الجدد</h3>
                    <p className="text-xs text-slate-500 dark:text-chalk-muted">متابعة لحظية لاشتراكات الطلاب وتفعيل الأكواد</p>
                  </div>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="بحث بالاسم أو رقم الهاتف..."
                      className="pr-9 pl-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-chalk outline-none focus:border-cyan-electric"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-chalk-muted font-bold">
                        <th className="py-3 px-4">الطالب</th>
                        <th className="py-3 px-4">رقم الهاتف</th>
                        <th className="py-3 px-4">الصف الدراسي</th>
                        <th className="py-3 px-4">نوع الخطة</th>
                        <th className="py-3 px-4">الكود المستخدم</th>
                        <th className="py-3 px-4">تاريخ التفعيل</th>
                        <th className="py-3 px-4">الحالة</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80 font-medium text-slate-800 dark:text-chalk">
                      {[
                        { name: 'أحمد محمود العبد', phone: '01012345678', grade: 'الصف الأول الإعدادي', plan: 'اشتراك شهر', code: 'ALM-M1-8K9X', date: 'منذ 10 دقائق', status: 'نشط' },
                        { name: 'محمد مصطفى كامل', phone: '01223456789', grade: 'الصف الثالث الإعدادي', plan: 'اشتراك ترم', code: 'ALM-TR-4L2P', date: 'منذ ساعتين', status: 'نشط' },
                        { name: 'سارة إبراهيم حسن', phone: '01112223334', grade: 'الصف الأول الثانوي', plan: 'اشتراك شهر', code: 'ALM-M1-9Y7W', date: 'منذ 5 ساعات', status: 'نشط' },
                        { name: 'عمر خالد فؤاد', phone: '01099887766', grade: 'الصف الثاني الإعدادي', plan: 'اشتراك ترم', code: 'ALM-TR-1Z3A', date: 'أمس', status: 'نشط' },
                      ].map((st, i) => (
                        <tr key={i} className="hover:bg-slate-100/50 dark:hover:bg-slate-900/50 transition-colors">
                          <td className="py-3 px-4 font-bold text-slate-900 dark:text-chalk">{st.name}</td>
                          <td className="py-3 px-4 font-mono text-slate-500 dark:text-chalk-muted" dir="ltr">{st.phone}</td>
                          <td className="py-3 px-4">{st.grade}</td>
                          <td className="py-3 px-4 font-bold text-cyan-electric">{st.plan}</td>
                          <td className="py-3 px-4 font-mono">{st.code}</td>
                          <td className="py-3 px-4 text-slate-500 dark:text-chalk-muted">{st.date}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold">
                              {st.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VOUCHER CODES GENERATOR */}
          {selectedTab === 'vouchers' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5 chalk-card rounded-3xl p-6 bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-cyan-electric/15 space-y-6">
                <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-electric/15 flex items-center justify-center text-cyan-electric">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-chalk">توليد أكواد شحن كروت جديدة</h3>
                    <p className="text-xs text-slate-500 dark:text-chalk-muted">إنشاء مجموعة أكواد شحن 12 حرفاً لطباعتها وتوزيعها</p>
                  </div>
                </div>

                <form onSubmit={handleGenerateCodes} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-chalk/90">نوع الخطة (Plan)</label>
                    <select
                      value={planType}
                      onChange={(e) => setPlanType(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk text-sm outline-none focus:border-cyan-electric"
                    >
                      <option value="1month">اشتراك شهر (30 يوماً)</option>
                      <option value="term">اشتراك ترم (4 أشهر)</option>
                      <option value="year">اشتراك سنة كاملة (12 شهر)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-chalk/90">عدد الأكواد المطلوبة</label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={codeCount}
                      onChange={(e) => setCodeCount(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk text-sm outline-none focus:border-cyan-electric"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl text-sm font-extrabold text-black bg-cyan-electric hover:bg-cyan-electric-hover shadow-cyan-glow transition-all flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>توليد الأكواد الآن</span>
                  </button>
                </form>
              </div>

              {/* Generated Codes Preview */}
              <div className="lg:col-span-7 chalk-card rounded-3xl p-6 bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-cyan-electric/15 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                  <h3 className="text-lg font-black text-slate-900 dark:text-chalk">الأكواد المنشأة حديثاً</h3>
                  {generatedCodes.length > 0 && (
                    <button
                      onClick={() => alert('تم نسخ الأكواد للحافظة!')}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-cyan-electric bg-cyan-electric/10 border border-cyan-electric/30 flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>تصدير للأكسل / طباعة</span>
                    </button>
                  )}
                </div>

                {generatedCodes.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 dark:text-chalk-muted text-xs space-y-2">
                    <KeyRound className="w-12 h-12 mx-auto text-slate-400 opacity-50" />
                    <p>قم باختيار الخطة والعدد واضغط على "توليد الأكواد" لعرض قائمة الكروت المجهزة للطباعة.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {generatedCodes.map((c, i) => (
                      <div key={i} className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 flex items-center justify-between">
                        <span className="font-mono font-bold text-sm text-cyan-electric tracking-widest">{c}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500">UNUSED</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: LESSONS & COURSES CMS */}
          {(selectedTab === 'courses' || selectedTab === 'lessons') && (
            <div className="chalk-card rounded-3xl p-6 bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-cyan-electric/15 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-chalk">إدارة المناهج والدروس (Upload Center)</h3>
                  <p className="text-xs text-slate-500 dark:text-chalk-muted">رفع مقاطع الفيديو والمذكرات لجميع الصفوف الدراسية</p>
                </div>
                <button className="px-4 py-2.5 rounded-xl text-xs font-bold text-black bg-cyan-electric hover:bg-cyan-electric-hover shadow-cyan-glow flex items-center gap-2">
                  <UploadCloud className="w-4 h-4" />
                  <span>رفع درس جديد</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['الصف الأول الإعدادي', 'الصف الثاني الإعدادي', 'الصف الثالث الإعدادي', 'الصف الأول الثانوي'].map((g, i) => (
                  <div key={i} className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900 dark:text-chalk">{g}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-electric/10 text-cyan-electric">30 درس</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-chalk-muted">الجبر، الإحصاء، الهندسة وحساب المثلثات</p>
                    <button className="w-full py-2 rounded-xl text-xs font-bold text-slate-800 dark:text-chalk border border-slate-300 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-900">
                      إدارة محتوى الصف
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: AUDIT LOGS */}
          {selectedTab === 'audit' && (
            <div className="chalk-card rounded-3xl p-6 bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-cyan-electric/15 space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h3 className="text-lg font-black text-slate-900 dark:text-chalk">سجل الأحداث والأمان (Audit Logs)</h3>
                <p className="text-xs text-slate-500 dark:text-chalk-muted">سجل العمليات الحساسة وتفعيلات الأكواد بالمنصة</p>
              </div>

              <div className="space-y-3 text-xs">
                {[
                  { action: 'CODE_ACTIVATED', user: 'أحمد محمود', details: 'قام بتفعيل كود ALM-M1-8K9X (اشتراك شهر)', time: 'منذ 10 دقائق' },
                  { action: 'LESSON_CREATED', user: 'م/ رضا خيرت (Admin)', details: 'تم رفع درس: هندسة الدائرة - الصف الثالث الإعدادي', time: 'منذ ساعتين' },
                  { action: 'QUIZ_SUBMITTED', user: 'سارة إبراهيم', details: 'أكملت اختبار الجبر بدرجة 90%', time: 'منذ 3 ساعات' },
                ].map((log, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="font-mono font-bold text-cyan-electric">{log.action}</span>
                      <p className="text-slate-700 dark:text-chalk font-semibold">{log.user}: {log.details}</p>
                    </div>
                    <span className="text-slate-500 dark:text-chalk-muted">{log.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>
      </div>
    </DarkGradientBg>
  );
}
