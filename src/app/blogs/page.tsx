import { notFound } from 'next/navigation';
import { BlogIndex } from '@/components/blogs/blog-index.client';
import { SiteFooter } from '@/components/site/site-footer';
import { getBlogs } from '@/sanity/blogs';
import { pageMetadata } from '@/lib/seo';
import './blogs.css';
type Props = { searchParams: Promise<{ page?: string; category?: string }> };
function options(params: Awaited<Props['searchParams']>) {
  const page = Number(params.page || 1);
  if (!Number.isSafeInteger(page) || page < 1 || (params.category && !['news', 'op-ed'].includes(params.category))) notFound();
  return { page, category: params.category === 'news' ? 'News' as const : params.category === 'op-ed' ? 'Op-Ed' as const : undefined };
}
export async function generateMetadata({ searchParams }: Props) {
  const { page, category } = options(await searchParams);
  const query = new URLSearchParams(); if (category) query.set('category', category.toLowerCase()); if (page > 1) query.set('page', String(page));
  const path = `/blogs${query.size ? `?${query}` : ''}`;
  return pageMetadata(path, { title: `Blog${category ? ` — ${category}` : ''}${page > 1 ? ` — Page ${page}` : ''} | Izart Studio`, description: 'Perspectives on branding, culture, design, and building brands that matter. Insights from Izart Studio.' });
}
export const revalidate = 60;
export default async function BlogsPage({ searchParams }: Props) {
  const { page, category } = options(await searchParams);
  const posts = (await getBlogs()).filter(post => !category || post.category === category);
  const start = page === 1 ? 0 : 5 + (page - 2) * 4;
  if (page > 1 && start >= posts.length) notFound();
  return <><BlogIndex posts={posts.slice(start, start + (page === 1 ? 5 : 4))} category={category} page={page} hasNext={start + (page === 1 ? 5 : 4) < posts.length} /><SiteFooter /></>;
}
