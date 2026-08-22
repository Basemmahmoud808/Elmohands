import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

/**
 * Paymob Webhook Handler with strict HMAC SHA512 signature verification.
 */
export async function POST(req: NextRequest) {
  try {
    const hmacSecret = process.env.PAYMOB_HMAC_SECRET;
    if (!hmacSecret) {
      console.error('PAYMOB_HMAC_SECRET is not configured in environment variables.');
      return NextResponse.json(
        { error: 'Webhook signature verification key is not configured.' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const url = new URL(req.url);
    const receivedHmac = url.searchParams.get('hmac') || req.headers.get('x-paymob-hmac');

    if (!receivedHmac) {
      return NextResponse.json(
        { error: 'Missing HMAC signature.' },
        { status: 401 }
      );
    }

    // Paymob transaction object extraction
    const obj = body.obj || body;

    // Concatenate specified Paymob fields in exact standard order
    const concatenatedValues = [
      obj.amount_cents ?? '',
      obj.created_at ?? '',
      obj.currency ?? '',
      obj.error_occured ?? '',
      obj.has_parent_transaction ?? '',
      obj.id ?? '',
      obj.integration_id ?? '',
      obj.is_3d_secure ?? '',
      obj.is_auth ?? '',
      obj.is_capture ?? '',
      obj.is_refunded ?? '',
      obj.is_standalone_payment ?? '',
      obj.is_voided ?? '',
      obj.order?.id ?? '',
      obj.owner ?? '',
      obj.pending ?? '',
      obj.source_data?.pan ?? '',
      obj.source_data?.sub_type ?? '',
      obj.source_data?.type ?? '',
      obj.success ?? '',
    ].join('');

    // Compute expected HMAC SHA512
    const calculatedHmac = crypto
      .createHmac('sha512', hmacSecret)
      .update(concatenatedValues)
      .digest('hex');

    const isValidSignature = crypto.timingSafeEqual(
      Buffer.from(calculatedHmac, 'hex'),
      Buffer.from(receivedHmac, 'hex')
    );

    if (!isValidSignature) {
      console.warn('Paymob Webhook: Invalid HMAC signature rejected.');
      return NextResponse.json(
        { error: 'Invalid HMAC signature.' },
        { status: 403 }
      );
    }

    // Only activate subscription if payment was successful and not pending
    if (obj.success === true && obj.pending === false) {
      const studentId = obj.order?.merchant_order_id || obj.extra_data?.student_id;
      const planId = obj.extra_data?.plan_id;
      const durationDays = Number(obj.extra_data?.duration_days) || 30;

      if (studentId) {
        // Calculate new expiry
        let newExpiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000);
        const { data: existingSub } = await supabaseAdmin
          .from('subscriptions')
          .select('id, expires_at')
          .eq('student_id', studentId)
          .eq('status', 'ACTIVE')
          .order('expires_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (existingSub && new Date(existingSub.expires_at) > new Date()) {
          newExpiresAt = new Date(new Date(existingSub.expires_at).getTime() + durationDays * 24 * 60 * 60 * 1000);
        }

        // Insert verified subscription
        await supabaseAdmin.from('subscriptions').insert({
          student_id: studentId,
          plan_id: planId || null,
          status: 'ACTIVE',
          starts_at: new Date().toISOString(),
          expires_at: newExpiresAt.toISOString(),
          source: 'PAYMOB',
        });

        // Audit Log
        await supabaseAdmin.from('audit_logs').insert({
          user_id: studentId,
          action: 'PAYMOB_PAYMENT_SUCCESS',
          entity_type: 'subscriptions',
          metadata: {
            transactionId: obj.id,
            amountCents: obj.amount_cents,
            durationDays,
            newExpiresAt: newExpiresAt.toISOString(),
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('Paymob Webhook processing error:', err);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
