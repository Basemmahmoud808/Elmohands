import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

/**
 * Health Check & Keep-Alive Endpoint.
 * Performs a lightweight query to ensure database connections stay active
 * and prevents free-tier database sleep/pausing during idle hours.
 */
export async function GET() {
  const startTime = Date.now();
  try {
    const { count, error } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (error) {
      return NextResponse.json(
        {
          status: 'warning',
          db: 'error',
          error: error.message,
          durationMs: Date.now() - startTime,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: 'healthy',
      db: 'connected',
      activeProfilesCount: count,
      durationMs: Date.now() - startTime,
      platform: 'منصة المهندس — م/ رضا خيرت',
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown health check failure';
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: msg,
        durationMs: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
