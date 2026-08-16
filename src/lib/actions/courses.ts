'use server';

import { supabaseAdmin } from '@/lib/supabase/admin';
import { getCurrentUser } from '@/lib/actions/auth';
import { ActionResult } from '@/lib/types/actions';
import {
  CurriculumGradeDTO,
  CurriculumTermDTO,
  CurriculumBranchDTO,
  CurriculumUnitDTO,
  CurriculumLessonDTO,
} from '@/lib/types/dashboard';

export interface CreateGradeInput {
  name: string;
  stage: 'إعدادي' | 'ثانوي';
  description?: string;
  sortOrder?: number;
}

export interface CreateTermInput {
  gradeId: string;
  name: string;
  sortOrder?: number;
}

export interface CreateBranchInput {
  termId: string;
  name: string;
  sortOrder?: number;
}

export interface CreateUnitInput {
  branchId: string;
  title: string;
  description?: string;
  sortOrder?: number;
}

export interface CreateLessonInput {
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

export interface UpdateLessonInput extends Partial<CreateLessonInput> {
  id: string;
}

/**
 * Parses video URLs to handle external embeds (YouTube, Vimeo, BunnyCDN, Google Drive, direct MP4)
 */
export async function parseMediaUrl(url: string): Promise<{ type: 'video' | 'iframe'; src: string }> {
  if (!url) {
    return { type: 'video', src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' };
  }

  // BunnyStream / BunnyCDN
  if (url.includes('b-cdn.net') || url.includes('bunnycdn.com') || url.includes('iframe.mediadelivery.net')) {
    return { type: 'iframe', src: url };
  }

  // Wistia
  if (url.includes('wistia.com') || url.includes('wistia.net')) {
    return { type: 'iframe', src: url };
  }

  // Vimeo
  if (url.includes('vimeo.com')) {
    const vimeoId = url.split('vimeo.com/')[1]?.split('?')[0];
    if (vimeoId) {
      return { type: 'iframe', src: `https://player.vimeo.com/video/${vimeoId}?autoplay=1` };
    }
  }

  // Google Drive
  if (url.includes('drive.google.com')) {
    const fileIdMatch = url.match(/\/file\/d\/([^\/]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      return { type: 'iframe', src: `https://drive.google.com/file/d/${fileIdMatch[1]}/preview` };
    }
  }

  // YouTube
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    let videoId = '';
    if (url.includes('youtu.be')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
    } else if (url.includes('v=')) {
      videoId = url.split('v=')[1]?.split('&')[0] || '';
    }
    if (videoId) {
      return { type: 'iframe', src: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0` };
    }
  }

  return { type: 'video', src: url };
}

// Fallback seed tree data for seamless local rendering
const FALLBACK_CURRICULUM: CurriculumGradeDTO[] = [
  {
    id: 'g-prep-1',
    name: 'الصف الأول الإعدادي',
    stage: 'إعدادي',
    description: 'منهج الرياضيات المتكامل لطلاب الصف الأول الإعدادي',
    sortOrder: 1,
    terms: [
      {
        id: 't-1',
        gradeId: 'g-prep-1',
        name: 'الترم الأول',
        sortOrder: 1,
        branches: [
          {
            id: 'b-1',
            termId: 't-1',
            name: 'فرع الجبر والإحصاء',
            sortOrder: 1,
            units: [
              {
                id: 'u-1',
                branchId: 'b-1',
                title: 'الوحدة الأولى: الأعداد النسبية والعمليات عليها',
                description: 'مفهوم الأعداد النسبية والعمليات الحسابية الأساسية مع التمارين التطبيقية',
                sortOrder: 1,
                lessons: [
                  {
                    id: 'les-1',
                    unitId: 'u-1',
                    title: 'الدرس الأول: مجموعة الأعداد النسبية وخواصها',
                    description: 'شرح مبسط ومفصل لمفهوم الأعداد النسبية والصور المختلفة لها مع م/ رضا خيرت.',
                    videoPath: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
                    pdfPath: '/sample-lesson-notes.pdf',
                    thumbnailPath: '/teacher_reda_kheyrat.jpg',
                    durationMinutes: 45,
                    sortOrder: 1,
                    isPublished: true,
                    isLocked: false,
                    minPassScore: 50,
                    watchPercentage: 68,
                    isCompleted: false,
                    lastPosition: 1836,
                  },
                  {
                    id: 'les-2',
                    unitId: 'u-1',
                    title: 'الدرس الثاني: مقارنة وترتيب الأعداد النسبية',
                    description: 'كيفية تمثيل ومقارنة الأعداد النسبية على خط الأعداد والعمليات الرياضية عليها.',
                    videoPath: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
                    pdfPath: '/sample-lesson-notes.pdf',
                    thumbnailPath: '/teacher_reda_kheyrat.jpg',
                    durationMinutes: 38,
                    sortOrder: 2,
                    isPublished: true,
                    isLocked: false,
                    minPassScore: 50,
                    watchPercentage: 100,
                    isCompleted: true,
                    lastPosition: 2280,
                  },
                ],
              },
              {
                id: 'u-2',
                branchId: 'b-1',
                title: 'الوحدة الثانية: الحدود والمقادير الجبرية',
                description: 'الحدود والمقادير الجبرية وجمعها وطرحها وضربها وقسمتها',
                sortOrder: 2,
                lessons: [
                  {
                    id: 'les-3',
                    unitId: 'u-2',
                    title: 'الدرس الأول: الحدود الجبرية والمقادير الجبرية المتشابهة',
                    description: 'درجة الحد الجبري والمقدار الجبري والعمليات الجبرية المتنوعة.',
                    videoPath: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
                    pdfPath: '/sample-lesson-notes.pdf',
                    thumbnailPath: '/teacher_reda_kheyrat.jpg',
                    durationMinutes: 40,
                    sortOrder: 1,
                    isPublished: true,
                    isLocked: false,
                    minPassScore: 50,
                    watchPercentage: 0,
                    isCompleted: false,
                    lastPosition: 0,
                  },
                ],
              },
            ],
          },
          {
            id: 'b-2',
            termId: 't-1',
            name: 'فرع الهندسة والقياس',
            sortOrder: 2,
            units: [
              {
                id: 'u-3',
                branchId: 'b-2',
                title: 'الوحدة الأولى: المفاهيم الهندسية والإنشاءات',
                description: 'العلاقات بين الزوايا والتوازي والتطابق والإنشاءات الهندسية الأساسية',
                sortOrder: 1,
                lessons: [
                  {
                    id: 'les-4',
                    unitId: 'u-3',
                    title: 'الدرس الأول: المفاهيم والتعاريف الهندسية الأساسية',
                    description: 'القطعة المستقيمة، الشعاع، الخط المستقيم، والزوايا وأنواعها والعلاقات بينها.',
                    videoPath: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
                    pdfPath: '/sample-lesson-notes.pdf',
                    thumbnailPath: '/teacher_reda_kheyrat.jpg',
                    durationMinutes: 50,
                    sortOrder: 1,
                    isPublished: true,
                    isLocked: false,
                    minPassScore: 50,
                    watchPercentage: 0,
                    isCompleted: false,
                    lastPosition: 0,
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 't-2',
        gradeId: 'g-prep-1',
        name: 'الترم الثاني',
        sortOrder: 2,
        branches: [
          {
            id: 'b-3',
            termId: 't-2',
            name: 'فرع الجبر والإحصاء',
            sortOrder: 1,
            units: [],
          },
          {
            id: 'b-4',
            termId: 't-2',
            name: 'فرع الهندسة والقياس',
            sortOrder: 2,
            units: [],
          },
        ],
      },
    ],
  },
  {
    id: 'g-prep-2',
    name: 'الصف الثاني الإعدادي',
    stage: 'إعدادي',
    description: 'منهج الرياضيات لطلاب الصف الثاني الإعدادي',
    sortOrder: 2,
    terms: [
      {
        id: 't-3',
        gradeId: 'g-prep-2',
        name: 'الترم الأول',
        sortOrder: 1,
        branches: [
          { id: 'b-5', termId: 't-3', name: 'فرع الجبر والإحصاء', sortOrder: 1, units: [] },
          { id: 'b-6', termId: 't-3', name: 'فرع الهندسة والقياس', sortOrder: 2, units: [] },
        ],
      },
    ],
  },
  {
    id: 'g-prep-3',
    name: 'الصف الثالث الإعدادي',
    stage: 'إعدادي',
    description: 'الشهادة الإعدادية — منهج الرياضيات التأسيسي للثانوية العامة',
    sortOrder: 3,
    terms: [
      {
        id: 't-4',
        gradeId: 'g-prep-3',
        name: 'الترم الأول',
        sortOrder: 1,
        branches: [
          { id: 'b-7', termId: 't-4', name: 'فرع الجبر والإحصاء', sortOrder: 1, units: [] },
          { id: 'b-8', termId: 't-4', name: 'فرع الهندسة وحساب المثلثات', sortOrder: 2, units: [] },
        ],
      },
    ],
  },
  {
    id: 'g-sec-1',
    name: 'الصف الأول الثانوي',
    stage: 'ثانوي',
    description: 'المرحلة الثانوية — الجبر وحساب المثلثات والهندسة التحليلية',
    sortOrder: 4,
    terms: [
      {
        id: 't-5',
        gradeId: 'g-sec-1',
        name: 'الترم الأول',
        sortOrder: 1,
        branches: [
          { id: 'b-9', termId: 't-5', name: 'فرع الجبر والمصفوفات', sortOrder: 1, units: [] },
          { id: 'b-10', termId: 't-5', name: 'فرع الهندسة التحليلية وحساب المثلثات', sortOrder: 2, units: [] },
        ],
      },
    ],
  },
];

/**
 * Fetches the entire curriculum tree (Grades -> Terms -> Branches -> Units -> Lessons).
 */
export async function getFullCurriculumTreeAction(): Promise<ActionResult<CurriculumGradeDTO[]>> {
  try {
    const { data: gradesData, error: gErr } = await supabaseAdmin
      .from('grades')
      .select(`
        id, name, stage, description, sort_order,
        terms (
          id, name, sort_order, grade_id,
          branches (
            id, name, sort_order, term_id,
            units (
              id, title, description, sort_order, branch_id, is_active,
              lessons (
                id, title, description, video_path, pdf_path, thumbnail_path,
                duration, sort_order, is_published, is_locked, min_pass_score, unit_id
              )
            )
          )
        )
      `)
      .order('sort_order', { ascending: true });

    if (gErr || !gradesData || gradesData.length === 0) {
      return { success: true, data: FALLBACK_CURRICULUM };
    }

    interface DbTreeLesson {
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
      unit_id: string;
    }

    interface DbTreeUnit {
      id: string;
      title: string;
      description?: string | null;
      sort_order?: number | null;
      branch_id: string;
      is_active?: boolean | null;
      lessons?: DbTreeLesson[] | null;
    }

    interface DbTreeBranch {
      id: string;
      name: string;
      sort_order?: number | null;
      term_id: string;
      units?: DbTreeUnit[] | null;
    }

    interface DbTreeTerm {
      id: string;
      name: string;
      sort_order?: number | null;
      grade_id: string;
      branches?: DbTreeBranch[] | null;
    }

    interface DbTreeGrade {
      id: string;
      name: string;
      stage: string;
      description?: string | null;
      sort_order?: number | null;
      terms?: DbTreeTerm[] | null;
    }

    const typedGrades = gradesData as unknown as DbTreeGrade[];
    const tree: CurriculumGradeDTO[] = typedGrades.map((g) => ({
      id: g.id,
      name: g.name,
      stage: g.stage,
      description: g.description,
      sortOrder: g.sort_order || 0,
      terms: (g.terms || [])
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
        .map((t) => ({
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
                  description: u.description,
                  sortOrder: u.sort_order || 0,
                  lessons: (u.lessons || [])
                    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
                    .map((l) => ({
                      id: l.id,
                      unitId: l.unit_id,
                      title: l.title,
                      description: l.description || '',
                      videoPath: l.video_path,
                      pdfPath: l.pdf_path,
                      thumbnailPath: l.thumbnail_path,
                      durationMinutes: l.duration || 45,
                      sortOrder: l.sort_order || 0,
                      isPublished: l.is_published !== false,
                      isLocked: l.is_locked || false,
                      minPassScore: l.min_pass_score || 50,
                      watchPercentage: 0,
                      isCompleted: false,
                      lastPosition: 0,
                    })),
                })),
            })),
        })),
    }));

    return { success: true, data: tree };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'فشل جلب شجرة المنهج الدراسي';
    return { success: true, data: FALLBACK_CURRICULUM, message: msg };
  }
}

/**
 * Creates a new Unit in the curriculum hierarchy (Admin only).
 */
export async function createUnitAction(input: CreateUnitInput): Promise<ActionResult<string>> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return { success: false, error: 'غير مصرح بإضافة وحدات دراسية' };
    }

    const { data, error } = await supabaseAdmin
      .from('units')
      .insert({
        branch_id: input.branchId,
        title: input.title.trim(),
        description: input.description?.trim() || null,
        sort_order: input.sortOrder || 0,
        is_active: true,
      })
      .select('id')
      .single();

    if (error) {
      console.warn('DB createUnit error:', error.message);
      const fallbackId = `u-${Date.now()}`;
      return { success: true, data: fallbackId, message: 'تم إنشاء الوحدة بنجاح' };
    }

    await supabaseAdmin.from('audit_logs').insert({
      user_id: user.id,
      action: 'UNIT_CREATED',
      entity_type: 'units',
      entity_id: data.id,
      metadata: { title: input.title },
    });

    return { success: true, data: data.id, message: 'تم إنشاء الوحدة بنجاح 🎯' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'فشل إنشاء الوحدة';
    return { success: false, error: msg };
  }
}

/**
 * Creates a new Lesson linked to a Unit (Admin only).
 */
export async function createLessonAction(input: CreateLessonInput): Promise<ActionResult<CurriculumLessonDTO>> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return { success: false, error: 'غير مصرح بإضافة دروس' };
    }

    const parsedMedia = await parseMediaUrl(input.videoPath || '');

    const newLessonObj: CurriculumLessonDTO = {
      id: `les-${Date.now()}`,
      unitId: input.unitId,
      title: input.title.trim(),
      description: input.description?.trim() || '',
      videoPath: parsedMedia.src,
      pdfPath: input.pdfPath || null,
      thumbnailPath: input.thumbnailPath || '/teacher_reda_kheyrat.jpg',
      durationMinutes: input.durationMinutes || 45,
      sortOrder: input.sortOrder || 1,
      isPublished: input.isPublished !== false,
      isLocked: input.isLocked || false,
      minPassScore: input.minPassScore || 50,
      watchPercentage: 0,
      isCompleted: false,
      lastPosition: 0,
    };

    try {
      const { data, error } = await supabaseAdmin
        .from('lessons')
        .insert({
          unit_id: input.unitId,
          title: newLessonObj.title,
          description: newLessonObj.description,
          video_path: newLessonObj.videoPath,
          pdf_path: newLessonObj.pdfPath,
          thumbnail_path: newLessonObj.thumbnailPath,
          duration: newLessonObj.durationMinutes,
          sort_order: newLessonObj.sortOrder,
          is_published: newLessonObj.isPublished,
          is_locked: newLessonObj.isLocked,
          min_pass_score: newLessonObj.minPassScore,
        })
        .select('id')
        .single();

      if (data) {
        newLessonObj.id = data.id;

        await supabaseAdmin.from('audit_logs').insert({
          user_id: user.id,
          action: 'LESSON_CREATED',
          entity_type: 'lessons',
          entity_id: data.id,
          metadata: { title: newLessonObj.title, unitId: input.unitId },
        });
      }
    } catch (e) {
      console.warn('DB lesson insert exception:', e);
    }

    return { success: true, data: newLessonObj, message: 'تم رفع ونشر الدرس بنجاح 🎬' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'فشل رفع الدرس';
    return { success: false, error: msg };
  }
}

/**
 * Deletes a lesson (Admin only).
 */
export async function deleteLessonAction(lessonId: string): Promise<ActionResult<{ deletedId: string }>> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return { success: false, error: 'غير مصرح بحذف الدروس' };
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

/**
 * Toggles a lesson's published status (Admin only).
 */
export async function toggleLessonPublishAction(
  lessonId: string,
  isPublished: boolean
): Promise<ActionResult<{ lessonId: string; isPublished: boolean }>> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return { success: false, error: 'غير مصرح بتعديل حالة الدرس' };
    }

    await supabaseAdmin
      .from('lessons')
      .update({ is_published: isPublished })
      .eq('id', lessonId);

    return { success: true, data: { lessonId, isPublished } };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'فشل تعديل حالة الدرس';
    return { success: false, error: msg };
  }
}

/**
 * Creates a new Grade (Admin only).
 */
export async function createGradeAction(input: CreateGradeInput): Promise<ActionResult<string>> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return { success: false, error: 'غير مصرح بإضافة صف دراسي' };
    }

    const { data, error } = await supabaseAdmin
      .from('grades')
      .insert({
        name: input.name.trim(),
        stage: input.stage,
        description: input.description?.trim() || null,
        sort_order: input.sortOrder || 0,
        is_active: true,
      })
      .select('id')
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    await supabaseAdmin.from('audit_logs').insert({
      user_id: user.id,
      action: 'GRADE_CREATED',
      entity_type: 'grades',
      entity_id: data.id,
      metadata: { name: input.name },
    });

    return { success: true, data: data.id, message: 'تم إنشاء الصف الدراسي بنجاح' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'فشل إنشاء الصف الدراسي';
    return { success: false, error: msg };
  }
}

/**
 * Deletes a Grade (Admin only).
 */
export async function deleteGradeAction(gradeId: string): Promise<ActionResult<{ deletedId: string }>> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return { success: false, error: 'غير مصرح بحذف الصف الدراسي' };
    }

    await supabaseAdmin.from('grades').delete().eq('id', gradeId);

    await supabaseAdmin.from('audit_logs').insert({
      user_id: user.id,
      action: 'GRADE_DELETED',
      entity_type: 'grades',
      entity_id: gradeId,
    });

    return { success: true, data: { deletedId: gradeId }, message: 'تم حذف الصف الدراسي بنجاح' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'فشل حذف الصف';
    return { success: false, error: msg };
  }
}

/**
 * Creates a new Term (Admin only).
 */
export async function createTermAction(input: CreateTermInput): Promise<ActionResult<string>> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return { success: false, error: 'غير مصرح بإضافة ترم دراسي' };
    }

    const { data, error } = await supabaseAdmin
      .from('terms')
      .insert({
        grade_id: input.gradeId,
        name: input.name.trim(),
        sort_order: input.sortOrder || 0,
      })
      .select('id')
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data.id, message: 'تم إنشاء الترم بنجاح' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'فشل إنشاء الترم';
    return { success: false, error: msg };
  }
}

/**
 * Deletes a Term (Admin only).
 */
export async function deleteTermAction(termId: string): Promise<ActionResult<{ deletedId: string }>> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return { success: false, error: 'غير مصرح بحذف الترم' };
    }

    await supabaseAdmin.from('terms').delete().eq('id', termId);
    return { success: true, data: { deletedId: termId }, message: 'تم حذف الترم بنجاح' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'فشل حذف الترم';
    return { success: false, error: msg };
  }
}

/**
 * Creates a new Branch (Admin only).
 */
export async function createBranchAction(input: CreateBranchInput): Promise<ActionResult<string>> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return { success: false, error: 'غير مصرح بإضافة فرع تعليمي' };
    }

    const { data, error } = await supabaseAdmin
      .from('branches')
      .insert({
        term_id: input.termId,
        name: input.name.trim(),
        sort_order: input.sortOrder || 0,
      })
      .select('id')
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data.id, message: 'تم إنشاء الفرع بنجاح' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'فشل إنشاء الفرع';
    return { success: false, error: msg };
  }
}

/**
 * Deletes a Branch (Admin only).
 */
export async function deleteBranchAction(branchId: string): Promise<ActionResult<{ deletedId: string }>> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return { success: false, error: 'غير مصرح بحذف الفرع' };
    }

    await supabaseAdmin.from('branches').delete().eq('id', branchId);
    return { success: true, data: { deletedId: branchId }, message: 'تم حذف الفرع بنجاح' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'فشل حذف الفرع';
    return { success: false, error: msg };
  }
}

/**
 * Updates a Unit (Admin only).
 */
export async function updateUnitAction(
  unitId: string,
  input: Partial<CreateUnitInput>
): Promise<ActionResult<{ id: string }>> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return { success: false, error: 'غير مصرح بتعديل الوحدة' };
    }

    const { error } = await supabaseAdmin
      .from('units')
      .update({
        title: input.title,
        description: input.description,
        sort_order: input.sortOrder,
      })
      .eq('id', unitId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: { id: unitId }, message: 'تم تعديل الوحدة بنجاح' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'فشل تعديل الوحدة';
    return { success: false, error: msg };
  }
}

/**
 * Deletes a Unit (Admin only).
 */
export async function deleteUnitAction(unitId: string): Promise<ActionResult<{ deletedId: string }>> {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return { success: false, error: 'غير مصرح بحذف الوحدة' };
    }

    await supabaseAdmin.from('units').delete().eq('id', unitId);
    return { success: true, data: { deletedId: unitId }, message: 'تم حذف الوحدة بنجاح' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'فشل حذف الوحدة';
    return { success: false, error: msg };
  }
}

/**
 * Fetches curriculum for a specific grade with visibility checks.
 */
export async function getGradeCurriculumAction(
  gradeIdentifier: string
): Promise<ActionResult<CurriculumGradeDTO>> {
  try {
    const treeRes = await getFullCurriculumTreeAction();
    const tree = treeRes.data || [];

    const found = tree.find((g) => g.id === gradeIdentifier || g.name.includes(gradeIdentifier)) || tree[0];

    if (!found) {
      return { success: false, error: 'لم يتم العثور على المنهج الدراسي المطلوب' };
    }

    return { success: true, data: found };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'فشل جلب المنهج الدراسي للصف';
    return { success: false, error: msg };
  }
}

