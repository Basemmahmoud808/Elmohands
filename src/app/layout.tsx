import type { Metadata, Viewport } from 'next';
import { Cairo } from 'next/font/google';
import './globals.css';
import 'katex/dist/katex.min.css';
import { ThemeProvider } from '@/components/theme-provider';

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
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
        <script dangerouslySetInnerHTML={{ __html: `
          tailwind.config = {
            darkMode: 'class',
            theme: {
              extend: {
                colors: {
                  'cyan-electric': '#00CFFF',
                  'cyan-electric-hover': '#00B8E6',
                  'blue-ink': '#0A192F',
                  chalk: '#F8FAFC',
                }
              }
            }
          }
        ` }} />
        <style dangerouslySetInnerHTML={{ __html: `
          :root { --background: 255 255 255; --foreground: 15 23 42; }
          .dark { --background: 0 0 0; --foreground: 248 250 252; }
          body { font-family: var(--font-cairo), 'Cairo', system-ui, -apple-system, sans-serif; min-height: 100vh; overflow-x: hidden; margin: 0; padding: 0; }
          .chalk-card { background-color: rgba(255, 255, 255, 0.9); border: 1px solid rgba(226, 232, 240, 0.9); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
          .dark .chalk-card { background-color: rgba(15, 23, 42, 0.8); border-color: rgba(0, 207, 255, 0.15); box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.4); }
          .bg-cyan-electric { background-color: #00CFFF !important; }
          .text-cyan-electric { color: #00CFFF !important; }
          .dark body { background-color: #000000 !important; color: #f8fafc !important; }
        ` }} />
      </head>
      <body className={`${cairo.className} ${cairo.variable} font-arabic bg-slate-50 dark:bg-black text-slate-900 dark:text-chalk antialiased selection:bg-cyan-electric selection:text-black`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
