import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getCurrentUser } from '@/lib/actions/auth';

/**
 * Protected API Route: Generates a short-lived signed URL for private Supabase Storage files.
 * Only authenticated users can access this endpoint.
 * The signed URL expires after 60 minutes (3600 seconds).
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'يجب تسجيل الدخول للوصول إلى المحتوى' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { filePath, bucket = 'course-materials' } = body;

    if (!filePath || typeof filePath !== 'string') {
      return NextResponse.json(
        { error: 'مسار الملف مطلوب' },
        { status: 400 }
      );
    }

    // Extract the storage path from full URL if needed
    let storagePath = filePath;
    
    // If it's a full Supabase URL, extract just the path portion
    const publicPathMatch = filePath.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)$/);
    const signedPathMatch = filePath.match(/\/storage\/v1\/object\/sign\/[^/]+\/(.+?)(\?|$)/);
    
    if (publicPathMatch) {
      storagePath = decodeURIComponent(publicPathMatch[1]);
    } else if (signedPathMatch) {
      storagePath = decodeURIComponent(signedPathMatch[1]);
    }

    // Generate a signed URL that expires in 60 minutes
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUrl(storagePath, 3600); // 3600 seconds = 60 minutes

    if (error || !data?.signedUrl) {
      console.error('Signed URL generation error:', error);
      return NextResponse.json(
        { error: 'فشل في توليد رابط الوصول المؤقت' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      signedUrl: data.signedUrl,
      expiresIn: 3600,
    });
  } catch (err) {
    console.error('Signed URL API error:', err);
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}
