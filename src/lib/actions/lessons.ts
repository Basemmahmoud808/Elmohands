'use server';

import { supabase } from '@/lib/supabase/client';

export interface LessonItem {
  id: string;
  unitId: string;
  title: string;
  description: string;
  videoPath?: string;
  pdfPath?: string;
  thumbnailPath?: string;
  durationMinutes: number;
  gradeName: string;
  branchName: string;
  createdAt: string;
}

// In-memory demo store for uploaded lessons
const LESSON_STORE: LessonItem[] = [
  {
    id: 'les-1',
    unitId: 'u-1',
    title: 'الدرس الأول: مجموعات الأعداد والعمليات الأساسية',
    description: 'شرح مبسط ومفصل لمفهوم الأعداد النسبية وتطبيقاتها في الحياة العملية.',
    videoPath: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    pdfPath: '/sample-lesson-notes.pdf',
    thumbnailPath: '/teacher_reda_kheyrat.jpg',
    durationMinutes: 45,
    gradeName: 'الصف الأول الإعدادي',
    branchName: 'جبر وإحصاء',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'les-2',
    unitId: 'u-1',
    title: 'الدرس الثاني: التحليل بتقسيم الأعداد وإكمال المربع',
    description: 'تمارين ومسائل مبرهنة على التحليل وإكمال المربع وطرق الحل المتعددة.',
    videoPath: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    pdfPath: '/sample-lesson-notes.pdf',
    thumbnailPath: '/teacher_reda_kheyrat.jpg',
    durationMinutes: 38,
    gradeName: 'الصف الأول الإعدادي',
    branchName: 'جبر وإحصاء',
    createdAt: new Date().toISOString(),
  },
];

export async function createLessonAction(formData: FormData): Promise<{ success: boolean; lesson?: LessonItem; message?: string }> {
  try {
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const gradeName = (formData.get('gradeName') as string) || 'الصف الأول الإعدادي';
    const branchName = (formData.get('branchName') as string) || 'جبر وإحصاء';
    const videoUrl = (formData.get('videoUrl') as string) || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
    const pdfUrl = (formData.get('pdfUrl') as string) || '/sample-notes.pdf';

    const newLesson: LessonItem = {
      id: `les-${Date.now()}`,
      unitId: 'u-1',
      title: title.trim(),
      description: description ? description.trim() : 'شرح مفصل وتمارين محلولة باحترافية مع م/ رضا خيرت',
      videoPath: videoUrl,
      pdfPath: pdfUrl,
      thumbnailPath: '/teacher_reda_kheyrat.jpg',
      durationMinutes: Math.floor(Math.random() * 20) + 25,
      gradeName,
      branchName,
      createdAt: new Date().toISOString(),
    };

    LESSON_STORE.unshift(newLesson);

    return { success: true, lesson: newLesson };
  } catch (error: any) {
    return { success: false, message: error.message || 'فشل رفع الدرس' };
  }
}

export async function getLessonsList(): Promise<LessonItem[]> {
  return LESSON_STORE;
}

export async function getLessonById(id: string): Promise<LessonItem | null> {
  return LESSON_STORE.find((l) => l.id === id) || LESSON_STORE[0];
}
