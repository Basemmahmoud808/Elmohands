import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'منصة المهندس — م/ رضا خيرت',
    short_name: 'المهندس',
    description: 'المنصة الرائدة في تعليم الرياضيات للمرحلة الإعدادية والصف الأول الثانوي مع م/ رضا خيرت.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#00CFFF',
    dir: 'rtl',
    lang: 'ar',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
