'use server';

import { ActionResult } from '@/lib/types/actions';

/**
 * Server action to automatically detect video duration from YouTube, Vimeo, or direct URLs.
 */
export async function detectVideoDurationAction(
  rawUrl: string
): Promise<ActionResult<{ durationMinutes: number; durationSeconds: number; title?: string }>> {
  try {
    if (!rawUrl || typeof rawUrl !== 'string') {
      return { success: false, error: 'الرابط غير صالح' };
    }

    const url = rawUrl.trim();

    // 1. YouTube Video
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = '';
      if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0]?.split('&')[0]?.split('#')[0] || '';
      } else if (url.includes('/embed/')) {
        videoId = url.split('/embed/')[1]?.split('?')[0]?.split('&')[0]?.split('#')[0] || '';
      } else if (url.includes('/shorts/')) {
        videoId = url.split('/shorts/')[1]?.split('?')[0]?.split('&')[0]?.split('#')[0] || '';
      } else if (url.includes('v=')) {
        videoId = url.split('v=')[1]?.split('&')[0]?.split('?')[0]?.split('#')[0] || '';
      } else {
        const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
        if (match) videoId = match[1];
      }

      if (!videoId) {
        return { success: false, error: 'تعذر استخراج معرّف فيديو يوتيوب' };
      }

      // Fetch YouTube watch page
      const ytResponse = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'ar,en;q=0.9',
        },
        next: { revalidate: 3600 },
      });

      if (ytResponse.ok) {
        const html = await ytResponse.text();

        // Check lengthSeconds or approxDurationMs or duration in microformat
        const lengthMatch = html.match(/"lengthSeconds":"(\d+)"/);
        const approxMatch = html.match(/"approxDurationMs":"(\d+)"/);
        const isoMatch = html.match(/itemprop="duration" content="PT(\d+H)?(\d+M)?(\d+S)?"/);

        let seconds = 0;
        if (lengthMatch && lengthMatch[1]) {
          seconds = parseInt(lengthMatch[1], 10);
        } else if (approxMatch && approxMatch[1]) {
          seconds = Math.round(parseInt(approxMatch[1], 10) / 1000);
        } else if (isoMatch) {
          const hours = parseInt(isoMatch[1]?.replace('H', '') || '0', 10);
          const mins = parseInt(isoMatch[2]?.replace('M', '') || '0', 10);
          const secs = parseInt(isoMatch[3]?.replace('S', '') || '0', 10);
          seconds = hours * 3600 + mins * 60 + secs;
        }

        if (seconds > 0) {
          const minutes = Math.max(1, Math.round(seconds / 60));
          return {
            success: true,
            data: {
              durationMinutes: minutes,
              durationSeconds: seconds,
            },
          };
        }
      }
    }

    // 2. Vimeo Video
    if (url.includes('vimeo.com')) {
      const vimeoResponse = await fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`, {
        next: { revalidate: 3600 },
      });
      if (vimeoResponse.ok) {
        const data = await vimeoResponse.json();
        if (data && typeof data.duration === 'number' && data.duration > 0) {
          const seconds = data.duration;
          const minutes = Math.max(1, Math.round(seconds / 60));
          return {
            success: true,
            data: {
              durationMinutes: minutes,
              durationSeconds: seconds,
              title: data.title,
            },
          };
        }
      }
    }

    return {
      success: false,
      error: 'تعذر التعرف التلقائي على مدة الفيديو. يرجى إدخالها يدوياً.',
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'فشل فحص مدة الفيديو';
    return { success: false, error: msg };
  }
}
