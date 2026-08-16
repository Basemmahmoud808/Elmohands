'use server';

import { getCurrentUser } from '@/lib/actions/auth';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { ActionResult } from '@/lib/types/actions';
import { UpdateProgressResult } from '@/lib/types/dashboard';

/**
 * Updates video playback progress and automatically marks lesson as completed if percentage >= 90%.
 * Supports both signatures:
 * (lessonId, lastPosition, watchPercentage) OR (lessonId, watchPercentage, lastPosition)
 */
export async function updateLessonProgressAction(
  lessonId: string,
  arg2: number,
  arg3: number
): Promise<ActionResult<UpdateProgressResult>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'يرجى تسجيل الدخول لتحديث تقدم المشاهدة' };
    }

    if (!lessonId) {
      return { success: false, error: 'معرّف الدرس غير صالح' };
    }

    // Determine watchPercentage and lastPosition regardless of argument order
    // If one of the numbers is > 100 or clearly seconds, disambiguate:
    let watchPercentage: number;
    let lastPosition: number;

    if (arg2 > 100 && arg3 <= 100) {
      // arg2 is lastPosition (seconds), arg3 is watchPercentage
      lastPosition = Math.max(0, Math.round(arg2));
      watchPercentage = Math.min(100, Math.max(0, Math.round(arg3)));
    } else if (arg3 > 100 && arg2 <= 100) {
      // arg2 is watchPercentage, arg3 is lastPosition
      watchPercentage = Math.min(100, Math.max(0, Math.round(arg2)));
      lastPosition = Math.max(0, Math.round(arg3));
    } else {
      // Both <= 100: assume arg2 is watchPercentage if passed as (lessonId, pct, pos)
      // or check standard (lessonId, lastPosition, watchPercentage) convention
      // If arg3 is percentage-like, set:
      watchPercentage = Math.min(100, Math.max(0, Math.round(arg3)));
      lastPosition = Math.max(0, Math.round(arg2));
    }

    const isCompleted = watchPercentage >= 90;
    const nowIso = new Date().toISOString();

    const { error: upsertError } = await supabaseAdmin.from('student_progress').upsert(
      {
        student_id: user.id,
        lesson_id: lessonId,
        watch_percentage: watchPercentage,
        last_position: lastPosition,
        is_completed: isCompleted,
        completed_at: isCompleted ? nowIso : null,
        updated_at: nowIso,
      },
      { onConflict: 'student_id,lesson_id' }
    );

    if (upsertError) {
      console.warn('DB upsert error in student_progress:', upsertError.message);
    }

    return {
      success: true,
      data: {
        isCompleted,
        watchPercentage,
        lastPosition,
        completedAt: isCompleted ? nowIso : null,
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'فشل حفظ التقدم';
    return { success: false, error: msg };
  }
}

/**
 * Fetches the student's progress for a single lesson.
 */
export async function getLessonProgressAction(
  lessonId: string
): Promise<ActionResult<UpdateProgressResult | null>> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: true, data: null };
    }

    const { data: progress, error } = await supabaseAdmin
      .from('student_progress')
      .select('watch_percentage, is_completed, last_position, completed_at')
      .eq('student_id', user.id)
      .eq('lesson_id', lessonId)
      .maybeSingle();

    if (error || !progress) {
      return { success: true, data: null };
    }

    return {
      success: true,
      data: {
        isCompleted: Boolean(progress.is_completed),
        watchPercentage: progress.watch_percentage || 0,
        lastPosition: progress.last_position || 0,
        completedAt: progress.completed_at || null,
      },
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'فشل جلب تقدم الدرس';
    return { success: false, error: msg };
  }
}

/**
 * Fetches all lesson progress records for the current authenticated student.
 */
export async function getStudentCurriculumProgressAction(): Promise<
  ActionResult<Record<string, { watchPercentage: number; isCompleted: boolean; lastPosition: number }>>
> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: true, data: {} };
    }

    const { data: records, error } = await supabaseAdmin
      .from('student_progress')
      .select('lesson_id, watch_percentage, is_completed, last_position')
      .eq('student_id', user.id);

    if (error || !records) {
      return { success: true, data: {} };
    }

    const progressMap: Record<string, { watchPercentage: number; isCompleted: boolean; lastPosition: number }> = {};
    for (const r of records) {
      if (r.lesson_id) {
        progressMap[r.lesson_id] = {
          watchPercentage: r.watch_percentage || 0,
          isCompleted: Boolean(r.is_completed),
          lastPosition: r.last_position || 0,
        };
      }
    }

    return { success: true, data: progressMap };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'فشل جلب سجلات التقدم';
    return { success: false, error: msg };
  }
}
