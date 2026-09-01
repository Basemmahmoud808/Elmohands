import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://elmohands-one.vercel.app';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/courses', '/courses/*', '/sign-in', '/sign-up'],
        disallow: [
          '/admin',
          '/admin/*',
          '/student',
          '/student/*',
          '/api/*',
          '/account',
          '/account/*',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
