import { SiteButton } from "@/components/site/site-button";
import Link from "next/link";
import Image from "next/image";
import type { HomepageProject } from "@/sanity/projects";
import { PointToPixel } from "./point-to-pixel";
import { ShowcaseMotion } from "./showcase-motion.client";

export function Showcase({ projects, latestWork, variant = "home" }: { projects: HomepageProject[]; variant?: "home" | "industries"; latestWork?: { heading?: string; introduction?: string } }) {
  if (!projects.length) return null;

  const intro = <header className="showcase__intro">
      <h2 id="showcase-title" className={latestWork ? "showcase__heading" : "sr-only"}>{latestWork?.heading || "Selected work"}</h2>
      <p>{latestWork?.introduction || (latestWork ? "Every project is a chance to try something new. Look at something with a fresh perspective. Do something for the first time." : "Brand identities, digital products, and websites built to perform - explore Izart's work.")}</p>
      <SiteButton custom className="site-button showcase__all" href="/projects">View All Work <span aria-hidden="true">→</span></SiteButton>
    </header>;

  return <ShowcaseMotion projectCount={projects.length} bridge={!latestWork && variant === "home" ? <PointToPixel /> : undefined} latestWork={Boolean(latestWork)} header={variant === "industries" ? intro : undefined}>
    {variant === "home" && intro}
    <ol className="showcase__list">
      {projects.map((project, index) => <li key={`${project.slug}-${index}`}>
        <Link className={`showcase-card${project.homepageHoverVideo ? " showcase-card--has-hover-video" : ""}`} href={`/projects/${project.slug}`} aria-label={latestWork ? undefined : `View ${project.name} case study`}>
          <span className="showcase-card__media" data-artwork={project.homepageImage.url}>
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
