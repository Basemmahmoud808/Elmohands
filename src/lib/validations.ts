import { z } from 'zod';
import { sanitizeInput, normalizeArabicDigits } from '@/lib/security';

export const EgyptianPhoneRegex = /^01[0125]\d{8}$/;

export const LoginSchema = z.object({
  phone: z
    .string()
    .min(1, 'رقم الهاتف مطلوب')
    .transform((val) => sanitizeInput(normalizeArabicDigits(val)).replace(/\s+/g, '')),
  password: z
    .string()
    .min(1, 'كلمة المرور مطلوبة'),
});

export const RegisterSchema = z.object({
  fullName: z
    .string()
    .min(3, 'الاسم يجب أن يتكون من 3 أحرف على الأقل')
    .max(100, 'الاسم طويل جداً')
    .transform((val) => sanitizeInput(val)),
  phone: z
    .string()
    .transform((val) => sanitizeInput(normalizeArabicDigits(val)).replace(/\s+/g, ''))
    .pipe(z.string().regex(EgyptianPhoneRegex, 'رقم هاتف الطالب غير صحيح! يجب أن يتكون من 11 رقماً مصرياً')),
  parentPhone: z
    .string()
    .transform((val) => sanitizeInput(normalizeArabicDigits(val)).replace(/\s+/g, ''))
    .pipe(z.string().regex(EgyptianPhoneRegex, 'رقم هاتف ولي الأمر غير صحيح! يجب أن يتكون من 11 رقماً مصرياً')),
  password: z
    .string()
    .min(6, 'كلمة المرور يجب أن تكون 6 أحرف أو أرقام على الأقل'),
  gradeId: z.string().optional().nullable(),
  email: z.string().email('البريد الإلكتروني غير صحيح').optional().nullable().or(z.literal('')),
  parentEmail: z.string().email('بريد ولي الأمر غير صحيح').optional().nullable().or(z.literal('')),
}).refine((data) => data.phone !== data.parentPhone, {
  message: 'رقم ولي الأمر يجب أن يكون مختلفاً عن رقم هاتف الطالب',
  path: ['parentPhone'],
});

export const RedeemVoucherSchema = z.object({
  code: z
    .string()
    .min(4, 'كود التفعيل غير صحيح')
    .max(64, 'كود التفعيل غير صحيح')
    .transform((val) => sanitizeInput(val)),
});

export const SubmitQuizAttemptSchema = z.object({
  quizId: z.string().min(1, 'معرف الاختبار مطلوب').transform(sanitizeInput),
  answers: z.array(
    z.object({
      questionId: z.string().min(1).transform(sanitizeInput),
      selectedAnswer: z.string().transform(sanitizeInput),
    })
  ),
  durationSpentSeconds: z.number().int().nonnegative().optional(),
});

export const CreateQuizSchema = z.object({
  lessonId: z.string().min(1, 'يجب تحديد الدرس المرتبط').transform(sanitizeInput),
  title: z.string().min(2, 'عنوان الاختبار مطلوب').transform(sanitizeInput),
  description: z.string().optional().nullable().transform((val) => val ? sanitizeInput(val) : val),
  durationMinutes: z.number().int().min(1).default(20),
  passScore: z.number().int().min(1).max(100).default(50),
  maxAttempts: z.number().int().min(1).max(10).default(3),
  isPublished: z.boolean().default(true),
  questionIds: z.array(z.string().transform(sanitizeInput)).optional(),
  type: z.enum(['mcq', 'file']).default('mcq'),
  pdfPath: z.string().optional().nullable(),
});
