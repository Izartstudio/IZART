import Link from "next/link";
import preserved from "@/content/preserved-pages.json";
import { SiteFooter } from "@/components/site/site-footer";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { ProjectsIndex } from "@/components/projects/projects-index";
import { getProjects } from "@/sanity/projects";

export const revalidate = 60;
export const metadata: Metadata = pageMetadata("/projects", { title: "Projects — Brand Identity & Digital Design | Izart Studio", description: "Explore selected brand identity, packaging, and digital design projects by Izart Studio." });

export default async function ProjectsPage() {
  const projects = await getProjects();
  const archive = [...projects.map(project => ({ path: `/projects/${project.slug}`, heading: project.name })), ...preserved.filter(page => page.path.startsWith('/projects/'))];
  return <><ProjectsIndex projects={projects} /><nav className="project-case-study-archive" aria-label="All case studies"><h2>Explore our case studies</h2><ul>{archive.map(project => <li key={project.path}><Link href={project.path}>{project.heading}</Link></li>)}</ul></nav><SiteFooter /></>;
}
