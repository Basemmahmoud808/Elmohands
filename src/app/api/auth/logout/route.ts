import { NextResponse } from 'next/server';
import { clearAuthCookies, getCurrentUser, revokeUserSessions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (user) {
      await revokeUserSessions(user.userId);
    }
    await clearAuthCookies();
    return NextResponse.json({ success: true, message: 'تم تسجيل الخروج بنجاح' });
  } catch (error) {
    console.error('Logout error:', error);
    await clearAuthCookies();
    return NextResponse.json({ success: true });
  }
}
