import type { Metadata } from 'next';
import legacy from '@/content/legacy-seo.json';
import { site } from '@/lib/site';

type PageSeo = { title: string; description: string; image?: string; imageAlt?: string; type?: 'website' | 'article'; publishedAt?: string; modifiedAt?: string };
export const absoluteUrl = (path: string) => new URL(path, site.url).href;
export function pageMetadata(path: string, fallback: PageSeo): Metadata {
  const source = (legacy as Record<string, { title?: string; description?: string; image?: string | null }>)[path];
  const title = source?.title || fallback.title;
  const description = source?.description || fallback.description;
  const image = fallback.image || source?.image || '/assets/site/open-menu-project.png';
  return {
    title: { absolute: title }, description, alternates: { canonical: path },
    openGraph: { title, description, url: path, siteName: site.name, locale: 'en_IN', type: fallback.type || 'website', images: [{ url: image, alt: fallback.imageAlt || title }], ...(fallback.type === 'article' ? { publishedTime: fallback.publishedAt, modifiedTime: fallback.modifiedAt } : {}) },
    twitter: { card: 'summary_large_image', title, description, images: [image] },
  };
}
export function breadcrumbData(items: { name: string; path: string }[]) {
  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map((item, i) => ({ '@type': 'ListItem', position: i + 1, name: item.name, item: absoluteUrl(item.path) })) };
}
