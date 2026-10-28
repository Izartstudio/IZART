import type { CSSProperties } from "react";

export function ProjectBackdrop({ current, colors }: { current: number; colors: [string, string] }) {
  return <div className="projects-backdrop" aria-hidden="true">
    {colors.map((color, index) => <span key={index} className={current === index ? "is-visible" : ""} style={{ "--project-color": color } as CSSProperties} />)}
  </div>;
}

