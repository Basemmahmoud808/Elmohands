'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { getCurrentUser } from '@/lib/actions/auth';
import { ActionResult } from '@/lib/types/actions';
import {
  QuestionItemDTO,
  QuizDetailsDTO,
  QuestionOptionDTO,
} from '@/lib/types/dashboard';

import { CreateQuestionInput, UpdateQuestionInput, QuestionFilters } from '@/lib/actions/questions';
export type { CreateQuestionInput, UpdateQuestionInput, QuestionFilters };

export interface CreateQuizInput {
  lessonId: string;
  title: string;
  description?: string;
  durationMinutes: number;
  passScore: number;
  maxAttempts: number;
  isPublished?: boolean;
  questionIds?: string[];
  pdfPath?: string;
  fileType?: string;
  type?: 'mcq' | 'file';
}

export interface UpdateQuizInput {
  lessonId?: string;
  title?: string;
  description?: string;
  durationMinutes?: number;
  passScore?: number;
  maxAttempts?: number;
  isPublished?: boolean;
  questionIds?: string[];
  pdfPath?: string;
  type?: 'mcq' | 'file';
}

export interface SubmitQuizAttemptInput {
  quizId: string;
  answers: { questionId: string; selectedAnswer: string }[];
  violationCount?: number;
  timeSpentSeconds?: number;
}

export interface StudentQuizQuestionDTO {
  id: string;
  questionText: string;
  questionLatex?: string | null;
  imageUrl?: string | null;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  questionType: 'MCQ' | 'TRUE_FALSE';
  options: QuestionOptionDTO[];
  branchName?: string;
}

export interface StudentExamSessionDTO {
  quiz: {
    id: string;
    lessonId: string;
    lessonTitle: string;
    branchName: string;
    gradeName: string;
    title: string;
    description?: string | null;
    durationMinutes: number;
    passScore: number;
    maxAttempts: number;
    questionsCount: number;
  };
  questions: StudentQuizQuestionDTO[];
  currentAttemptNumber: number;
  maxAttempts: number;
  attemptsRemaining: number;
  student: {
    id: string;
    fullName: string;
    phone: string;
  };
  previousAttempts: Array<{
    attemptNumber: number;
    score: number;
    percentage: number;
    passed: boolean;
    submittedAt: string;
  }>;
}

export interface QuizAttemptResultDTO {
  attemptId: string;
  attemptNumber: number;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
  violationCount: number;
  timeSpentSeconds?: number;
  breakdown: {
    questionId: string;
    questionText: string;
    questionLatex?: string | null;
    imageUrl?: string | null;
    selectedAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
    explanation?: string | null;
  }[];
}

interface DbQuestionRaw {
  id: string;
  question_text: string;
  question_latex?: string | null;
  image_url?: string | null;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD' | null;
  question_type?: 'MCQ' | 'TRUE_FALSE' | null;
  options?: string | QuestionOptionDTO[] | null;
  correct_answer: string;
  explanation?: string | null;
  created_by?: string | null;
  created_at?: string | null;
}

/**
 * Fetches all quizzes for Admin overview and builder.
 */
export async function getAdminQuizzesListAction(): Promise<ActionResult<QuizDetailsDTO[]>> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return { success: false, error: 'غير مصرح بعرض الاختبارات' };
    }

    const { data, error } = await supabaseAdmin
      .from('quizzes')
      .select(`
        id, title, description, duration_minutes, pass_score, max_attempts, is_published, created_at, lesson_id, pdf_path, type,
        lessons (
          title, unit_id,
          units (
            title,
            branches (
              name,
              terms (
                grades (name)
              )
            )
          )
        ),
        quiz_questions (id)
      `)
      .order('created_at', { ascending: false });

    interface DbAdminQuizRow {
      id: string;
      title: string;
      description?: string | null;
      duration_minutes?: number | null;
      pass_score?: number | null;
      max_attempts?: number | null;
      is_published?: boolean | null;
      created_at?: string | null;
      lesson_id: string;
      pdf_path?: string | null;
      type?: 'mcq' | 'file' | null;
      quiz_questions?: Array<{ id: string }> | null;
      lessons?: {
        title?: string | null;
        unit_id?: string | null;
        units?: {
          title?: string | null;
          branches?: {
            name?: string | null;
            terms?: {
              grades?: { name?: string | null } | Array<{ name?: string | null }> | null;
            } | Array<{ grades?: { name?: string | null } | Array<{ name?: string | null }> | null }> | null;
          } | Array<{
            name?: string | null;
            terms?: {
              grades?: { name?: string | null } | Array<{ name?: string | null }> | null;
            } | Array<{ grades?: { name?: string | null } | Array<{ name?: string | null }> | null }> | null;
          }> | null;
        } | Array<{
          title?: string | null;
          branches?: {
            name?: string | null;
            terms?: {
              grades?: { name?: string | null } | Array<{ name?: string | null }> | null;
            } | Array<{ grades?: { name?: string | null } | Array<{ name?: string | null }> | null }> | null;
          } | Array<{
            name?: string | null;
            terms?: {
              grades?: { name?: string | null } | Array<{ name?: string | null }> | null;
            } | Array<{ grades?: { name?: string | null } | Array<{ name?: string | null }> | null }> | null;
          }> | null;
        }> | null;
      } | Array<{
        title?: string | null;
        unit_id?: string | null;
        units?: {
          title?: string | null;
          branches?: {
            name?: string | null;
            terms?: {
              grades?: { name?: string | null } | Array<{ name?: string | null }> | null;
            } | Array<{ grades?: { name?: string | null } | Array<{ name?: string | null }> | null }> | null;
          } | Array<{
            name?: string | null;
            terms?: {
              grades?: { name?: string | null } | Array<{ name?: string | null }> | null;
            } | Array<{ grades?: { name?: string | null } | Array<{ name?: string | null }> | null }> | null;
          }> | null;
        } | Array<{
          title?: string | null;
          branches?: {
            name?: string | null;
            terms?: {
              grades?: { name?: string | null } | Array<{ name?: string | null }> | null;
            } | Array<{ grades?: { name?: string | null } | Array<{ name?: string | null }> | null }> | null;
          } | Array<{
            name?: string | null;
            terms?: {
              grades?: { name?: string | null } | Array<{ name?: string | null }> | null;
            } | Array<{ grades?: { name?: string | null } | Array<{ name?: string | null }> | null }> | null;
          }> | null;
        }> | null;
      }> | null;
    }

    if (error || !data || data.length === 0) {
      return { success: true, data: [] };
    }

    const typedQuizzes = data as unknown as DbAdminQuizRow[];
    const quizzes: QuizDetailsDTO[] = typedQuizzes.map((q) => {
      const lessonObj = Array.isArray(q.lessons) ? q.lessons[0] : q.lessons;
      const unitObj = lessonObj?.units ? (Array.isArray(lessonObj.units) ? lessonObj.units[0] : lessonObj.units) : null;
      const branchObj = unitObj?.branches ? (Array.isArray(unitObj.branches) ? unitObj.branches[0] : unitObj.branches) : null;
      const termObj = branchObj?.terms ? (Array.isArray(branchObj.terms) ? branchObj.terms[0] : branchObj.terms) : null;
      const gradeObj = termObj?.grades ? (Array.isArray(termObj.grades) ? termObj.grades[0] : termObj.grades) : null;
      const qCount = Array.isArray(q.quiz_questions) ? q.quiz_questions.length : (q.pdf_path ? 1 : 0);

      return {
        id: q.id,
        lessonId: q.lesson_id,
        lessonTitle: lessonObj?.title || 'درس عام',
        branchName: branchObj?.name || 'فرع الجبر والإحصاء',
        gradeName: gradeObj?.name || 'الصف الأول الإعدادي',
        title: q.title,
        description: q.description,
        durationMinutes: q.duration_minutes || 20,
        passScore: q.pass_score || 50,
        maxAttempts: q.max_attempts || 3,
        isPublished: q.is_published !== false,
        questionsCount: qCount,
        pdfPath: q.pdf_path || null,
        type: q.type || (q.pdf_path ? 'file' : 'mcq'),
        createdAt: q.created_at || new Date().toISOString(),
      };
    });

    return { success: true, data: quizzes };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'فشل جلب الاختبارات';
    return { success: true, data: [], message: msg };
  }
}

/**
 * Fetches single Quiz details for student exam solver with server-side validation.
 */
export async function getQuizForStudentAction(quizId: string): Promise<ActionResult<StudentExamSessionDTO>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'يرجى تسجيل الدخول أولاً للوصول إلى هذا الاختبار.' };
    }

    // 1. Fetch Quiz Metadata with lesson & grade info
    let quizMeta: {
      id: string;
      lessonId: string;
      lessonTitle: string;
      branchName: string;
      gradeName: string;
      gradeId?: string;
      title: string;
      description?: string | null;
      durationMinutes: number;
      passScore: number;
      maxAttempts: number;
    } | null = null;

    try {
      const { data: dbQuiz } = await supabaseAdmin
        .from('quizzes')
        .select(`
          id, title, description, duration_minutes, pass_score, max_attempts, lesson_id,
          lessons (
            title, unit_id, is_locked,
            units (
              title,
              branches (
                name,
                terms (
                  grade_id,
                  grades (id, name)
                )
              )
            )
          )
        `)
        .eq('id', quizId)
        .maybeSingle();

      if (dbQuiz) {
        const lObj = (Array.isArray(dbQuiz.lessons) ? dbQuiz.lessons[0] : dbQuiz.lessons) as Record<string, unknown> | undefined;
        const uObj = (Array.isArray(lObj?.units) ? lObj?.units[0] : lObj?.units) as Record<string, unknown> | undefined;
        const bObj = (Array.isArray(uObj?.branches) ? uObj?.branches[0] : uObj?.branches) as Record<string, unknown> | undefined;
        const tObj = (Array.isArray(bObj?.terms) ? bObj?.terms[0] : bObj?.terms) as Record<string, unknown> | undefined;
        const gObj = (Array.isArray(tObj?.grades) ? tObj?.grades[0] : tObj?.grades) as Record<string, unknown> | undefined;

        quizMeta = {
          id: dbQuiz.id,
          lessonId: dbQuiz.lesson_id,
          lessonTitle: typeof lObj?.title === 'string' ? lObj.title : 'درس منصة المهندس',
          branchName: typeof bObj?.name === 'string' ? bObj.name : 'فرع الجبر والإحصاء',
          gradeName: typeof gObj?.name === 'string' ? gObj.name : 'الصف الأول الإعدادي',
          gradeId: typeof gObj?.id === 'string' ? gObj.id : (typeof tObj?.grade_id === 'string' ? tObj.grade_id : undefined),
          title: dbQuiz.title,
          description: dbQuiz.description,
          durationMinutes: dbQuiz.duration_minutes || 20,
          passScore: dbQuiz.pass_score || 50,
          maxAttempts: dbQuiz.max_attempts || 3,
        };
      }
    } catch {
      // Fallback
    }

    if (!quizMeta) {
      return { success: false, error: 'لم يتم العثور على هذا الاختبار في قاعدة البيانات.' };
    }

    // 2. Server-side subscription & grade verification (for non-admin students)
    if (user.role !== 'ADMIN') {
      // Check active subscription
      const { data: subData } = await supabaseAdmin
        .from('subscriptions')
        .select('id, status, expires_at')
        .eq('student_id', user.id)
        .eq('status', 'ACTIVE')
        .gt('expires_at', new Date().toISOString())
        .order('expires_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const hasActiveSub = Boolean(subData);

      // Check grade match if both user grade and quiz grade are defined
      if (user.gradeId && quizMeta.gradeId && user.gradeId !== quizMeta.gradeId) {
        return {
          success: false,
          error: `عفواً، هذا الاختبار مخصص لـ (${quizMeta.gradeName}) بينما مرحلتك الدراسية المسجلة هي (${user.gradeName || 'مرحلة أخرى'}).`,
        };
      }
    }

    // 3. Server-side Attempt Number Calculation: COUNT(*) + 1 <= max_attempts
    let attemptNumber = 1;
    const previousAttempts: Array<{
      attemptNumber: number;
      score: number;
      percentage: number;
      passed: boolean;
      submittedAt: string;
    }> = [];

    try {
      const { data: attemptsData } = await supabaseAdmin
        .from('exam_attempts')
        .select('attempt_number, score, percentage, passed, submitted_at')
        .eq('quiz_id', quizMeta.id)
        .eq('student_id', user.id)
        .order('attempt_number', { ascending: true });

      if (attemptsData && attemptsData.length > 0) {
        attemptsData.forEach((a) => {
          previousAttempts.push({
            attemptNumber: a.attempt_number,
            score: a.score || 0,
            percentage: a.percentage || 0,
            passed: Boolean(a.passed),
            submittedAt: a.submitted_at || new Date().toISOString(),
          });
        });
        attemptNumber = attemptsData.length + 1;
      }
    } catch {
      // Fallback
    }

    if (attemptNumber > quizMeta.maxAttempts) {
      return {
        success: false,
        error: `لقد استنفذت الحد الأقصى للمحاولات المسموحة لهذا الاختبار (${quizMeta.maxAttempts} محاولات). يمكنك مراجعة نتائجك السابقة في لوحة التحكم.`,
      };
    }

    // 4. Fetch Questions (Sanitized for solving — WITHOUT revealing correct_answer or explanation)
    let questionsForStudent: StudentQuizQuestionDTO[] = [];

    try {
      const { data: qData } = await supabaseAdmin
        .from('quiz_questions')
        .select(`
          sort_order,
          questions (
            id, question_text, question_latex, image_url, difficulty, question_type, options
          )
        `)
        .eq('quiz_id', quizMeta.id)
        .order('sort_order', { ascending: true });

      if (qData && qData.length > 0) {
        questionsForStudent = qData.map((row: Record<string, unknown>) => {
          const q = (Array.isArray(row.questions) ? row.questions[0] : row.questions) as Record<string, unknown>;
          const rawOpts = typeof q?.options === 'string' ? JSON.parse(q.options) : (Array.isArray(q?.options) ? q.options : []);
          const normalizedOptions: QuestionOptionDTO[] = rawOpts.map((opt: Record<string, unknown> | string, idx: number) => {
            if (typeof opt === 'string') {
              return { label: String.fromCharCode(65 + idx), text: opt };
            }
            return {
              label: typeof opt?.label === 'string' ? opt.label : String.fromCharCode(65 + idx),
              text: typeof opt?.text === 'string' ? opt.text : '',
            };
          });

          return {
            id: String(q?.id || ''),
            questionText: String(q?.question_text || ''),
            questionLatex: typeof q?.question_latex === 'string' ? q.question_latex : undefined,
            imageUrl: typeof q?.image_url === 'string' ? q.image_url : undefined,
            difficulty: (q?.difficulty as 'EASY' | 'MEDIUM' | 'HARD') || 'MEDIUM',
            questionType: (q?.question_type as 'MCQ' | 'TRUE_FALSE') || 'MCQ',
            options: normalizedOptions,
            branchName: quizMeta?.branchName,
          };
        });
      }
    } catch {
      // Fallback
    }

    if (questionsForStudent.length === 0) {
      return { success: false, error: 'لا توجد أسئلة مضافة لهذا الاختبار بعد.' };
    }

    const attemptsRemaining = Math.max(0, quizMeta.maxAttempts - attemptNumber + 1);

    const session: StudentExamSessionDTO = {
      quiz: {
        id: quizMeta.id,
        lessonId: quizMeta.lessonId,
        lessonTitle: quizMeta.lessonTitle,
        branchName: quizMeta.branchName,
        gradeName: quizMeta.gradeName,
        title: quizMeta.title,
        description: quizMeta.description,
        durationMinutes: quizMeta.durationMinutes,
        passScore: quizMeta.passScore,
        maxAttempts: quizMeta.maxAttempts,
        questionsCount: questionsForStudent.length,
      },
      questions: questionsForStudent,
      currentAttemptNumber: attemptNumber,
      maxAttempts: quizMeta.maxAttempts,
      attemptsRemaining,
      student: {
        id: user.id,
        fullName: user.fullName || 'طالب منصة المهندس',
        phone: user.phone || '',
      },
      previousAttempts,
    };

    return { success: true, data: session };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'فشل تحميل جلسة الاختبار';
    return { success: false, error: msg };
  }
}

/**
 * Creates a new Quiz and links questions to it (Admin only).
 */
export async function createQuizAction(input: CreateQuizInput): Promise<ActionResult<QuizDetailsDTO>> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return { success: false, error: 'غير مصرح بإنشاء اختبارات' };
    }

    if (!input.title || !input.title.trim()) {
      return { success: false, error: 'يرجى كتابة عنوان الاختبار' };
    }
    if (!input.lessonId) {
      return { success: false, error: 'يرجى اختيار الدرس المرتبط بالاختبار' };
    }

    const newQuiz: QuizDetailsDTO = {
      id: `quiz-${Date.now()}`,
      lessonId: input.lessonId,
      title: input.title.trim(),
      description: input.description?.trim() || '',
      durationMinutes: input.durationMinutes || 20,
      passScore: input.passScore || 50,
      maxAttempts: input.maxAttempts || 3,
      isPublished: input.isPublished !== false,
      questionsCount: input.questionIds?.length || (input.pdfPath ? 1 : 0),
      pdfPath: input.pdfPath || null,
      type: input.type || (input.pdfPath ? 'file' : 'mcq'),
      createdAt: new Date().toISOString(),
    };

    const isValidUuid = (id?: string | null) =>
      Boolean(id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id));

    try {
      const { data, error } = await supabaseAdmin
        .from('quizzes')
        .insert({
          lesson_id: isValidUuid(input.lessonId) ? input.lessonId : null,
          title: newQuiz.title,
          description: newQuiz.description,
          duration_minutes: newQuiz.durationMinutes,
          pass_score: newQuiz.passScore,
          max_attempts: newQuiz.maxAttempts,
          is_published: newQuiz.isPublished,
          pdf_path: newQuiz.pdfPath,
          type: newQuiz.type,
        })
        .select('id')
        .single();

      if (!error && data) {
        newQuiz.id = data.id;

        // Insert quiz questions mappings
        if (input.questionIds && input.questionIds.length > 0) {
          const mappingRows = input.questionIds.map((qId, idx) => ({
            quiz_id: data.id,
            question_id: qId,
            sort_order: idx + 1,
          }));
          await supabaseAdmin.from('quiz_questions').insert(mappingRows);
        }

        await supabaseAdmin.from('audit_logs').insert({
          user_id: user.id,
          action: 'QUIZ_CREATED',
          entity_type: 'quizzes',
          entity_id: data.id,
          metadata: { title: newQuiz.title, lessonId: input.lessonId, questionsCount: input.questionIds?.length || 0 },
        });
      }
    } catch (e) {
      console.warn('DB quiz insert exception:', e);
    }

    return { success: true, data: newQuiz, message: 'تم إنشاء الاختبار وربطه بالدرس بنجاح ' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'فشل إنشاء الاختبار';
    return { success: false, error: msg };
  }
}

/**
 * Updates an existing Quiz (Admin only).
 */
export async function updateQuizAction(
  quizId: string,
  input: UpdateQuizInput
): Promise<ActionResult<QuizDetailsDTO>> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return { success: false, error: 'غير مصرح بتعديل الاختبارات' };
    }

    const updates: Record<string, unknown> = {};
    if (input.title !== undefined) updates.title = input.title.trim();
    if (input.description !== undefined) updates.description = input.description.trim();
    if (input.lessonId !== undefined) updates.lesson_id = input.lessonId;
    if (input.durationMinutes !== undefined) updates.duration_minutes = input.durationMinutes;
    if (input.passScore !== undefined) updates.pass_score = input.passScore;
    if (input.maxAttempts !== undefined) updates.max_attempts = input.maxAttempts;
    if (input.isPublished !== undefined) updates.is_published = input.isPublished;
    if (input.pdfPath !== undefined) updates.pdf_path = input.pdfPath;
    if (input.type !== undefined) updates.type = input.type;

    try {
      await supabaseAdmin.from('quizzes').update(updates).eq('id', quizId);

      if (input.questionIds !== undefined) {
        // Replace mappings
        await supabaseAdmin.from('quiz_questions').delete().eq('quiz_id', quizId);
        if (input.questionIds.length > 0) {
          const mappingRows = input.questionIds.map((qId, idx) => ({
            quiz_id: quizId,
            question_id: qId,
            sort_order: idx + 1,
          }));
          await supabaseAdmin.from('quiz_questions').insert(mappingRows);
        }
      }

      await supabaseAdmin.from('audit_logs').insert({
        user_id: user.id,
        action: 'QUIZ_UPDATED',
        entity_type: 'quizzes',
        entity_id: quizId,
        metadata: updates,
      });
    } catch (e) {
      console.warn('DB quiz update exception:', e);
    }

    const updatedQuiz: QuizDetailsDTO = {
      id: quizId,
      lessonId: input.lessonId || '',
      title: input.title || 'اختبار محدث',
      durationMinutes: input.durationMinutes || 20,
      passScore: input.passScore || 50,
      maxAttempts: input.maxAttempts || 3,
      isPublished: input.isPublished !== false,
      questionsCount: input.questionIds?.length || 0,
      createdAt: new Date().toISOString(),
    };

    return { success: true, data: updatedQuiz, message: 'تم تحديث بيانات الاختبار بنجاح ' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'فشل تحديث الاختبار';
    return { success: false, error: msg };
  }
}

/**
 * Deletes a quiz (Admin only).
 */
export async function deleteQuizAction(quizId: string): Promise<ActionResult<{ deletedId: string }>> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return { success: false, error: 'غير مصرح بحذف الاختبارات' };
    }

    await supabaseAdmin.from('quizzes').delete().eq('id', quizId);

    await supabaseAdmin.from('audit_logs').insert({
      user_id: user.id,
      action: 'QUIZ_DELETED',
      entity_type: 'quizzes',
      entity_id: quizId,
    });

    return { success: true, data: { deletedId: quizId }, message: 'تم حذف الاختبار بنجاح' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'فشل حذف الاختبار';
    return { success: false, error: msg };
  }
}

/**
 * Submits a student's quiz attempt with genuine score calculation and attempt limit enforcement.
 */
export async function submitQuizAttemptAction(
  input: SubmitQuizAttemptInput
): Promise<ActionResult<QuizAttemptResultDTO>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'يرجى تسجيل الدخول أولاً لتسليم الاختبار' };
    }

    // 1. Calculate Attempt Number server-side
    let attemptNumber = 1;
    let maxAttempts = 3;
    let passScore = 50;

    try {
      // Check quiz max_attempts
      const { data: quizData } = await supabaseAdmin
        .from('quizzes')
        .select('max_attempts, pass_score')
        .eq('id', input.quizId)
        .maybeSingle();

      if (quizData) {
        maxAttempts = quizData.max_attempts || 3;
        passScore = quizData.pass_score || 50;
      }

      // Count prior attempts
      const { count } = await supabaseAdmin
        .from('exam_attempts')
        .select('id', { count: 'exact', head: true })
        .eq('quiz_id', input.quizId)
        .eq('student_id', user.id);

      attemptNumber = (count || 0) + 1;

      if (attemptNumber > maxAttempts) {
        return {
          success: false,
          error: `لقد استنفذت الحد الأقصى للمحاولات المسموحة لهذا الاختبار (${maxAttempts} محاولات).`,
        };
      }
    } catch {
      // Offline attempt calculation
    }

    // 2. Score Calculation & Grading against DB Answers
    const breakdown: QuizAttemptResultDTO['breakdown'] = [];
    let correctCount = 0;

    // Fetch quiz questions
    let questionsForGrading: QuestionItemDTO[] = [];
    interface DbQuizQuestionGradingRow {
      questions?: DbQuestionRaw | DbQuestionRaw[] | null;
    }

    try {
      const { data: qData } = await supabaseAdmin
        .from('quiz_questions')
        .select('questions (*)')
        .eq('quiz_id', input.quizId)
        .order('sort_order', { ascending: true });

      if (qData && qData.length > 0) {
        const typedRows = qData as unknown as DbQuizQuestionGradingRow[];
        questionsForGrading = typedRows.map((row) => {
          const q = Array.isArray(row.questions) ? row.questions[0] : row.questions;
          return {
            id: q?.id || '',
            questionText: q?.question_text || '',
            questionLatex: q?.question_latex,
            imageUrl: q?.image_url,
            difficulty: q?.difficulty || 'MEDIUM',
            questionType: q?.question_type || 'MCQ',
            options: typeof q?.options === 'string' ? JSON.parse(q.options) : q?.options || [],
            correctAnswer: q?.correct_answer || 'A',
            explanation: q?.explanation,
          };
        });
      }
    } catch {
      // fallback
    }

    if (questionsForGrading.length === 0) {
      return {
        success: false,
        error: 'لا توجد أسئلة مسجلة لهذا الاختبار لتصحيحها.',
      };
    }

    const isLastAttempt = attemptNumber >= maxAttempts;

    for (const q of questionsForGrading) {
      const studentAns = input.answers.find((a) => a.questionId === q.id);
      const selected = studentAns?.selectedAnswer || '';
      const isCorrect = selected.trim() !== '' && selected.trim() === q.correctAnswer.trim();
      if (isCorrect) correctCount++;

      breakdown.push({
        questionId: q.id,
        questionText: q.questionText,
        questionLatex: q.questionLatex,
        imageUrl: q.imageUrl,
        selectedAnswer: selected,
        // Only reveal the correct answer on the student's final attempt to prevent answer harvesting
        correctAnswer: isLastAttempt ? q.correctAnswer : (isCorrect ? q.correctAnswer : ''),
        isCorrect,
        explanation: isLastAttempt ? q.explanation : null,
      });
    }

    const totalQuestions = Math.max(1, questionsForGrading.length);
    const score = correctCount * 10;
    const maxScore = totalQuestions * 10;
    const percentage = Math.round((correctCount / totalQuestions) * 100);
    const passed = percentage >= passScore;
    let attemptId = `att-${Date.now()}`;
    const violationCount = input.violationCount || 0;

    // 3. Persist Exam Attempt & Student Answers in Supabase
    try {
      const { data: attData, error: attError } = await supabaseAdmin
        .from('exam_attempts')
        .insert({
          quiz_id: input.quizId,
          student_id: user.id,
          attempt_number: attemptNumber,
          score,
          percentage,
          passed,
          submitted_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (!attError && attData) {
        attemptId = attData.id;

        const answerRows = breakdown.map((b) => ({
          attempt_id: attData.id,
          question_id: b.questionId,
          answer: b.selectedAnswer,
          is_correct: b.isCorrect,
        }));
        await supabaseAdmin.from('student_answers').insert(answerRows);

        // Record Audit log with anti-cheat violations metadata
        await supabaseAdmin.from('audit_logs').insert({
          user_id: user.id,
          action: 'EXAM_SUBMITTED',
          entity_type: 'exam_attempts',
          entity_id: attData.id,
          metadata: {
            quizId: input.quizId,
            attemptNumber,
            score,
            percentage,
            passed,
            violationCount,
            timeSpentSeconds: input.timeSpentSeconds || 0,
          },
        });
      }
    } catch (e) {
      console.warn('DB exam attempt insert error:', e);
    }

    return {
      success: true,
      data: {
        attemptId,
        attemptNumber,
        score,
        maxScore,
        percentage,
        passed,
        violationCount,
        timeSpentSeconds: input.timeSpentSeconds,
        breakdown,
      },
      message: passed
        ? 'مبروك! لقد اجتزت الاختبار بنجاح '
        : 'حاول مرة أخرى لتحسين نتيجتك وفهم الحلول النموذجية ',
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'فشل تسليم الاختبار';
    return { success: false, error: msg };
  }
}
