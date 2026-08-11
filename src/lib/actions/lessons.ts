'use server';

import { supabase } from '@/lib/supabase/client';

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
  createdAt: string;
}

export async function parseMediaUrl(url: string): Promise<{ type: 'video' | 'iframe'; src: string }> {
  if (!url) return { type: 'video', src: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' };

  // BunnyStream / Encrypted DRM Stream
  if (url.includes('b-cdn.net') || url.includes('bunnycdn.com') || url.includes('iframe.mediadelivery.net')) {
    return { type: 'iframe', src: url };
  }

  // Wistia Protected Player
  if (url.includes('wistia.com') || url.includes('wistia.net')) {
    return { type: 'iframe', src: url };
  }

  // Vimeo Protected Player
  if (url.includes('vimeo.com')) {
    const vimeoId = url.split('vimeo.com/')[1]?.split('?')[0];
    if (vimeoId) {
      return { type: 'iframe', src: `https://player.vimeo.com/video/${vimeoId}?autoplay=1` };
    }
  }

  if (url.includes('drive.google.com')) {
    const fileIdMatch = url.match(/\/file\/d\/([^\/]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      return { type: 'iframe', src: `https://drive.google.com/file/d/${fileIdMatch[1]}/preview` };
    }
  }

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

// Structured lesson store grouped by grade, course, branch, and unit
const LESSON_STORE: LessonItem[] = [];

export async function createLessonAction(formData: FormData): Promise<{ success: boolean; lesson?: LessonItem; message?: string }> {
  try {
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const gradeName = (formData.get('gradeName') as string) || 'الصف الأول الإعدادي';
    const branchName = (formData.get('branchName') as string) || 'فرع الجبر والإحصاء';
    const unitTitle = (formData.get('unitTitle') as string) || 'الوحدة الأولى: المفاهيم الأساسية';
    const courseName = (formData.get('courseName') as string) || 'كورس الرياضيات الشامل';
    const sequenceOrder = Number(formData.get('sequenceOrder')) || (LESSON_STORE.length + 1);
    const durationMinutes = Number(formData.get('durationMinutes')) || 60;
    const thumbnailPath = (formData.get('thumbnailPath') as string) || '/teacher_reda_kheyrat.jpg';
    const rawVideoUrl = (formData.get('videoUrl') as string) || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4';
    const pdfUrl = (formData.get('pdfUrl') as string) || '/sample-notes.pdf';

    const parsedMedia = await parseMediaUrl(rawVideoUrl);

    const newLesson: LessonItem = {
      id: `les-${Date.now()}`,
      unitId: `u-${Date.now()}`,
      unitTitle,
      courseName,
      sequenceOrder,
      title: title.trim(),
      description: description ? description.trim() : 'شرح مفصل وتمارين محلولة باحترافية مع م/ رضا خيرت',
      videoPath: parsedMedia.src,
      pdfPath: pdfUrl,
      thumbnailPath,
      durationMinutes,
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
