import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://hobolabs.digital', changeFrequency: 'monthly', priority: 1 },
    { url: 'https://hobolabs.digital/lab', changeFrequency: 'yearly', priority: 0.3 },
  ];
}
