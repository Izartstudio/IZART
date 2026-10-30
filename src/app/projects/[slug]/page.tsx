import { preservedPages, preservedMetadata, PreservedPage } from "@/components/seo/preserved-page";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectPageView } from "@/components/project/project-page";
import { getProject, getProjectSlugs } from "@/sanity/projects";
import { projectMetadata, projectStructuredData } from "@/lib/project-seo";
import { JsonLd } from "@/components/seo/json-ld";
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
  return projectMetadata(project);
}
export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) {
    const page = preservedPages.find(page => page.path === `/projects/${slug}`);
    if (!page) notFound();
    return <PreservedPage page={page} />;
  }
  return <><JsonLd data={projectStructuredData(project)} /><ProjectPageView project={project} /></>;
}
