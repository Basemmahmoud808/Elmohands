'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardSidebar } from '@/components/ui/dashboard-sidebar';
import { DarkGradientBg } from '@/components/ui/elegant-dark-pattern';
import { getCurrentUser } from '@/lib/actions/auth';
import {
  AdminOverviewStatsDTO,
  AdminStudentDTO,
  AdminSubscriptionDTO,
  AdminAuditLogDTO,
  CurriculumGradeDTO,
  QuestionItemDTO,
  QuizDetailsDTO,
} from '@/lib/types/dashboard';
import {
  getAdminOverviewStatsAction,
  getAdminStudentsListAction,
  getAdminAuditLogsAction,
  getAdminSubscriptionsListAction,
} from '@/lib/actions/admin';
import { getFullCurriculumTreeAction } from '@/lib/actions/courses';
import { getAdminQuizzesListAction } from '@/lib/actions/quizzes';
import { getQuestionsListAction } from '@/lib/actions/questions';
import { AdminOverviewTab } from '@/components/admin/AdminOverviewTab';
import { StudentsManagementTab } from '@/components/admin/StudentsManagementTab';
import { CoursesManagementTab } from '@/components/admin/CoursesManagementTab';
import { LessonsManagementTab } from '@/components/admin/LessonsManagementTab';
import { QuestionBankTab } from '@/components/admin/QuestionBankTab';
import { QuizBuilderTab } from '@/components/admin/QuizBuilderTab';
import { SubscriptionsTab } from '@/components/admin/SubscriptionsTab';
import { AuditLogsTab } from '@/components/admin/AuditLogsTab';
import { MediaPreviewModal } from '@/components/admin/MediaPreviewModal';
import { Loader2 } from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [adminName, setAdminName] = useState('المهندس');

  // Consolidated Data State
  const initialAdminStats: AdminOverviewStatsDTO = {
    totalStudents: 0,
    activeSubscriptions: 0,
    totalLessons: 0,
    totalQuestions: 0,
    totalQuizzes: 0,
    unusedVouchers: 0,
    recentAuditLogs: [],
  };
  const [stats, setStats] = useState<AdminOverviewStatsDTO>(initialAdminStats);
  const [students, setStudents] = useState<AdminStudentDTO[]>([]);
  const [curriculum, setCurriculum] = useState<CurriculumGradeDTO[]>([]);
  const [questions, setQuestions] = useState<QuestionItemDTO[]>([]);
  const [quizzes, setQuizzes] = useState<QuizDetailsDTO[]>([]);
  const [subscriptions, setSubscriptions] = useState<AdminSubscriptionDTO[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLogDTO[]>([]);

  // Media Modal Preview State
  const [activeMediaModal, setActiveMediaModal] = useState<{
    type: 'video' | 'pdf' | 'exam';
    title: string;
    url: string;
  } | null>(null);

  const loadAllAdminData = async () => {
    try {
      const user = await getCurrentUser();
      if (!user || user.role !== 'ADMIN') {
        router.push('/student');
        return;
      }
      setAdminName(user.fullName || 'المهندس');

      const [
        statsRes,
        studentsRes,
        curriculumRes,
        questionsRes,
        quizzesRes,
        subsRes,
        logsRes,
      ] = await Promise.all([
        getAdminOverviewStatsAction(),
        getAdminStudentsListAction(),
        getFullCurriculumTreeAction(),
        getQuestionsListAction(),
        getAdminQuizzesListAction(),
        getAdminSubscriptionsListAction(),
        getAdminAuditLogsAction(),
      ]);

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      } else {
        setStats({
          totalStudents: studentsRes.data?.length || 0,
          activeSubscriptions: subsRes.data?.length || 0,
          totalLessons: 0,
          totalQuestions: questionsRes.data?.length || 0,
          totalQuizzes: quizzesRes.data?.length || 0,
          unusedVouchers: 0,
          recentAuditLogs: logsRes.data || [],
        });
      }

      if (studentsRes.success && studentsRes.data) setStudents(studentsRes.data);
      if (curriculumRes.success && curriculumRes.data) setCurriculum(curriculumRes.data);
      if (questionsRes.success && questionsRes.data) setQuestions(questionsRes.data);
      if (quizzesRes.success && quizzesRes.data) setQuizzes(quizzesRes.data);
      if (subsRes.success && subsRes.data) setSubscriptions(subsRes.data);
      if (logsRes.success && logsRes.data) setAuditLogs(logsRes.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

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
                لوحة تحكم منصة المهندس — جاري تجهيز البيانات...
              </h2>
              <p className="text-xs text-slate-500 dark:text-chalk-muted font-bold">
                تحميل شجرة المناهج، الطلاب، وأكواد الشحن
              </p>
            </div>
          </div>
        </div>
      </DarkGradientBg>
    );
  }

  return (
    <DarkGradientBg>
      <div className="flex min-h-screen w-full font-arabic">
        <DashboardSidebar
          role="ADMIN"
          userFullName={adminName}
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-10 pt-20 md:pt-6 overflow-y-auto space-y-6 sm:space-y-8 w-full max-w-full overflow-x-hidden">
          {/* TAB 1: OVERVIEW */}
          {selectedTab === 'dashboard' && (
            <AdminOverviewTab
              stats={stats}
              onSelectTab={(tabId) => setSelectedTab(tabId)}
            />
          )}

          {/* TAB 2: STUDENTS MANAGEMENT */}
          {selectedTab === 'students' && (
            <StudentsManagementTab initialStudents={students} />
          )}

          {/* TAB 3: COURSES & GRADES MANAGEMENT */}
          {selectedTab === 'courses' && (
            <CoursesManagementTab
              initialCurriculum={curriculum}
              students={students}
              questions={questions}
              quizzes={quizzes}
              onRefresh={loadAllAdminData}
              onNavigateTab={(tabId) => setSelectedTab(tabId)}
              onPreviewMedia={(media) => setActiveMediaModal(media)}
            />
          )}

          {/* TAB 4: LESSONS & MEDIA CMS */}
          {selectedTab === 'lessons' && (
            <LessonsManagementTab
              curriculum={curriculum}
              onRefresh={loadAllAdminData}
              onPreviewMedia={(media) => setActiveMediaModal(media)}
            />
          )}

          {/* TAB 5: QUESTION BANK & KATEX */}
          {selectedTab === 'questions' && (
            <QuestionBankTab
              initialQuestions={questions}
              curriculum={curriculum}
              onRefresh={loadAllAdminData}
            />
          )}

          {/* TAB 6: QUIZ BUILDER */}
          {selectedTab === 'quizzes' && (
            <QuizBuilderTab
              initialQuizzes={quizzes}
              questions={questions}
              curriculum={curriculum}
              onRefresh={loadAllAdminData}
            />
          )}

          {/* TAB 7: SUBSCRIPTIONS */}
          {selectedTab === 'subscriptions' && (
            <SubscriptionsTab initialSubscriptions={subscriptions} />
          )}

          {/* TAB 9: AUDIT LOGS & SECURITY */}
          {selectedTab === 'audit' && (
            <AuditLogsTab initialLogs={auditLogs} />
          )}
        </main>
      </div>

      {/* Media Preview Modal */}
      <MediaPreviewModal
        media={activeMediaModal}
        onClose={() => setActiveMediaModal(null)}
      />
    </DarkGradientBg>
  );
}
