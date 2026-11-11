import type { ReactNode, Ref } from "react";

export function projectProgressLeft(progress: number) {
  return `calc(${progress * 100}% + ${(.5 - progress) * 1.21}px)`;
}

export function ProjectProgress({ count, active = 0, className, markerRef, children }: {
  count: number;
  active?: number;
  className?: string;
  markerRef?: Ref<HTMLSpanElement>;
  children?: ReactNode;
}) {
  if (!count) return null;

  return <div className={`project-progress ${className ?? ""}`} aria-hidden={children ? undefined : true}>
    <div className="showcase-progress__ticks" aria-hidden="true">
      {Array.from({ length: (count - 1) * 4 + 1 }, (_, index) => <i className={index % 4 === 0 ? "is-major" : ""} key={index} />)}
    </div>
    <span ref={markerRef} className="showcase-progress__marker" aria-hidden="true"
      style={{ left: projectProgressLeft(count > 1 ? active / (count - 1) : .5) }} />
    {children}
  </div>;
}
