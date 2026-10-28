import Link from 'next/link';
import pages from '@/content/preserved-pages.json';
import { JsonLd } from './json-ld';
import { breadcrumbData, pageMetadata } from '@/lib/seo';
import { SiteFooter } from '@/components/site/site-footer';
import './preserved-page.css';
export const preservedPages = pages;
export function preservedMetadata(page: typeof pages[number]) {
  return pageMetadata(page.path, { title: `${page.heading} | Izart Studio`, description: `Discover ${page.heading} at Izart Studio.` });
}
export function PreservedPage({ page }: { page: typeof pages[number] }) {
  return <><main id="main" className="preserved-page"><JsonLd data={breadcrumbData([{ name: 'Home', path: '/' }, { name: page.heading, path: page.path }])} /><header><Link href="/">Izart Studio</Link><h1>{page.heading}</h1></header><div className="preserved-page__content" dangerouslySetInnerHTML={{ __html: page.html }} /></main><SiteFooter /></>;
}
