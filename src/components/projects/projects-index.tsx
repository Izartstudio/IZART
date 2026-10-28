"use client";

import { useState } from "react";
import { ProjectBackdrop } from "./gallery/project-backdrop";
import { ProjectsGallery } from "./gallery/projects-gallery";
import { useProjectColors } from "./gallery/use-project-colors";
import { useProjectGallery } from "./gallery/use-project-gallery";
import { ProjectsGrid } from "./grid/projects-grid";
import type { ListingProject, ProjectsView } from "./project-types";

export function ProjectsIndex({ projects }: { projects: ListingProject[] }) {
  const [view, setView] = useState<ProjectsView>("gallery");
  const colorsRef = useProjectColors(projects);
  const gallery = useProjectGallery(projects, view === "gallery", colorsRef);
  return <main id="main" className="projects-index" data-view={view}>
    <h1 className="sr-only">Projects by Izart Studio</h1>
    <ProjectBackdrop {...gallery.backdrop} />
    <ProjectsGallery projects={projects} active={gallery.active} view={view} setView={setView} hostRef={gallery.hostRef} galleryRef={gallery.galleryRef} canvasRef={gallery.canvasRef} goTo={gallery.goTo} />
    <ProjectsGrid projects={projects} view={view} setView={setView} />
  </main>;
}
