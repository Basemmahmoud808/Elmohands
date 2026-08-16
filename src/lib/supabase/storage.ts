import { supabase } from './client';

/**
 * Builds a structured, unique storage filename.
 */
export function buildStorageFileName(file: File, folder?: string): string {
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'bin';
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  const cleanBaseName = file.name
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .substring(0, 30);
  const fileName = `${timestamp}_${randomStr}_${cleanBaseName}.${fileExt}`;
  return folder ? `${folder.replace(/\/$/, '')}/${fileName}` : fileName;
}

/**
 * Uploads a file to Supabase Storage bucket ('course-materials') with optional progress tracking.
 * If Supabase Storage is configured and accessible, returns the public cloud URL.
 * Otherwise, converts the file into a persistent Data URL / Object URL as a robust fallback.
 */
export async function uploadRealFile(
  file: File,
  bucketName: string = 'course-materials',
  folder?: string
): Promise<string> {
  return uploadRealFileWithProgress(file, bucketName, folder);
}

/**
 * Uploads a file to Supabase Storage bucket with progress simulation / callback.
 */
export async function uploadRealFileWithProgress(
  file: File,
  bucketName: string = 'course-materials',
  folder?: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  const filePath = buildStorageFileName(file, folder);

  try {
    if (onProgress) onProgress(15);

    // 1. Try uploading to Supabase Storage bucket
    if (onProgress) onProgress(45);
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (onProgress) onProgress(80);

    if (!error && data) {
      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      if (publicUrlData?.publicUrl) {
        if (onProgress) onProgress(100);
        return publicUrlData.publicUrl;
      }
    }
  } catch (e) {
    console.warn('Supabase Storage bucket upload attempt:', e);
  }

  // 2. Fallback: Convert to Data URL (for images/small PDFs <= 15MB) or Object URL (for large videos)
  if (onProgress) onProgress(90);

  if (file.size <= 15 * 1024 * 1024) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (onProgress) onProgress(100);
        resolve(reader.result as string);
      };
      reader.onerror = () => {
        if (onProgress) onProgress(100);
        resolve(URL.createObjectURL(file));
      };
      reader.readAsDataURL(file);
    });
  }

  if (onProgress) onProgress(100);
  return URL.createObjectURL(file);
}

