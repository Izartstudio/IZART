import { notFound } from 'next/navigation';
import { preservedPages, preservedMetadata, PreservedPage } from '@/components/seo/preserved-page';
type Props = { params: Promise<{ legacy: string[] }> };
const pages = preservedPages.filter(page => !page.path.startsWith('/projects/') && page.path !== '/manifesto');
export function generateStaticParams() { return pages.map(page => ({ legacy: page.path.slice(1).split('/') })); }
export async function generateMetadata({ params }: Props) {
  const path = '/' + (await params).legacy.join('/');
  const page = pages.find(page => page.path === path); if (!page) notFound();
  return preservedMetadata(page);
}
export default async function LegacyRoute({ params }: Props) {
  const path = '/' + (await params).legacy.join('/');
  const page = pages.find(page => page.path === path); if (!page) notFound();
  return <PreservedPage page={page} />;
}
