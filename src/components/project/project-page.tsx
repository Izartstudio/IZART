import type { Project } from "@/content/project";
import { ProjectHero } from "./project-hero";
import { ProjectImageView } from "./project-image";
import { ProjectVideo } from "./project-video";
import { ProjectDetails } from "./project-details";

function MediaStream({ project, eager = false }: { project: Project; eager?: boolean }) {
  return <>{project.media.map((panel, index) => <div className="project-panel" key={panel._key}>
    {panel._type === "imagePanel" ? <ProjectImageView image={panel.image} mobileImage={panel.mobileImage} alt={panel.decorative ? "" : panel.alt} eager={eager && index === 0} /> : <ProjectVideo panel={panel} />}
  </div>)}</>;
}

export function ProjectPageView({ project }: { project: Project }) {
  return <main id="main" className="project"><article>
    <ProjectHero project={project} />
    <ProjectDetails project={project}><MediaStream project={project} eager /></ProjectDetails>
  </article></main>;
}
