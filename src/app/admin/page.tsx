'use client';

import React, { useState, useEffect } from 'react';
import { DashboardSidebar } from '@/components/ui/dashboard-sidebar';
import { DarkGradientBg } from '@/components/ui/elegant-dark-pattern';
import { generateVoucherCodes, getAllVouchers, VoucherCode } from '@/lib/actions/vouchers';
import { createLessonAction, getLessonsList, LessonItem } from '@/lib/actions/lessons';
import {
  Users,
  Video,
  FileQuestion,
  KeyRound,
  CreditCard,
  History,
  Plus,
  Search,
  CheckCircle2,
  Download,
  UploadCloud,
  Sparkles,
  BookOpen,
  HelpCircle,
  ShieldAlert,
  Copy,
  Trash2,
} from 'lucide-react';

export default function AdminDashboard() {
  const [selectedTab, setSelectedTab] = useState('dashboard');
  
  // Voucher Generator State
  const [planType, setPlanType] = useState<'1month' | 'term' | 'year'>('1month');
  const [codeCount, setCodeCount] = useState(5);
  const [vouchers, setVouchers] = useState<VoucherCode[]>([]);

  // Lesson Upload State
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDesc, setLessonDesc] = useState('');
  const [lessonGrade, setLessonGrade] = useState('الصف الأول الإعدادي');
  const [videoUrl, setVideoUrl] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [lessons, setLessons] = useState<LessonItem[]>([]);
  const [uploadMsg, setUploadMsg] = useState('');

  // MCQ Question State
  const [qText, setQText] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [correctAns, setCorrectAns] = useState('A');
  const [questionsList, setQuestionsList] = useState([
    { id: 'q-1', text: 'س: اختر الإجابة الصحيحة: أي مما يلي يمثل عدداً نسبياً؟', options: ['A) 5/0', 'B) 3/4', 'C) √(-4)', 'D) 0/0'], correct: 'B' },
  ]);
  const [qMsg, setQMsg] = useState('');

  // Student Search & Filter
  const [searchStudent, setSearchStudent] = useState('');
  const [studentsList, setStudentsList] = useState([
    { id: 'st-1', name: 'أحمد محمود العبد', phone: '01012345678', parentPhone: '01223456789', grade: 'الصف الأول الإعدادي', gov: 'القاهرة', status: 'نشط' },
    { id: 'st-2', name: 'محمد مصطفى كامل', phone: '01223456789', parentPhone: '01099887766', grade: 'الصف الثالث الإعدادي', gov: 'الجيزة', status: 'نشط' },
    { id: 'st-3', name: 'سارة إبراهيم حسن', phone: '01112223334', parentPhone: '01011223344', grade: 'الصف الأول الثانوي', gov: 'الإسكندرية', status: 'نشط' },
  ]);

  useEffect(() => {
    async function loadData() {
      const vList = await getAllVouchers();
      setVouchers(vList);
      const lList = await getLessonsList();
      setLessons(lList);
    }
    loadData();
  }, []);

  const handleGenerateCodes = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await generateVoucherCodes(planType, codeCount);
    if (res.success) {
      const updatedVouchers = await getAllVouchers();
      setVouchers(updatedVouchers);
    }
  };

  const handleUploadLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonTitle.trim()) return;

    const fd = new FormData();
    fd.append('title', lessonTitle);
    fd.append('description', lessonDesc);
    fd.append('gradeName', lessonGrade);
    if (videoUrl) fd.append('videoUrl', videoUrl);
    if (pdfUrl) fd.append('pdfUrl', pdfUrl);

    const res = await createLessonAction(fd);
    if (res.success && res.lesson) {
      setUploadMsg('تم حفظ ونشر الدرس بنجاح للطلاب!');
      setLessonTitle('');
      setLessonDesc('');
      const updatedLessons = await getLessonsList();
      setLessons(updatedLessons);
    }
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!qText.trim()) return;

    const newQ = {
      id: `q-${Date.now()}`,
      text: qText.trim(),
      options: [`A) ${optA || 'الخيار الأول'}`, `B) ${optB || 'الخيار الثاني'}`, `C) ${optC || 'الخيار الثالث'}`, `D) ${optD || 'الخيار الرابع'}`],
      correct: correctAns,
    };

    setQuestionsList([newQ, ...questionsList]);
    setQMsg('تمت إضافة السؤال بنجاح إلى بنك الأسئلة!');
    setQText('');
    setOptA('');
    setOptB('');
    setOptC('');
    setOptD('');
  };

  const filteredStudents = studentsList.filter(
    (st) => st.name.includes(searchStudent) || st.phone.includes(searchStudent) || st.gov.includes(searchStudent)
  );

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
            <button
              onClick={() => setSelectedTab('students')}
              className="text-right chalk-card rounded-2xl p-5 space-y-2 bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-cyan-electric transition-all"
            >
              <div className="flex items-center justify-between text-cyan-electric">
                <Users className="w-6 h-6" />
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-cyan-electric/10">+12% هذا الشهر</span>
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-chalk">{studentsList.length} طالب</div>
              <div className="text-xs text-slate-500 dark:text-chalk-muted font-medium">إجمالي الطلاب المسجلين</div>
            </button>

            <button
              onClick={() => setSelectedTab('vouchers')}
              className="text-right chalk-card rounded-2xl p-5 space-y-2 bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-cyan-electric transition-all"
            >
              <div className="flex items-center justify-between text-emerald-500">
                <CreditCard className="w-6 h-6" />
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/10">نشط</span>
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-chalk">{vouchers.length} كارت</div>
              <div className="text-xs text-slate-500 dark:text-chalk-muted font-medium">أكواد الشحن المتوفرة</div>
            </button>

            <button
              onClick={() => setSelectedTab('lessons')}
              className="text-right chalk-card rounded-2xl p-5 space-y-2 bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-cyan-electric transition-all"
            >
              <div className="flex items-center justify-between text-amber-500">
                <Video className="w-6 h-6" />
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/10">مرفوع</span>
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-chalk">{lessons.length} درس</div>
              <div className="text-xs text-slate-500 dark:text-chalk-muted font-medium">درساً مرفوعاً (فيديو + PDF)</div>
            </button>

            <button
              onClick={() => setSelectedTab('questions')}
              className="text-right chalk-card rounded-2xl p-5 space-y-2 bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-cyan-electric transition-all"
            >
              <div className="flex items-center justify-between text-blue-500">
                <FileQuestion className="w-6 h-6" />
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-500/10">MCQ</span>
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-chalk">{questionsList.length} سؤالاً</div>
              <div className="text-xs text-slate-500 dark:text-chalk-muted font-medium">سؤالاً في بنك الأسئلة</div>
            </button>
          </div>

          {/* TAB 1: OVERVIEW & STUDENTS */}
          {(selectedTab === 'dashboard' || selectedTab === 'students') && (
            <div className="chalk-card rounded-3xl p-6 bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-chalk">إدارة حسابات الطلاب المسجلين</h3>
                  <p className="text-xs text-slate-500 dark:text-chalk-muted">البحث باسم الطالب أو المحافظة أو رقم ولي الأمر</p>
                </div>
                <div className="relative">
                  <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    placeholder="بحث بالاسم أو رقم الهاتف..."
                    value={searchStudent}
                    onChange={(e) => setSearchStudent(e.target.value)}
                    className="pr-9 pl-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-chalk outline-none focus:border-cyan-electric"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-chalk-muted font-bold">
                      <th className="py-3 px-4">اسم الطالب</th>
                      <th className="py-3 px-4">رقم هاتف الطالب</th>
                      <th className="py-3 px-4">رقم ولي الأمر</th>
                      <th className="py-3 px-4">المحافظة</th>
                      <th className="py-3 px-4">الصف الدراسي</th>
                      <th className="py-3 px-4">حالة الحساب</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80 font-medium text-slate-800 dark:text-chalk">
                    {filteredStudents.map((st) => (
                      <tr key={st.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-900/50 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900 dark:text-chalk">{st.name}</td>
                        <td className="py-3 px-4 font-mono text-slate-500 dark:text-chalk-muted" dir="ltr">{st.phone}</td>
                        <td className="py-3 px-4 font-mono text-slate-500 dark:text-chalk-muted" dir="ltr">{st.parentPhone}</td>
                        <td className="py-3 px-4 font-bold text-cyan-electric">{st.gov}</td>
                        <td className="py-3 px-4">{st.grade}</td>
                        <td className="py-3 px-4">
                          <span className="px-2.5 py-1 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-bold">
                            {st.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: VOUCHER CODES GENERATOR */}
          {selectedTab === 'vouchers' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5 chalk-card rounded-3xl p-6 bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 space-y-6">
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
                      onChange={(e: any) => setPlanType(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk text-xs outline-none focus:border-cyan-electric"
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
                      className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk text-xs outline-none focus:border-cyan-electric"
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
              <div className="lg:col-span-7 chalk-card rounded-3xl p-6 bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
                  <h3 className="text-lg font-black text-slate-900 dark:text-chalk">الأكواد الفعالة المنشأة</h3>
                  <button
                    onClick={() => alert('تم نسخ الأكواد!')}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-cyan-electric bg-cyan-electric/10 border border-cyan-electric/30 flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تصدير الأكواد</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1">
                  {vouchers.map((c) => (
                    <div key={c.id} className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="font-mono font-bold text-sm text-cyan-electric tracking-widest block">{c.code}</span>
                        <span className="text-[10px] text-slate-500">{c.planName}</span>
                      </div>
                      <button
                        onClick={() => navigator.clipboard.writeText(c.code)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-electric hover:bg-slate-200 dark:hover:bg-slate-800"
                        title="نسخ الكود"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LESSONS CMS */}
          {(selectedTab === 'courses' || selectedTab === 'lessons') && (
            <div className="space-y-8">
              <div className="chalk-card rounded-3xl p-6 bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 space-y-6">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                  <h3 className="text-lg font-black text-slate-900 dark:text-chalk">رفع وتجهيز درس جديد (Video & PDF Upload)</h3>
                  <p className="text-xs text-slate-500 dark:text-chalk-muted">إضافة عنوان الدرس، وصفه، رابط الفيديو والمذكرة وتحديد الصف الدراسي</p>
                </div>

                {uploadMsg && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{uploadMsg}</span>
                  </div>
                )}

                <form onSubmit={handleUploadLesson} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-chalk/90">عنوان الدرس</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: الدرس الثالث: تحليل الفرق بين المربعين"
                      value={lessonTitle}
                      onChange={(e) => setLessonTitle(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk text-xs outline-none focus:border-cyan-electric"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-chalk/90">الصف الدراسي</label>
                    <select
                      value={lessonGrade}
                      onChange={(e) => setLessonGrade(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk text-xs outline-none focus:border-cyan-electric"
                    >
                      <option value="الصف الأول الإعدادي">الصف الأول الإعدادي</option>
                      <option value="الصف الثاني الإعدادي">الصف الثاني الإعدادي</option>
                      <option value="الصف الثالث الإعدادي">الصف الثالث الإعدادي</option>
                      <option value="الصف الأول الثانوي">الصف الأول الثانوي</option>
                    </select>
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-chalk/90">رابط الفيديو المستضاف (Video Stream URL)</label>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk text-xs font-mono outline-none focus:border-cyan-electric"
                      dir="ltr"
                    />
                  </div>

                  <div className="md:col-span-2 pt-2">
                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-xl text-sm font-extrabold text-black bg-cyan-electric hover:bg-cyan-electric-hover shadow-cyan-glow transition-all flex items-center justify-center gap-2"
                    >
                      <UploadCloud className="w-4 h-4" />
                      <span>حفظ ونشر الدرس للطلاب</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Lessons List */}
              <div className="chalk-card rounded-3xl p-6 bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="text-lg font-black text-slate-900 dark:text-chalk border-b border-slate-200 dark:border-slate-800 pb-3">الدروس المرفوعة حالياً ({lessons.length})</h3>
                
                <div className="space-y-3">
                  {lessons.map((les) => (
                    <div key={les.id} className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="font-bold text-sm text-slate-900 dark:text-chalk">{les.title}</span>
                        <p className="text-xs text-slate-500 dark:text-chalk-muted">{les.gradeName} • {les.branchName} • {les.durationMinutes} دقيقة</p>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-xs font-bold border border-emerald-500/20">
                        منشور
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: QUESTION BANK & QUIZZES */}
          {(selectedTab === 'questions' || selectedTab === 'quizzes') && (
            <div className="space-y-8">
              <div className="chalk-card rounded-3xl p-6 bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 space-y-6">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                  <h3 className="text-lg font-black text-slate-900 dark:text-chalk">إضافة سؤال جديد لبنك الأسئلة (MCQ Question Builder)</h3>
                  <p className="text-xs text-slate-500 dark:text-chalk-muted">إضافة نص السؤال والتخييرات المتعددة واختيار الإجابة الصحيحة</p>
                </div>

                {qMsg && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{qMsg}</span>
                  </div>
                )}

                <form onSubmit={handleAddQuestion} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-chalk/90">نص السؤال أو المعادلة</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: إذا كانت س + 3 = 7 فإن س تساوي..."
                      value={qText}
                      onChange={(e) => setQText(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk text-xs outline-none focus:border-cyan-electric"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="الخيار (أ)"
                      value={optA}
                      onChange={(e) => setOptA(e.target.value)}
                      className="px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-chalk outline-none focus:border-cyan-electric"
                    />
                    <input
                      type="text"
                      placeholder="الخيار (ب)"
                      value={optB}
                      onChange={(e) => setOptB(e.target.value)}
                      className="px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-chalk outline-none focus:border-cyan-electric"
                    />
                    <input
                      type="text"
                      placeholder="الخيار (ج)"
                      value={optC}
                      onChange={(e) => setOptC(e.target.value)}
                      className="px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-chalk outline-none focus:border-cyan-electric"
                    />
                    <input
                      type="text"
                      placeholder="الخيار (د)"
                      value={optD}
                      onChange={(e) => setOptD(e.target.value)}
                      className="px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-chalk outline-none focus:border-cyan-electric"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-chalk/90">الإجابة الصحيحة</label>
                    <select
                      value={correctAns}
                      onChange={(e) => setCorrectAns(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-chalk outline-none focus:border-cyan-electric"
                    >
                      <option value="A">الخيار (أ)</option>
                      <option value="B">الخيار (ب)</option>
                      <option value="C">الخيار (ج)</option>
                      <option value="D">الخيار (د)</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl text-sm font-extrabold text-black bg-cyan-electric hover:bg-cyan-electric-hover shadow-cyan-glow transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة السؤال لبنك الأسئلة</span>
                  </button>
                </form>
              </div>

              {/* Questions List */}
              <div className="chalk-card rounded-3xl p-6 bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="text-lg font-black text-slate-900 dark:text-chalk border-b border-slate-200 dark:border-slate-800 pb-3">أسئلة البنك الحالية ({questionsList.length})</h3>
                <div className="space-y-3">
                  {questionsList.map((q) => (
                    <div key={q.id} className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-chalk">{q.text}</span>
                      <div className="flex flex-wrap gap-2 text-xs">
                        {q.options.map((opt, idx) => (
                          <span key={idx} className="px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-900 text-slate-700 dark:text-chalk">
                            {opt}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: AUDIT & SUBSCRIPTIONS */}
          {(selectedTab === 'audit' || selectedTab === 'subscriptions') && (
            <div className="chalk-card rounded-3xl p-6 bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h3 className="text-lg font-black text-slate-900 dark:text-chalk">سجل الأحداث والعمليات الفعالة (Audit Logs)</h3>
                <p className="text-xs text-slate-500 dark:text-chalk-muted">سجل العمليات وتفعيلات أكواد الشحن المباشرة</p>
              </div>

              <div className="space-y-3 text-xs">
                {[
                  { action: 'VOUCHER_GENERATED', user: 'م/ رضا خيرت (Admin)', details: 'تم توليد 5 أكواد شحن جديدة (اشتراك شهر)', time: 'منذ لحظات' },
                  { action: 'CODE_ACTIVATED', user: 'أحمد محمود العبد', details: 'قام بتفعيل كود ALM-M1-8K9X2P (اشتراك شهر)', time: 'منذ 10 دقائق' },
                  { action: 'LESSON_CREATED', user: 'م/ رضا خيرت (Admin)', details: 'تم رفع درس: مجموعات الأعداد والعمليات الأساسية', time: 'منذ ساعتين' },
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
