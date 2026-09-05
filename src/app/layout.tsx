import type { Metadata, Viewport } from 'next';
import { Cairo } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import 'katex/dist/katex.min.css';
import { ThemeProvider } from '@/components/theme-provider';
import { SecurityShield } from '@/components/ui/SecurityShield';
import { GA_MEASUREMENT_ID, META_PIXEL_ID, CLARITY_PROJECT_ID } from '@/lib/analytics';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-cairo',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://elmohands-one.vercel.app'),
  title: {
    default: 'منصة المهندس — م/ رضا خيرت | تعليم الرياضيات',
    template: '%s | منصة المهندس',
  },
  description: 'منصتك الأولى لتعلم وفهم الرياضيات بأسلوب بسيط وممتع مع م/ رضا خيرت للمرحلة الإعدادية والصف الأول الثانوي.',
  keywords: ['رياضيات', 'منصة المهندس', 'رضا خيرت', 'شرح رياضيات', 'إعدادي', 'أولى ثانوي', 'اختبارات رياضيات'],
  authors: [{ name: 'م/ رضا خيرت' }],
  creator: 'م/ رضا خيرت',
  publisher: 'منصة المهندس لتعليم الرياضيات',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/icon.svg',
    apple: '/apple-icon',
  },
  openGraph: {
    title: 'منصة المهندس — م/ رضا خيرت | تعليم الرياضيات',
    description: 'منصتك الأولى لتعلم وفهم الرياضيات بأسلوب بسيط وممتع مع م/ رضا خيرت للمرحلة الإعدادية والصف الأول الثانوي.',
    url: 'https://elmohands-one.vercel.app',
    siteName: 'منصة المهندس',
    locale: 'ar_EG',
    type: 'website',
  },
  manifest: '/manifest.webmanifest',
  alternates: {
    canonical: 'https://elmohands-one.vercel.app',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'منصة المهندس — م/ رضا خيرت',
    description: 'منصتك الأولى لتعلم وفهم الرياضيات بأسلوب بسيط وممتع مع م/ رضا خيرت.',
  },
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
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'منصة المهندس لتعليم الرياضيات',
    alternateName: 'منصة المهندس — م/ رضا خيرت',
    url: 'https://elmohands-one.vercel.app',
    logo: 'https://elmohands-one.vercel.app/icon.svg',
    description: 'منصتك الأولى لتعلم وفهم الرياضيات بأسلوب بسيط وممتع مع م/ رضا خيرت للمرحلة الإعدادية والصف الأول الثانوي.',
    telephone: '+201030548198',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'EG',
    },
    founder: {
      '@type': 'Person',
      name: 'رضا خيرت',
      jobTitle: 'معلم أول الرياضيات',
    },
  };

  return (
    <html lang="ar" dir="rtl" className={cairo.variable} suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <style dangerouslySetInnerHTML={{ __html: `
          :root { --background: 255 255 255; --foreground: 15 23 42; }
          .dark { --background: 0 0 0; --foreground: 248 250 252; }
          body { font-family: var(--font-cairo), 'Cairo', system-ui, -apple-system, sans-serif; min-height: 100vh; overflow-x: hidden; }
          .chalk-card { background-color: rgba(255, 255, 255, 0.9); border: 1px solid rgba(226, 232, 240, 0.9); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
          .dark .chalk-card { background-color: rgba(15, 23, 42, 0.8); border-color: rgba(0, 207, 255, 0.15); box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.4); }
          .bg-cyan-electric { background-color: #00CFFF !important; }
          .text-cyan-electric { color: #00CFFF !important; }
          .dark body { background-color: #000000 !important; color: #f8fafc !important; }
        ` }} />
      </head>
      <body className="bg-slate-50 dark:bg-black text-slate-900 dark:text-chalk antialiased selection:bg-cyan-electric selection:text-black" suppressHydrationWarning>
        {/* Google Analytics Script (Conditional) */}
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_MEASUREMENT_ID}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}

        {/* Meta Pixel Script (Conditional) */}
        {META_PIXEL_ID && (
          <Script
            id="meta-pixel"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${META_PIXEL_ID}');
                fbq('track', 'PageView');
              `,
            }}
          />
        )}

        {/* Microsoft Clarity Script (Conditional) */}
        {CLARITY_PROJECT_ID && (
          <Script
            id="microsoft-clarity"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(c,l,a,r,i,t,y){
                  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                })(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");
              `,
            }}
          />
        )}

        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <SecurityShield />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
