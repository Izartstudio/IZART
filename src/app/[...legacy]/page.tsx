import { serviceSubpages, serviceSubpageDescription } from "@/content/service-subpages";
import { ServiceDetailPage } from "@/components/services/service-detail-page";
import { getServiceDetailContent } from "@/sanity/services";
import { pageMetadata } from "@/lib/seo";
import { notFound } from 'next/navigation';
import { preservedPages, preservedMetadata, PreservedPage } from '@/components/seo/preserved-page';
type Props = { params: Promise<{ legacy: string[] }> };
const pages = preservedPages.filter(page => !page.path.startsWith('/projects/') && page.path !== '/manifesto');
export function generateStaticParams() { return [...new Set([...pages.map(page => page.path), ...serviceSubpages.map(page => page.path)])].map(path => ({ legacy: path.slice(1).split("/") })); }
export async function generateMetadata({ params }: Props) {
  const path = '/' + (await params).legacy.join('/');
  const service = serviceSubpages.find(page => page.path === path);
  if (service) {
    const content = await getServiceDetailContent(service.slug);
    return pageMetadata(path, { title: `${content.title || service.title} | Izart Studio`, description: content.description || serviceSubpageDescription });
  }
  const page = pages.find(page => page.path === path); if (!page) notFound();
  return preservedMetadata(page);
}
export default async function LegacyRoute({ params }: Props) {
  const path = '/' + (await params).legacy.join('/');
  const service = serviceSubpages.find(page => page.path === path);
  if (service) return <ServiceDetailPage slug={service.slug} title={service.title} description={serviceSubpageDescription} />;
  const page = pages.find(page => page.path === path); if (!page) notFound();
  return <PreservedPage page={page} />;
}
