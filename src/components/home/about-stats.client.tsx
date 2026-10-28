"use client";

import { useEffect, useRef } from "react";
import { AboutIntroduction } from "./about-introduction";
import { ClientLogoStrip } from "./client-logo-strip";
import { StatsGrid } from "./stats-grid";

export function AboutStats() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let frame = 0;

    const updateTheme = () => {
      frame = 0;
      // Match the live site's "top top" trigger: the transition only starts
      // once the fixed navbar is fully over this section.
      section.classList.toggle("is-light", section.getBoundingClientRect().top <= 0);
    };

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateTheme);
    };

    updateTheme();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return <section ref={sectionRef} className="about-stats" aria-label="About Izart and company statistics">
    <AboutIntroduction />
    <ClientLogoStrip />
    <StatsGrid />
  </section>;
}
