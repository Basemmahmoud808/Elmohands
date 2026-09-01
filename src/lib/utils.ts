import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number) {
  return new Intl.NumberFormat('ar-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(amount);
}

export interface ParsedMediaResult {
  type: 'video' | 'iframe';
  src: string;
  isEmbed: boolean;
  provider?: 'youtube' | 'bunny' | 'vimeo' | 'gdrive' | 'cloudflare' | 'loom' | 'direct';
}

/**
 * Universal media URL parser that converts external video links (YouTube, BunnyCDN, Vimeo, Google Drive, Cloudflare, etc.)
 * into secure, embeddable iframe URLs or direct HTML5 video sources.
 * Supports startSeconds for automatically resuming playback where the student left off.
 */
export function parseMediaUrlHelper(rawUrl: string, startSeconds?: number): ParsedMediaResult {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { type: 'video', src: '', isEmbed: false, provider: 'direct' };
  }

  const url = rawUrl.trim();
  const startTime = startSeconds && startSeconds > 0 ? Math.floor(startSeconds) : 0;

  // 1. YouTube (Supports watch?v=, youtu.be/, /embed/, /shorts/, m.youtube.com, etc.)
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    let videoId = '';
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0]?.split('&')[0] || '';
    } else if (url.includes('/embed/')) {
      videoId = url.split('/embed/')[1]?.split('?')[0]?.split('&')[0] || '';
    } else if (url.includes('/shorts/')) {
      videoId = url.split('/shorts/')[1]?.split('?')[0]?.split('&')[0] || '';
    } else if (url.includes('v=')) {
      videoId = url.split('v=')[1]?.split('&')[0]?.split('?')[0] || '';
    }

    if (videoId) {
      const startParam = startTime > 0 ? `&start=${startTime}` : '';
      return {
        type: 'iframe',
        src: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1${startParam}`,
        isEmbed: true,
        provider: 'youtube',
      };
    }
  }

  // 2. Bunny Stream / BunnyCDN (mediadelivery.net / video.bunnycdn.com)
  if (url.includes('mediadelivery.net') || url.includes('bunnycdn.com') || url.includes('b-cdn.net')) {
    if (url.includes('/embed/') || url.includes('/play/')) {
      const normalizedUrl = url.replace('/play/', '/embed/');
      const startParam = startTime > 0 ? `&t=${startTime}` : '';
      return {
        type: 'iframe',
        src: normalizedUrl.includes('?') ? `${normalizedUrl}&autoplay=true${startParam}` : `${normalizedUrl}?autoplay=true${startParam}`,
        isEmbed: true,
        provider: 'bunny',
      };
    }
    // Direct MP4 or HLS stream
    if (url.endsWith('.mp4') || url.endsWith('.m3u8') || url.includes('/play_')) {
      return { type: 'video', src: url, isEmbed: false, provider: 'bunny' };
    }
    return { type: 'iframe', src: url, isEmbed: true, provider: 'bunny' };
  }

  // 3. Vimeo
  if (url.includes('vimeo.com')) {
    const vimeoIdMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    const vimeoId = vimeoIdMatch ? vimeoIdMatch[1] : url.split('vimeo.com/')[1]?.split('?')[0];
    if (vimeoId) {
      const startHash = startTime > 0 ? `#t=${startTime}s` : '';
      return {
        type: 'iframe',
        src: `https://player.vimeo.com/video/${vimeoId}?autoplay=1&dnt=1${startHash}`,
        isEmbed: true,
        provider: 'vimeo',
      };
    }
  }

  // 4. Google Drive
  if (url.includes('drive.google.com')) {
    let fileId = '';
    const fileIdMatch = url.match(/\/file\/d\/([^\/]+)/);
    if (fileIdMatch && fileIdMatch[1]) {
      fileId = fileIdMatch[1];
    } else if (url.includes('id=')) {
      fileId = url.split('id=')[1]?.split('&')[0] || '';
    }
    if (fileId) {
      return {
        type: 'iframe',
        src: `https://drive.google.com/file/d/${fileId}/preview`,
        isEmbed: true,
        provider: 'gdrive',
      };
    }
  }

  // 5. Cloudflare Stream
  if (url.includes('cloudflarestream.com') || url.includes('videodelivery.net')) {
    if (url.includes('/iframe') || url.includes('videodelivery.net')) {
      return { type: 'iframe', src: url, isEmbed: true, provider: 'cloudflare' };
    }
    const cfMatch = url.match(/(?:cloudflarestream\.com|videodelivery\.net)\/([a-zA-Z0-9]+)/);
    if (cfMatch && cfMatch[1]) {
      return {
        type: 'iframe',
        src: `https://iframe.videodelivery.net/${cfMatch[1]}`,
        isEmbed: true,
        provider: 'cloudflare',
      };
    }
  }

  // 6. Loom
  if (url.includes('loom.com/share/')) {
    const loomId = url.split('loom.com/share/')[1]?.split('?')[0];
    if (loomId) {
      return {
        type: 'iframe',
        src: `https://www.loom.com/embed/${loomId}`,
        isEmbed: true,
        provider: 'loom',
      };
    }
  }

  // Default: Direct video URL (MP4, WebM, Supabase Storage, etc.)
  return {
    type: 'video',
    src: url,
    isEmbed: false,
    provider: 'direct',
  };
}
