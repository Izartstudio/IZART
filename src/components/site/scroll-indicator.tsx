import type { ReactNode, Ref } from "react";

type ProjectRuler = {
  variant: "ruler";
  count: number;
  active?: number;
  className?: string;
  markerRef?: Ref<HTMLSpanElement>;
  children?: ReactNode;
};
export function ScrollIndicator(props: ProjectRuler | { variant?: "cue" } = {}) {
  if (props.variant === "ruler") return <ProjectRulerView {...props} />;
  return <span className="home-hero__scroll" aria-hidden="true">
    <i />
    <svg viewBox="0 0 22 40" fill="none">
      <path d="m14.091 30.534-3.29 3.3-3.301-3.3.474-.464 2.5 2.499v-6.064h.664v6.064l2.5-2.489.453.454Z" fill="currentColor" />
    </svg>
  </span>;
}

export function projectProgressLeft(progress: number) {
  return `calc(${progress * 100}% + ${(.5 - progress) * 1.21}px)`;
}

function ProjectRulerView({ count, active = 0, className, markerRef, children }: ProjectRuler) {
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
