"use client";

import { useEffect, useRef } from "react";

export function PointToPixel() {
  const hostRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const compact = window.matchMedia("(max-width: 991px)");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const steps = Array.from(host.querySelectorAll<HTMLElement>("[data-bridge-step]"));
    const connector = host.querySelector<HTMLElement>(".point-to-pixel__line-wrapper");
    let frame = 0;
    const update = () => {
      frame = 0;
      if (!compact.matches) return;
      // A selection owns its border and corners, so each box appears with its word.
      steps.forEach(step => {
        const threshold = window.innerHeight * .82;
        step.classList.toggle("is-active", motion.matches || step.getBoundingClientRect().top <= threshold);
      });
      if (connector) {
        const bounds = connector.getBoundingClientRect();
        const progress = motion.matches ? 1 : Math.min(1, Math.max(0, (window.innerHeight * .7 - bounds.top) / Math.max(1, bounds.height)));
        host.style.setProperty("--bridge-line-progress", String(progress));
      }
    };
    const requestUpdate = () => { if (!frame) frame = window.requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    window.addEventListener("pageshow", requestUpdate);
    motion.addEventListener("change", requestUpdate);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      window.removeEventListener("pageshow", requestUpdate);
      motion.removeEventListener("change", requestUpdate);
    };
  }, []);
  return <section ref={hostRef} className="point-to-pixel" aria-labelledby="point-to-pixel-title">
    <h2 id="point-to-pixel-title" className="sr-only">From point to pixel</h2>
    <div className="point-to-pixel__item">
      <BridgePhrase leading="From" selected="Point" leadingAt={0.08} selectedAt={0.2} borderAt={0.32} />
    </div>
    <div className="point-to-pixel__line-wrapper" data-bridge-step data-bridge-at="0.44" aria-hidden="true">
      <span className="point-to-pixel__line" />
    </div>
    <div className="point-to-pixel__item">
      <BridgePhrase leading="To" selected="Pixel" leadingAt={0.58} selectedAt={0.7} borderAt={0.82} pixel />
    </div>
  </section>;
}

function BridgePhrase({ leading, selected, leadingAt, selectedAt, borderAt, pixel = false }: { leading: string; selected: string; leadingAt: number; selectedAt: number; borderAt: number; pixel?: boolean }) {
  return <p className="point-to-pixel__phrase" aria-hidden="true">
    <span className="point-to-pixel__word" data-bridge-step data-bridge-at={leadingAt}>{leading}</span>{" "}
    <span className={`point-to-pixel__selection${pixel ? " is-pixel" : ""}`} data-bridge-step data-bridge-at={borderAt}>
      <span className="point-to-pixel__word" data-bridge-step data-bridge-at={selectedAt}>{selected}</span>
      <i className="selection-border selection-border--top" /><i className="selection-border selection-border--right" /><i className="selection-border selection-border--bottom" /><i className="selection-border selection-border--left" />
      <i className="corner corner--tl" /><i className="corner corner--tr" /><i className="corner corner--bl" /><i className="corner corner--br" />
    </span>
  </p>;
}
