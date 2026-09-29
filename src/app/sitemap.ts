import type { MetadataRoute } from 'next';
import { SHEETS } from '@/features/site/content';
import { SITE_URL } from '@/features/site/metadata';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...SHEETS.map((s) => ({
      url: s.href === '/' ? SITE_URL : `${SITE_URL}${s.href}`,
      changeFrequency: 'monthly' as const,
      priority: s.href === '/' ? 1 : 0.8,
    })),
    { url: `${SITE_URL}/lab`, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
