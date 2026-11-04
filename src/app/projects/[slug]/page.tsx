import { preservedPages, preservedMetadata, PreservedPage } from "@/components/seo/preserved-page";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectPageView } from "@/components/project/project-page";
import { getProject, getProjectSlugs, getProjects } from "@/sanity/projects";
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
  const projects = await getProjects();
  const selected = project.latestWork?.projectSlugs?.filter(slug => slug !== project.slug);
  const current = projects.findIndex(item => item.slug === project.slug);
  const ordered = [...projects.slice(current + 1), ...projects.slice(0, Math.max(0, current))].filter(item => item.slug !== project.slug);
  const nextProjects = selected?.length
    ? selected.map(slug => projects.find(item => item.slug === slug)).filter((item): item is (typeof projects)[number] => Boolean(item))
    : ordered.slice(0, 4);
  const latestProjects = nextProjects.map(item => ({ ...item, homepageImage: item.homepageImage || item.listingImage, listingDescription: item.listingDescription || item.introduction }));
  return <><JsonLd data={projectStructuredData(project)} /><ProjectPageView project={project} latestProjects={latestProjects} /></>;
}
