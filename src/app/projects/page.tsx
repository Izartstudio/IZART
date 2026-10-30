import Link from "next/link";
import preserved from "@/content/preserved-pages.json";
import { SiteFooter } from "@/components/site/site-footer";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { ProjectsIndex } from "@/components/projects/projects-index";
import { getProjects, getPortfolioSettings } from "@/sanity/projects";

export const revalidate = 60;
export const metadata: Metadata = pageMetadata("/projects", { title: "Projects — Brand Identity & Digital Design | Izart Studio", description: "Explore selected brand identity, packaging, and digital design projects by Izart Studio." });

export default async function ProjectsPage() {
  const [projects, settings] = await Promise.all([getProjects(), getPortfolioSettings()]);
  const archive = [...projects.map(project => ({ path: `/projects/${project.slug}`, heading: project.name })), ...preserved.filter(page => page.path.startsWith('/projects/') && !projects.some(project => page.path === `/projects/${project.slug}`))];
  return <><ProjectsIndex projects={projects} settings={settings} />{settings.showArchive && <nav className="project-case-study-archive" aria-label="All case studies"><h2>{settings.archiveHeading}</h2><ul>{archive.map(project => <li key={project.path}><Link href={project.path}>{project.heading}</Link></li>)}</ul></nav>}<SiteFooter /></>;
}
