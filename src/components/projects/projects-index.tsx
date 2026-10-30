"use client";
import { useState, type CSSProperties } from "react";
import { ProjectBackdrop } from "./gallery/project-backdrop";
import { ProjectsGallery } from "./gallery/projects-gallery";
import { useProjectGallery } from "./gallery/use-project-gallery";
import { ProjectsGrid } from "./grid/projects-grid";
import { ProjectNavigationTheme } from "./project-navigation-theme.client";
import { createProjectTheme } from "@/lib/project-theme";
import type { PortfolioSettings } from "@/content/portfolio-page";
import type { ListingProject, ProjectsView } from "./project-types";

export function ProjectsIndex({ projects, settings }: { projects: ListingProject[]; settings: PortfolioSettings }) {
  const [view, setView] = useState<ProjectsView>(settings.defaultView);
  const [gridActive, setGridActive] = useState(0);
  const gallery = useProjectGallery(projects, view === "gallery");
  const theme = projects[view === "gallery" ? gallery.active : gridActive]?.theme || createProjectTheme([]);
  const backdrop = view === "gallery" ? gallery.backdrop : { current: 0, themes: [theme, theme] as [typeof theme, typeof theme] };
  const style = { "--project-bg": theme.background, "--project-fg": theme.foreground, "--project-muted": theme.muted } as CSSProperties;
  if (!projects.length) return <main id="main" className="projects-index" style={style}><h1>{settings.heading}</h1><p>Projects will appear here when published.</p></main>;
  return <main id="main" className="projects-index" data-view={view} style={style}>
    <ProjectNavigationTheme foreground={theme.foreground} />
    <h1 className="sr-only">{settings.heading}</h1>
    <ProjectBackdrop {...backdrop} />
    <ProjectsGallery settings={settings} projects={projects} active={gallery.active} view={view} setView={setView} hostRef={gallery.hostRef} galleryRef={gallery.galleryRef} canvasRef={gallery.canvasRef} goTo={gallery.goTo} />
    <ProjectsGrid settings={settings} projects={projects} view={view} setView={setView} onActiveChange={setGridActive} />
  </main>;
}
