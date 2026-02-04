import { MetadataRoute } from 'next';
import { BASE_URL } from '@/lib/utils/env';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/my-studio/'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
