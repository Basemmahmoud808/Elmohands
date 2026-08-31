'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { getCurrentUser, UserSession } from '@/lib/actions/auth';
import { getCurriculumByGradeAction } from '@/lib/actions/lessons';
import { getStudentSubscriptionStatusAction } from '@/lib/actions/student';
import { CurriculumGradeDTO, CurriculumLessonDTO } from '@/lib/types/dashboard';
import { LessonPdfViewer } from '@/components/lessons/LessonPdfViewer';
import {
  BookOpen,
  Video,
  FileText,
  Play,
  Clock,
  CheckCircle2,
  Lock,
  Sparkles,
  Plus,
  X,
  LogIn,
  UserPlus,
} from 'lucide-react';

export default function GradeCoursesPage() {
  const params = useParams();
  const router = useRouter();

  // Decode grade param
  const rawParam = typeof params.grade === 'string' ? decodeURIComponent(params.grade) : 'الصف الأول الإعدادي';
  const gradeAliasMap: Record<string, string> = {
    'prep1': 'الصف الأول الإعدادي',
    'prep2': 'الصف الثاني الإعدادي',
    'prep3': 'الصف الثالث الإعدادي',
    'sec1': 'الصف الأول الثانوي',
  };
  const gradeName = gradeAliasMap[rawParam] || rawParam;

  const [user, setUser] = useState<UserSession | null>(null);
  const [hasActiveSub, setHasActiveSub] = useState(false);
  const [curriculum, setCurriculum] = useState<CurriculumGradeDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTermIndex, setSelectedTermIndex] = useState(0);

  // PDF Preview modal
  const [activePdfModal, setActivePdfModal] = useState<{ url: string; title: string } | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);

        if (!currentUser) {
          router.push(`/sign-in?redirect=${encodeURIComponent(`/courses/${rawParam}`)}`);
          return;
        }

        const [res, subRes] = await Promise.all([
          getCurriculumByGradeAction(gradeName),
          getStudentSubscriptionStatusAction(),
        ]);

        if (res.success && res.data) {
          setCurriculum(res.data);
        }

        if (subRes.success && subRes.data) {
          setHasActiveSub(subRes.data.hasActiveSubscription);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [gradeName, rawParam, router]);

  const isAdmin = user?.role === 'ADMIN';
  const isMatchingStudent = user?.role === 'STUDENT' && (user.gradeName === gradeName || user.gradeId === curriculum?.id);

  // Active Term
  const activeTerm = curriculum?.terms[selectedTermIndex] || curriculum?.terms[0];

  // Lessons belonging to active term
  const termLessons = useMemo(() => {
    if (!activeTerm) return [];
    const list: Array<CurriculumLessonDTO & { branchName: string; unitTitle: string }> = [];
    activeTerm.branches.forEach((b) => {
      b.units.forEach((u) => {
        u.lessons.forEach((l) => {
          list.push({
            ...l,
            branchName: b.name,
            unitTitle: u.title,
          });
        });
      });
    });
    return list;
  }, [activeTerm]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-black flex items-center justify-center font-arabic transition-colors duration-200">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-cyan-electric border-t-transparent rounded-full animate-spin mx-auto shadow-cyan-glow" />
          <p className="text-sm font-bold text-slate-700 dark:text-chalk">
            جاري جلب دروس {gradeName}...
          </p>
        </div>
      </div>
    );
  }

  // Not logged in gate
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-black font-arabic flex flex-col justify-between transition-colors duration-200">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-5 shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-cyan-electric/15 text-cyan-electric mx-auto flex items-center justify-center">
              <Lock className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-chalk">
              محتوى خاص بطلاب المنصة
            </h2>
            <p className="text-xs text-slate-500 dark:text-chalk-muted leading-relaxed">
              يرجى تسجيل الدخول أو إنشاء حساب جديد للوصول إلى دروس واختبارات ومذكرات {gradeName}.
            </p>
            <div className="flex flex-col gap-2.5 pt-2">
              <Link
                href={`/sign-in?redirect=${encodeURIComponent(`/courses/${rawParam}`)}`}
                className="w-full py-3.5 rounded-2xl bg-cyan-electric hover:bg-cyan-electric-hover text-black font-black text-xs shadow-cyan-glow transition-all flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>تسجيل الدخول</span>
              </Link>
              <Link
                href="/sign-up"
                className="w-full py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-chalk border border-slate-200 dark:border-slate-700 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>إنشاء حساب طالب جديد</span>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const defaultGradeCover = gradeName.includes('الأول الإعدادي')
    ? '/courses/prep-1.jpg'
    : gradeName.includes('الثاني الإعدادي')
    ? '/courses/prep-2.jpg'
    : gradeName.includes('الثالث الإعدادي')
    ? '/courses/prep-3.jpg'
    : gradeName.includes('الأول الثانوي')
    ? '/courses/sec-1.jpg'
    : '/courses/prep-1.jpg';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-chalk font-arabic transition-colors duration-200 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 py-8 sm:py-10 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Course Cover Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-lg min-h-[220px] sm:min-h-[260px] flex flex-col justify-end p-6 sm:p-8">
          <img
            src={curriculum?.coverImage || curriculum?.thumbnailPath || defaultGradeCover}
            alt={gradeName}
            className="absolute inset-0 w-full h-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-electric/20 border border-cyan-electric/40 text-cyan-electric text-xs font-black">
                <Sparkles className="w-3.5 h-3.5" />
                <span>كورس الرياضيات المتكامل • م/ رضا خيرت</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                {gradeName}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                {curriculum?.description || `محاضرات شرح فيديو عالية الجودة، مذكرات تدريبية، وامتحانات تفاعلية لمنهج ${gradeName}.`}
              </p>
            </div>

            {/* Term Switcher */}
            {curriculum?.terms && curriculum.terms.length > 0 && (
              <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700 shadow-sm self-start md:self-auto shrink-0">
                {curriculum.terms.map((term, idx) => (
                  <button
                    key={term.id}
                    onClick={() => setSelectedTermIndex(idx)}
                    className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                      selectedTermIndex === idx
                        ? 'bg-cyan-electric text-black shadow-cyan-glow'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>{term.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Lessons List */}
        {termLessons.length === 0 ? (
          <div className="rounded-3xl p-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm max-w-2xl mx-auto my-12">
            <div className="w-16 h-16 rounded-2xl bg-cyan-electric/10 text-cyan-electric flex items-center justify-center mx-auto">
              <Video className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-slate-900 dark:text-chalk">
                دروس {gradeName} قيد النشر قريباً
              </h3>
              <p className="text-xs text-slate-500 dark:text-chalk-muted leading-relaxed">
                سيتم رفع جميع محاضرات الشرح والمذكرات والامتحانات الخاصة بهذا الصف قريباً من قبل م/ رضا خيرت.
              </p>
            </div>

            {isAdmin && (
              <div className="pt-2">
                <Link
                  href="/admin"
                  className="px-6 py-3 rounded-2xl bg-cyan-electric hover:bg-cyan-electric-hover text-black font-black text-xs shadow-cyan-glow inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة درس لهذا الصف من لوحة التحكم</span>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {termLessons.map((lesson, idx) => {
              const canDirectPlay = isAdmin || (hasActiveSub && isMatchingStudent);

              return (
                <div
                  key={lesson.id}
                  className={`rounded-3xl border overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                    canDirectPlay
                      ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-cyan-electric/40'
                      : 'bg-white/70 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800/80'
                  }`}
                >
                  {/* Thumbnail / Cover Image */}
                  <div className="relative w-full h-44 bg-slate-100 dark:bg-slate-950 flex items-center justify-center overflow-hidden">
                    {lesson.thumbnailPath ? (
                      <Image
                        src={lesson.thumbnailPath}
                        alt={lesson.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <Video className="w-10 h-10 text-cyan-electric/60" />
                        <span className="text-[11px] font-bold">محاضرة فيديو</span>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="absolute top-3 right-3">
                      {lesson.isCompleted ? (
                        <span className="px-2.5 py-1 rounded-xl bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1 shadow-sm">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>مكتمل</span>
                        </span>
                      ) : canDirectPlay ? (
                        <span className="px-2.5 py-1 rounded-xl bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1 shadow-sm">
                          <Sparkles className="w-3 h-3" />
                          <span>مفتوح للمشاهدة</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-xl bg-black/80 backdrop-blur-sm text-amber-400 text-[10px] font-bold flex items-center gap-1 border border-amber-500/30">
                          <Lock className="w-3 h-3 text-amber-400" />
                          <span>يتطلب اشتراكاً</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                        <span className="text-cyan-electric">{lesson.branchName}</span>
                        <span>{lesson.unitTitle}</span>
                      </div>

                      <h3 className="text-base font-black text-slate-900 dark:text-chalk line-clamp-2">
                        {lesson.title}
                      </h3>

                      {lesson.description && (
                        <p className="text-xs text-slate-500 dark:text-chalk-muted line-clamp-2 leading-relaxed">
                          {lesson.description}
                        </p>
                      )}
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-chalk-muted">
                        <Clock className="w-3.5 h-3.5 text-cyan-electric" />
                        <span>{lesson.durationMinutes || 45} دقيقة</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {lesson.pdfPath && (
                          <button
                            onClick={() =>
                              setActivePdfModal({
                                url: lesson.pdfPath || '',
                                title: lesson.title,
                              })
                            }
                            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-chalk hover:text-cyan-electric transition-colors"
                            title="معاينة مذكرة PDF"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        )}

                        <Link
                          href={`/lessons/${lesson.id}`}
                          className={`px-4 py-2 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all ${
                            canDirectPlay
                              ? 'bg-cyan-electric hover:bg-cyan-electric-hover text-black shadow-cyan-glow'
                              : 'bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-chalk hover:bg-cyan-electric hover:text-black border border-slate-300 dark:border-slate-700'
                          }`}
                        >
                          {canDirectPlay ? <Play className="w-3.5 h-3.5 fill-current" /> : <Lock className="w-3.5 h-3.5 text-amber-500" />}
                          <span>{canDirectPlay ? 'مشاهدة الدرس' : 'اشترك لفتح الدرس'}</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* PDF Modal Preview */}
        {activePdfModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="relative w-full max-w-5xl h-[85vh] bg-white dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl flex flex-col">
              <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-chalk truncate">{activePdfModal.title}</span>
                <button
                  onClick={() => setActivePdfModal(null)}
                  className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-black dark:hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <LessonPdfViewer
                  pdfUrl={activePdfModal.url}
                  title={activePdfModal.title}
                  studentName={user?.fullName}
                  studentPhone={user?.phone}
                  allowDownload={isMatchingStudent || isAdmin}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
