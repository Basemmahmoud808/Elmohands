'use client';

import React, { useState, useEffect } from 'react';
import { DashboardSidebar } from '@/components/ui/dashboard-sidebar';
import { DarkGradientBg } from '@/components/ui/elegant-dark-pattern';
import { StudentDashboardData, StudentQuizItemDTO } from '@/lib/types/dashboard';
import { getStudentDashboardDataAction } from '@/lib/actions/student';
import { StudentWelcomeBanner } from '@/components/student/StudentWelcomeBanner';
import { ContinueLearningCard } from '@/components/student/ContinueLearningCard';
import { StudentStatsGrid } from '@/components/student/StudentStatsGrid';
import { EnrolledCoursesGrid } from '@/components/student/EnrolledCoursesGrid';
import { QuickAccessCards } from '@/components/student/QuickAccessCards';
import { StudentSubscriptionPaymentCard } from '@/components/student/StudentSubscriptionPaymentCard';
import { StudentResultsTable } from '@/components/student/StudentResultsTable';
import { NotificationCenter } from '@/components/student/NotificationCenter';
import { StudentQuestionBankTab } from '@/components/student/StudentQuestionBankTab';
import { ExamViewerModal } from '@/components/student/modals/ExamViewerModal';
import { QuizSolveModal } from '@/components/student/modals/QuizSolveModal';
import { VideoPreviewModal } from '@/components/student/modals/VideoPreviewModal';
import { HelpCircle, Play, FileText, Clock, Award, Loader2 } from 'lucide-react';

export default function StudentDashboard() {
  const [selectedTab, setSelectedTab] = useState('overview');
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [activeQuizModal, setActiveQuizModal] = useState<StudentQuizItemDTO | null>(null);
  const [activeExamFileModal, setActiveExamFileModal] = useState<StudentQuizItemDTO | null>(null);
  const [activeVideoModal, setActiveVideoModal] = useState<{ title: string; url: string } | null>(null);

  const loadData = async () => {
    try {
      const res = await getStudentDashboardDataAction();
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleVoucherRedeemed = (durationDays: number) => {
    if (data && data.subscription.subscription) {
      setData({
        ...data,
        subscription: {
          hasActiveSubscription: true,
          subscription: {
            ...data.subscription.subscription,
            status: 'ACTIVE',
            daysRemaining: data.subscription.subscription.daysRemaining + durationDays,
          },
        },
      });
    } else {
      loadData();
    }
  };

  if (loading) {
    return (
      <DarkGradientBg>
        <div className="flex min-h-screen items-center justify-center font-arabic">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-cyan-electric/15 border border-cyan-electric/30 flex items-center justify-center text-cyan-electric shadow-cyan-glow animate-bounce">
              <Loader2 className="w-7 h-7 animate-spin" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900 dark:text-chalk">
                منصة المهندس — جاري تجهيز لوحة التحكم...
              </h2>
              <p className="text-xs text-slate-500 dark:text-chalk-muted font-bold">
                م/ رضا خيرت — خطتك الدراسية قيد التحميل
              </p>
            </div>
          </div>
        </div>
      </DarkGradientBg>
    );
  }

  if (!data) return null;

  return (
    <DarkGradientBg>
      <div className="flex min-h-screen w-full font-arabic">
        <DashboardSidebar
          role="STUDENT"
          userFullName={data.profile.fullName}
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
          hasActiveSubscription={
            Boolean(
              data.subscription.hasActiveSubscription &&
              data.subscription.subscription &&
              data.subscription.subscription.daysRemaining > 0
            )
          }
        />

        {/* Main Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-10 pt-20 md:pt-6 overflow-y-auto space-y-6 sm:space-y-8 w-full max-w-full overflow-x-hidden">
          {/* Welcome Banner with Active Subscription badge */}
          <StudentWelcomeBanner
            profile={data.profile}
            subscription={data.subscription}
            onNavigateToSubscribe={() => setSelectedTab('subscribe')}
          />

          {/* TAB 1: OVERVIEW (الرئيسية) */}
          {selectedTab === 'overview' && (
            <div className="space-y-8 animate-in fade-in duration-200">
              <ContinueLearningCard
                lesson={data.continueLearning}
                hasActiveSubscription={data.subscription.hasActiveSubscription}
                onOpenVideo={(title, url) => setActiveVideoModal({ title, url })}
              />

              <StudentStatsGrid summary={data.progressSummary} />

              <QuickAccessCards
                quizzes={data.availableQuizzes}
                recentResults={data.recentResults}
                onStartQuiz={(q) => setActiveQuizModal(q)}
                onOpenExamFile={(q) => setActiveExamFileModal(q)}
              />
            </div>
          )}

          {/* TAB 2: CURRICULUM (المقرارات الدراسية) */}
          {selectedTab === 'my-courses' && (
            <div className="animate-in fade-in duration-200">
              <EnrolledCoursesGrid
                curriculum={data.curriculum}
                gradeName={data.profile.gradeName || undefined}
                hasActiveSubscription={data.subscription.hasActiveSubscription}
                onOpenVideo={(title, url) => setActiveVideoModal({ title, url })}
                onOpenPdf={(title, url) =>
                  setActiveExamFileModal({
                    id: 'doc-pdf',
                    lessonId: 'les-doc',
                    lessonTitle: title,
                    branchName: 'مذكرة الدرس',
                    title,
                    durationMinutes: 0,
                    passScore: 0,
                    maxAttempts: 0,
                    questionsCount: 0,
                    attemptsCount: 0,
                    hasPassed: false,
                    isLocked: false,
                    pdfPath: url,
                    type: 'file',
                  })
                }
              />
            </div>
          )}

          {/* TAB 3: QUESTION BANK (بنك الأسئلة والتمارين) */}
          {selectedTab === 'question-bank' && (
            <div className="animate-in fade-in duration-200">
              <StudentQuestionBankTab
                studentGradeName={data.profile.gradeName || undefined}
                onOpenPdf={(title, url) =>
                  setActiveExamFileModal({
                    id: 'qb-pdf',
                    lessonId: 'qb-les',
                    lessonTitle: title,
                    branchName: 'بنك الأسئلة',
                    title,
                    durationMinutes: 0,
                    passScore: 0,
                    maxAttempts: 0,
                    questionsCount: 0,
                    attemptsCount: 0,
                    hasPassed: false,
                    isLocked: false,
                    pdfPath: url,
                    type: 'file',
                  })
                }
              />
            </div>
          )}

          {/* TAB 4: QUIZZES (الاختبارات والامتحانات) */}
          {selectedTab === 'my-quizzes' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-chalk">
                  الاختبارات والتقييمات المتاحة
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-chalk-muted mt-0.5">
                  اختبر فهمك بعد كل درس لترسيخ القوانين والنظريات الرياضية
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {data.availableQuizzes.map((quiz) => (
                  <div
                    key={quiz.id}
                    className="chalk-card rounded-3xl p-6 bg-white/80 dark:bg-slate-900/60 border-slate-200 dark:border-cyan-electric/15 flex flex-col justify-between space-y-4 hover:border-cyan-electric/40 transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-cyan-electric block">
                          {quiz.branchName}
                        </span>
                        {quiz.hasPassed ? (
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                            تم الاجتياز ({quiz.bestScorePercentage}%) 
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                            متاح للحل
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-black text-slate-900 dark:text-chalk leading-snug">
                        {quiz.title}
                      </h3>

                      <p className="text-xs text-slate-600 dark:text-chalk-muted leading-relaxed line-clamp-2">
                        {quiz.description || 'اختبار تقييمي دوري لتحديد مستوى الفهم واستيعاب الدرس.'}
                      </p>

                      <div className="flex items-center gap-4 text-xs font-bold text-slate-500 dark:text-chalk-muted pt-2 border-t border-slate-200 dark:border-slate-800">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          <span>{quiz.durationMinutes} دقيقة</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <HelpCircle className="w-3.5 h-3.5 text-cyan-electric" />
                          <span>{quiz.questionsCount} أسئلة</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (quiz.type === 'file') {
                          setActiveExamFileModal(quiz);
                        } else {
                          setActiveQuizModal(quiz);
                        }
                      }}
                      className="w-full py-3 rounded-2xl text-xs font-black text-black bg-cyan-electric hover:bg-cyan-electric-hover shadow-cyan-glow transition-all flex items-center justify-center gap-2"
                    >
                      {quiz.type === 'file' ? <FileText className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      <span>{quiz.type === 'file' ? 'عرض ورقة الامتحان' : 'بدء الاختبار الآن'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: RESULTS (نتائجي وتقييماتي) */}
          {selectedTab === 'my-results' && (
            <div className="animate-in fade-in duration-200">
              <StudentResultsTable results={data.recentResults} />
            </div>
          )}

          {/* TAB 5: SUBSCRIBE & PAYMENT INSTRUCTIONS */}
          {(selectedTab === 'subscribe' || selectedTab === 'activate-code') && (
            <div className="animate-in fade-in duration-200">
              <StudentSubscriptionPaymentCard
                profile={data.profile}
                subscription={data.subscription}
              />
            </div>
          )}

          {/* TAB 6: NOTIFICATIONS (التنبيهات) */}
          {selectedTab === 'notifications' && (
            <div className="animate-in fade-in duration-200">
              <NotificationCenter notifications={data.notifications} />
            </div>
          )}
        </main>
      </div>

      {/* Interactive Modals */}
      <ExamViewerModal
        quiz={activeExamFileModal}
        onClose={() => setActiveExamFileModal(null)}
      />

      <QuizSolveModal
        quiz={activeQuizModal}
        onClose={() => setActiveQuizModal(null)}
        onQuizCompleted={() => loadData()}
      />

      <VideoPreviewModal
        video={activeVideoModal}
        onClose={() => setActiveVideoModal(null)}
        studentName={data.profile.fullName}
        studentPhone={data.profile.phone}
      />
    </DarkGradientBg>
  );
}
