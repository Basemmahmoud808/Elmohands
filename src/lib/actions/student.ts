'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { getCurrentUser } from '@/lib/actions/auth';
import { ActionResult } from '@/lib/types/actions';
import {
  StudentDashboardData,
  StudentExamResultDTO,
  CurriculumGradeDTO,
} from '@/lib/types/dashboard';
import { getFullCurriculumTreeAction } from '@/lib/actions/courses';

/**
 * Fetches all consolidated data required for the Student Dashboard in a single server-side call.
 */
export async function getStudentDashboardDataAction(): Promise<ActionResult<StudentDashboardData>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'غير مسجل دخول. يرجى تسجيل الدخول أولاً.' };
    }

    // 1. Fetch Profile & Grade
    let profile = {
      id: user.id,
      fullName: user.fullName || 'طالب المهندس',
      phone: user.phone || '',
      email: user.email || null,
      parentEmail: user.parentEmail || null,
      role: 'STUDENT' as const,
      gradeId: user.gradeId || null,
      gradeName: user.gradeName || 'الصف الأول الإعدادي',
      stage: 'إعدادي',
      createdAt: user.createdAt || new Date().toISOString(),
    };

    try {
      const { data: dbProfile } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name, phone, email, parent_email, role, grade_id, created_at, grades (id, name, stage)')
        .eq('id', user.id)
        .maybeSingle();

      if (dbProfile) {
        const gradeObj = Array.isArray(dbProfile.grades) ? dbProfile.grades[0] : dbProfile.grades;
        profile = {
          id: dbProfile.id,
          fullName: dbProfile.full_name,
          phone: dbProfile.phone,
          email: dbProfile.email,
          parentEmail: dbProfile.parent_email,
          role: 'STUDENT',
          gradeId: dbProfile.grade_id,
          gradeName: gradeObj?.name || profile.gradeName,
          stage: gradeObj?.stage || 'إعدادي',
          createdAt: dbProfile.created_at || profile.createdAt,
        };
      }
    } catch {
      // Profile query fallback
    }

    // 2. Fetch Subscription
    let subscriptionData: StudentDashboardData['subscription'] = {
      hasActiveSubscription: false,
      subscription: null,
    };

    try {
      const { data: dbSub } = await supabaseAdmin
        .from('subscriptions')
        .select('id, plan_id, status, starts_at, expires_at, plans (name)')
        .eq('student_id', user.id)
        .eq('status', 'ACTIVE')
        .order('expires_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (dbSub) {
        const planObj = Array.isArray(dbSub.plans) ? dbSub.plans[0] : dbSub.plans;
        const expTime = new Date(dbSub.expires_at).getTime();
        const daysRemaining = Math.max(0, Math.ceil((expTime - Date.now()) / (1000 * 60 * 60 * 24)));
        const isActive = daysRemaining > 0;

        subscriptionData = {
          hasActiveSubscription: isActive,
          subscription: {
            id: dbSub.id,
            planId: dbSub.plan_id,
            planName: planObj?.name || 'اشتراك المنصة',
            startsAt: dbSub.starts_at,
            expiresAt: dbSub.expires_at,
            daysRemaining,
            status: isActive ? 'ACTIVE' : 'EXPIRED',
          },
        };
      }
    } catch {
      // Subscription query fallback
    }

    // 3. Fetch Full Curriculum
    const treeRes = await getFullCurriculumTreeAction();
    const allGrades = treeRes.data || [];
    const matchingGrade = allGrades.find((g: CurriculumGradeDTO) =>
      (profile.gradeId && g.id === profile.gradeId) ||
      (profile.gradeName && g.name.includes(profile.gradeName))
    ) || allGrades[0];

    const curriculumTerms = matchingGrade ? matchingGrade.terms : [];

    // 4. Fetch Student Progress from DB to attach to lessons
    let completedCount = 0;
    let totalWatchSec = 0;
    let progressMap: Record<string, { watch_percentage: number; is_completed: boolean; last_position: number }> = {};

    try {
      const { data: progressRows } = await supabaseAdmin
        .from('student_progress')
        .select('lesson_id, watch_percentage, is_completed, last_position')
        .eq('student_id', user.id);

      if (progressRows && progressRows.length > 0) {
        (progressRows as Array<{
          lesson_id: string;
          watch_percentage?: number | null;
          is_completed?: boolean | null;
          last_position?: number | null;
        }>).forEach((r) => {
          progressMap[r.lesson_id] = {
            watch_percentage: r.watch_percentage || 0,
            is_completed: r.is_completed || false,
            last_position: r.last_position || 0,
          };
          if (r.is_completed) completedCount++;
          totalWatchSec += r.last_position || 0;
        });
      }
    } catch {
      // Progress query fallback
    }

    // Attach progress to curriculum tree lessons
    let allLessonsFlat: Array<{
      id: string;
      unitId: string;
      unitTitle: string;
      branchName: string;
      gradeName: string;
      title: string;
      description: string;
      videoPath?: string | null;
      pdfPath?: string | null;
      thumbnailPath?: string | null;
      durationMinutes: number;
      lastPosition: number;
      watchPercentage: number;
      isCompleted: boolean;
    }> = [];

    const hasActiveSub = subscriptionData.hasActiveSubscription;

    curriculumTerms.forEach((t) => {
      t.branches.forEach((b) => {
        b.units.forEach((u) => {
          u.lessons.forEach((l) => {
            const userProg = progressMap[l.id];
            if (userProg) {
              l.watchPercentage = userProg.watch_percentage;
              l.isCompleted = userProg.is_completed;
              l.lastPosition = userProg.last_position;
            }
            if (!hasActiveSub) {
              l.isLocked = l.isLocked !== false;
            }
            allLessonsFlat.push({
              id: l.id,
              unitId: u.id,
              unitTitle: u.title,
              branchName: b.name,
              gradeName: matchingGrade?.name || 'الصف الأول الإعدادي',
              title: l.title,
              description: l.description,
              videoPath: l.videoPath,
              pdfPath: l.pdfPath,
              thumbnailPath: l.thumbnailPath,
              durationMinutes: l.durationMinutes,
              lastPosition: l.lastPosition,
              watchPercentage: l.watchPercentage,
              isCompleted: l.isCompleted,
            });
          });
        });
      });
    });

    // 5. Determine "Continue Learning"
    // Find first unfinished lesson or most recently watched (only if active subscription)
    const continueLearning = hasActiveSub
      ? (allLessonsFlat.find((l) => l.watchPercentage > 0 && !l.isCompleted) ||
         allLessonsFlat.find((l) => !l.isCompleted) ||
         allLessonsFlat[0] ||
         null)
      : null;

    // 6. Recent Exam Results & Available Quizzes
    let recentResults: StudentExamResultDTO[] = [];

    try {
      const { data: dbAttempts } = await supabaseAdmin
        .from('exam_attempts')
        .select(`
          id, quiz_id, attempt_number, score, percentage, passed, submitted_at,
          quizzes (title, lessons (units (branches (name))))
        `)
        .eq('student_id', user.id)
        .order('submitted_at', { ascending: false })
        .limit(10);

      if (dbAttempts && dbAttempts.length > 0) {
        recentResults = (dbAttempts as unknown as Array<{
          id: string;
          quiz_id: string;
          attempt_number?: number | null;
          score?: number | null;
          percentage?: number | null;
          passed?: boolean | null;
          submitted_at?: string | null;
          quizzes?: {
            title?: string;
            lessons?: {
              units?: {
                branches?: {
                  name?: string;
                } | Array<{ name?: string }> | null;
              } | Array<{ branches?: { name?: string } | Array<{ name?: string }> | null }> | null;
            } | Array<{
              units?: {
                branches?: {
                  name?: string;
                } | Array<{ name?: string }> | null;
              } | Array<{ branches?: { name?: string } | Array<{ name?: string }> | null }> | null;
            }> | null;
          } | Array<{
            title?: string;
            lessons?: {
              units?: {
                branches?: {
                  name?: string;
                } | Array<{ name?: string }> | null;
              } | Array<{ branches?: { name?: string } | Array<{ name?: string }> | null }> | null;
            } | Array<{
              units?: {
                branches?: {
                  name?: string;
                } | Array<{ name?: string }> | null;
              } | Array<{ branches?: { name?: string } | Array<{ name?: string }> | null }> | null;
            }> | null;
          }> | null;
        }>).map((att) => {
          const quizObj = Array.isArray(att.quizzes) ? att.quizzes[0] : att.quizzes;
          const lessonObj = quizObj?.lessons ? (Array.isArray(quizObj.lessons) ? quizObj.lessons[0] : quizObj.lessons) : null;
          const unitObj = lessonObj?.units ? (Array.isArray(lessonObj.units) ? lessonObj.units[0] : lessonObj.units) : null;
          const branchObj = unitObj?.branches ? (Array.isArray(unitObj.branches) ? unitObj.branches[0] : unitObj.branches) : null;

          return {
            attemptId: att.id,
            quizId: att.quiz_id,
            quizTitle: quizObj?.title || 'اختبار تقييمي',
            branchName: branchObj?.name || 'فرع الجبر والإحصاء',
            attemptNumber: att.attempt_number || 1,
            score: att.score || 0,
            maxScore: 30,
            percentage: att.percentage || 0,
            passed: att.passed || false,
            submittedAt: att.submitted_at || new Date().toISOString(),
          };
        });
      }
    } catch {
      // Exam attempts query fallback
    }

    let availableQuizzes: StudentDashboardData['availableQuizzes'] = [];

    try {
      const { data: dbQuizzes } = await supabaseAdmin
        .from('quizzes')
        .select(`
          id, lesson_id, title, description, duration_minutes, pass_score, max_attempts, is_published,
          lessons (title, units (branches (name))),
          quiz_questions (id)
        `)
        .eq('is_published', true);

      if (dbQuizzes && dbQuizzes.length > 0) {
        availableQuizzes = (dbQuizzes as unknown as Array<{
          id: string;
          lesson_id: string;
          title: string;
          description?: string | null;
          duration_minutes?: number | null;
          pass_score?: number | null;
          max_attempts?: number | null;
          lessons?: {
            title?: string | null;
            units?: {
              branches?: {
                name?: string | null;
              } | Array<{ name?: string | null }> | null;
            } | Array<{ branches?: { name?: string | null } | Array<{ name?: string | null }> | null }> | null;
          } | null;
          quiz_questions?: Array<{ id: string }> | null;
        }>).map((q) => {
          const lessonObj = q.lessons;
          const unitObj = lessonObj?.units ? (Array.isArray(lessonObj.units) ? lessonObj.units[0] : lessonObj.units) : null;
          const branchObj = unitObj?.branches ? (Array.isArray(unitObj.branches) ? unitObj.branches[0] : unitObj.branches) : null;
          const qCount = Array.isArray(q.quiz_questions) ? q.quiz_questions.length : 0;

          const studentAttempts = recentResults.filter((r) => r.quizId === q.id);
          const hasPassed = studentAttempts.some((r) => r.passed);
          const bestScore = studentAttempts.length > 0 ? Math.max(...studentAttempts.map((r) => r.percentage)) : null;

          return {
            id: q.id,
            lessonId: q.lesson_id,
            lessonTitle: lessonObj?.title || 'درس تعليمي',
            branchName: branchObj?.name || 'مادة الرياضيات',
            title: q.title,
            description: q.description || '',
            durationMinutes: q.duration_minutes || 30,
            passScore: q.pass_score || 50,
            maxAttempts: q.max_attempts || 3,
            questionsCount: qCount,
            attemptsCount: studentAttempts.length,
            bestScorePercentage: bestScore,
            hasPassed,
            isLocked: false,
            type: 'mcq' as const,
          };
        });
      }
    } catch {
      // Quizzes query fallback
    }

    // 7. Stats Calculation (Real dynamic numbers starting from 0)
    const totalLessonsInGrade = allLessonsFlat.length;
    const completedLessonsCount = completedCount;
    const progressSummary = {
      totalLessonsInGrade,
      completedLessonsCount,
      overallProgressPercentage: totalLessonsInGrade > 0 ? Math.round((completedLessonsCount / totalLessonsInGrade) * 100) : 0,
      averageQuizScorePercentage: recentResults.length > 0
        ? Math.round(recentResults.reduce((acc, r) => acc + r.percentage, 0) / recentResults.length)
        : 0,
      totalWatchHours: Number((totalWatchSec / 3600).toFixed(1)),
      passedQuizzesCount: recentResults.filter((r) => r.passed).length,
      totalQuizzesCount: availableQuizzes.length,
    };

    // 8. Notifications
    const notifications: StudentDashboardData['notifications'] = [
      {
        id: 'notif-1',
        type: 'ANNOUNCEMENT' as const,
        title: 'مرحباً بك في منصة المهندس ',
        description: 'تم تجهيز خطة دراسية متكاملة لـ ' + (matchingGrade?.name || 'صفك الدراسي') + ' مع م/ رضا خيرت.',
        createdAt: new Date().toISOString(),
        isRead: false,
      },
    ];

    if (subscriptionData.hasActiveSubscription && subscriptionData.subscription) {
      notifications.push({
        id: 'notif-sub',
        type: 'SUBSCRIPTION' as const,
        title: `اشتراكك نشط — متبقي ${subscriptionData.subscription.daysRemaining} يوماً`,
        description: 'يمكنك تمديد الاشتراك في أي وقت عبر قسم تفعيل كود الشحن.',
        createdAt: new Date().toISOString(),
        isRead: false,
      });
    }

    const dashboardData: StudentDashboardData = {
      profile,
      subscription: subscriptionData,
      continueLearning,
      progressSummary,
      curriculum: curriculumTerms,
      availableQuizzes,
      recentResults,
      notifications,
    };

    return { success: true, data: dashboardData };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'فشل تحميل بيانات لوحة تحكم الطالب';
    return { success: false, error: errorMsg };
  }
}

/**
 * Updates video playback progress and automatically marks lesson as completed if percentage >= 90%.
 */
export async function updateLessonProgressAction(
  lessonId: string,
  watchPercentage: number,
  lastPosition: number
): Promise<ActionResult<{ isCompleted: boolean }>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'يرجى تسجيل الدخول لتحديث تقدم المشاهدة' };
    }

    const isCompleted = watchPercentage >= 90;

    await supabaseAdmin.from('student_progress').upsert(
      {
        student_id: user.id,
        lesson_id: lessonId,
        watch_percentage: Math.min(100, Math.round(watchPercentage)),
        last_position: Math.round(lastPosition),
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'student_id,lesson_id' }
    );

    return { success: true, data: { isCompleted } };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'فشل حفظ التقدم';
    return { success: false, error: msg };
  }
}

/**
 * Fetches the student's exam history and detailed quiz scores.
 */
export async function getStudentExamResultsAction(): Promise<ActionResult<StudentExamResultDTO[]>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'يرجى تسجيل الدخول' };
    }

    const { data, error } = await supabaseAdmin
      .from('exam_attempts')
      .select(`
        id, quiz_id, attempt_number, score, percentage, passed, submitted_at,
        quizzes (title, lessons (units (branches (name))))
      `)
      .eq('student_id', user.id)
      .order('submitted_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return {
        success: true,
        data: [],
      };
    }

    interface DbExamAttemptJoin {
      id: string;
      quiz_id: string;
      attempt_number?: number | null;
      score?: number | null;
      percentage?: number | null;
      passed?: boolean | null;
      submitted_at?: string | null;
      quizzes?: {
        title?: string;
        lessons?: {
          units?: {
            branches?: {
              name?: string;
            } | Array<{ name?: string }> | null;
          } | Array<{ branches?: { name?: string } | Array<{ name?: string }> | null }> | null;
        } | Array<{
          units?: {
            branches?: {
              name?: string;
            } | Array<{ name?: string }> | null;
          } | Array<{ branches?: { name?: string } | Array<{ name?: string }> | null }> | null;
        }> | null;
      } | Array<{
        title?: string;
        lessons?: {
          units?: {
            branches?: {
              name?: string;
            } | Array<{ name?: string }> | null;
          } | Array<{ branches?: { name?: string } | Array<{ name?: string }> | null }> | null;
        } | Array<{
          units?: {
            branches?: {
              name?: string;
            } | Array<{ name?: string }> | null;
          } | Array<{ branches?: { name?: string } | Array<{ name?: string }> | null }> | null;
        }> | null;
      }> | null;
    }

    const results: StudentExamResultDTO[] = (data as unknown as DbExamAttemptJoin[]).map((att) => {
      const quizObj = Array.isArray(att.quizzes) ? att.quizzes[0] : att.quizzes;
      const lessonObj = quizObj?.lessons ? (Array.isArray(quizObj.lessons) ? quizObj.lessons[0] : quizObj.lessons) : null;
      const unitObj = lessonObj?.units ? (Array.isArray(lessonObj.units) ? lessonObj.units[0] : lessonObj.units) : null;
      const branchObj = unitObj?.branches ? (Array.isArray(unitObj.branches) ? unitObj.branches[0] : unitObj.branches) : null;

      return {
        attemptId: att.id,
        quizId: att.quiz_id,
        quizTitle: quizObj?.title || 'اختبار تقييمي',
        branchName: branchObj?.name || 'فرع الجبر والإحصاء',
        attemptNumber: att.attempt_number || 1,
        score: att.score || 0,
        maxScore: 30,
        percentage: att.percentage || 0,
        passed: att.passed || false,
        submittedAt: att.submitted_at || new Date().toISOString(),
      };
    });

    return { success: true, data: results };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'فشل جلب نتائج الاختبارات';
    return { success: false, error: msg };
  }
}

import { getStudentDashboardData as fetchStudentDashboardData } from '@/lib/actions/dashboard';

// Wrapper for Milestone 2 Server Actions interoperability in "use server" file
export async function getStudentDashboardData() {
  return fetchStudentDashboardData();
}

/**
 * Checks if the current user has an active subscription or is admin.
 */
export async function getStudentSubscriptionStatusAction(): Promise<ActionResult<{ hasActiveSubscription: boolean; daysRemaining: number }>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: true, data: { hasActiveSubscription: false, daysRemaining: 0 } };
    }
    if (user.role === 'ADMIN') {
      return { success: true, data: { hasActiveSubscription: true, daysRemaining: 999 } };
    }

    const { data: dbSub } = await supabaseAdmin
      .from('subscriptions')
      .select('id, status, expires_at')
      .eq('student_id', user.id)
      .eq('status', 'ACTIVE')
      .order('expires_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (dbSub) {
      const expTime = new Date(dbSub.expires_at).getTime();
      const daysRemaining = Math.max(0, Math.ceil((expTime - Date.now()) / (1000 * 60 * 60 * 24)));
      return { success: true, data: { hasActiveSubscription: daysRemaining > 0, daysRemaining } };
    }

    return { success: true, data: { hasActiveSubscription: false, daysRemaining: 0 } };
  } catch {
    return { success: true, data: { hasActiveSubscription: false, daysRemaining: 0 } };
  }
}


