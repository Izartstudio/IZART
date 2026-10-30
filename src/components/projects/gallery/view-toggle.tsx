import type { ProjectsView } from "../project-types";

export function ViewToggle({ view, setView, labels }: { view: ProjectsView; setView: (view: ProjectsView) => void; labels: { galleryLabel: string; gridLabel: string } }) {
  return <div className="projects-toggle" role="group" aria-label="Project view">
    {(["gallery", "grid"] as const).map(option => <button key={option} type="button" aria-pressed={view === option} onClick={() => setView(option)}>{option === "gallery" ? labels.galleryLabel : labels.gridLabel}</button>)}
  </div>;
}

