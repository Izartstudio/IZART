"use client";

import Image, { type ImageLoaderProps } from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { ListingProject, ProjectsView } from "../project-types";
import type { PortfolioSettings } from "@/content/portfolio-page";
import { ProjectPagination } from "../gallery/project-pagination";
import { ViewToggle } from "../gallery/view-toggle";

const imageLoader = ({ src }: ImageLoaderProps) => src;

export function ProjectsGrid({ filters, settings, projects, view, setView, onActiveChange }: { filters?: ReactNode; settings: PortfolioSettings; projects: ListingProject[]; view: ProjectsView; setView: (view: ProjectsView) => void; onActiveChange: (index: number) => void }) {
  const [active, setActive] = useState(0);
  const itemsRef = useRef<(HTMLLIElement | null)[]>([]);
  const gridRef = useRef<HTMLUListElement>(null);
  const stopsRef = useRef<{ top: number; projectIndex: number }[]>([]);
  const [rowStarts, setRowStarts] = useState<number[]>([]);

  const chooseProject = (index: number) => {
    const stop = stopsRef.current[index];
    if (!stop) return;
    window.scrollTo({
      top: stop.top,
      behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  };

  useEffect(() => {
    const grid = gridRef.current;
    if (view !== "grid" || !grid) return;

    const update = () => {
      const stops = stopsRef.current;
      const y = window.scrollY;
      const next = stops.findIndex((stop, index) => {
        const following = stops[index + 1];
        return !following || y < (stop.top + following.top) / 2;
      });
      if (next < 0) return;
      setActive(next);
      onActiveChange(stops[next].projectIndex);
    };

    const measure = () => {
      const y = window.scrollY;
      const rows: { top: number; projectIndex: number }[] = [];
      let previousTop = -Infinity;
      itemsRef.current.forEach((item, projectIndex) => {
        if (!item) return;
        const top = item.getBoundingClientRect().top;
        if (Math.abs(top - previousTop) < 1) return;
        previousTop = top;
        const inset = Number.parseFloat(getComputedStyle(item).scrollMarginTop) || 0;
        rows.push({ top: Math.max(0, top + y - inset), projectIndex });
      });
      stopsRef.current = rows;
      const starts = rows.map(row => row.projectIndex);
      setRowStarts(current => current.length === starts.length &&
        current.every((index, row) => index === starts[row]) ? current : starts);
      update();
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(grid);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", update);
    };
  }, [view, onActiveChange]);

  return <section className="projects-grid-section" aria-label="All projects">
    <aside className="projects-grid__aside">
      {filters}
      <p>{settings.gridIntroduction}</p>
      <nav className="projects-grid__pagination" aria-label="Choose project row">
        <ProjectPagination projects={rowStarts.map(index => projects[index])} active={active} choose={chooseProject} />
      </nav>
      <ViewToggle view={view} setView={setView} labels={settings} />
    </aside>
    <div className="projects-grid__column"><ul ref={gridRef} className="projects-grid">
      {projects.map((project, index) => <li key={project.slug} ref={node => { itemsRef.current[index] = node; }}>
        <Link href={`/projects/${project.slug}`} className="projects-card">
          <span className="projects-card__image"><Image loader={imageLoader} unoptimized src={project.listingImage.url} width={project.listingImage.width} height={project.listingImage.height} sizes="(max-width: 767px) 90vw, 31vw" alt={project.listingAlt || `${project.name} project`} /></span>
          <span className="projects-card__details"><span className="projects-card__name">{project.name}</span><span className="projects-card__services">{project.services.map(service => <span key={service}>{service}</span>)}</span></span>
        </Link>
      </li>)}
    </ul></div>
  </section>;
}
