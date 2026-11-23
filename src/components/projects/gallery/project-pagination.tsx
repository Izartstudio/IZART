import { ScrollIndicator, projectProgressLeft } from "@/components/site/scroll-indicator";
import type { KeyboardEvent } from "react";
import type { ListingProject } from "../project-types";

export function ProjectPagination({ projects, active, choose, interactive = true }: { projects: ListingProject[]; active: number; choose?: (index: number) => void; interactive?: boolean }) {
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!choose || !["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("button"));
    const focused = buttons.findIndex(button => button === event.target);
    const current = focused < 0 ? active : focused;
    const index = event.key === "Home" ? 0 : event.key === "End" ? projects.length - 1 : (current + (["ArrowDown", "ArrowRight"].includes(event.key) ? 1 : -1) + projects.length) % projects.length;
    choose(index);
    buttons[index]?.focus({ preventScroll: true });
  };
  return <div className="project-pagination" onKeyDown={onKeyDown}>
    <ScrollIndicator variant="ruler" count={projects.length} active={active}>
      {projects.map((project, index) => <button
        className="project-pagination__stop" key={project.slug} type="button"
        aria-label={`Go to ${project.name}`} aria-current={active === index ? "true" : undefined}
        tabIndex={interactive ? 0 : -1} onClick={() => choose?.(index)}
        style={{
          left: projectProgressLeft(projects.length > 1 ? index / (projects.length - 1) : .5),
          width: `min(40px, ${100 / projects.length}%)`,
        }}
      />)}
    </ScrollIndicator>
  </div>;
}
