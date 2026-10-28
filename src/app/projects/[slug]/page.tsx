import { preservedPages, preservedMetadata, PreservedPage } from "@/components/seo/preserved-page";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectPageView } from "@/components/project/project-page";
import { getProject, getProjectSlugs } from "@/sanity/projects";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";
export const revalidate = 60;
type Props = { params: Promise<{ slug: string }> };
export async function generateStaticParams() { return [...new Set([...(await getProjectSlugs()), ...preservedPages.filter(page => page.path.startsWith("/projects/")).map(page => page.path.split("/")[2])])].map(slug => ({ slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) {
    const page = preservedPages.find(page => page.path === `/projects/${slug}`);
    if (!page) notFound();
    return preservedMetadata(page);
  }
  const url = `/projects/${project.slug}`;
  return { ...pageMetadata(url, { title: project.seoTitle, description: project.description, image: project.socialImage?.url }), robots: { index: site.indexable && project.indexable, follow: true } };
}
export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) {
    const page = preservedPages.find(page => page.path === `/projects/${slug}`);
    if (!page) notFound();
    return <PreservedPage page={page} />;
  }
  const data = { "@context": "https://schema.org", "@type": "CreativeWork", name: project.name, description: project.description,
    url: new URL(`/projects/${project.slug}`, site.url).href, ...(project.socialImage?.url ? { image: new URL(project.socialImage.url, site.url).href } : {}) };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} /><ProjectPageView project={project} /></>;
}
