"use client";

import Image, { type ImageLoaderProps } from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { ListingProject, ProjectsView } from "../project-types";
import type { PortfolioSettings } from "@/content/portfolio-page";
import { ViewToggle } from "../gallery/view-toggle";

const imageLoader = ({ src }: ImageLoaderProps) => src;

export function ProjectsGrid({ settings, projects, view, setView, onActiveChange }: { settings: PortfolioSettings; projects: ListingProject[]; view: ProjectsView; setView: (view: ProjectsView) => void; onActiveChange: (index: number) => void }) {
  const [active, setActive] = useState(0);
  const itemsRef = useRef<(HTMLLIElement | null)[]>([]);
  useEffect(() => {
    if (view !== "grid") return;
    const update = () => {
      const center = innerHeight * .48;
      let closest = 0, distance = Number.POSITIVE_INFINITY;
      itemsRef.current.forEach((item, index) => {
        if (!item) return;
        const bounds = item.getBoundingClientRect();
        const nextDistance = Math.abs(bounds.top + Math.min(bounds.height, innerHeight) * .42 - center);
        if (nextDistance < distance) { distance = nextDistance; closest = index; }
      });
      setActive(current => current === closest ? current : closest);
      onActiveChange(closest);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => { window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, [view, onActiveChange]);
  return <section className="projects-grid-section" aria-label="All projects">
    <aside className="projects-grid__aside">
      <p>{settings.gridIntroduction}</p>
      <nav className="projects-grid__pagination" aria-label="Project rows">
        {projects.filter((_, index) => index % 2 === 0).map((project, row) => <button
          key={project.slug} type="button" aria-label={`Scroll to ${project.name}`}
          aria-current={Math.floor(active / 2) === row ? "true" : undefined}
          onClick={() => itemsRef.current[row * 2]?.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" })}
        ><i /><i /><i /><i /></button>)}
      </nav>
      <ViewToggle view={view} setView={setView} labels={settings} />
    </aside>
    <div className="projects-grid__column"><ul className="projects-grid">
      {projects.map((project, index) => <li key={project.slug} ref={node => { itemsRef.current[index] = node; }}>
        <Link href={`/projects/${project.slug}`} className="projects-card">
          <span className="projects-card__image"><Image loader={imageLoader} unoptimized src={project.listingImage.url} width={project.listingImage.width} height={project.listingImage.height} sizes="(max-width: 767px) 90vw, 31vw" alt={project.listingAlt || `${project.name} project`} /></span>
          <span className="projects-card__details"><span className="projects-card__name">{project.name}</span><span className="projects-card__services">{project.services.map(service => <span key={service}>{service}</span>)}</span></span>
        </Link>
      </li>)}
    </ul></div>
  </section>;
}
