'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { DarkGradientBg } from '@/components/ui/elegant-dark-pattern';
import { getCurrentUser, UserSession } from '@/lib/actions/auth';
import { getLessonDetailsAction } from '@/lib/actions/lessons';
import { LessonDetailsDTO } from '@/lib/types/dashboard';
import { VideoPlayer } from '@/components/lessons/VideoPlayer';
import { LessonPdfViewer } from '@/components/lessons/LessonPdfViewer';
import { LessonLockedCard } from '@/components/lessons/LessonLockedCard';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  FileText,
  Video,
  FileQuestion,
  Info,
  CheckCircle2,
  Clock,
  BookOpen,
  Sparkles,
  ShieldCheck,
  Award,
  Layers,
} from 'lucide-react';

export default function LessonPlayerPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [lessonDetails, setLessonDetails] = useState<LessonDetailsDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Active Tab: 'video' | 'pdf' | 'notes' | 'quiz'
  const [activeTab, setActiveTab] = useState<'video' | 'pdf' | 'notes' | 'quiz'>('video');

  // Watch progress state
  const [watchPct, setWatchPct] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const loadData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);

      const res = await getLessonDetailsAction(params.id);
      if (res.success && res.data) {
        setLessonDetails(res.data);
        setWatchPct(res.data.studentProgress?.watchPercentage || 0);
        setIsCompleted(Boolean(res.data.studentProgress?.isCompleted));
      } else {
        setErrorMsg(res.error || 'تعذر تحميل بيانات الدرس');
      }
    } catch {
      setErrorMsg('حدث خطأ غير متوقع أثناء تحميل الدرس');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [params.id]);

  if (loading) {
    return (
      <DarkGradientBg>
        <div className="min-h-screen flex items-center justify-center font-arabic">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-cyan-electric border-t-transparent rounded-full animate-spin mx-auto shadow-lg shadow-cyan-electric/20" />
            <p className="text-sm font-bold text-slate-700 dark:text-chalk">
              جاري تجهيز المشغل المشفر وفحص الصلاحيات...
            </p>
          </div>
        </div>
      </DarkGradientBg>
    );
  }

  if (errorMsg || !lessonDetails) {
    return (
      <DarkGradientBg>
        <div className="min-h-screen flex items-center justify-center font-arabic p-4">
          <div className="max-w-md w-full p-6 rounded-3xl bg-slate-900 border border-red-500/30 text-center space-y-4">
            <p className="text-sm font-bold text-red-400">{errorMsg || 'لم يتم العثور على الدرس'}</p>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-electric text-slate-950 font-bold text-xs"
            >
              <ArrowRight className="w-4 h-4" />
              <span>العودة لقائمة الكورسات</span>
            </Link>
          </div>
        </div>
      </DarkGradientBg>
    );
  }

  // If student is blocked due to subscription or grade mismatch
  if (!lessonDetails.hasAccess) {
    return (
      <DarkGradientBg>
        <div className="min-h-screen flex flex-col font-arabic">
          {/* Header */}
          <header className="bg-slate-950/90 backdrop-blur-xl border-b border-slate-800 p-4 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <Link
                href="/student"
                className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-cyan-electric transition-colors"
              >
                <ArrowRight className="w-4 h-4 text-cyan-electric" />
                <span>لوحة تحكم الطالب</span>
              </Link>
              <span className="text-xs font-bold text-chalk-muted">{lessonDetails.gradeName}</span>
            </div>
          </header>

          <main className="flex-1 flex items-center justify-center p-4">
            <LessonLockedCard
              lessonTitle={lessonDetails.title}
              lessonGradeName={lessonDetails.gradeName}
              userGradeName={lessonDetails.assignedGradeName || user?.gradeName}
              isGuest={!user}
              gradeMismatch={Boolean(lessonDetails.gradeMismatch)}
              requiresSubscription={Boolean(lessonDetails.requiresSubscription)}
              reason={lessonDetails.accessReason}
              onActivated={loadData}
            />
          </main>
        </div>
      </DarkGradientBg>
    );
  }

  return (
    <DarkGradientBg>
      <div className="min-h-screen flex flex-col font-arabic">
        {/* 1. Top Navigation & Breadcrumbs Header */}
        <header className="bg-slate-950/95 backdrop-blur-xl border-b border-slate-800 p-3 sm:p-4 sticky top-0 z-50 shadow-md">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Breadcrumb links */}
            <div className="flex items-center gap-2 text-xs text-slate-400 w-full md:w-auto truncate">
              <Link
                href="/student"
                className="flex items-center gap-1 font-bold text-slate-300 hover:text-cyan-electric transition-colors shrink-0"
              >
                <ArrowRight className="w-4 h-4 text-cyan-electric" />
                <span>الرئيسية</span>
              </Link>
              <span>/</span>
              <Link
                href={`/courses/${encodeURIComponent(lessonDetails.gradeName)}`}
                className="hover:text-cyan-electric transition-colors truncate"
              >
                {lessonDetails.gradeName}
              </Link>
              <span>/</span>
              <span className="text-slate-300 font-semibold truncate">{lessonDetails.branchName}</span>
              <span>/</span>
              <span className="text-cyan-electric font-bold truncate">{lessonDetails.title}</span>
            </div>

            {/* Badges & Quick Stats */}
            <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto justify-between md:justify-end">
              <div className="flex items-center gap-1.5 text-xs text-chalk-muted font-medium bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                <Clock className="w-3.5 h-3.5 text-cyan-electric" />
                <span>{lessonDetails.durationMinutes} دقيقة</span>
              </div>

              {isCompleted ? (
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>مكتمل ({watchPct}%)</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-electric bg-cyan-electric/10 border border-cyan-electric/25 px-3 py-1.5 rounded-xl">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-electric" />
                  <span>نسبة المشاهدة: {watchPct}%</span>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* 2. Main Lesson Content Grid */}
        <main className="flex-1 max-w-7xl mx-auto w-full p-3 sm:p-6 lg:p-8 space-y-6">
          {/* Tabs Switcher */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 overflow-x-auto gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('video')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
                  activeTab === 'video'
                    ? 'bg-gradient-to-r from-cyan-electric to-blue-500 text-slate-950 shadow-cyan-glow'
                    : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <Video className="w-4 h-4" />
                <span>فيديو الشرح التفاعلي</span>
              </button>

              {lessonDetails.pdfPath && (
                <button
                  onClick={() => setActiveTab('pdf')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
                    activeTab === 'pdf'
                      ? 'bg-gradient-to-r from-cyan-electric to-blue-500 text-slate-950 shadow-cyan-glow'
                      : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>مذكرة الدرس PDF</span>
                </button>
              )}

              <button
                onClick={() => setActiveTab('notes')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
                  activeTab === 'notes'
                    ? 'bg-gradient-to-r from-cyan-electric to-blue-500 text-slate-950 shadow-cyan-glow'
                    : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <Info className="w-4 h-4" />
                <span>تفاصيل ونقاط الدرس</span>
              </button>

              {lessonDetails.quizzes && lessonDetails.quizzes.length > 0 && (
                <button
                  onClick={() => setActiveTab('quiz')}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shrink-0 ${
                    activeTab === 'quiz'
                      ? 'bg-gradient-to-r from-cyan-electric to-blue-500 text-slate-950 shadow-cyan-glow'
                      : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  <FileQuestion className="w-4 h-4" />
                  <span>امتحان الدرس ({lessonDetails.quizzes.length})</span>
                </button>
              )}
            </div>
          </div>

          {/* Active Tab View */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Stage (2 cols on lg) */}
            <div className="lg:col-span-2 space-y-6">
              {activeTab === 'video' && (
                <VideoPlayer
                  lessonId={lessonDetails.id}
                  lessonTitle={lessonDetails.title}
                  media={lessonDetails.parsedMedia}
                  poster={lessonDetails.thumbnailPath || undefined}
                  initialPosition={lessonDetails.studentProgress?.lastPosition || 0}
                  initialWatchPercentage={lessonDetails.studentProgress?.watchPercentage || 0}
                  studentName={user?.fullName}
                  studentPhone={user?.phone}
                  onProgressUpdate={(pct, _pos, comp) => {
                    setWatchPct(pct);
                    if (comp) setIsCompleted(true);
                  }}
                  onCompleted={() => setIsCompleted(true)}
                />
              )}

              {activeTab === 'pdf' && lessonDetails.pdfPath && (
                <LessonPdfViewer
                  pdfUrl={lessonDetails.pdfPath}
                  title={lessonDetails.title}
                  studentName={user?.fullName}
                  studentPhone={user?.phone}
                  allowDownload={true}
                />
              )}

              {activeTab === 'notes' && (
                <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
                  <div className="flex items-center gap-2 text-cyan-electric font-bold text-base">
                    <BookOpen className="w-5 h-5" />
                    <span>ملاحظات وإرشادات الدرس</span>
                  </div>
                  <p className="text-sm text-chalk leading-relaxed whitespace-pre-line">
                    {lessonDetails.description}
                  </p>
                  <div className="p-4 rounded-2xl bg-cyan-electric/5 border border-cyan-electric/20 space-y-2">
                    <h5 className="text-xs font-bold text-cyan-electric">💡 نصائح للمذاكرة الفعالة:</h5>
                    <ul className="text-xs text-chalk-muted space-y-1 list-disc list-inside leading-relaxed">
                      <li>احرص على تدوين القوانين والملاحظات في كشكول الرياضيات الخاص بك.</li>
                      <li>قم بحل الأمثلة المحلولة في المذكرة بنفسك بعد مشاهدة الشرح مباشرة.</li>
                      <li>انتقل للامتحان القصير بعد إتمام مشاهدة الفيديو لقياس مستوى استيعابك.</li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'quiz' && (
                <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2 text-cyan-electric font-bold text-base">
                      <Award className="w-5 h-5" />
                      <span>امتحانات وتمارين الدرس</span>
                    </div>
                    <span className="text-xs text-chalk-muted">تقييم إلكتروني فوري</span>
                  </div>

                  <div className="space-y-3">
                    {lessonDetails.quizzes.map((quiz) => (
                      <div
                        key={quiz.id}
                        className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4"
                      >
                        <div className="space-y-1 text-right w-full sm:w-auto">
                          <h4 className="text-sm font-bold text-chalk">{quiz.title}</h4>
                          <p className="text-xs text-chalk-muted">
                            المدة: {quiz.durationMinutes} دقيقة • درجة النجاح: {quiz.passScore}% • عدد المحاولات: {quiz.maxAttempts}
                          </p>
                        </div>
                        <Link
                          href={`/exams/${quiz.id}`}
                          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-cyan-electric text-slate-950 font-bold text-xs flex items-center justify-center gap-2 hover:shadow-cyan-glow transition-all shrink-0"
                        >
                          <span>بدء الامتحان الآن</span>
                          <ChevronLeft className="w-4 h-4" />
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lesson Metadata & Overview Card */}
              <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                  <div>
                    <h2 className="text-lg sm:text-xl font-black text-chalk">{lessonDetails.title}</h2>
                    <span className="text-xs text-cyan-electric font-medium">
                      {lessonDetails.gradeName} • {lessonDetails.branchName} • {lessonDetails.unitTitle}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold text-emerald-400 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      محتوى رسمي معتمد
                    </span>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-chalk-muted leading-relaxed">
                  {lessonDetails.description}
                </p>
              </div>
            </div>

            {/* Sidebar Playlist / Unit Card (1 col on lg) */}
            <div className="space-y-6">
              {/* Unit Info Card */}
              <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-chalk">
                    <Layers className="w-4 h-4 text-cyan-electric" />
                    <span>محتوى الوحدة الدراسية</span>
                  </div>
                  <span className="text-[11px] text-cyan-electric font-semibold">{lessonDetails.branchName}</span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-300">{lessonDetails.unitTitle}</h4>
                  <p className="text-[11px] text-chalk-muted leading-relaxed">
                    دروس وتمارين مادة الرياضيات لـ {lessonDetails.gradeName} بإشراف م/ رضا خيرت.
                  </p>
                </div>

                {lessonDetails.pdfPath && (
                  <button
                    onClick={() => setActiveTab('pdf')}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-electric text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    <span>فتح مذكرة الدرس PDF</span>
                  </button>
                )}
              </div>

              {/* Quick Actions & Support */}
              <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3 text-center">
                <h4 className="text-xs font-bold text-chalk">هل لديك استفسار حول مسألة رياضية؟</h4>
                <p className="text-[11px] text-chalk-muted leading-relaxed">
                  تواصل مباشرة مع فريق م/ رضا خيرت للمساعدة وشرح خطوات الحل.
                </p>
                <a
                  href="https://wa.me/201008901896"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/25 transition-all text-xs font-bold"
                >
                  <span>استفسار عبر واتساب</span>
                </a>
              </div>
            </div>
          </div>
        </main>
      </div>
    </DarkGradientBg>
  );
}
