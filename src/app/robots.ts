import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';
import { crawlerRules } from '@/lib/crawler-policy';
export default function robots(): MetadataRoute.Robots {
  return {
    rules: crawlerRules(site.indexable, process.env.AI_TRAINING_ALLOWED === 'true', process.env.GOOGLE_EXTENDED_ALLOWED !== 'false'),
    ...(site.indexable ? { sitemap: new URL('/sitemap.xml', site.url).href } : {}),
  };
}
