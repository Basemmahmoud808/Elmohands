import type { Metadata, Viewport } from 'next';
import { Cairo } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import 'katex/dist/katex.min.css';
import './globals.css';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-cairo',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'منصة المهندس — م/ رضا خيرت | تعليم الرياضيات (إعدادي وثانوي)',
  description: 'منصتك الأولى لتعلم وفهم الرياضيات بأسلوب بسيط وممتع مع م/ رضا خيرت للمرحلة الإعدادية والصف الأول الثانوي.',
  keywords: ['رياضيات', 'منصة المهندس', 'رضا خيرت', 'شرح رياضيات', 'إعدادي', 'أولى ثانوي', 'اختبارات رياضيات'],
  authors: [{ name: 'م/ رضا خيرت' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable} suppressHydrationWarning>
      <body className="bg-slate-50 dark:bg-black text-slate-900 dark:text-chalk antialiased selection:bg-cyan-electric selection:text-black">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
