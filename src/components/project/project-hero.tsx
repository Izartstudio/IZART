import type { Project } from "@/content/project";
import { ProjectImageView } from "./project-image";
export function ProjectHero({ project }: { project: Project }) {
  return <header className="project-hero">
    <div className="project-hero__main">
      <div className="project-hero__copy">
        {project.year.trim() && <p className="project-hero__year">{project.year}</p>}
        <h1>{project.name}</h1>
        <p className="project-hero__intro">{project.introduction}</p>
      </div>
      {project.logo && <ProjectImageView image={project.logo} alt={`${project.client} logo`} sizes="(max-width: 800px) 180px, 240px" className="project-hero__logo" />}
    </div>
    <ul className="project-hero__services" aria-label="Project services">{project.services.map(service => <li key={service}>{service}</li>)}</ul>
  </header>;
}
