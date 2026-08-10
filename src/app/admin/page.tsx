'use client';

import React, { useState, useEffect } from 'react';
import { DashboardSidebar } from '@/components/ui/dashboard-sidebar';
import { DarkGradientBg } from '@/components/ui/elegant-dark-pattern';
import { generateVoucherCodes, getAllVouchers, VoucherCode } from '@/lib/actions/vouchers';
import { createLessonAction, getLessonsList, LessonItem } from '@/lib/actions/lessons';
import { useRouter } from 'next/navigation';
import { getCurrentUser, getAllRegisteredUsers } from '@/lib/actions/auth';
import { LogoSearchInput } from '@/components/ui/LogoSearchInput';
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
  Copy,
  Layers,
  FileUp,
  Link2,
  Image as ImageIcon,
  Clock,
  FolderGit2,
} from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState('dashboard');

  // Voucher Generator State
  const [planType, setPlanType] = useState<'1month' | 'term' | 'year'>('1month');
  const [codeCount, setCodeCount] = useState(5);
  const [vouchers, setVouchers] = useState<VoucherCode[]>([]);

  // Lesson Upload State
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDesc, setLessonDesc] = useState('');
  const [lessonGrade, setLessonGrade] = useState('الصف الأول الإعدادي');
  const [lessonBranch, setLessonBranch] = useState('فرع الجبر والإحصاء');
  const [lessonUnit, setLessonUnit] = useState('الوحدة الأولى: الأعداد النسبية والعمليات عليها');
  const [lessonCourse, setLessonCourse] = useState('كورس الجبر الشامل (الترم الأول)');
  const [sequenceOrder, setSequenceOrder] = useState(1);
  const [durationMinutes, setDurationMinutes] = useState(60);
  
  // Media Input Mode: 'file' (direct device upload) or 'url' (Google Drive/YouTube/HTTP)
  const [videoSourceMode, setVideoSourceMode] = useState<'file' | 'url'>('file');
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [selectedPdfFile, setSelectedPdfFile] = useState<File | null>(null);
  const [selectedThumbnailFile, setSelectedThumbnailFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');

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
    { id: 'q-1', text: 'س: اختر الإجابة الصحيحة: أي مما يلي يمثل عدداً نسبياً؟', options: ['A) 5/0', 'B) 3/4', 'C) √(-4)', 'D) 0/0'], correct: 'B', branch: 'فرع الجبر والإحصاء' },
    { id: 'q-2', text: 'س: في المثلث قائم الزاوية، مجموع مربعي طولي ضلعي القائمة يساوي:', options: ['A) مربع الوتر', 'B) نصف الوتر', 'C) ضعف الوتر', 'D) محيط المثلث'], correct: 'A', branch: 'فرع الهندسة والقياس' },
  ]);
  const [qMsg, setQMsg] = useState('');

  // Exam / Quiz Builder State
  const [quizTitle, setQuizTitle] = useState('');
  const [quizGrade, setQuizGrade] = useState('الصف الأول الإعدادي');
  const [quizBranch, setQuizBranch] = useState('فرع الجبر والإحصاء');
  const [quizDuration, setQuizDuration] = useState(25);
  const [quizQCount, setQuizQCount] = useState(10);
  const [quizMsg, setQuizMsg] = useState('');
  const [quizzesList, setQuizzesList] = useState([
    { id: 'qz-1', title: 'اختبار الوحدة الأولى: الجبر والأعداد النسبية', count: '15 سؤالاً', duration: '20 دقيقة', grade: 'الصف الأول الإعدادي', branch: 'فرع الجبر والإحصاء' },
    { id: 'qz-2', title: 'اختبار هندسة: الإنشاءات الهندسية والتناظر', count: '20 سؤالاً', duration: '25 دقيقة', grade: 'الصف الأول الإعدادي', branch: 'فرع الهندسة والقياس' },
  ]);

  // Student Search & Filter
  const [searchStudent, setSearchStudent] = useState('');
  const [studentsList, setStudentsList] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        router.push('/sign-in');
        return;
      }
      if (currentUser.role !== 'ADMIN') {
        router.push('/student');
        return;
      }
      const vList = await getAllVouchers();
      setVouchers(vList);
      const lList = await getLessonsList();
      setLessons(lList);

      const registeredUsers = await getAllRegisteredUsers();
      const realStudents = registeredUsers
        .filter((u) => u.role === 'STUDENT')
        .map((u) => ({
          id: u.id,
          name: u.fullName,
          phone: u.phone,
          parentPhone: u.parentPhone || 'غير محدد',
          grade: u.gradeName || 'الصف الأول الإعدادي',
          gov: u.governorate || 'القاهرة',
          status: 'نشط',
          subExpire: '30 يوماً',
        }));

      if (realStudents.length > 0) {
        setStudentsList(realStudents);
      }
    }
    loadData();
  }, [router]);

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

    let finalVideoPath = videoUrl;
    if (videoSourceMode === 'file' && selectedVideoFile) {
      finalVideoPath = URL.createObjectURL(selectedVideoFile);
    }

    let finalPdfPath = pdfUrl;
    if (selectedPdfFile) {
      finalPdfPath = URL.createObjectURL(selectedPdfFile);
    }

    let finalThumbnailPath = thumbnailUrl || '/teacher_reda_kheyrat.jpg';
    if (selectedThumbnailFile) {
      finalThumbnailPath = URL.createObjectURL(selectedThumbnailFile);
    }

    const fd = new FormData();
    fd.append('title', lessonTitle);
    fd.append('description', lessonDesc);
    fd.append('gradeName', lessonGrade);
    fd.append('branchName', lessonBranch);
    fd.append('unitTitle', lessonUnit);
    fd.append('courseName', lessonCourse);
    fd.append('sequenceOrder', String(sequenceOrder));
    fd.append('durationMinutes', String(durationMinutes));
    fd.append('thumbnailPath', finalThumbnailPath);
    if (finalVideoPath) fd.append('videoUrl', finalVideoPath);
    if (finalPdfPath) fd.append('pdfUrl', finalPdfPath);

    const res = await createLessonAction(fd);
    if (res.success && res.lesson) {
      setUploadMsg(`تم نشر المحاضرة (${durationMinutes} دقيقة) بنجاح في ${lessonCourse}!`);
      setLessonTitle('');
      setLessonDesc('');
      setSelectedVideoFile(null);
      setSelectedPdfFile(null);
      setSelectedThumbnailFile(null);
      setVideoUrl('');
      setPdfUrl('');
      setThumbnailUrl('');
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
      branch: lessonBranch,
    };

    setQuestionsList([newQ, ...questionsList]);
    setQMsg('تمت إضافة السؤال بنجاح إلى بنك الأسئلة!');
    setQText('');
    setOptA('');
    setOptB('');
    setOptC('');
    setOptD('');
  };

  const handleCreateQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizTitle.trim()) return;

    const newQuiz = {
      id: `qz-${Date.now()}`,
      title: quizTitle.trim(),
      count: `${quizQCount} سؤالاً`,
      duration: `${quizDuration} دقيقة`,
      grade: quizGrade,
      branch: quizBranch,
    };

    setQuizzesList([newQuiz, ...quizzesList]);
    setQuizMsg('تم نشر الامتحان بنجاح للطلاب على المنصة!');
    setQuizTitle('');
  };

  const filteredStudents = React.useMemo(() => {
    return studentsList.filter(
      (st) => st.name.includes(searchStudent) || st.phone.includes(searchStudent) || st.gov.includes(searchStudent)
    );
  }, [studentsList, searchStudent]);

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
          
          {/* Top Admin Header Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-electric/10 text-cyan-electric text-xs font-bold mb-2 border border-cyan-electric/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>لوحة التحكم المباشرة للمدرس (Admin Control Center)</span>
              </div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-chalk">
                منصة المهندس — م/ رضا خيرت
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedTab('vouchers')}
                className="px-5 py-3 rounded-2xl text-xs font-black text-black bg-cyan-electric hover:bg-cyan-electric-hover shadow-cyan-glow transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>توليد أكواد جديدة</span>
              </button>
            </div>
          </div>

          {/* ==================================================== */}
          {/* TAB 1: OVERVIEW DASHBOARD */}
          {/* ==================================================== */}
          {selectedTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Admin Stat Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <button
                  onClick={() => setSelectedTab('students')}
                  className="text-right chalk-card rounded-3xl p-6 space-y-3 bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-cyan-electric transition-all"
                >
                  <div className="flex items-center justify-between text-cyan-electric">
                    <Users className="w-7 h-7" />
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-cyan-electric/10">+12% هذا الشهر</span>
                  </div>
                  <div className="text-3xl font-black text-slate-900 dark:text-chalk">{studentsList.length} طالب</div>
                  <div className="text-xs text-slate-500 dark:text-chalk-muted font-bold">إجمالي الطلاب المسجلين</div>
                </button>

                <button
                  onClick={() => setSelectedTab('vouchers')}
                  className="text-right chalk-card rounded-3xl p-6 space-y-3 bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-cyan-electric transition-all"
                >
                  <div className="flex items-center justify-between text-emerald-500">
                    <CreditCard className="w-7 h-7" />
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10">نشط</span>
                  </div>
                  <div className="text-3xl font-black text-slate-900 dark:text-chalk">{vouchers.length} كود</div>
                  <div className="text-xs text-slate-500 dark:text-chalk-muted font-bold">أكواد الشحن المتوفرة</div>
                </button>

                <button
                  onClick={() => setSelectedTab('lessons')}
                  className="text-right chalk-card rounded-3xl p-6 space-y-3 bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-cyan-electric transition-all"
                >
                  <div className="flex items-center justify-between text-amber-500">
                    <Video className="w-7 h-7" />
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-500/10">مرفوع</span>
                  </div>
                  <div className="text-3xl font-black text-slate-900 dark:text-chalk">{lessons.length} درس</div>
                  <div className="text-xs text-slate-500 dark:text-chalk-muted font-bold">درساً ومحاضرة طويلة</div>
                </button>

                <button
                  onClick={() => setSelectedTab('questions')}
                  className="text-right chalk-card rounded-3xl p-6 space-y-3 bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 hover:border-cyan-electric transition-all"
                >
                  <div className="flex items-center justify-between text-blue-500">
                    <FileQuestion className="w-7 h-7" />
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-500/10">MCQ</span>
                  </div>
                  <div className="text-3xl font-black text-slate-900 dark:text-chalk">{questionsList.length} سؤالاً</div>
                  <div className="text-xs text-slate-500 dark:text-chalk-muted font-bold">سؤالاً في بنك الأسئلة</div>
                </button>
              </div>

              {/* Quick Actions Shortcuts */}
              <div className="chalk-card rounded-3xl p-6 bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="text-lg font-black text-slate-900 dark:text-chalk border-b border-slate-200 dark:border-slate-800 pb-3">إجراءات التحكم السريع</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button
                    onClick={() => setSelectedTab('lessons')}
                    className="p-4 rounded-2xl bg-cyan-electric/10 border border-cyan-electric/30 text-cyan-electric hover:bg-cyan-electric/20 font-extrabold text-xs flex items-center justify-center gap-2"
                  >
                    <UploadCloud className="w-4 h-4" />
                    <span>رفع محاضرة طويلة / كورس</span>
                  </button>
                  <button
                    onClick={() => setSelectedTab('quizzes')}
                    className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20 font-extrabold text-xs flex items-center justify-center gap-2"
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span>إنشاء امتحان جديد للطلاب</span>
                  </button>
                  <button
                    onClick={() => setSelectedTab('questions')}
                    className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-500 hover:bg-blue-500/20 font-extrabold text-xs flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة سؤال لبنك الأسئلة</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 2: STUDENTS MANAGEMENT */}
          {/* ==================================================== */}
          {selectedTab === 'students' && (
            <div className="chalk-card rounded-3xl p-6 bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-chalk">إدارة حسابات الطلاب المسجلين</h3>
                  <p className="text-xs text-slate-500 dark:text-chalk-muted">البحث باسم الطالب أو المحافظة أو رقم ولي الأمر</p>
                </div>
                <div className="w-full sm:w-72">
                  <LogoSearchInput
                    value={searchStudent}
                    onChange={(e) => setSearchStudent(e.target.value)}
                    onClear={() => setSearchStudent('')}
                    placeholder="بحث باسم الطالب أو رقم الهاتف..."
                    size="sm"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-chalk-muted font-bold">
                      <th className="py-3.5 px-4">اسم الطالب</th>
                      <th className="py-3.5 px-4">رقم هاتف الطالب</th>
                      <th className="py-3.5 px-4">رقم ولي الأمر</th>
                      <th className="py-3.5 px-4">المحافظة</th>
                      <th className="py-3.5 px-4">الصف الدراسي</th>
                      <th className="py-3.5 px-4">صلاحية الاشتراك</th>
                      <th className="py-3.5 px-4">حالة الحساب</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80 font-medium text-slate-800 dark:text-chalk">
                    {filteredStudents.map((st) => (
                      <tr key={st.id} className="hover:bg-slate-100/50 dark:hover:bg-slate-900/50 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-chalk">{st.name}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-chalk-muted" dir="ltr">{st.phone}</td>
                        <td className="py-3.5 px-4 font-mono text-slate-500 dark:text-chalk-muted" dir="ltr">{st.parentPhone}</td>
                        <td className="py-3.5 px-4 font-bold text-cyan-electric">{st.gov}</td>
                        <td className="py-3.5 px-4">{st.grade}</td>
                        <td className="py-3.5 px-4 font-bold text-emerald-500">{st.subExpire}</td>
                        <td className="py-3.5 px-4">
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

          {/* ==================================================== */}
          {/* TAB 3: COURSES & GRADES STRUCTURE */}
          {/* ==================================================== */}
          {selectedTab === 'courses' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-chalk">المناهج والصفوف الدراسية والمواد</h2>
                <p className="text-xs text-slate-500 dark:text-chalk-muted">هيكلة المراحل التعليمية وفروع الرياضيات المتاحة للطلاب</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { grade: 'الصف الأول الإعدادي', stage: 'المرحلة الإعدادية', branches: ['فرع الجبر والإحصاء', 'فرع الهندسة والقياس'], lessons: 24 },
                  { grade: 'الصف الثاني الإعدادي', stage: 'المرحلة الإعدادية', branches: ['فرع الجبر والإحصاء', 'فرع الهندسة والتحليل'], lessons: 28 },
                  { grade: 'الصف الثالث الإعدادي', stage: 'المرحلة الإعدادية', branches: ['فرع الجبر وحساب المثلثات', 'فرع الهندسة التحليلية'], lessons: 32 },
                  { grade: 'الصف الأول الثانوي', stage: 'المرحلة الثانوية', branches: ['فرع الجبر والأعداد المركبة', 'حساب المثلثات', 'الهندسة المستوية'], lessons: 36 },
                ].map((c, idx) => (
                  <div key={idx} className="chalk-card rounded-3xl p-6 bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-cyan-electric px-2.5 py-1 rounded-md bg-cyan-electric/10 border border-cyan-electric/30">
                        {c.stage}
                      </span>
                      <span className="text-xs font-bold text-slate-500">{c.lessons} درساً متاحة</span>
                    </div>

                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-chalk">{c.grade}</h3>

                    <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                      <span className="text-xs font-bold text-slate-700 dark:text-chalk/80 block">فروع المنهج:</span>
                      <div className="flex flex-wrap gap-2">
                        {c.branches.map((b, i) => (
                          <span key={i} className="text-xs font-bold px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-cyan-electric">
                            • {b}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 4: LESSONS MANAGEMENT (LONG VIDEO & COURSE CMS) */}
          {/* ==================================================== */}
          {selectedTab === 'lessons' && (
            <div className="space-y-8">
              <div className="chalk-card rounded-3xl p-6 bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 space-y-6">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                  <h3 className="text-lg font-black text-slate-900 dark:text-chalk">رفع وتخصيص فيديو طويل / كورس وصورة مصغرة</h3>
                  <p className="text-xs text-slate-500 dark:text-chalk-muted">دعم المحاضرات الطويلة (ساعة فأكثر)، تعيين الكورس المحدد، ترتيب الحلقات والصورة المصغرة</p>
                </div>

                {uploadMsg && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{uploadMsg}</span>
                  </div>
                )}

                <form onSubmit={handleUploadLesson} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Lesson Title */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-chalk/90">عنوان المحاضرة أو الدرس</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: الشرح الكامل والشامل للوحدة الأولى في الجبر (محاضرة 60 دقيقة)"
                      value={lessonTitle}
                      onChange={(e) => setLessonTitle(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk text-xs outline-none focus:border-cyan-electric"
                    />
                  </div>

                  {/* Course Name */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-chalk/90 flex items-center gap-1.5">
                      <FolderGit2 className="w-3.5 h-3.5 text-cyan-electric" />
                      اسم الكورس / التتابع
                    </label>
                    <select
                      value={lessonCourse}
                      onChange={(e) => setLessonCourse(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk text-xs outline-none focus:border-cyan-electric"
                    >
                      <option value="كورس الجبر الشامل (الترم الأول)">كورس الجبر الشامل (الترم الأول)</option>
                      <option value="كورس الهندسة وحساب المثلثات">كورس الهندسة وحساب المثلثات</option>
                      <option value="كورس المراجعة النهائية والليالي الامتحانية">كورس المراجعة النهائية والليالي الامتحانية</option>
                      <option value="كورس التأسيس المباشر للرياضيات">كورس التأسيس المباشر للرياضيات</option>
                    </select>
                  </div>

                  {/* Sequence Order */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-chalk/90">ترتيب الدرس / الحلقة رقم</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={sequenceOrder}
                      onChange={(e) => setSequenceOrder(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk text-xs outline-none focus:border-cyan-electric"
                    />
                  </div>

                  {/* Grade Level */}
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

                  {/* Branch */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-chalk/90">فرع المادة</label>
                    <select
                      value={lessonBranch}
                      onChange={(e) => setLessonBranch(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk text-xs outline-none focus:border-cyan-electric"
                    >
                      <option value="فرع الجبر والإحصاء">فرع الجبر والإحصاء</option>
                      <option value="فرع الهندسة والقياس">فرع الهندسة والقياس</option>
                      <option value="فرع حساب المثلثات">فرع حساب المثلثات</option>
                    </select>
                  </div>

                  {/* Unit Title */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-chalk/90">عنوان الوحدة</label>
                    <input
                      type="text"
                      placeholder="مثال: الوحدة الأولى: الأعداد النسبية"
                      value={lessonUnit}
                      onChange={(e) => setLessonUnit(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk text-xs outline-none focus:border-cyan-electric"
                    />
                  </div>

                  {/* Video Duration (Minutes / Long Video) */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-chalk/90 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-cyan-electric" />
                      مدة المحاضرة (بالدقائق)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="1"
                        max="300"
                        value={durationMinutes}
                        onChange={(e) => setDurationMinutes(Number(e.target.value))}
                        className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk text-xs outline-none focus:border-cyan-electric"
                      />
                      <button
                        type="button"
                        onClick={() => setDurationMinutes(60)}
                        className="px-3 py-2 rounded-xl text-xs font-bold bg-cyan-electric/15 text-cyan-electric border border-cyan-electric/30 hover:bg-cyan-electric/25 whitespace-nowrap"
                      >
                        60 دقيقة
                      </button>
                      <button
                        type="button"
                        onClick={() => setDurationMinutes(90)}
                        className="px-3 py-2 rounded-xl text-xs font-bold bg-cyan-electric/15 text-cyan-electric border border-cyan-electric/30 hover:bg-cyan-electric/25 whitespace-nowrap"
                      >
                        90 دقيقة
                      </button>
                    </div>
                  </div>

                  {/* Thumbnail Image Picker & Preview */}
                  <div className="md:col-span-2 space-y-2 p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800">
                    <label className="text-xs font-bold text-slate-700 dark:text-chalk flex items-center gap-1.5">
                      <ImageIcon className="w-3.5 h-3.5 text-cyan-electric" />
                      الصورة المصغرة للمحاضرة (Thumbnail Image):
                    </label>
                    
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setSelectedThumbnailFile(e.target.files?.[0] || null)}
                        className="w-full text-xs text-slate-700 dark:text-chalk file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-cyan-electric file:text-black hover:file:bg-cyan-electric-hover cursor-pointer"
                      />
                      
                      {(selectedThumbnailFile || thumbnailUrl) && (
                        <div className="w-24 h-14 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 shrink-0 bg-slate-900">
                          <img
                            src={selectedThumbnailFile ? URL.createObjectURL(selectedThumbnailFile) : thumbnailUrl}
                            alt="معاينة الصورة المصغرة"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Video Source Switcher */}
                  <div className="md:col-span-2 space-y-3 p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 dark:text-chalk">مصدر ملف الفيديو (يدعم الفيديوهات الطويلة 1hr+):</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setVideoSourceMode('file')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                            videoSourceMode === 'file' ? 'bg-cyan-electric text-black shadow-cyan-glow' : 'bg-slate-200 dark:bg-slate-900 text-slate-600 dark:text-chalk'
                          }`}
                        >
                          <FileUp className="w-3.5 h-3.5" />
                          <span>رفع من الجهاز</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setVideoSourceMode('url')}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                            videoSourceMode === 'url' ? 'bg-cyan-electric text-black shadow-cyan-glow' : 'bg-slate-200 dark:bg-slate-900 text-slate-600 dark:text-chalk'
                          }`}
                        >
                          <Link2 className="w-3.5 h-3.5" />
                          <span>رابط Drive / YouTube</span>
                        </button>
                      </div>
                    </div>

                    {videoSourceMode === 'file' ? (
                      <div className="space-y-2">
                        <input
                          type="file"
                          accept="video/*"
                          onChange={(e) => setSelectedVideoFile(e.target.files?.[0] || null)}
                          className="w-full text-xs text-slate-700 dark:text-chalk file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-cyan-electric file:text-black hover:file:bg-cyan-electric-hover cursor-pointer"
                        />
                        {selectedVideoFile && (
                          <p className="text-[11px] font-mono text-emerald-500 font-bold">تم اختيار فيديو من الجهاز: {selectedVideoFile.name} ({(selectedVideoFile.size / (1024 * 1024)).toFixed(1)} MB)</p>
                        )}
                      </div>
                    ) : (
                      <input
                        type="text"
                        placeholder="ضع رابط Google Drive أو YouTube أو MP4..."
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk text-xs font-mono outline-none focus:border-cyan-electric"
                        dir="ltr"
                      />
                    )}
                  </div>

                  {/* PDF File Input */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-chalk/90">رفع المذكرة PDF من الجهاز (اختياري)</label>
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={(e) => setSelectedPdfFile(e.target.files?.[0] || null)}
                      className="w-full text-xs text-slate-700 dark:text-chalk file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-extrabold file:bg-slate-200 dark:file:bg-slate-800 file:text-slate-800 dark:file:text-chalk cursor-pointer"
                    />
                  </div>

                  <div className="md:col-span-2 pt-2">
                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-xl text-sm font-extrabold text-black bg-cyan-electric hover:bg-cyan-electric-hover shadow-cyan-glow transition-all flex items-center justify-center gap-2"
                    >
                      <UploadCloud className="w-4 h-4" />
                      <span>حفظ ونشر المحاضرة الكنسية للطلاب</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Lessons List */}
              <div className="chalk-card rounded-3xl p-6 bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 space-y-4">
                <h3 className="text-lg font-black text-slate-900 dark:text-chalk border-b border-slate-200 dark:border-slate-800 pb-3">الدروس والمحاضرات المرفوعة ({lessons.length})</h3>
                
                <div className="space-y-3">
                  {lessons.map((les) => (
                    <div key={les.id} className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-10 rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-slate-700">
                          <img src={les.thumbnailPath || '/teacher_reda_kheyrat.jpg'} alt={les.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="space-y-1">
                          <span className="font-bold text-sm text-slate-900 dark:text-chalk">{les.title}</span>
                          <p className="text-xs text-slate-500 dark:text-chalk-muted">{les.gradeName} • {les.courseName || les.branchName} • مدة المحاضرة: {les.durationMinutes} دقيقة</p>
                        </div>
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

          {/* ==================================================== */}
          {/* TAB 5: QUESTION BANK */}
          {/* ==================================================== */}
          {selectedTab === 'questions' && (
            <div className="space-y-8">
              <div className="chalk-card rounded-3xl p-6 bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 space-y-6">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                  <h3 className="text-lg font-black text-slate-900 dark:text-chalk">إضافة سؤال جديد لبنك الأسئلة (MCQ Builder)</h3>
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
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900 dark:text-chalk">{q.text}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-electric/15 text-cyan-electric">{q.branch}</span>
                      </div>
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

          {/* ==================================================== */}
          {/* TAB 6: QUIZZES MANAGEMENT & LOCAL EXAM CREATOR */}
          {/* ==================================================== */}
          {selectedTab === 'quizzes' && (
            <div className="space-y-8">
              {/* Quiz Creator Form */}
              <div className="chalk-card rounded-3xl p-6 bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 space-y-6">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                  <h3 className="text-lg font-black text-slate-900 dark:text-chalk">إنشاء امتحان / اختبار جديد ونشره للطلاب</h3>
                  <p className="text-xs text-slate-500 dark:text-chalk-muted">حدد عنوان الامتحان، الصف الدراسي، مدة الاختيار بالدقائق وعدد الأسئلة</p>
                </div>

                {quizMsg && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{quizMsg}</span>
                  </div>
                )}

                <form onSubmit={handleCreateQuiz} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-chalk/90">عنوان الامتحان / الاختبار</label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: امتحان شهر أكتوبر في الجبر وحساب المثلثات"
                      value={quizTitle}
                      onChange={(e) => setQuizTitle(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk text-xs outline-none focus:border-cyan-electric"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-chalk/90">الصف الدراسي</label>
                    <select
                      value={quizGrade}
                      onChange={(e) => setQuizGrade(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk text-xs outline-none focus:border-cyan-electric"
                    >
                      <option value="الصف الأول الإعدادي">الصف الأول الإعدادي</option>
                      <option value="الصف الثاني الإعدادي">الصف الثاني الإعدادي</option>
                      <option value="الصف الثالث الإعدادي">الصف الثالث الإعدادي</option>
                      <option value="الصف الأول الثانوي">الصف الأول الثانوي</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-chalk/90">فرع المادة</label>
                    <select
                      value={quizBranch}
                      onChange={(e) => setQuizBranch(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk text-xs outline-none focus:border-cyan-electric"
                    >
                      <option value="فرع الجبر والإحصاء">فرع الجبر والإحصاء</option>
                      <option value="فرع الهندسة والقياس">فرع الهندسة والقياس</option>
                      <option value="فرع حساب المثلثات">فرع حساب المثلثات</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-chalk/90">مدة الامتحان (بالدقائق)</label>
                    <input
                      type="number"
                      min="5"
                      max="180"
                      value={quizDuration}
                      onChange={(e) => setQuizDuration(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk text-xs outline-none focus:border-cyan-electric"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-chalk/90">عدد أسئلة الامتحان</label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={quizQCount}
                      onChange={(e) => setQuizQCount(Number(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-chalk text-xs outline-none focus:border-cyan-electric"
                    />
                  </div>

                  <div className="md:col-span-2 pt-2">
                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-xl text-sm font-extrabold text-black bg-cyan-electric hover:bg-cyan-electric-hover shadow-cyan-glow transition-all flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      <span>حفظ وحفظ الامتحان الآن للطلاب</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Active Quizzes List */}
              <div className="space-y-4">
                <h3 className="text-lg font-black text-slate-900 dark:text-chalk">الامتحانات الفعالة المتاحة ({quizzesList.length})</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {quizzesList.map((qz) => (
                    <div key={qz.id} className="chalk-card rounded-3xl p-6 bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-cyan-electric px-2.5 py-1 rounded-md bg-cyan-electric/10 border border-cyan-electric/30">{qz.grade}</span>
                        <span className="text-xs font-bold text-emerald-500">نشط ومتاح</span>
                      </div>

                      <h3 className="text-lg font-extrabold text-slate-900 dark:text-chalk">{qz.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-chalk-muted">{qz.count} • مدة الاختيار: {qz.duration} • {qz.branch}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 7: VOUCHERS GENERATOR */}
          {/* ==================================================== */}
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
                  <h3 className="text-lg font-black text-slate-900 dark:text-chalk">الأكواد الفعالة المنشأة ({vouchers.length})</h3>
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

          {/* ==================================================== */}
          {/* TAB 8: ACTIVE SUBSCRIPTIONS */}
          {/* ==================================================== */}
          {selectedTab === 'subscriptions' && (
            <div className="chalk-card rounded-3xl p-6 bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h3 className="text-xl font-black text-slate-900 dark:text-chalk">سجل الاشتراكات الفعالة للطلاب</h3>
                <p className="text-xs text-slate-500 dark:text-chalk-muted">متابعة مواعيد تجديد وانتهاء الاشتراكات الحالية</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-chalk-muted font-bold">
                      <th className="py-3.5 px-4">اسم الطالب</th>
                      <th className="py-3.5 px-4">الصف الدراسي</th>
                      <th className="py-3.5 px-4">نوع الخطة</th>
                      <th className="py-3.5 px-4">تاريخ التفعيل</th>
                      <th className="py-3.5 px-4">المدة المتبقية</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80 font-medium text-slate-800 dark:text-chalk">
                    {studentsList.map((st) => (
                      <tr key={st.id}>
                        <td className="py-3.5 px-4 font-bold">{st.name}</td>
                        <td className="py-3.5 px-4">{st.grade}</td>
                        <td className="py-3.5 px-4 font-bold text-cyan-electric">اشتراك شهر (30 يوماً)</td>
                        <td className="py-3.5 px-4">01 أغسطس 2026</td>
                        <td className="py-3.5 px-4 font-bold text-emerald-500">{st.subExpire}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ==================================================== */}
          {/* TAB 9: AUDIT LOGS */}
          {/* ==================================================== */}
          {selectedTab === 'audit' && (
            <div className="chalk-card rounded-3xl p-6 bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 space-y-6">
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
                <h3 className="text-xl font-black text-slate-900 dark:text-chalk">سجل الأحداث والعمليات الفعالة (Audit Logs)</h3>
                <p className="text-xs text-slate-500 dark:text-chalk-muted">سجل العمليات وتفعيلات أكواد الشحن المباشرة</p>
              </div>

              <div className="space-y-3 text-xs">
                {[
                  { action: 'VOUCHER_GENERATED', user: 'م/ رضا خيرت (Admin)', details: 'تم توليد 5 أكواد شحن جديدة (اشتراك شهر)', time: 'منذ لحظات' },
                  { action: 'CODE_ACTIVATED', user: 'أحمد محمود العبد', details: 'قام بتفعيل كود ALM-M1-8K9X2P (اشتراك شهر)', time: 'منذ 10 دقائق' },
                  { action: 'LESSON_CREATED', user: 'م/ رضا خيرت (Admin)', details: 'تم رفع درس: مجموعات الأعداد والعمليات الأساسية', time: 'منذ ساعتين' },
                  { action: 'STUDENT_REGISTERED', user: 'سارة إبراهيم حسن', details: 'تسجيل حساب طالب جديد (الصف الأول الثانوي)', time: 'منذ 5 ساعات' },
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
