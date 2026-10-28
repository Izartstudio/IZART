"use client";

import Image, { type ImageLoaderProps } from "next/image";
import Link from "next/link";
import type { RefObject } from "react";
import type { ListingProject, ProjectsView } from "../project-types";
import { ProjectPagination } from "./project-pagination";
import { ViewToggle } from "./view-toggle";

const imageLoader = ({ src }: ImageLoaderProps) => src;

export function ProjectsGallery({ projects, active, view, setView, hostRef, galleryRef, canvasRef, goTo }: {
  projects: ListingProject[]; active: number; view: ProjectsView; setView: (view: ProjectsView) => void;
  hostRef: RefObject<HTMLElement | null>; galleryRef: RefObject<HTMLDivElement | null>; canvasRef: RefObject<HTMLCanvasElement | null>;
  goTo: (index: number) => void;
}) {
  const project = projects[active];
  return <section ref={hostRef} className="projects-gallery" aria-label="Project gallery">
    <div ref={galleryRef} className="projects-gallery__sticky">
      <div className="projects-gallery__info">
        <nav className="projects-rail" aria-label="Choose project"><ProjectPagination projects={projects} active={active} choose={goTo} /></nav>
        <div className="projects-gallery__copy" aria-live="polite">
          <h2>{project.name}</h2>
          <p>{project.listingDescription || project.introduction}</p>
          <ul>{project.services.map(service => <li key={service}>{service}</li>)}</ul>
        </div>
        <span className="projects-gallery__dots" aria-hidden="true" />
        <ViewToggle view={view} setView={setView} />
      </div>
      <div className="projects-gallery__stage">
        <canvas ref={canvasRef} className="projects-paper-canvas" aria-hidden="true" />
        <Image className="projects-paper-fallback" loader={imageLoader} unoptimized src={project.listingImage.url} width={project.listingImage.width} height={project.listingImage.height} sizes="(max-width: 767px) 88vw, 64vw" alt={`${project.name} project`} priority />
        <Link href={`/projects/${project.slug}`} className="projects-paper-link" aria-label={`View ${project.name} case study`} />
      </div>
    </div>
  </section>;
}
