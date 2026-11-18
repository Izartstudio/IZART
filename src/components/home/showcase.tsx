import Link from "next/link";
import Image from "next/image";
import type { HomepageProject } from "@/sanity/projects";
import { PointToPixel } from "./point-to-pixel";
import { ShowcaseMotion } from "./showcase-motion.client";

export function Showcase({ projects, latestWork }: { projects: HomepageProject[]; latestWork?: { heading?: string; introduction?: string } }) {
  if (!projects.length) return null;

  return <ShowcaseMotion projectCount={projects.length} bridge={latestWork ? undefined : <PointToPixel />} latestWork={Boolean(latestWork)}>
    <header className="showcase__intro">
      <h2 id="showcase-title" className={latestWork ? "showcase__heading" : "sr-only"}>{latestWork?.heading || "Selected work"}</h2>
      <p>{latestWork?.introduction || (latestWork ? "Every project is a chance to try something new. Look at something with a fresh perspective. Do something for the first time." : "Brand identities, digital products, and websites built to perform - explore Izart's work.")}</p>
      <Link className="showcase__all" href="/projects">View All Work <span aria-hidden="true">→</span></Link>
    </header>
    <ol className="showcase__list">
      {projects.map((project, index) => <li key={`${project.slug}-${index}`}>
        <Link className={`showcase-card${project.homepageHoverVideo ? " showcase-card--has-hover-video" : ""}${!latestWork && index === 0 ? " is-active" : ""}`} href={`/projects/${project.slug}`} aria-label={latestWork ? undefined : `View ${project.name} case study`}>
          <span className="showcase-card__media">
            <Image src={project.homepageImage.url} width={project.homepageImage.width} height={project.homepageImage.height} sizes="(max-width: 767px) 74vw, 30vw" alt={`${project.name} project artwork`} />
            {project.homepageHoverVideo ? <video muted loop playsInline preload="auto" aria-hidden="true"><source src={project.homepageHoverVideo} /></video> : null}
          </span>
          {latestWork ? <span className="showcase-card__overlay">
            <strong>{project.name}</strong>
            <span className="showcase-card__summary">{project.listingDescription}<span>{project.year}</span></span>
            <span className="showcase-card__services">{project.services.slice(0, 2).map(service => <span key={service}>{service}</span>)}</span>
          </span> : <span className="showcase-card__details">
            {project.listingDescription && <span className="showcase-card__description">{project.listingDescription}</span>}
            <span className="showcase-card__tags">{project.services.map(service => <span key={service}>{service}</span>)}</span>
          </span>}
        </Link>
      </li>)}
    </ol>
  </ShowcaseMotion>;
}
