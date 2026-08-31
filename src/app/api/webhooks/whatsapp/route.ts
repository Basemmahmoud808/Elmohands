import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { formatEgyptianWhatsAppPhone, sendWhatsAppNotification } from '@/lib/services/whatsapp';

/**
 * Webhook Handler for OpenWA WhatsApp Gateway.
 * Receives incoming messages, receipts, and media events sent to the official WhatsApp number.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Verify incoming payload structure
    const event = body.event || body.type;
    const message = body.data || body.message || body;

    const from = message.from || message.sender || '';
    const text = message.body || message.text || message.caption || '';
    const hasMedia = Boolean(message.hasMedia || message.mediaUrl || message.mimetype);
    const mediaUrl = message.mediaUrl || message.url || null;

    if (!from) {
      return NextResponse.json({ success: true, message: 'No sender identified' });
    }

    // Extract clean phone number without @c.us or @s.whatsapp.net
    const rawDigits = from.replace(/@.*$/, '').replace(/\D/g, '');
    const cleanPhone = formatEgyptianWhatsAppPhone(rawDigits);

    // Look up student by phone number in database
    const localPhoneFormat = cleanPhone.startsWith('20') ? '0' + cleanPhone.slice(2) : cleanPhone;
    const { data: student } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, phone, grade_id, is_active')
      .or(`phone.eq.${localPhoneFormat},phone.eq.${cleanPhone}`)
      .maybeSingle();

    // Log the incoming message / receipt to audit logs for Admin visibility
    await supabaseAdmin.from('audit_logs').insert({
      user_id: student?.id || null,
      action: hasMedia ? 'WHATSAPP_PAYMENT_PROOF_RECEIVED' : 'WHATSAPP_MESSAGE_RECEIVED',
      entity_type: 'whatsapp_messages',
      metadata: {
        from: cleanPhone,
        senderName: student?.full_name || 'طالب غير مسجل بعد',
        text,
        hasMedia,
        mediaUrl,
        timestamp: new Date().toISOString(),
      },
    });

    // Auto-reply acknowledgment to the student if payment receipt was received
    if (hasMedia || text.includes('تحويل') || text.includes('كاش') || text.includes('فودافون')) {
      const replyText = `أهلاً بك في منصة المهندس مع م/ رضا خيرت! 🎓
تم استلام إيصال التحويل وبياناتك بنجاح.
يقوم الأدمن بمراجعة الإيصال وتفعيل اشتراكك بالمنصة فوراً. نتمنى لك التوفيق! 🌟`;

      // Auto-reply via OpenWA
      await sendWhatsAppNotification({
        phone: cleanPhone,
        message: replyText,
      }).catch(() => {
        // Non-blocking
      });
    }

    return NextResponse.json({
      success: true,
      processed: true,
      sender: cleanPhone,
      studentName: student?.full_name || null,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Internal webhook error';
    console.error('Error processing WhatsApp webhook:', errorMsg);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'online',
    service: 'Almohands WhatsApp Webhook Gateway',
    timestamp: new Date().toISOString(),
  });
}
