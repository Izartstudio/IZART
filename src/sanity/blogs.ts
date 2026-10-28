import 'server-only';
import { cache } from 'react';
import { createClient } from '@sanity/client';
import fallback from '@/content/blogs.json';

export type BlogBlock = { kind: 'heading' | 'paragraph' | 'quote' | 'image' | 'list'; text?: string; level?: number; url?: string; items?: string[] };
export type BlogPost = { slug: string; title: string; author: string; category: 'News' | 'Op-Ed'; topic?: string; excerpt: string; image: string; imageAlt: string; publishedAt?: string | null; updatedAt?: string; seoTitle?: string; seoDescription?: string; body: BlogBlock[]; faqs: { question: string; answer: string }[]; sourceUrl?: string };
const client = process.env.SANITY_PROJECT_ID ? createClient({ projectId: process.env.SANITY_PROJECT_ID, dataset: process.env.SANITY_DATASET || 'production', apiVersion: '2026-10-01', useCdn: true, perspective: 'published', token: process.env.SANITY_API_READ_TOKEN }) : null;
const projection = `"slug": slug.current, title, author, category, topic, excerpt, "image": coalesce(cover.asset->url, imageUrl), "imageAlt": cover.alt, publishedAt, "updatedAt": _updatedAt, seoTitle, seoDescription, body[]{kind, text, level, items, "url": coalesce(image.asset->url, url)}, faqs[]{question, answer}`;
export const getBlogs = cache(async (): Promise<BlogPost[]> => {
  if (!client) return fallback as BlogPost[];
  try {
    const posts = await client.fetch<BlogPost[]>(`*[_type == "blogPost" && defined(slug.current)] | order(publishedAt desc){${projection}}`, {}, { next: { revalidate: 60 } });
    const merged = new Map((fallback as BlogPost[]).map(post => [post.slug, post]));
    for (const post of posts) {
      const previous = merged.get(post.slug);
      merged.set(post.slug, { ...previous, ...post, image: post.image || previous?.image || '/assets/services/example.png', imageAlt: post.imageAlt || previous?.imageAlt || post.title, body: post.body || previous?.body || [], faqs: post.faqs || previous?.faqs || [] });
    }
    return [...merged.values()];
  } catch (error) {
    console.error('Unable to load Sanity blogs; using the local archive.', error);
    return fallback as BlogPost[];
  }
});
export const getBlog = cache(async (slug: string) => (await getBlogs()).find(post => post.slug === slug) || null);
export function blogHeadingId(text: string, index: number) { return `${text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'section'}-${index}`; }
