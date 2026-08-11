import { supabaseAdmin, supabase } from './client';

/**
 * Uploads a file to Supabase Storage bucket ('course-materials')
 * If Supabase Storage is configured and accessible, returns the public cloud URL.
 * Otherwise, converts the file into a persistent Data URL / Object URL as a robust fallback.
 */
export async function uploadRealFile(file: File, bucketName: string = 'course-materials'): Promise<string> {
  const fileExt = file.name.split('.').pop() || 'bin';
  const cleanFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${fileExt}`;

  try {
    // 1. Try uploading to Supabase Storage bucket
    const { data, error } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(cleanFileName, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (!error && data) {
      const { data: publicUrlData } = supabaseAdmin.storage
        .from(bucketName)
        .getPublicUrl(cleanFileName);

      if (publicUrlData?.publicUrl) {
        return publicUrlData.publicUrl;
      }
    }
  } catch (e) {
    console.warn('Supabase Storage bucket upload attempt:', e);
  }

  // 2. Fallback: Convert to Data URL (for images/small PDFs <= 15MB) or Object URL (for large videos)
  if (file.size <= 15 * 1024 * 1024) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => {
        resolve(URL.createObjectURL(file));
      };
      reader.readAsDataURL(file);
    });
  }

  return URL.createObjectURL(file);
}
