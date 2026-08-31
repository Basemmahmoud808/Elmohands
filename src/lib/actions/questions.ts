'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { getCurrentUser } from '@/lib/actions/auth';
import { ActionResult } from '@/lib/types/actions';
import {
  QuestionItemDTO,
  QuestionOptionDTO,
} from '@/lib/types/dashboard';

export interface CreateQuestionInput {
  questionText: string;
  questionLatex?: string;
  imageUrl?: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  questionType: 'MCQ' | 'TRUE_FALSE' | 'FILE';
  options: QuestionOptionDTO[];
  correctAnswer: string;
  explanation?: string;
  branchName?: string;
  gradeName?: string;
  targetAudience?: 'ALL_STUDENTS' | 'SUBSCRIBERS_ONLY' | 'PUBLIC';
  entryType?: 'QUESTION' | 'FILE';
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
}

export interface UpdateQuestionInput {
  questionText?: string;
  questionLatex?: string;
  imageUrl?: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  questionType?: 'MCQ' | 'TRUE_FALSE' | 'FILE';
  options?: QuestionOptionDTO[];
  correctAnswer?: string;
  explanation?: string;
  branchName?: string;
  gradeName?: string;
  targetAudience?: 'ALL_STUDENTS' | 'SUBSCRIBERS_ONLY' | 'PUBLIC';
  entryType?: 'QUESTION' | 'FILE';
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
}

export interface QuestionFilters {
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  questionType?: 'MCQ' | 'TRUE_FALSE' | 'FILE';
  branchName?: string;
  gradeName?: string;
  targetAudience?: 'ALL_STUDENTS' | 'SUBSCRIBERS_ONLY' | 'PUBLIC';
  entryType?: 'QUESTION' | 'FILE';
  search?: string;
}

interface DbQuestionRaw {
  id: string;
  question_text: string;
  question_latex?: string | null;
  image_url?: string | null;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD' | null;
  question_type?: 'MCQ' | 'TRUE_FALSE' | 'FILE' | null;
  options?: string | QuestionOptionDTO[] | null;
  correct_answer: string;
  explanation?: string | null;
  branch_name?: string | null;
  grade_name?: string | null;
  target_audience?: 'ALL_STUDENTS' | 'SUBSCRIBERS_ONLY' | 'PUBLIC' | null;
  entry_type?: 'QUESTION' | 'FILE' | null;
  file_url?: string | null;
  file_name?: string | null;
  file_type?: string | null;
  created_by?: string | null;
  created_at?: string | null;
}

/**
 * Fetches the questions list for Admin Question Bank Tab directly from Supabase.
 */
export async function getQuestionsListAction(
  filters?: QuestionFilters
): Promise<ActionResult<QuestionItemDTO[]>> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return { success: false, error: 'غير مصرح بالوصول إلى بنك الأسئلة' };
    }

    let query = supabaseAdmin
      .from('questions')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.difficulty) {
      query = query.eq('difficulty', filters.difficulty);
    }
    if (filters?.questionType) {
      query = query.eq('question_type', filters.questionType);
    }
    if (filters?.gradeName && filters.gradeName !== 'ALL') {
      query = query.eq('grade_name', filters.gradeName);
    }
    if (filters?.targetAudience) {
      query = query.eq('target_audience', filters.targetAudience);
    }
    if (filters?.entryType) {
      query = query.eq('entry_type', filters.entryType);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      return { success: true, data: [] };
    }

    const typedQuestions = data as unknown as DbQuestionRaw[];
    let results: QuestionItemDTO[] = typedQuestions.map((q) => ({
      id: q.id,
      questionText: q.question_text,
      questionLatex: q.question_latex,
      imageUrl: q.image_url,
      difficulty: q.difficulty || 'MEDIUM',
      questionType: q.question_type || 'MCQ',
      entryType: q.entry_type || (q.question_type === 'FILE' ? 'FILE' : 'QUESTION'),
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options || [],
      correctAnswer: q.correct_answer,
      explanation: q.explanation,
      branchName: q.branch_name || 'فرع الجبر والإحصاء',
      gradeName: q.grade_name || 'الصف الأول الإعدادي',
      targetAudience: q.target_audience || 'ALL_STUDENTS',
      fileUrl: q.file_url,
      fileName: q.file_name,
      fileType: q.file_type,
      createdBy: q.created_by,
      createdAt: q.created_at || new Date().toISOString(),
    }));

    // Search filter
    if (filters?.search && filters.search.trim()) {
      const s = filters.search.trim().toLowerCase();
      results = results.filter(
        (q) =>
          q.questionText.toLowerCase().includes(s) ||
          (q.questionLatex && q.questionLatex.toLowerCase().includes(s)) ||
          (q.explanation && q.explanation.toLowerCase().includes(s)) ||
          (q.branchName && q.branchName.toLowerCase().includes(s)) ||
          (q.gradeName && q.gradeName.toLowerCase().includes(s)) ||
          (q.fileName && q.fileName.toLowerCase().includes(s))
      );
    }

    return { success: true, data: results };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'فشل جلب بنك الأسئلة';
    return { success: false, error: msg };
  }
}

/**
 * Gets a single question by its ID.
 */
export async function getQuestionByIdAction(questionId: string): Promise<ActionResult<QuestionItemDTO>> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return { success: false, error: 'غير مصرح بالوصول إلى السؤال' };
    }

    const { data, error } = await supabaseAdmin
      .from('questions')
      .select('*')
      .eq('id', questionId)
      .maybeSingle();

    if (error || !data) {
      return { success: false, error: 'السؤال غير موجود' };
    }

    const q = data as unknown as DbQuestionRaw;
    return {
      success: true,
      data: {
        id: q.id,
        questionText: q.question_text,
        questionLatex: q.question_latex,
        imageUrl: q.image_url,
        difficulty: q.difficulty || 'MEDIUM',
        questionType: q.question_type || 'MCQ',
        entryType: q.entry_type || (q.question_type === 'FILE' ? 'FILE' : 'QUESTION'),
        options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options || [],
        correctAnswer: q.correct_answer,
        explanation: q.explanation,
        branchName: q.branch_name || 'فرع الجبر والإحصاء',
        gradeName: q.grade_name || 'الصف الأول الإعدادي',
        targetAudience: q.target_audience || 'ALL_STUDENTS',
        fileUrl: q.file_url,
        fileName: q.file_name,
        fileType: q.file_type,
        createdBy: q.created_by,
        createdAt: q.created_at || new Date().toISOString(),
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'فشل جلب السؤال';
    return { success: false, error: msg };
  }
}

/**
 * Creates a new question in the Question Bank (Admin only).
 */
export async function createQuestionAction(input: CreateQuestionInput): Promise<ActionResult<QuestionItemDTO>> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return { success: false, error: 'غير مصرح بإضافة أسئلة' };
    }

    if (!input.questionText || !input.questionText.trim()) {
      return { success: false, error: 'يرجى كتابة نص أو عنوان السؤال / الملف' };
    }

    const { data, error } = await supabaseAdmin
      .from('questions')
      .insert({
        question_text: input.questionText.trim(),
        question_latex: input.questionLatex?.trim() || null,
        image_url: input.imageUrl || null,
        difficulty: input.difficulty || 'MEDIUM',
        question_type: input.questionType || (input.entryType === 'FILE' ? 'FILE' : 'MCQ'),
        options: input.options || [],
        correct_answer: input.correctAnswer || '',
        explanation: input.explanation?.trim() || null,
        branch_name: input.branchName || 'فرع الجبر والإحصاء',
        grade_name: input.gradeName || 'الصف الأول الإعدادي',
        target_audience: input.targetAudience || 'ALL_STUDENTS',
        entry_type: input.entryType || (input.questionType === 'FILE' ? 'FILE' : 'QUESTION'),
        file_url: input.fileUrl || null,
        file_name: input.fileName || null,
        file_type: input.fileType || null,
        created_by: user.id,
      })
      .select('*')
      .single();

    if (error || !data) {
      return { success: false, error: error?.message || 'فشل حفظ السؤال في قاعدة البيانات' };
    }

    const q = data as unknown as DbQuestionRaw;
    const createdItem: QuestionItemDTO = {
      id: q.id,
      questionText: q.question_text,
      questionLatex: q.question_latex,
      imageUrl: q.image_url,
      difficulty: q.difficulty || 'MEDIUM',
      questionType: q.question_type || 'MCQ',
      entryType: q.entry_type || (q.question_type === 'FILE' ? 'FILE' : 'QUESTION'),
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options || [],
      correctAnswer: q.correct_answer,
      explanation: q.explanation,
      branchName: q.branch_name || 'فرع الجبر والإحصاء',
      gradeName: q.grade_name || 'الصف الأول الإعدادي',
      targetAudience: q.target_audience || 'ALL_STUDENTS',
      fileUrl: q.file_url,
      fileName: q.file_name,
      fileType: q.file_type,
      createdBy: q.created_by,
      createdAt: q.created_at || new Date().toISOString(),
    };

    await supabaseAdmin.from('audit_logs').insert({
      user_id: user.id,
      action: 'QUESTION_CREATED',
      entity_type: 'questions',
      entity_id: data.id,
      metadata: {
        text: createdItem.questionText,
        gradeName: createdItem.gradeName,
        targetAudience: createdItem.targetAudience,
        entryType: createdItem.entryType,
      },
    });

    return { success: true, data: createdItem, message: 'تم حفظ السؤال/الملف في بنك الأسئلة بنجاح ' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'فشل إضافة السؤال';
    return { success: false, error: msg };
  }
}

/**
 * Updates an existing question in the Question Bank (Admin only).
 */
export async function updateQuestionAction(
  questionId: string,
  input: UpdateQuestionInput
): Promise<ActionResult<QuestionItemDTO>> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return { success: false, error: 'غير مصرح بتعديل الأسئلة' };
    }

    const updates: Record<string, unknown> = {};
    if (input.questionText !== undefined) updates.question_text = input.questionText.trim();
    if (input.questionLatex !== undefined) updates.question_latex = input.questionLatex?.trim() || null;
    if (input.imageUrl !== undefined) updates.image_url = input.imageUrl;
    if (input.difficulty !== undefined) updates.difficulty = input.difficulty;
    if (input.questionType !== undefined) updates.question_type = input.questionType;
    if (input.entryType !== undefined) updates.entry_type = input.entryType;
    if (input.options !== undefined) updates.options = input.options;
    if (input.correctAnswer !== undefined) updates.correct_answer = input.correctAnswer;
    if (input.explanation !== undefined) updates.explanation = input.explanation?.trim() || null;
    if (input.branchName !== undefined) updates.branch_name = input.branchName;
    if (input.gradeName !== undefined) updates.grade_name = input.gradeName;
    if (input.targetAudience !== undefined) updates.target_audience = input.targetAudience;
    if (input.fileUrl !== undefined) updates.file_url = input.fileUrl;
    if (input.fileName !== undefined) updates.file_name = input.fileName;
    if (input.fileType !== undefined) updates.file_type = input.fileType;

    const { data, error } = await supabaseAdmin
      .from('questions')
      .update(updates)
      .eq('id', questionId)
      .select('*')
      .single();

    if (error || !data) {
      return { success: false, error: error?.message || 'فشل تحديث السؤال في قاعدة البيانات' };
    }

    const q = data as unknown as DbQuestionRaw;
    const updatedItem: QuestionItemDTO = {
      id: q.id,
      questionText: q.question_text,
      questionLatex: q.question_latex,
      imageUrl: q.image_url,
      difficulty: q.difficulty || 'MEDIUM',
      questionType: q.question_type || 'MCQ',
      entryType: q.entry_type || (q.question_type === 'FILE' ? 'FILE' : 'QUESTION'),
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options || [],
      correctAnswer: q.correct_answer,
      explanation: q.explanation,
      branchName: q.branch_name || 'فرع الجبر والإحصاء',
      gradeName: q.grade_name || 'الصف الأول الإعدادي',
      targetAudience: q.target_audience || 'ALL_STUDENTS',
      fileUrl: q.file_url,
      fileName: q.file_name,
      fileType: q.file_type,
      createdBy: q.created_by,
      createdAt: q.created_at || new Date().toISOString(),
    };

    await supabaseAdmin.from('audit_logs').insert({
      user_id: user.id,
      action: 'QUESTION_UPDATED',
      entity_type: 'questions',
      entity_id: questionId,
      metadata: updates,
    });

    return { success: true, data: updatedItem, message: 'تم تحديث السؤال/الملف بنجاح ' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'فشل تحديث السؤال';
    return { success: false, error: msg };
  }
}

/**
 * Deletes a question from the question bank (Admin only).
 */
export async function deleteQuestionAction(questionId: string): Promise<ActionResult<{ deletedId: string }>> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return { success: false, error: 'غير مصرح بحذف الأسئلة' };
    }

    const { error } = await supabaseAdmin.from('questions').delete().eq('id', questionId);
    if (error) {
      return { success: false, error: error.message };
    }

    await supabaseAdmin.from('audit_logs').insert({
      user_id: user.id,
      action: 'QUESTION_DELETED',
      entity_type: 'questions',
      entity_id: questionId,
    });

    return { success: true, data: { deletedId: questionId }, message: 'تم حذف السؤال بنجاح' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'فشل حذف السؤال';
    return { success: false, error: msg };
  }
}

/**
 * Fetches questions and exercise files for students (accessible to authenticated students and admins).
 */
export async function getStudentQuestionsListAction(params?: {
  gradeName?: string;
  branchName?: string;
  entryType?: 'QUESTION' | 'FILE';
}): Promise<ActionResult<QuestionItemDTO[]>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'يرجى تسجيل الدخول أولاً' };
    }

    // Determine target grade: from params or from user's profile
    let targetGrade = params?.gradeName;
    if (!targetGrade || targetGrade === 'ALL') {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('grade_id, grades (name)')
        .eq('id', user.id)
        .maybeSingle();

      const gradeObj = Array.isArray(profile?.grades) ? profile.grades[0] : profile?.grades;
      if (gradeObj?.name) {
        targetGrade = gradeObj.name;
      }
    }

    let query = supabaseAdmin
      .from('questions')
      .select('*')
      .order('created_at', { ascending: false });

    // Filter strictly by the student's grade
    if (targetGrade && targetGrade !== 'ALL') {
      const cleanGrade = targetGrade.replace(/^الصف\s+/, '').trim();
      query = query.ilike('grade_name', `%${cleanGrade}%`);
    }

    if (params?.branchName && params.branchName !== 'ALL') {
      const cleanBranch = params.branchName.replace(/^فرع\s+/, '').trim();
      query = query.ilike('branch_name', `%${cleanBranch}%`);
    }

    if (params?.entryType) {
      query = query.eq('entry_type', params.entryType);
    }

    const { data, error } = await query;
    if (error) {
      return { success: false, error: error.message };
    }

    const list: QuestionItemDTO[] = (data || []).map((q: any) => ({
      id: q.id,
      questionText: q.question_text,
      questionLatex: q.question_latex,
      imageUrl: q.image_url,
      difficulty: q.difficulty || 'MEDIUM',
      questionType: q.question_type || 'MCQ',
      entryType: q.entry_type || (q.question_type === 'FILE' ? 'FILE' : 'QUESTION'),
      options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options || [],
      correctAnswer: q.correct_answer,
      explanation: q.explanation,
      branchName: q.branch_name || 'فرع الرياضيات',
      gradeName: q.grade_name || targetGrade || 'الصف الأول الإعدادي',
      targetAudience: q.target_audience || 'ALL_STUDENTS',
      fileUrl: q.file_url,
      fileName: q.file_name,
      fileType: q.file_type,
      createdBy: q.created_by,
      createdAt: q.created_at || new Date().toISOString(),
    }));

    return { success: true, data: list };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'فشل جلب بنك الأسئلة';
    return { success: false, error: msg };
  }
}

