/**
 * WhatsApp Gateway Service (OpenWA & Direct Links)
 * Platform: منصة المهندس — م/ رضا خيرت
 *
 * Supports automated sending via OpenWA self-hosted API gateway,
 * with seamless fallback to direct 1-click wa.me action links.
 */

export const TEACHER_WHATSAPP_PHONE = process.env.NEXT_PUBLIC_TEACHER_PHONE || '01030548198';
export const TEACHER_WHATSAPP_INTL = '201030548198';

export interface WhatsAppSendResult {
  sentViaGateway: boolean;
  directUrl: string;
  error?: string;
}

/**
 * Formats any Egyptian phone number into the international WhatsApp format (e.g., 201012345678).
 */
export function formatEgyptianWhatsAppPhone(phone: string): string {
  if (!phone) return '';
  // Convert Eastern Arabic numerals to standard digits
  let clean = phone
    .trim()
    .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d).toString())
    .replace(/\D/g, '');

  if (clean.startsWith('0')) {
    clean = '20' + clean.slice(1);
  } else if (!clean.startsWith('20') && clean.length === 10) {
    clean = '20' + clean;
  }
  return clean;
}

/**
 * Generates a direct 1-click WhatsApp deep link (wa.me) for instant desktop / mobile opening.
 */
export function getWhatsAppDirectUrl(phone: string, text: string): string {
  const formattedPhone = formatEgyptianWhatsAppPhone(phone);
  const encodedText = encodeURIComponent(text.trim());
  return `https://wa.me/${formattedPhone}?text=${encodedText}`;
}

// -------------------------------------------------------------
// Professional Arabic Message Templates
// -------------------------------------------------------------

export function getSubscriptionWelcomeMessage(params: {
  studentName: string;
  planName: string;
  gradeName: string;
  durationDays: number;
}): string {
  return `أهلاً بك يا ${params.studentName} في منصة المهندس! 🎓
مع م/ رضا خيرت — معلم الرياضيات

تم تفعيل اشتراكك بنجاح:
• باقة الاشتراك: ${params.planName}
• الصف الدراسي: ${params.gradeName}
• مدة الاشتراك: ${params.durationDays} يوماً

يمكنك الآن الدخول للمنصة ومشاهدة شرح الدروس وتحميل الشيتات وحل بنك الأسئلة والامتحانات.
رابط المنصة: https://elmohands-one.vercel.app

نتمنى لك التوفيق والدرجة النهائية دائماً يا بطل! 🌟`;
}

export function getPasswordResetMessage(params: {
  studentName: string;
  phone: string;
  temporaryPassword: string;
}): string {
  return `مرحباً يا ${params.studentName} 🔑
من منصة المهندس لتعليم الرياضيات (م/ رضا خيرت)

تمت إعادة تعيين كلمة المرور الخاصة بحسابك:
• رقم الدخول / الهاتف: ${params.phone}
• كلمة المرور الجديدة: ${params.temporaryPassword}

يمكنك تسجيل الدخول الآن عبر:
https://elmohands-one.vercel.app/sign-in`;
}

export function getExamScoreParentMessage(params: {
  studentName: string;
  examTitle: string;
  gradeName: string;
  score: number;
  maxScore: number;
  percentage: number;
  passed: boolean;
}): string {
  const statusEmoji = params.passed ? 'ممتاز ومجتاز 🎯' : 'يحتاج لمزيد من المراجعة والتدريب ⚠️';
  return `ولي أمر الطالب المحترم / ${params.studentName} 📊
تقرير تقييم منصة المهندس في الرياضيات (م/ رضا خيرت)

• الامتحان: ${params.examTitle}
• الصف الدراسي: ${params.gradeName}
• الدرجة المحققة: ${params.score} من ${params.maxScore} (${params.percentage}%)
• التقييم: ${statusEmoji}

يمكن للطالب مراجعة تفاصيل الإجابات النموذجية من لوحة التحكم.
مع تحيات م/ رضا خيرت`;
}

// -------------------------------------------------------------
// OpenWA Gateway Dispatcher
// -------------------------------------------------------------

export async function sendWhatsAppNotification(params: {
  phone: string;
  message: string;
}): Promise<WhatsAppSendResult> {
  const formattedPhone = formatEgyptianWhatsAppPhone(params.phone);
  const directUrl = getWhatsAppDirectUrl(params.phone, params.message);

  const gatewayUrl = process.env.OPENWA_API_URL;
  const apiKey = process.env.OPENWA_API_KEY;
  const sessionId = process.env.OPENWA_SESSION_ID || 'default';

  // If gateway is not configured, return direct URL for 1-click execution
  if (!gatewayUrl || !apiKey) {
    return {
      sentViaGateway: false,
      directUrl,
    };
  }

  try {
    const endpoint = `${gatewayUrl.replace(/\/$/, '')}/api/messages/send-text`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        sessionId,
        to: `${formattedPhone}@c.us`,
        text: params.message,
      }),
      // Set reasonable timeout so app is never blocked
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      return {
        sentViaGateway: true,
        directUrl,
      };
    } else {
      const errText = await response.text().catch(() => 'Gateway response not ok');
      console.warn('OpenWA Gateway failed, fallback available:', errText);
      return {
        sentViaGateway: false,
        directUrl,
        error: errText,
      };
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown gateway error';
    console.warn('OpenWA Gateway exception, fallback available:', errorMsg);
    return {
      sentViaGateway: false,
      directUrl,
      error: errorMsg,
    };
  }
}
