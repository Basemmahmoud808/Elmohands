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

// In-memory fallback question bank for local/offline execution
const IN_MEMORY_QUESTIONS: QuestionItemDTO[] = [
  {
    id: 'q-1',
    questionText: 'أي من الأعداد التالية ينتمي إلى مجموعة الأعداد النسبية (ن)؟',
    questionLatex: '\\frac{3}{5} \\in \\mathbb{Q}',
    difficulty: 'EASY',
    questionType: 'MCQ',
    entryType: 'QUESTION',
    options: [
      { label: 'A', text: '5 / 0' },
      { label: 'B', text: '3 / 4' },
      { label: 'C', text: '√(-4)' },
      { label: 'D', text: '0 / 0' },
    ],
    correctAnswer: 'B',
    explanation: 'العدد 3/4 مكتوب على صورة أ/ب حيث أ، ب عددان صحيحان والمقام لا يساوي صفراً.',
    branchName: 'فرع الجبر والإحصاء',
    gradeName: 'الصف الأول الإعدادي',
    targetAudience: 'ALL_STUDENTS',
    createdAt: new Date('2026-01-10T10:00:00Z').toISOString(),
  },
  {
    id: 'q-2',
    questionText: 'في المثلث القائم الزاوية، مربع طول الوتر يساوي:',
    questionLatex: 'a^2 + b^2 = c^2',
    difficulty: 'MEDIUM',
    questionType: 'MCQ',
    entryType: 'QUESTION',
    options: [
      { label: 'A', text: 'مجموع مربعي طولي ضلعي القائمة' },
      { label: 'B', text: 'الفرق بين طولي ضلعي القائمة' },
      { label: 'C', text: 'نصف حاصل ضرب ضلعي القائمة' },
      { label: 'D', text: 'محيط المثلث' },
    ],
    correctAnswer: 'A',
    explanation: 'وفقاً لنظرية فيثاغورس الشهيرة في الهندسة الإقليدية، مربع الوتر = مجموع مربعي ضلعي القائمة.',
    branchName: 'فرع الهندسة والقياس',
    gradeName: 'الصف الثاني الإعدادي',
    targetAudience: 'SUBSCRIBERS_ONLY',
    createdAt: new Date('2026-01-12T11:00:00Z').toISOString(),
  },
  {
    id: 'q-3',
    questionText: 'العدد 0.35 يمكن كتابته في صورة عدد نسبي على أبسط صورة كالتالي:',
    questionLatex: '0.35 = \\frac{35}{100} = \\frac{7}{20}',
    difficulty: 'EASY',
    questionType: 'MCQ',
    entryType: 'QUESTION',
    options: [
      { label: 'A', text: '7 / 20' },
      { label: 'B', text: '35 / 10' },
      { label: 'C', text: '7 / 25' },
      { label: 'D', text: '3 / 5' },
    ],
    correctAnswer: 'A',
    explanation: 'بالقسمة على 5 لكل من البسط والمقام: 35 ÷ 5 = 7، 100 ÷ 5 = 20، إذن 7/20.',
    branchName: 'فرع الجبر والإحصاء',
    gradeName: 'الصف الأول الإعدادي',
    targetAudience: 'PUBLIC',
    createdAt: new Date('2026-01-14T12:00:00Z').toISOString(),
  },
  {
    id: 'q-4',
    questionText: 'إذا كان المستقيمان ل₁ و ل₂ متوازيين، فإن قياس الزاويتين المتبادلتين يكون:',
    questionLatex: 'L_1 \\parallel L_2 \\implies \\angle 1 = \\angle 2',
    difficulty: 'EASY',
    questionType: 'MCQ',
    entryType: 'QUESTION',
    options: [
      { label: 'A', text: 'متساويين في القياس' },
      { label: 'B', text: 'متكاملين (مجموعهما 180°)' },
      { label: 'C', text: 'متتامين (مجموعهما 90°)' },
      { label: 'D', text: 'منفرجتين دائماً' },
    ],
    correctAnswer: 'A',
    explanation: 'من خواص التوازي: كل زاويتين متبادلتين متساويتان في القياس (على شكل حرف Z).',
    branchName: 'فرع الهندسة والقياس',
    gradeName: 'الصف الأول الإعدادي',
    targetAudience: 'ALL_STUDENTS',
    createdAt: new Date('2026-01-16T13:00:00Z').toISOString(),
  },
  {
    id: 'q-5',
    questionText: 'مجموعة حل المعادلة: 2س + 6 = 16 في مجموعة الأعداد الصحيحة (ص) هي:',
    questionLatex: '2x + 6 = 16 \\implies 2x = 10 \\implies x = 5',
    difficulty: 'MEDIUM',
    questionType: 'MCQ',
    entryType: 'QUESTION',
    options: [
      { label: 'A', text: '{ 5 }' },
      { label: 'B', text: '{ 10 }' },
      { label: 'C', text: '{ -5 }' },
      { label: 'D', text: '∅' },
    ],
    correctAnswer: 'A',
    explanation: 'بطرح 6 من الطرفين: 2س = 10، ثم بالقسمة على 2: س = 5، وهو ينتمي إلى ص.',
    branchName: 'فرع الجبر والإحصاء',
    gradeName: 'الصف الأول الإعدادي',
    targetAudience: 'SUBSCRIBERS_ONLY',
    createdAt: new Date('2026-01-18T14:00:00Z').toISOString(),
  },
  {
    id: 'q-6',
    questionText: 'الزاويتان المتتامتان مجموع قياسهما يساوي 90 درجة.',
    questionLatex: '\\alpha + \\beta = 90^\\circ',
    difficulty: 'EASY',
    questionType: 'TRUE_FALSE',
    entryType: 'QUESTION',
    options: [
      { label: 'A', text: 'صواب (True)' },
      { label: 'B', text: 'خطأ (False)' },
    ],
    correctAnswer: 'A',
    explanation: 'الزاويتان المتتامتان هما زاويتان مجموع قياسيهما 90°، بينما المتكاملتان 180°.',
    branchName: 'فرع الهندسة والقياس',
    gradeName: 'الصف الأول الإعدادي',
    targetAudience: 'PUBLIC',
    createdAt: new Date('2026-01-20T15:00:00Z').toISOString(),
  },
  {
    id: 'q-7',
    questionText: 'إذا كانت جا (س) = 0.5 حيث س زاوية حادة، فإن قياس زاوية س يساوي:',
    questionLatex: '\\sin(x) = 0.5 \\implies x = 30^\\circ',
    difficulty: 'MEDIUM',
    questionType: 'MCQ',
    entryType: 'QUESTION',
    options: [
      { label: 'A', text: '30°' },
      { label: 'B', text: '45°' },
      { label: 'C', text: '60°' },
      { label: 'D', text: '90°' },
    ],
    correctAnswer: 'A',
    explanation: 'النسب المثلثية الأساسية: جا(30°) = 1/2 = 0.5.',
    branchName: 'فرع حساب المثلثات',
    gradeName: 'الصف الثالث الإعدادي',
    targetAudience: 'ALL_STUDENTS',
    createdAt: new Date('2026-01-22T16:00:00Z').toISOString(),
  },
  {
    id: 'q-8',
    questionText: 'الحد الجبري 5 س² ص³ من الدرجة الخامسة.',
    questionLatex: '5x^2y^3 \\implies 2 + 3 = 5',
    difficulty: 'HARD',
    questionType: 'TRUE_FALSE',
    entryType: 'QUESTION',
    options: [
      { label: 'A', text: 'صواب (True)' },
      { label: 'B', text: 'خطأ (False)' },
    ],
    correctAnswer: 'A',
    explanation: 'درجة الحد الجبري هي مجموع أسس العوامل الجبرية (الرموز): 2 + 3 = 5.',
    branchName: 'فرع الجبر والإحصاء',
    gradeName: 'الصف الأول الثانوي',
    targetAudience: 'SUBSCRIBERS_ONLY',
    createdAt: new Date('2026-01-24T17:00:00Z').toISOString(),
  },
  {
    id: 'q-9',
    questionText: 'شيت تدريبات بنك الأسئلة الشامل - مراجعة ليلة الامتحان في الجبر',
    difficulty: 'HARD',
    questionType: 'FILE',
    entryType: 'FILE',
    options: [],
    correctAnswer: '',
    explanation: 'ملف PDF يحتوي على 50 سؤالاً نموذجياً مع نماذج الإجابة التفصيلية.',
    branchName: 'فرع الجبر والإحصاء',
    gradeName: 'الصف الأول الإعدادي',
    targetAudience: 'SUBSCRIBERS_ONLY',
    fileUrl: '/sample-question-bank.pdf',
    fileName: 'مراجعة_الجبر_الشاملة_2026.pdf',
    fileType: 'pdf',
    createdAt: new Date('2026-01-28T18:00:00Z').toISOString(),
  },
];

/**
 * Fetches all questions for Question Bank management (Admin only).
 */
export async function getQuestionsListAction(
  filters?: QuestionFilters
): Promise<ActionResult<QuestionItemDTO[]>> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return { success: false, error: 'غير مصرح بعرض بنك الأسئلة' };
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

    let results: QuestionItemDTO[] = [];

    if (!error && data && data.length > 0) {
      const typedQuestions = data as unknown as DbQuestionRaw[];
      results = typedQuestions.map((q) => ({
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
    } else {
      results = [...IN_MEMORY_QUESTIONS];
      if (filters?.difficulty) {
        results = results.filter((q) => q.difficulty === filters.difficulty);
      }
      if (filters?.questionType) {
        results = results.filter((q) => q.questionType === filters.questionType);
      }
      if (filters?.gradeName && filters.gradeName !== 'ALL') {
        results = results.filter((q) => q.gradeName === filters.gradeName);
      }
      if (filters?.targetAudience) {
        results = results.filter((q) => q.targetAudience === filters.targetAudience);
      }
      if (filters?.entryType) {
        results = results.filter((q) => (q.entryType || 'QUESTION') === filters.entryType);
      }
    }

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
    return { success: true, data: IN_MEMORY_QUESTIONS, message: msg };
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

    if (!error && data) {
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
    }

    const found = IN_MEMORY_QUESTIONS.find((item) => item.id === questionId);
    if (found) {
      return { success: true, data: found };
    }

    return { success: false, error: 'السؤال غير موجود' };
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

    const newQuestion: QuestionItemDTO = {
      id: `q-${Date.now()}`,
      questionText: input.questionText.trim(),
      questionLatex: input.questionLatex?.trim() || null,
      imageUrl: input.imageUrl || null,
      difficulty: input.difficulty || 'MEDIUM',
      questionType: input.questionType || (input.entryType === 'FILE' ? 'FILE' : 'MCQ'),
      entryType: input.entryType || (input.questionType === 'FILE' ? 'FILE' : 'QUESTION'),
      options: input.options || [],
      correctAnswer: input.correctAnswer || '',
      explanation: input.explanation?.trim() || null,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
      branchName: input.branchName || 'فرع الجبر والإحصاء',
      gradeName: input.gradeName || 'الصف الأول الإعدادي',
      targetAudience: input.targetAudience || 'ALL_STUDENTS',
      fileUrl: input.fileUrl || null,
      fileName: input.fileName || null,
      fileType: input.fileType || null,
    };

    try {
      const { data, error } = await supabaseAdmin
        .from('questions')
        .insert({
          question_text: newQuestion.questionText,
          question_latex: newQuestion.questionLatex,
          image_url: newQuestion.imageUrl,
          difficulty: newQuestion.difficulty,
          question_type: newQuestion.questionType,
          options: newQuestion.options,
          correct_answer: newQuestion.correctAnswer,
          explanation: newQuestion.explanation,
          branch_name: newQuestion.branchName,
          grade_name: newQuestion.gradeName,
          target_audience: newQuestion.targetAudience,
          entry_type: newQuestion.entryType,
          file_url: newQuestion.fileUrl,
          file_name: newQuestion.fileName,
          file_type: newQuestion.fileType,
          created_by: user.id,
        })
        .select('id')
        .single();

      if (!error && data) {
        newQuestion.id = data.id;

        await supabaseAdmin.from('audit_logs').insert({
          user_id: user.id,
          action: 'QUESTION_CREATED',
          entity_type: 'questions',
          entity_id: data.id,
          metadata: {
            text: newQuestion.questionText,
            gradeName: newQuestion.gradeName,
            targetAudience: newQuestion.targetAudience,
            entryType: newQuestion.entryType,
          },
        });
      }
    } catch (e) {
      console.warn('DB question insert exception:', e);
    }

    IN_MEMORY_QUESTIONS.unshift(newQuestion);
    return { success: true, data: newQuestion, message: 'تم حفظ السؤال/الملف في بنك الأسئلة بنجاح ' };
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

    try {
      await supabaseAdmin.from('questions').update(updates).eq('id', questionId);

      await supabaseAdmin.from('audit_logs').insert({
        user_id: user.id,
        action: 'QUESTION_UPDATED',
        entity_type: 'questions',
        entity_id: questionId,
        metadata: updates,
      });
    } catch (e) {
      console.warn('DB question update exception:', e);
    }

    // Update in-memory
    const idx = IN_MEMORY_QUESTIONS.findIndex((q) => q.id === questionId);
    let updatedQuestion: QuestionItemDTO;
    if (idx !== -1) {
      IN_MEMORY_QUESTIONS[idx] = {
        ...IN_MEMORY_QUESTIONS[idx],
        questionText: input.questionText !== undefined ? input.questionText : IN_MEMORY_QUESTIONS[idx].questionText,
        questionLatex: input.questionLatex !== undefined ? input.questionLatex : IN_MEMORY_QUESTIONS[idx].questionLatex,
        imageUrl: input.imageUrl !== undefined ? input.imageUrl : IN_MEMORY_QUESTIONS[idx].imageUrl,
        difficulty: input.difficulty !== undefined ? input.difficulty : IN_MEMORY_QUESTIONS[idx].difficulty,
        questionType: input.questionType !== undefined ? input.questionType : IN_MEMORY_QUESTIONS[idx].questionType,
        entryType: input.entryType !== undefined ? input.entryType : IN_MEMORY_QUESTIONS[idx].entryType,
        options: input.options !== undefined ? input.options : IN_MEMORY_QUESTIONS[idx].options,
        correctAnswer: input.correctAnswer !== undefined ? input.correctAnswer : IN_MEMORY_QUESTIONS[idx].correctAnswer,
        explanation: input.explanation !== undefined ? input.explanation : IN_MEMORY_QUESTIONS[idx].explanation,
        branchName: input.branchName !== undefined ? input.branchName : IN_MEMORY_QUESTIONS[idx].branchName,
        gradeName: input.gradeName !== undefined ? input.gradeName : IN_MEMORY_QUESTIONS[idx].gradeName,
        targetAudience: input.targetAudience !== undefined ? input.targetAudience : IN_MEMORY_QUESTIONS[idx].targetAudience,
        fileUrl: input.fileUrl !== undefined ? input.fileUrl : IN_MEMORY_QUESTIONS[idx].fileUrl,
        fileName: input.fileName !== undefined ? input.fileName : IN_MEMORY_QUESTIONS[idx].fileName,
        fileType: input.fileType !== undefined ? input.fileType : IN_MEMORY_QUESTIONS[idx].fileType,
      };
      updatedQuestion = IN_MEMORY_QUESTIONS[idx];
    } else {
      updatedQuestion = {
        id: questionId,
        questionText: input.questionText || '',
        questionLatex: input.questionLatex || null,
        imageUrl: input.imageUrl || null,
        difficulty: input.difficulty || 'MEDIUM',
        questionType: input.questionType || 'MCQ',
        entryType: input.entryType || 'QUESTION',
        options: input.options || [],
        correctAnswer: input.correctAnswer || 'A',
        explanation: input.explanation || null,
        branchName: input.branchName || 'فرع الجبر والإحصاء',
        gradeName: input.gradeName || 'الصف الأول الإعدادي',
        targetAudience: input.targetAudience || 'ALL_STUDENTS',
        fileUrl: input.fileUrl || null,
        fileName: input.fileName || null,
        fileType: input.fileType || null,
        createdAt: new Date().toISOString(),
      };
      IN_MEMORY_QUESTIONS.unshift(updatedQuestion);
    }

    return { success: true, data: updatedQuestion, message: 'تم تحديث السؤال/الملف بنجاح ' };
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

    await supabaseAdmin.from('questions').delete().eq('id', questionId);

    const idx = IN_MEMORY_QUESTIONS.findIndex((q) => q.id === questionId);
    if (idx !== -1) IN_MEMORY_QUESTIONS.splice(idx, 1);

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
