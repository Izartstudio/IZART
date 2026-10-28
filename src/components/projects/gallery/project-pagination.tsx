import type { KeyboardEvent } from "react";
import type { ListingProject } from "../project-types";

export function ProjectPagination({ projects, active, choose, interactive = true }: { projects: ListingProject[]; active: number; choose?: (index: number) => void; interactive?: boolean }) {
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!choose || !["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const index = event.key === "Home" ? 0 : event.key === "End" ? projects.length - 1 : (active + (event.key === "ArrowDown" ? 1 : -1) + projects.length) % projects.length;
    choose(index);
    event.currentTarget.querySelectorAll<HTMLButtonElement>("button")[index]?.focus();
  };
  return <div className="project-pagination" aria-label="Project position" onKeyDown={onKeyDown}>
    {projects.map((project, index) => <button className="project-pagination__stop" key={project.slug} type="button" aria-label={`Go to ${project.name}`} aria-current={active === index ? "true" : "false"} tabIndex={interactive ? 0 : -1} onClick={() => choose?.(index)} />)}
  </div>;
}

