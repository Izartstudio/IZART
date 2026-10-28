"use client";

import { useEffect, useRef } from "react";

const clamp = (value: number) => Math.min(1, Math.max(0, value));

export function VideoExpansion() {
  const sectionRef = useRef<HTMLElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const frame = frameRef.current;
    if (!section || !frame) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let current = 0;
    let target = 0;
    let animationFrame = 0;

    const paint = () => {
      animationFrame = 0;
      current += (target - current) * .14;

      if (Math.abs(target - current) < .001) current = target;
      frame.style.setProperty("--video-size", `${50 + current * 50}%`);

      if (current !== target) animationFrame = window.requestAnimationFrame(paint);
    };

    const update = () => {
      if (reducedMotion.matches) {
        frame.style.setProperty("--video-size", "100%");
        return;
      }

      const bounds = section.getBoundingClientRect();
      const travel = Math.max(section.offsetHeight - window.innerHeight, 1);
      target = clamp(-bounds.top / travel);

      if (!animationFrame) animationFrame = window.requestAnimationFrame(paint);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    reducedMotion.addEventListener("change", update);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      reducedMotion.removeEventListener("change", update);
      if (animationFrame) window.cancelAnimationFrame(animationFrame);
    };
  }, []);

  return <section ref={sectionRef} className="video-expansion" aria-label="Izart studio showreel">
    <div className="video-expansion__sticky">
      <div ref={frameRef} className="video-expansion__frame">
        <iframe
          className="video-expansion__video video-expansion__video--desktop"
          src="https://player.vimeo.com/video/1188988623?background=1&autoplay=1&loop=1&muted=1"
          title="Izart studio showreel"
          allow="autoplay; fullscreen; picture-in-picture"
          loading="lazy"
        />
        <iframe
          className="video-expansion__video video-expansion__video--mobile"
          src="https://player.vimeo.com/video/1188988490?background=1&autoplay=1&loop=1&muted=1"
          title="Izart studio mobile showreel"
          allow="autoplay; fullscreen; picture-in-picture"
          loading="lazy"
        />
      </div>
    </div>
  </section>;
}
