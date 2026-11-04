"use client";
import { useState, useMemo, type ReactNode, type CSSProperties } from "react";
import { ProjectFilter } from "./project-filter";
import { ProjectBackdrop } from "./gallery/project-backdrop";
import { ProjectsGallery } from "./gallery/projects-gallery";
import { useProjectGallery } from "./gallery/use-project-gallery";
import { ProjectsGrid } from "./grid/projects-grid";
import { ProjectNavigationTheme } from "./project-navigation-theme.client";
import { createProjectTheme } from "@/lib/project-theme";
import type { PortfolioSettings } from "@/content/portfolio-page";
import type { ListingProject, ProjectsView } from "./project-types";

const industriesBySlug: Record<string, string[]> = {
    "10x10": ["Exhibitions & Events"], benicio: ["Real Estate"], loupe: ["Jewellery"], ritva: ["Fashion"],
    "soak-studio": ["Beauty & Wellness"], seraano: ["Real Estate"], plattr: ["Food & Beverage"], "dogs-and-cats": ["Pet Care"],
  };

export function ProjectsIndex({ projects, settings }: { projects: ListingProject[]; settings: PortfolioSettings }) {
  const [view, setView] = useState<ProjectsView>(settings.defaultView);
  const [service, setService] = useState("");
  const [industry, setIndustry] = useState("");
  const industryLabels = (project: ListingProject) => project.industries?.length ? project.industries : industriesBySlug[project.slug] || [];
  const serviceOptions = [...new Set(projects.flatMap(project => project.services))].sort();
  const industryOptions = [...new Set(projects.flatMap(industryLabels))].sort();
  const filtered = useMemo(() => projects.filter(project => (!service || project.services.includes(service)) && (!industry || (project.industries?.length ? project.industries : industriesBySlug[project.slug] || []).includes(industry))), [projects, service, industry]);
  const filters = <div className="projects-filters" aria-label="Filter projects">
    <ProjectFilter label="Services" allLabel="All services" value={service} options={serviceOptions} onChange={setService} />
    <ProjectFilter label="Industry" allLabel="All industries" value={industry} options={industryOptions} onChange={setIndustry} />
    {(service || industry) && <button type="button" onClick={() => { setService(""); setIndustry(""); }}>Clear ×</button>}
    <span className="sr-only" role="status">{filtered.length} projects found</span>
  </div>;
  return <ProjectsResults key={filtered.map(project => project.slug).join("|")} projects={filtered} settings={settings} view={view} setView={setView} filters={filters} />;
}

function ProjectsResults({ projects, settings, view, setView, filters }: { projects: ListingProject[]; settings: PortfolioSettings; view: ProjectsView; setView: (view: ProjectsView) => void; filters: ReactNode }) {
  const [gridActive, setGridActive] = useState(0);
  const gallery = useProjectGallery(projects, view === "gallery");
  const theme = projects[view === "gallery" ? gallery.active : gridActive]?.theme || createProjectTheme([]);
  const backdrop = view === "gallery" ? gallery.backdrop : { current: 0, themes: [theme, theme] as [typeof theme, typeof theme] };
  const style = { "--project-bg": theme.background, "--project-fg": theme.foreground, "--project-muted": theme.muted } as CSSProperties;
  if (!projects.length) return <main id="main" className="projects-index" style={style}>{filters}<h1>{settings.heading}</h1><p>No projects match these filters. Try another selection or clear the filters.</p></main>;
  return <main id="main" className="projects-index" data-view={view} style={style}>
    <ProjectNavigationTheme foreground={theme.foreground} />
    <h1 className="sr-only">{settings.heading}</h1>
    <ProjectBackdrop {...backdrop} />
    <ProjectsGallery filters={filters} settings={settings} projects={projects} active={gallery.active} view={view} setView={setView} hostRef={gallery.hostRef} galleryRef={gallery.galleryRef} canvasRef={gallery.canvasRef} goTo={gallery.goTo} />
    <ProjectsGrid filters={filters} settings={settings} projects={projects} view={view} setView={setView} onActiveChange={setGridActive} />
  </main>;
}
