import type { ProjectsView } from "../project-types";

export function ViewToggle({ view, setView }: { view: ProjectsView; setView: (view: ProjectsView) => void }) {
  return <div className="projects-toggle" role="group" aria-label="Project view">
    {(["gallery", "grid"] as const).map(option => <button key={option} type="button" aria-pressed={view === option} onClick={() => setView(option)}>{option === "gallery" ? "Gallery View" : "Grid View"}</button>)}
  </div>;
}

