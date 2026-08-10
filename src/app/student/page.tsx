'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DashboardSidebar } from '@/components/ui/dashboard-sidebar';
import { DarkGradientBg } from '@/components/ui/elegant-dark-pattern';
import { getCurrentUser, UserSession } from '@/lib/actions/auth';
import { redeemVoucherCode } from '@/lib/actions/vouchers';
import { getLessonsList, LessonItem } from '@/lib/actions/lessons';
import {
  PlayCircle,
  KeyRound,
  CheckCircle2,
  Clock,
  BookOpen,
  Award,
  TrendingUp,
  AlertCircle,
  FileText,
  HelpCircle,
  BarChart3,
  Calendar,
  Check,
  ChevronLeft,
  Search,
  Zap,
} from 'lucide-react';

const MOCK_QUIZZES = [
  { id: 'q-1', title: 'اختبار الوحدة الأولى: الجبر والأعداد النسبية', duration: '20 دقيقة', questionsCount: 15, maxScore: 30, isCompleted: true, studentScore: 28 },
  { id: 'q-2', title: 'اختبار هندسة: الإنشاءات الهندسية والتناظر', duration: '25 دقيقة', questionsCount: 20, maxScore: 40, isCompleted: true, studentScore: 38 },
  { id: 'q-3', title: 'الاختبار الشامل على نصر الترم الأول (جبر وهندسة)', duration: '45 دقيقة', questionsCount: 30, maxScore: 60, isCompleted: false, studentScore: 0 },
];

export default function StudentDashboard() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState('overview');
  const [user, setUser] = useState<UserSession | null>(null);
  const [lessons, setLessons] = useState<LessonItem[]>([]);
  
  const [voucherInput, setVoucherInput] = useState('');
  const [voucherStatus, setVoucherStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [subDays, setSubDays] = useState(28);

  // Interactive Quiz State
  const [activeQuizModal, setActiveQuizModal] = useState<any | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizResult, setQuizResult] = useState<number | null>(null);

  useEffect(() => {
    async function loadData() {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
      const lList = await getLessonsList();
      setLessons(lList);
    }
    loadData();
  }, []);

  const handleActivateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherInput.trim()) return;
    
    const res = await redeemVoucherCode(voucherInput);
    setVoucherStatus({
      success: res.success,
      message: res.message,
    });

    if (res.success && res.durationDays) {
      setSubDays((prev) => prev + (res.durationDays || 0));
      setVoucherInput('');
    }
  };

  const handleStartQuiz = (quiz: any) => {
    setActiveQuizModal(quiz);
    setQuizAnswers({});
    setQuizResult(null);
  };

  const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
    setQuizAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));
  };

  const handleSubmitQuiz = () => {
    const calculatedScore = Math.floor(Math.random() * 5) + (activeQuizModal.maxScore - 4);
    setQuizResult(calculatedScore);
  };

  return (
    <DarkGradientBg>
      <div className="flex min-h-screen w-full font-arabic">
        <DashboardSidebar
          role="STUDENT"
          userFullName={user?.fullName || 'أحمد محمود'}
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-6 lg:p-10 overflow-y-auto space-y-8">
          
          {/* Top Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-chalk">
                أهلاً يا {user?.fullName || 'طالب'} 👋
              </h1>
              <p className="text-slate-600 dark:text-chalk-muted text-sm mt-1">
                {user?.gradeName || 'الصف الأول الإعدادي'} — الترم الأول (جبر وهندسة)
              </p>
            </div>

            {/* Active Subscription Badge */}
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-emerald-500/30 flex items-center gap-3 shadow-sm">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-900 dark:text-chalk">
                    اشتراكك الحالي: نشط
                  </span>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    ينتهي خلال {subDays} يوماً
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* TAB 1: OVERVIEW */}
          {selectedTab === 'overview' && (
            <div className="space-y-8">
              {/* Continue Learning Banner */}
              <div className="chalk-card rounded-3xl p-6 lg:p-8 bg-gradient-to-r from-cyan-electric/15 via-blue-ink/20 to-transparent border border-cyan-electric/30 relative overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
                  <div className="lg:col-span-8 space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-electric/20 text-cyan-electric text-xs font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>تابع دراستك (الدرس المتاح حالياً)</span>
                    </div>
                    
                    <h2 className="text-2xl font-black text-slate-900 dark:text-chalk">
                      {lessons[0]?.title || 'الدرس الأول: مجموعات الأعداد والعمليات الأساسية'}
                    </h2>
                    
                    <p className="text-xs text-slate-600 dark:text-chalk-muted leading-relaxed max-w-xl">
                      {lessons[0]?.description || 'وحدة الجبر والأعداد — شرح فيديو عالي الجودة وملاحظات مبرهنة للحل مع م/ رضا خيرت.'}
                    </p>

                    {/* Progress Bar */}
                    <div className="space-y-1.5 pt-2 max-w-lg">
                      <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-chalk/90">
                        <span>مستوى الإنجاز في الدرس</span>
                        <span className="text-cyan-electric">68%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                        <div className="bg-cyan-electric h-2.5 rounded-full shadow-cyan-glow transition-all duration-500" style={{ width: '68%' }} />
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-4 flex justify-end">
                    <Link
                      href="/lessons/les-1"
                      className="px-6 py-3.5 rounded-2xl text-sm font-extrabold text-black bg-cyan-electric hover:bg-cyan-electric-hover shadow-cyan-glow transition-all flex items-center gap-2"
                    >
                      <PlayCircle className="w-5 h-5" />
                      <span>تشغيل المشغل وتتبع الدرس</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Quick Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="chalk-card rounded-2xl p-5 space-y-2 bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-cyan-electric/15">
                  <div className="flex items-center justify-between text-cyan-electric">
                    <BookOpen className="w-6 h-6" />
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-cyan-electric/10">مكتمل</span>
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-chalk">14 / 24</div>
                  <div className="text-xs text-slate-500 dark:text-chalk-muted">درساً مكتمل في المنهج</div>
                </div>

                <div className="chalk-card rounded-2xl p-5 space-y-2 bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-cyan-electric/15">
                  <div className="flex items-center justify-between text-emerald-500">
                    <Award className="w-6 h-6" />
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/10">ممتاز</span>
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-chalk">94%</div>
                  <div className="text-xs text-slate-500 dark:text-chalk-muted">متوسط درجات الاختبارات</div>
                </div>

                <div className="chalk-card rounded-2xl p-5 space-y-2 bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-cyan-electric/15">
                  <div className="flex items-center justify-between text-amber-500">
                    <Clock className="w-6 h-6" />
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/10">ساعات</span>
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-chalk">18.5 س</div>
                  <div className="text-xs text-slate-500 dark:text-chalk-muted">إجمالي ساعات المشاهدة</div>
                </div>

                <div className="chalk-card rounded-2xl p-5 space-y-2 bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-cyan-electric/15">
                  <div className="flex items-center justify-between text-blue-500">
                    <TrendingUp className="w-6 h-6" />
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-500/10">تقييم</span>
                  </div>
                  <div className="text-2xl font-black text-slate-900 dark:text-chalk">8 / 8</div>
                  <div className="text-xs text-slate-500 dark:text-chalk-muted">اختبارات مجتازة بنجاح</div>
                </div>
              </div>

              {/* Two-Column Section: Voucher Activation & Available Lessons */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Activate Voucher Card */}
                <div className="lg:col-span-6 chalk-card rounded-3xl p-6 bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-cyan-electric/15 space-y-6">
                  <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                    <div className="w-10 h-10 rounded-xl bg-cyan-electric/15 flex items-center justify-center text-cyan-electric">
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-chalk">تفعيل كود الشحن الفعلي</h3>
                      <p className="text-xs text-slate-500 dark:text-chalk-muted">أدخل الكود المكون من 12 حرفاً المكتوب على كارت الشحن</p>
                    </div>
                  </div>

                  <form onSubmit={handleActivateVoucher} className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-700 dark:text-chalk/90">رمز التفعيل (Voucher Code)</label>
                      <input
                        type="text"
                        placeholder="مثال: ALM-M1-8K9X2P"
                        value={voucherInput}
                        onChange={(e) => setVoucherInput(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk font-mono text-center tracking-widest text-base uppercase focus:border-cyan-electric outline-none transition-colors"
                      />
                    </div>

                    {voucherStatus && (
                      <div className={`p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
                        voucherStatus.success
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                      }`}>
                        {voucherStatus.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        <span>{voucherStatus.message}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-xl text-sm font-extrabold text-black bg-cyan-electric hover:bg-cyan-electric-hover shadow-cyan-glow transition-all"
                    >
                      تفعيل كود الشحن الآن
                    </button>
                  </form>
                </div>

                {/* Lessons List */}
                <div className="lg:col-span-6 chalk-card rounded-3xl p-6 bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-cyan-electric/15 space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                    <h3 className="text-lg font-black text-slate-900 dark:text-chalk">دروس المنهج المتاحة لك</h3>
                    <span className="text-xs font-bold text-cyan-electric">{lessons.length} درس متاح</span>
                  </div>

                  <div className="space-y-4">
                    {lessons.map((les) => (
                      <div key={les.id} className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-chalk">{les.title}</h4>
                          <p className="text-xs text-slate-500 dark:text-chalk-muted">{les.gradeName} • {les.durationMinutes} دقيقة</p>
                        </div>
                        <Link
                          href={`/lessons/${les.id}`}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-black bg-cyan-electric hover:bg-cyan-electric-hover shadow-sm"
                        >
                          مشاهدة الدرس
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CURRICULUM & LESSONS */}
          {selectedTab === 'curriculum' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-chalk">مناهجي والدروس الدراسية</h2>
                  <p className="text-xs text-slate-500 dark:text-chalk-muted">استعرض وحدات المنهج وشاهد شرح الفيديو وملاحظات PDF لكل درس</p>
                </div>
                <span className="px-3.5 py-1.5 rounded-full bg-cyan-electric/10 text-cyan-electric text-xs font-bold border border-cyan-electric/30">
                  {user?.gradeName || 'الصف الأول الإعدادي'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {lessons.map((les, index) => (
                  <div key={les.id} className="chalk-card rounded-3xl p-6 bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-cyan-electric/15 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-cyan-electric/10 border border-cyan-electric/30 flex items-center justify-center text-cyan-electric font-black text-lg">
                        0{index + 1}
                      </div>
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-chalk/80">
                        {les.durationMinutes} دقيقة فيديو
                      </span>
                    </div>

                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-chalk">{les.title}</h3>
                    <p className="text-xs text-slate-600 dark:text-chalk-muted leading-relaxed">{les.description}</p>

                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-chalk-muted">
                        <FileText className="w-4 h-4 text-cyan-electric" />
                        <span>يتضمن ملف PDF للتمارين</span>
                      </div>
                      <Link
                        href={`/lessons/${les.id}`}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold text-black bg-cyan-electric hover:bg-cyan-electric-hover shadow-cyan-glow flex items-center gap-1.5"
                      >
                        <PlayCircle className="w-4 h-4" />
                        <span>فتح مشغل الدرس</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: QUIZZES */}
          {selectedTab === 'quizzes' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-chalk">الاختبارات والتأهيلات المتاحة</h2>
                  <p className="text-xs text-slate-500 dark:text-chalk-muted">اختبر فهمك للمواد بعد كل وحدة واحصل على درجات فورية</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {MOCK_QUIZZES.map((quiz) => (
                  <div key={quiz.id} className="chalk-card rounded-3xl p-6 bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-cyan-electric/15 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-cyan-electric px-2.5 py-1 rounded-md bg-cyan-electric/10 border border-cyan-electric/30">
                          {quiz.duration}
                        </span>
                        {quiz.isCompleted && (
                          <span className="text-xs font-bold text-emerald-500 px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30">
                            مكتمـل: {quiz.studentScore} / {quiz.maxScore}
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-extrabold text-slate-900 dark:text-chalk">{quiz.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-chalk-muted">{quiz.questionsCount} سؤال اختياري (MCQ) • التقييم فوري</p>
                    </div>

                    <button
                      onClick={() => handleStartQuiz(quiz)}
                      className="w-full py-3 rounded-xl text-xs font-bold text-black bg-cyan-electric hover:bg-cyan-electric-hover shadow-cyan-glow transition-all"
                    >
                      {quiz.isCompleted ? 'إعادة الاختبار الآن' : 'بدء الاختبار الحاضر'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: GRADES & PROGRESS */}
          {selectedTab === 'grades' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 dark:text-chalk">نتائجي وتقييماتي الدراسية</h2>
                  <p className="text-xs text-slate-500 dark:text-chalk-muted">تقرير درجاتك في جميع الاختبارات السابقة ونسب الإنجاز</p>
                </div>
              </div>

              <div className="chalk-card rounded-3xl p-6 bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-cyan-electric/15 space-y-4 overflow-x-auto">
                <table className="w-full text-right border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 dark:text-chalk-muted">
                      <th className="py-3 px-4">اسم الاختبار</th>
                      <th className="py-3 px-4">تاريخ الإنجاز</th>
                      <th className="py-3 px-4">الدرجة الحاصل عليها</th>
                      <th className="py-3 px-4">النسبة المئوية</th>
                      <th className="py-3 px-4">التقدير العام</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-xs font-semibold text-slate-800 dark:text-chalk/90">
                    <tr>
                      <td className="py-4 px-4 font-bold">اختبار الوحدة الأولى: الجبر والأعداد النسبية</td>
                      <td className="py-4 px-4">02 أغسطس 2026</td>
                      <td className="py-4 px-4 font-extrabold text-cyan-electric">28 / 30</td>
                      <td className="py-4 px-4">93%</td>
                      <td className="py-4 px-4"><span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-500 font-bold">ممتاز</span></td>
                    </tr>
                    <tr>
                      <td className="py-4 px-4 font-bold">اختبار هندسة: الإنشاءات الهندسية والتناظر</td>
                      <td className="py-4 px-4">07 أغسطس 2026</td>
                      <td className="py-4 px-4 font-extrabold text-cyan-electric">38 / 40</td>
                      <td className="py-4 px-4">95%</td>
                      <td className="py-4 px-4"><span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-500 font-bold">ممتاز مرتفع</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: DEDICATED VOUCHER TAB */}
          {selectedTab === 'voucher' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-black text-slate-900 dark:text-chalk">تفعيل كارت الشحن (Voucher Code)</h2>
                <p className="text-xs text-slate-500 dark:text-chalk-muted">أدخل الكود المطبوع على الكارت المكون من 12 حرفاً للبدء أو تمديد الاشتراك</p>
              </div>

              <div className="chalk-card rounded-3xl p-8 bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-cyan-electric/20 space-y-6 shadow-cyan-glow">
                <form onSubmit={handleActivateVoucher} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-chalk/90">أدخل رمز الشحن:</label>
                    <input
                      type="text"
                      placeholder="مثال: ALM-M1-8K9X2P"
                      value={voucherInput}
                      onChange={(e) => setVoucherInput(e.target.value)}
                      className="w-full px-4 py-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk font-mono text-center tracking-widest text-lg uppercase focus:border-cyan-electric outline-none transition-colors"
                    />
                  </div>

                  {voucherStatus && (
                    <div className={`p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                      voucherStatus.success
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                    }`}>
                      {voucherStatus.success ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                      <span>{voucherStatus.message}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-4 rounded-2xl text-sm font-extrabold text-black bg-cyan-electric hover:bg-cyan-electric-hover shadow-cyan-glow transition-all"
                  >
                    تأكيد وتفعيل كارت الشحن
                  </button>
                </form>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* QUIZ INTERACTIVE MODAL */}
      {activeQuizModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="chalk-card max-w-xl w-full rounded-3xl p-6 bg-slate-900 border border-cyan-electric/30 space-y-6 relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-black text-chalk">{activeQuizModal.title}</h3>
              <button onClick={() => setActiveQuizModal(null)} className="text-slate-400 hover:text-white text-xs font-bold">
                إغلاق ✕
              </button>
            </div>

            {quizResult === null ? (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <span className="text-xs font-bold text-cyan-electric">السؤال 1 من 1:</span>
                  <p className="text-sm font-bold text-chalk">
                    إذا كان س/5 = 3/15، فإن قيمة (س + 2) تساوي:
                  </p>
                  <div className="space-y-2 pt-2">
                    {['1', '3', '5', '7'].map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAnswerSelect(0, idx)}
                        className={`w-full p-3 rounded-xl text-right text-xs font-bold border transition-colors ${
                          quizAnswers[0] === idx
                            ? 'bg-cyan-electric text-black border-cyan-electric'
                            : 'bg-slate-900 text-chalk border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSubmitQuiz}
                  className="w-full py-3.5 rounded-xl text-xs font-bold text-black bg-cyan-electric hover:bg-cyan-electric-hover shadow-cyan-glow"
                >
                  تسليم الاختبار ورصد الدرجة
                </button>
              </div>
            ) : (
              <div className="text-center space-y-4 py-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-2xl font-black">
                  ✓
                </div>
                <h4 className="text-xl font-black text-chalk">أحسنت! اكتمل الاختبار بنجاح</h4>
                <p className="text-sm text-cyan-electric font-black">
                  درجتك: {quizResult} من {activeQuizModal.maxScore}
                </p>
                <button
                  onClick={() => setActiveQuizModal(null)}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold text-black bg-cyan-electric shadow-cyan-glow"
                >
                  العودة للوحة التحكم
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </DarkGradientBg>
  );
}
