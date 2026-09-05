'use server';

import { getCurrentUser } from '@/lib/actions/auth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { ActionResult } from '@/lib/types/actions';
import {
  LessonDetailsDTO,
  LessonAccessCheckResult,
  CurriculumGradeDTO,
  CurriculumTermDTO,
  CurriculumBranchDTO,
  CurriculumUnitDTO,
  CurriculumLessonDTO,
} from '@/lib/types/dashboard';
import { parseMediaUrl as parseMediaUrlInternal } from '@/lib/actions/courses';
import {
  updateLessonProgressAction as updateProgressInternal,
  getLessonProgressAction as getLessonProgressInternal,
  getStudentCurriculumProgressAction as getCurriculumProgressInternal,
} from '@/lib/actions/progress';

export async function updateLessonProgressAction(
  lessonId: string,
  arg2: number,
  arg3: number
) {
  return updateProgressInternal(lessonId, arg2, arg3);
}

export async function getLessonProgressAction(lessonId: string) {
  return getLessonProgressInternal(lessonId);
}

export async function getStudentCurriculumProgressAction() {
  return getCurriculumProgressInternal();
}

export async function parseMediaUrl(url: string) {
  return parseMediaUrlInternal(url);
}

export interface LessonItem {
  id: string;
  unitId: string;
  unitTitle: string;
  courseName?: string;
  sequenceOrder?: number;
  title: string;
  description: string;
  videoPath?: string;
  pdfPath?: string;
  thumbnailPath?: string;
  durationMinutes: number;
  gradeName: string;
  branchName: string;
  isPublished?: boolean;
  isLocked?: boolean;
  createdAt: string;
}


type DbLessonRelation = {
  id: string;
  unit_id: string;
  title: string;
  description?: string | null;
  video_path?: string | null;
  pdf_path?: string | null;
  thumbnail_path?: string | null;
  duration?: number | null;
  sort_order?: number | null;
  is_published?: boolean | null;
  is_locked?: boolean | null;
  min_pass_score?: number | null;
  created_at?: string;
  units?: {
    id?: string;
    title?: string;
    branches?: {
      id?: string;
      name?: string;
      terms?: {
        id?: string;
        name?: string;
        grades?: { id?: string; name?: string; stage?: string } | Array<{ id?: string; name?: string; stage?: string }>;
      } | Array<{ id?: string; name?: string; grades?: { id?: string; name?: string; stage?: string } | Array<{ id?: string; name?: string; stage?: string }> }>;
    } | Array<{
      id?: string;
      name?: string;
      terms?: {
        id?: string;
        name?: string;
        grades?: { id?: string; name?: string; stage?: string } | Array<{ id?: string; name?: string; stage?: string }>;
      } | Array<{ id?: string; name?: string; grades?: { id?: string; name?: string; stage?: string } | Array<{ id?: string; name?: string; stage?: string }> }>;
    }>;
  } | Array<{
    id?: string;
    title?: string;
    branches?: {
      id?: string;
      name?: string;
      terms?: {
        id?: string;
        name?: string;
        grades?: { id?: string; name?: string; stage?: string } | Array<{ id?: string; name?: string; stage?: string }>;
      } | Array<{ id?: string; name?: string; grades?: { id?: string; name?: string; stage?: string } | Array<{ id?: string; name?: string; stage?: string }> }>;
    } | Array<{
      id?: string;
      name?: string;
      terms?: {
        id?: string;
        name?: string;
        grades?: { id?: string; name?: string; stage?: string } | Array<{ id?: string; name?: string; stage?: string }>;
      } | Array<{ id?: string; name?: string; grades?: { id?: string; name?: string; stage?: string } | Array<{ id?: string; name?: string; stage?: string }> }>;
    }>;
  }>;
};

function extractLessonHierarchy(l: DbLessonRelation) {
  const u = Array.isArray(l.units) ? l.units[0] : l.units;
  const b = u?.branches ? (Array.isArray(u.branches) ? u.branches[0] : u.branches) : null;
  const t = b?.terms ? (Array.isArray(b.terms) ? b.terms[0] : b.terms) : null;
  const g = t?.grades ? (Array.isArray(t.grades) ? t.grades[0] : t.grades) : null;

  return {
    unitId: l.unit_id || u?.id || '',
    unitTitle: u?.title || 'الوحدة الأولى',
    branchId: b?.id || '',
    branchName: b?.name || 'فرع الجبر والإحصاء',
    termId: t?.id || '',
    termName: t?.name || 'الترم الأول',
    gradeId: g?.id || '',
    gradeName: g?.name || 'الصف الأول الإعدادي',
    stage: g?.stage || 'إعدادي',
  };
}

/**
 * Checks lesson access permissions for a student or guest.
 */
export async function checkLessonAccessAction(
  studentId: string,
  lessonId: string
): Promise<ActionResult<LessonAccessCheckResult>> {
  try {
    const user = await getCurrentUser();

    // 1. Fetch lesson details with hierarchy
    const { data: dbLesson, error } = await supabaseAdmin
      .from('lessons')
      .select(`
        id, unit_id, title, is_locked, is_published,
        units (
          id, title,
          branches (
            id, name,
            terms (
              id, name,
              grades (id, name, stage)
            )
          )
        )
      `)
      .eq('id', lessonId)
      .maybeSingle();

    let lessonGradeId = '';
    let lessonGradeName = 'الصف الأول الإعدادي';
    let isLocked = false;
    let lessonTitle = 'درس الرياضيات';

    if (dbLesson) {
      const hierarchy = extractLessonHierarchy(dbLesson as unknown as DbLessonRelation);
      lessonGradeId = hierarchy.gradeId;
      lessonGradeName = hierarchy.gradeName;
      isLocked = Boolean(dbLesson.is_locked);
      lessonTitle = dbLesson.title;
    } else {
      return {
        success: false,
        error: 'الدرس غير موجود في قاعدة البيانات',
      };
    }

    // 2. If user is ADMIN -> Full Access
    if (user && user.role === 'ADMIN') {
      return {
        success: true,
        data: {
          allowed: true,
          lesson: { id: lessonId, title: lessonTitle, gradeId: lessonGradeId, gradeName: lessonGradeName, isLocked },
          user: { id: user.id, fullName: user.fullName, role: 'ADMIN', hasActiveSubscription: true },
        },
      };
    }

    // 3. If guest (no logged in user)
    if (!user) {
      if (!isLocked) {
        return {
          success: true,
          data: {
            allowed: true,
            isGuest: true,
            lesson: { id: lessonId, title: lessonTitle, gradeId: lessonGradeId, gradeName: lessonGradeName, isLocked },
          },
        };
      }
      return {
        success: true,
        data: {
          allowed: false,
          isGuest: true,
          requiresSubscription: true,
          reason: 'يرجى تسجيل الدخول وتفعيل الاشتراك لمشاهدة هذا الدرس',
          lesson: { id: lessonId, title: lessonTitle, gradeId: lessonGradeId, gradeName: lessonGradeName, isLocked },
        },
      };
    }

    // 4. Student check: Grade Match
    const userGradeId = user.gradeId;
    const userGradeName = user.gradeName;

    const gradeMatches =
      (!userGradeId && !lessonGradeId) ||
      userGradeId === lessonGradeId ||
      (userGradeName && lessonGradeName && userGradeName === lessonGradeName);

    if (!gradeMatches) {
      return {
        success: true,
        data: {
          allowed: false,
          gradeMismatch: true,
          reason: `هذا الدرس مخصص لـ (${lessonGradeName}) بينما حسابك مسجل في (${userGradeName || 'صف دراسي آخر'})`,
          lesson: { id: lessonId, title: lessonTitle, gradeId: lessonGradeId, gradeName: lessonGradeName, isLocked },
          user: {
            id: user.id,
            fullName: user.fullName,
            role: 'STUDENT',
            gradeId: user.gradeId,
            gradeName: user.gradeName,
            hasActiveSubscription: false,
          },
        },
      };
    }

    // 5. Subscription check
    const nowIso = new Date().toISOString();
    const { data: sub } = await supabaseAdmin
      .from('subscriptions')
      .select('id, status, expires_at')
      .eq('student_id', user.id)
      .eq('status', 'ACTIVE')
      .gt('expires_at', nowIso)
      .order('expires_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    const hasActiveSubscription = Boolean(sub);

    if (!isLocked || hasActiveSubscription) {
      return {
        success: true,
        data: {
          allowed: true,
          lesson: { id: lessonId, title: lessonTitle, gradeId: lessonGradeId, gradeName: lessonGradeName, isLocked },
          user: {
            id: user.id,
            fullName: user.fullName,
            role: 'STUDENT',
            gradeId: user.gradeId,
            gradeName: user.gradeName,
            hasActiveSubscription,
          },
        },
      };
    }

    return {
      success: true,
      data: {
        allowed: false,
        requiresSubscription: true,
        reason: 'يتطلب هذا الدرس اشتراكاً نشطاً في المنصة أو شحن كود تفعيل',
        lesson: { id: lessonId, title: lessonTitle, gradeId: lessonGradeId, gradeName: lessonGradeName, isLocked },
        user: {
          id: user.id,
          fullName: user.fullName,
          role: 'STUDENT',
          gradeId: user.gradeId,
          gradeName: user.gradeName,
          hasActiveSubscription: false,
        },
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'فشل التحقق من صلاحيات الدرس';
    return { success: false, error: msg };
  }
}

/**
 * Fetches complete details for a lesson including security checks, parsed media, quizzes, and progress.
 */
export async function getLessonDetailsAction(
  lessonId: string
): Promise<ActionResult<LessonDetailsDTO>> {
  try {
    const user = await getCurrentUser();

    // 1. Fetch lesson with hierarchy & quizzes
    const { data: dbLesson, error: dbError } = await supabaseAdmin
      .from('lessons')
      .select(`
        id, unit_id, title, description, video_path, pdf_path, thumbnail_path, duration, sort_order, is_published, is_locked, min_pass_score, created_at,
        units (
          id, title,
          branches (
            id, name,
            terms (
              id, name,
              grades (id, name, stage)
            )
          )
        ),
        quizzes (
          id, title, description, duration_minutes, pass_score, max_attempts, is_published
        )
      `)
      .eq('id', lessonId)
      .maybeSingle();

    let lessonDto: Partial<LessonDetailsDTO> = {};
    let rawVideoPath = '';

    if (dbLesson) {
      const hierarchy = extractLessonHierarchy(dbLesson as unknown as DbLessonRelation);
      rawVideoPath = dbLesson.video_path || '';

      type QuizRelation = {
        id: string;
        title: string;
        description?: string | null;
        duration_minutes?: number | null;
        pass_score?: number | null;
        max_attempts?: number | null;
        is_published?: boolean | null;
      };

      const rawQuizzes = (Array.isArray(dbLesson.quizzes) ? dbLesson.quizzes : []) as QuizRelation[];
      const quizzes = rawQuizzes
        .filter((q) => q.is_published !== false)
        .map((q) => ({
          id: q.id,
          title: q.title,
          description: q.description || null,
          durationMinutes: q.duration_minutes || 15,
          passScore: q.pass_score || 50,
          maxAttempts: q.max_attempts || 3,
        }));

      lessonDto = {
        id: dbLesson.id,
        unitId: hierarchy.unitId,
        unitTitle: hierarchy.unitTitle,
        branchId: hierarchy.branchId,
        branchName: hierarchy.branchName,
        termId: hierarchy.termId,
        termName: hierarchy.termName,
        gradeId: hierarchy.gradeId,
        gradeName: hierarchy.gradeName,
        stage: hierarchy.stage,
        title: dbLesson.title,
        description: dbLesson.description || 'شرح تفصيلي ومبسط لمنهج الرياضيات مع م/ رضا خيرت',
        videoPath: dbLesson.video_path || null,
        pdfPath: dbLesson.pdf_path || null,
        thumbnailPath: dbLesson.thumbnail_path || '/teacher_reda_kheyrat.jpg',
        durationMinutes: dbLesson.duration || 0,
        sortOrder: dbLesson.sort_order || 1,
        isPublished: dbLesson.is_published !== false,
        isLocked: Boolean(dbLesson.is_locked),
        minPassScore: dbLesson.min_pass_score || 50,
        quizzes,
      };
    } else {
      return { success: false, error: 'لم يتم العثور على الدرس في قاعدة البيانات.' };
    }

    // Parse media
    const parsedMedia = await parseMediaUrl(rawVideoPath);

    // Check Access
    const accessRes = await checkLessonAccessAction(user?.id || '', lessonDto.id || lessonId);
    const accessData = accessRes.data;

    let studentProgress = null;
    if (user) {
      const { data: prog } = await supabaseAdmin
        .from('student_progress')
        .select('watch_percentage, is_completed, last_position, completed_at')
        .eq('student_id', user.id)
        .eq('lesson_id', lessonDto.id)
        .maybeSingle();

      if (prog) {
        studentProgress = {
          watchPercentage: prog.watch_percentage || 0,
          isCompleted: Boolean(prog.is_completed),
          lastPosition: prog.last_position || 0,
          completedAt: prog.completed_at || null,
        };
      }
    }

    const hasAccess = accessData?.allowed ?? true;

    const fullDetails: LessonDetailsDTO = {
      id: lessonDto.id || lessonId,
      unitId: lessonDto.unitId || '',
      unitTitle: lessonDto.unitTitle || 'الوحدة الأولى',
      branchId: lessonDto.branchId || '',
      branchName: lessonDto.branchName || 'فرع الجبر والإحصاء',
      termId: lessonDto.termId || '',
      termName: lessonDto.termName || 'الترم الأول',
      gradeId: lessonDto.gradeId || '',
      gradeName: lessonDto.gradeName || 'الصف الأول الإعدادي',
      stage: lessonDto.stage || 'إعدادي',
      title: lessonDto.title || 'درس الرياضيات',
      description: lessonDto.description || '',
      // Strip sensitive media URLs if student does not have authorized access
      videoPath: hasAccess ? (lessonDto.videoPath || null) : null,
      parsedMedia: hasAccess ? parsedMedia : null,
      pdfPath: hasAccess ? (lessonDto.pdfPath || null) : null,
      thumbnailPath: lessonDto.thumbnailPath || '/teacher_reda_kheyrat.jpg',
      durationMinutes: lessonDto.durationMinutes || 0,
      sortOrder: lessonDto.sortOrder || 1,
      isPublished: lessonDto.isPublished !== false,
      isLocked: Boolean(lessonDto.isLocked),
      minPassScore: lessonDto.minPassScore || 50,
      quizzes: lessonDto.quizzes || [],
      studentProgress,
      hasAccess,
      accessReason: accessData?.reason,
      requiresSubscription: accessData?.requiresSubscription,
      gradeMismatch: accessData?.gradeMismatch,
      assignedGradeName: user?.gradeName || null,
    };

    return { success: true, data: fullDetails };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'فشل جلب تفاصيل الدرس';
    return { success: false, error: msg };
  }
}

/**
 * Fetches the curriculum structure for a specific grade with attached student progress.
 */
export async function getCurriculumByGradeAction(
  gradeIdOrName: string
): Promise<ActionResult<CurriculumGradeDTO>> {
  try {
    const user = await getCurrentUser();

    // 1. Fetch grade record (Check UUID format first to avoid Postgres 22P02 error)
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(gradeIdOrName.trim());
    let dbGrade = null;

    if (isUuid) {
      const { data } = await supabaseAdmin
        .from('grades')
        .select('id, name, stage, description, sort_order')
        .eq('id', gradeIdOrName.trim())
        .maybeSingle();
      dbGrade = data;
    } else {
      const cleanName = gradeIdOrName.trim();
      const { data } = await supabaseAdmin
        .from('grades')
        .select('id, name, stage, description, sort_order')
        .ilike('name', `%${cleanName}%`)
        .order('sort_order', { ascending: true })
        .limit(1)
        .maybeSingle();
      dbGrade = data;
    }

    if (!dbGrade) {
      // Fallback: search with first two words if string has multiple words
      const parts = gradeIdOrName.trim().split(/\s+/);
      if (parts.length >= 2) {
        const partialName = `${parts[0]} ${parts[1]}`;
        const { data } = await supabaseAdmin
          .from('grades')
          .select('id, name, stage, description, sort_order')
          .ilike('name', `%${partialName}%`)
          .limit(1)
          .maybeSingle();
        dbGrade = data;
      }
    }

    const gradeId = dbGrade?.id || gradeIdOrName;
    const gradeName = dbGrade?.name || gradeIdOrName;
    const gradeStage = dbGrade?.stage || 'إعدادي';

    // 2. Fetch full tree for this grade
    const { data: dbTerms } = await supabaseAdmin
      .from('terms')
      .select(`
        id, name, sort_order, grade_id,
        branches (
          id, name, sort_order, term_id,
          units (
            id, title, description, sort_order, branch_id, is_active,
            lessons (
              id, title, description, video_path, pdf_path, thumbnail_path, duration, sort_order, is_published, is_locked, min_pass_score
            )
          )
        )
      `)
      .eq('grade_id', gradeId)
      .order('sort_order', { ascending: true });

    // 3. Fetch progress for current user if logged in
    let progressMap: Record<string, { watchPercentage: number; isCompleted: boolean; lastPosition: number }> = {};
    if (user) {
      const { data: progRecords } = await supabaseAdmin
        .from('student_progress')
        .select('lesson_id, watch_percentage, is_completed, last_position')
        .eq('student_id', user.id);

      if (progRecords) {
        for (const p of progRecords) {
          if (p.lesson_id) {
            progressMap[p.lesson_id] = {
              watchPercentage: p.watch_percentage || 0,
              isCompleted: Boolean(p.is_completed),
              lastPosition: p.last_position || 0,
            };
          }
        }
      }
    }

    type DbLessonItem = {
      id: string;
      title: string;
      description?: string | null;
      video_path?: string | null;
      pdf_path?: string | null;
      thumbnail_path?: string | null;
      duration?: number | null;
      sort_order?: number | null;
      is_published?: boolean | null;
      is_locked?: boolean | null;
      min_pass_score?: number | null;
    };

    type DbUnitItem = {
      id: string;
      title: string;
      description?: string | null;
      sort_order?: number | null;
      branch_id: string;
      is_active?: boolean | null;
      lessons?: DbLessonItem[];
    };

    type DbBranchItem = {
      id: string;
      name: string;
      sort_order?: number | null;
      term_id: string;
      units?: DbUnitItem[];
    };

    type DbTermItem = {
      id: string;
      name: string;
      sort_order?: number | null;
      grade_id: string;
      branches?: DbBranchItem[];
    };

    const rawTerms = (dbTerms || []) as unknown as DbTermItem[];

    const termsDto: CurriculumTermDTO[] = rawTerms.map((t) => ({
      id: t.id,
      gradeId: t.grade_id,
      name: t.name,
      sortOrder: t.sort_order || 0,
      branches: (t.branches || [])
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
        .map((b) => ({
          id: b.id,
          termId: b.term_id,
          name: b.name,
          sortOrder: b.sort_order || 0,
          units: (b.units || [])
            .filter((u) => u.is_active !== false)
            .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
            .map((u) => ({
              id: u.id,
              branchId: u.branch_id,
              title: u.title,
              description: u.description || null,
              sortOrder: u.sort_order || 0,
              lessons: (u.lessons || [])
                .filter((l) => l.is_published !== false)
                .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                .map((l) => {
                  const prog = progressMap[l.id];
                  return {
                    id: l.id,
                    unitId: u.id,
                    title: l.title,
                    description: l.description || '',
                    videoPath: l.video_path || null,
                    pdfPath: l.pdf_path || null,
                    thumbnailPath: l.thumbnail_path || '/teacher_reda_kheyrat.jpg',
                    durationMinutes: l.duration || 0,
                    sortOrder: l.sort_order || 0,
                    isPublished: l.is_published !== false,
                    isLocked: Boolean(l.is_locked),
                    minPassScore: l.min_pass_score || 50,
                    watchPercentage: prog?.watchPercentage || 0,
                    isCompleted: prog?.isCompleted || false,
                    lastPosition: prog?.lastPosition || 0,
                  };
                }),
            })),
        })),
    }));

    const resultDto: CurriculumGradeDTO = {
      id: gradeId,
      name: gradeName,
      stage: gradeStage,
      description: dbGrade?.description || `منهج مادة الرياضيات لـ ${gradeName}`,
      sortOrder: dbGrade?.sort_order || 1,
      terms: termsDto,
    };

    return { success: true, data: resultDto };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'فشل جلب منهج الصف';
    return { success: false, error: msg };
  }
}

/**
 * Fetches all lessons list for backward compatibility.
 */
export async function getLessonsList(gradeName?: string): Promise<LessonItem[]> {
  try {
    const { data: dbLessons, error } = await supabaseAdmin
      .from('lessons')
      .select(`
        id, unit_id, title, description, video_path, pdf_path, thumbnail_path, duration, sort_order, is_published, is_locked, created_at,
        units (
          id, title,
          branches (
            id, name,
            terms (
              id, name,
              grades (id, name, stage)
            )
          )
        )
      `)
      .order('sort_order', { ascending: true });

    if (error || !dbLessons || dbLessons.length === 0) {
      return [];
    }

    const lessons: LessonItem[] = (dbLessons as unknown as DbLessonRelation[]).map((l) => {
      const hierarchy = extractLessonHierarchy(l);
      return {
        id: l.id,
        unitId: l.unit_id,
        unitTitle: hierarchy.unitTitle,
        courseName: 'كورس الرياضيات الشامل',
        sequenceOrder: l.sort_order || 1,
        title: l.title,
        description: l.description || '',
        videoPath: l.video_path || undefined,
        pdfPath: l.pdf_path || undefined,
        thumbnailPath: l.thumbnail_path || '/teacher_reda_kheyrat.jpg',
        durationMinutes: l.duration ? Number(l.duration) : 0,
        gradeName: hierarchy.gradeName,
        branchName: hierarchy.branchName,
        isPublished: l.is_published !== false,
        isLocked: Boolean(l.is_locked),
        createdAt: l.created_at || new Date().toISOString(),
      };
    });

    if (gradeName) {
      return lessons.filter((l) => l.gradeName === gradeName);
    }
    return lessons;
  } catch {
    return [];
  }
}

/**
 * Fetches a single lesson by ID.
 */
export async function getLessonById(id: string): Promise<LessonItem | null> {
  try {
    const { data: dbLesson, error } = await supabaseAdmin
      .from('lessons')
      .select(`
        id, unit_id, title, description, video_path, pdf_path, thumbnail_path, duration, sort_order, is_published, is_locked, created_at,
        units (
          id, title,
          branches (
            id, name,
            terms (
              id, name,
              grades (id, name, stage)
            )
          )
        )
      `)
      .eq('id', id)
      .maybeSingle();

    if (error || !dbLesson) {
      return null;
    }

    const hierarchy = extractLessonHierarchy(dbLesson as unknown as DbLessonRelation);

    return {
      id: dbLesson.id,
      unitId: dbLesson.unit_id,
      unitTitle: hierarchy.unitTitle,
      courseName: 'كورس الرياضيات الشامل',
      sequenceOrder: dbLesson.sort_order || 1,
      title: dbLesson.title,
      description: dbLesson.description || '',
      videoPath: dbLesson.video_path || undefined,
      pdfPath: dbLesson.pdf_path || undefined,
      thumbnailPath: dbLesson.thumbnail_path || '/teacher_reda_kheyrat.jpg',
      durationMinutes: dbLesson.duration || 0,
      gradeName: hierarchy.gradeName,
      branchName: hierarchy.branchName,
      isPublished: dbLesson.is_published !== false,
      isLocked: Boolean(dbLesson.is_locked),
      createdAt: dbLesson.created_at || new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

/**
 * Creates a lesson (Admin only).
 */
export async function createLessonAction(
  inputOrFormData: FormData | {
    unitId: string;
    title: string;
    description?: string;
    videoPath?: string;
    pdfPath?: string;
    thumbnailPath?: string;
    durationMinutes: number;
    sortOrder?: number;
    isPublished?: boolean;
    isLocked?: boolean;
    minPassScore?: number;
  }
): Promise<{ success: boolean; lesson?: LessonItem; message?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return { success: false, message: 'غير مصرح. يجب تسجيل الدخول كأدمن لرفع الدروس.' };
    }

    let unitId = '';
    let title = '';
    let description = '';
    let rawVideoUrl = '';
    let pdfUrl = '';
    let thumbnailPath = '';
    let durationMinutes = 0;
    let sequenceOrder = 1;
    let isPublished = true;
    let isLocked = false;

    if (inputOrFormData instanceof FormData) {
      title = (inputOrFormData.get('title') as string) || '';
      description = (inputOrFormData.get('description') as string) || '';
      durationMinutes = Number(inputOrFormData.get('durationMinutes')) || 0;
      thumbnailPath = (inputOrFormData.get('thumbnailPath') as string) || '/teacher_reda_kheyrat.jpg';
      rawVideoUrl = (inputOrFormData.get('videoUrl') as string) || '';
      pdfUrl = (inputOrFormData.get('pdfUrl') as string) || '';
      unitId = (inputOrFormData.get('unitId') as string) || '';
      isPublished = inputOrFormData.get('isPublished') !== 'false';
      isLocked = inputOrFormData.get('isLocked') === 'true';
    } else {
      unitId = inputOrFormData.unitId;
      title = inputOrFormData.title;
      description = inputOrFormData.description || '';
      rawVideoUrl = inputOrFormData.videoPath || '';
      pdfUrl = inputOrFormData.pdfPath || '';
      thumbnailPath = inputOrFormData.thumbnailPath || '/teacher_reda_kheyrat.jpg';
      durationMinutes = inputOrFormData.durationMinutes || 0;
      sequenceOrder = inputOrFormData.sortOrder || 1;
      isPublished = inputOrFormData.isPublished !== false;
      isLocked = Boolean(inputOrFormData.isLocked);
    }

    // Auto-detect exact video duration if missing or 0
    if (rawVideoUrl && (!durationMinutes || durationMinutes === 0)) {
      try {
        const { detectVideoDurationAction } = await import('@/lib/actions/media');
        const detected = await detectVideoDurationAction(rawVideoUrl);
        if (detected.success && detected.data?.durationMinutes && detected.data.durationMinutes > 0) {
          durationMinutes = detected.data.durationMinutes;
        }
      } catch (err) {
        console.warn('Server auto-duration detection error:', err);
      }
    }

    const { data: dbData, error: insertError } = await supabaseAdmin
      .from('lessons')
      .insert({
        unit_id: unitId,
        title: title.trim(),
        description: description.trim() || 'شرح مفصل وتمارين محلولة باحترافية مع م/ رضا خيرت',
        video_path: rawVideoUrl || null,
        pdf_path: pdfUrl || null,
        thumbnail_path: thumbnailPath || '/teacher_reda_kheyrat.jpg',
        duration: durationMinutes > 0 ? durationMinutes : 0,
        sort_order: sequenceOrder,
        is_published: isPublished,
        is_locked: isLocked,
        min_pass_score: 50,
      })
      .select('id')
      .single();

    if (insertError || !dbData) {
      return { success: false, message: 'حدث خطأ أثناء حفظ الدرس في قاعدة البيانات: ' + insertError?.message };
    }

    await supabaseAdmin.from('audit_logs').insert({
      user_id: user.id,
      action: 'LESSON_CREATED',
      entity_type: 'lessons',
      entity_id: dbData.id,
      metadata: { title, unitId },
    });

    const createdLesson = await getLessonById(dbData.id);
    return { success: true, lesson: createdLesson || undefined, message: 'تم نشر الدرس بنجاح' };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'فشل رفع الدرس';
    return { success: false, message: msg };
  }
}

/**
 * Syncs real video duration detected during playback back to the database.
 */
export async function syncLessonDurationAction(lessonId: string, durationSeconds: number) {
  if (!lessonId || !durationSeconds || durationSeconds <= 0) return;
  const minutes = Math.round(durationSeconds / 60);
  if (minutes <= 0) return;
  try {
    const { data: current } = await supabaseAdmin
      .from('lessons')
      .select('duration')
      .eq('id', lessonId)
      .maybeSingle();

    if (!current?.duration || Math.abs((current.duration || 0) - minutes) >= 1) {
      await supabaseAdmin
        .from('lessons')
        .update({ duration: minutes })
        .eq('id', lessonId);
    }
  } catch (e) {
    console.warn('Failed to auto-sync lesson duration:', e);
  }
}

/**
 * Updates a lesson in Supabase.
 */
export async function updateLessonAction(
  id: string,
  data: Partial<LessonItem>
): Promise<ActionResult<LessonItem>> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return { success: false, error: 'غير مصرح بتعديل الدرس' };
    }

    let finalDuration = data.durationMinutes;
    if (data.videoPath && (!finalDuration || finalDuration === 0)) {
      try {
        const { detectVideoDurationAction } = await import('@/lib/actions/media');
        const detected = await detectVideoDurationAction(data.videoPath);
        if (detected.success && detected.data?.durationMinutes && detected.data.durationMinutes > 0) {
          finalDuration = detected.data.durationMinutes;
        }
      } catch (err) {
        console.warn('Server auto-duration detection error on update:', err);
      }
    }

    const { error } = await supabaseAdmin
      .from('lessons')
      .update({
        title: data.title,
        description: data.description,
        video_path: data.videoPath,
        pdf_path: data.pdfPath,
        thumbnail_path: data.thumbnailPath,
        duration: finalDuration,
        sort_order: data.sequenceOrder,
        is_published: data.isPublished,
        is_locked: data.isLocked,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }

    const updated = await getLessonById(id);
    if (!updated) {
      return { success: false, error: 'لم يتم العثور على الدرس بعد التعديل' };
    }

    return { success: true, data: updated, message: 'تم تعديل الدرس بنجاح' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'فشل تعديل الدرس';
    return { success: false, error: msg };
  }
}

/**
 * Deletes a lesson from Supabase.
 */
export async function deleteLessonAction(lessonId: string): Promise<ActionResult<{ deletedId: string }>> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return { success: false, error: 'غير مصرح بحذف الدرس' };
    }

    await supabaseAdmin.from('lessons').delete().eq('id', lessonId);

    await supabaseAdmin.from('audit_logs').insert({
      user_id: user.id,
      action: 'LESSON_DELETED',
      entity_type: 'lessons',
      entity_id: lessonId,
    });

    return { success: true, data: { deletedId: lessonId }, message: 'تم حذف الدرس بنجاح' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'فشل حذف الدرس';
    return { success: false, error: msg };
  }
}
