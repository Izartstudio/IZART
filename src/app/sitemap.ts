import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';
import { projectSitemapEntry } from '@/lib/project-seo';
import { getProject, getProjectSlugs } from '@/sanity/projects';
import { getCareerJobSlugs } from '@/sanity/careers';
import { getBlogs } from '@/sanity/blogs';
import { getPlaygroundPage } from '@/sanity/playground';
import preserved from '@/content/preserved-pages.json';
import { showcaseServices } from '@/components/services/service-showcase-data';
export const revalidate = 60;
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!site.indexable) return [];
  const [projects, blogs, careers, playground] = await Promise.all([
    getProjectSlugs().then(slugs => Promise.all(slugs.map(getProject))), getBlogs(), getCareerJobSlugs(), getPlaygroundPage(),
  ]);
  const entries: MetadataRoute.Sitemap = [
    ...['/', '/projects', '/services', '/careers', '/blogs', '/brand-identity', '/website-design-and-development'].map(path => ({ url: new URL(path, site.url).href })),
    ...showcaseServices.map(service => ({ url: new URL(service.href, site.url).href })),
    ...(playground.indexable ? [{ url: new URL('/playground', site.url).href }] : []),
    ...preserved.filter(page => !projects.some(project => project && page.path === `/projects/${project.slug}`)).map(page => ({ url: new URL(page.path, site.url).href })),
    ...blogs.map(post => ({ url: new URL(`/blogs/${post.slug}`, site.url).href, ...(post.updatedAt ? { lastModified: post.updatedAt } : {}) })),
    ...careers.map(slug => ({ url: new URL(`/careers/${slug}`, site.url).href })),
    ...projects.filter(p => p?.indexable).map(p => projectSitemapEntry(p!)),
  ];
  return [...new Map(entries.map(entry => [entry.url, entry])).values()];
}
