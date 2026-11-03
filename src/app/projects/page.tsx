import { ContactForm } from "@/components/home/contact-form.client";
import { SiteFooter } from "@/components/site/site-footer";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { ProjectsIndex } from "@/components/projects/projects-index";
import { getProjects, getPortfolioSettings } from "@/sanity/projects";

export const revalidate = 60;
export const metadata: Metadata = pageMetadata("/projects", { title: "Projects — Brand Identity & Digital Design | Izart Studio", description: "Explore selected brand identity, packaging, and digital design projects by Izart Studio." });

export default async function ProjectsPage() {
  const [projects, settings] = await Promise.all([getProjects(), getPortfolioSettings()]);
  return <><ProjectsIndex projects={projects} settings={settings} /><div className="projects-page__ending"><ContactForm /><SiteFooter /></div></>;
}
