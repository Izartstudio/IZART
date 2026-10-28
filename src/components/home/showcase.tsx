import Link from "next/link";
import Image from "next/image";
import type { HomepageProject } from "@/sanity/projects";
import { PointToPixel } from "./point-to-pixel";
import { ShowcaseMotion } from "./showcase-motion.client";

export function Showcase({ projects }: { projects: HomepageProject[] }) {
  if (!projects.length) return null;

  return <ShowcaseMotion>
    <header className="showcase__intro">
      <h2 id="showcase-title" className="sr-only">Selected work</h2>
      <p>Here is a compilation of some recent standout projects we shipped.</p>
      <Link className="showcase__all" href="/projects">View All Work <span aria-hidden="true">→</span></Link>
    </header>
    <ol className="showcase__list">
      {projects.map((project, index) => <li key={`${project.slug}-${index}`}>
        <Link className={`showcase-card${project.homepageHoverVideo ? " showcase-card--has-hover-video" : ""}`} href={`/projects/${project.slug}`}>
          <span className="showcase-card__media">
            <Image src={project.homepageImage.url} width={project.homepageImage.width} height={project.homepageImage.height} sizes="(max-width: 767px) 74vw, 30vw" alt={`${project.name} project artwork`} />
            {project.homepageHoverVideo ? <video muted loop playsInline preload="auto" aria-hidden="true"><source src={project.homepageHoverVideo} /></video> : null}
          </span>
          <span className="showcase-card__overlay">
            <strong>{project.name}</strong>
            <span className="showcase-card__services">{project.services.slice(0, 2).map(service => <span key={service}>{service}</span>)}</span>
          </span>
        </Link>
      </li>)}
    </ol>
    <PointToPixel />
  </ShowcaseMotion>;
}
