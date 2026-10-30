import type { CSSProperties } from "react";
import type { ProjectTheme } from "@/lib/project-theme";
export function ProjectBackdrop({ current, themes }: { current: number; themes: [ProjectTheme, ProjectTheme] }) {
  return <div className="projects-backdrop" aria-hidden="true">
    {themes.map((theme, index) => <span key={index} className={current === index ? "is-visible" : ""} style={{ "--project-color": theme.background, "--project-blob-one": theme.blobOne, "--project-blob-two": theme.blobTwo } as CSSProperties} />)}
  </div>;
}
