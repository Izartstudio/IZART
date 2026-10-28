"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { AboutIntroduction } from "./about-introduction";
import { ClientLogoStrip } from "./client-logo-strip";
import { StatsGrid } from "./stats-grid";

export function AboutStats({ children }: { children?: ReactNode }) {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    // Enter at top/top; leave only after moving clearly back above it.
    // This dead band prevents subpixel scrolling and elastic overscroll chatter.
    const exitThreshold = 48;
    const frequency = 9;
    let light = section.getBoundingClientRect().top <= 0;
    let position = light ? 1 : 0;
    let velocity = 0;
    let frame = 0;
    let previousTime: number | null = null;
    let needsMeasurement = false;
    let disposed = false;

    const paint = () => {
      section.style.setProperty("--about-theme-progress", String(position));
    };
    const render = (time: number) => {
      frame = 0;
      if (disposed) return;
      if (needsMeasurement) {
        needsMeasurement = false;
        const top = section.getBoundingClientRect().top;
        if (top <= 0) light = true;
        else if (top >= exitThreshold) light = false;
      }
      const target = light ? 1 : 0;
      // Exact critically damped spring integration: frame-rate independent,
      // with continuous velocity even when the scroll direction reverses.
      const dt = previousTime === null ? 0 : Math.min((time - previousTime) / 1000, .064);
      previousTime = time;
      if (motionQuery.matches) {
        position = target;
        velocity = 0;
      } else {
        const displacement = position - target;
        const impulse = velocity + frequency * displacement;
        const decay = Math.exp(-frequency * dt);
        position = target + (displacement + impulse * dt) * decay;
        velocity = (velocity - frequency * impulse * dt) * decay;
      }
      if (Math.abs(position - target) < .0001 && Math.abs(velocity) < .001) {
        position = target;
        velocity = 0;
      }
      paint();
      if (position !== target || velocity !== 0) frame = window.requestAnimationFrame(render);
      else previousTime = null;
    };
    const requestUpdate = () => {
      if (disposed) return;
      needsMeasurement = true;
      if (!frame) frame = window.requestAnimationFrame(render);
    };
    const resume = () => {
      previousTime = null;
      requestUpdate();
    };

    paint();
    const observer = new ResizeObserver(requestUpdate);
    observer.observe(document.body);
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    window.addEventListener("pageshow", resume);
    document.addEventListener("visibilitychange", resume);
    motionQuery.addEventListener("change", requestUpdate);

    return () => {
      disposed = true;
      observer.disconnect();
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      window.removeEventListener("pageshow", resume);
      document.removeEventListener("visibilitychange", resume);
      motionQuery.removeEventListener("change", requestUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  // About and the showreel share one painted surface, including during
  // interrupted transitions. Neither child can expose a differently colored seam.
  return <div ref={sectionRef} className="about-theme">
    <section className="about-stats" aria-label="About Izart and company statistics">
      <AboutIntroduction />
      <ClientLogoStrip />
      <StatsGrid />
    </section>
    {children}
  </div>;
}
