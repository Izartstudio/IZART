"use client";

import { useEffect, useRef } from "react";

export function VideoExpansion() {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    const wrapper = layer?.parentElement;
    const preview = wrapper?.querySelector(".about-stats__video-slot");
    const showreel = wrapper?.querySelector(".video-expansion");
    if (!layer || !wrapper || !preview || !showreel) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const paint = () => {
      frame = 0;
      const bounds = layer.getBoundingClientRect();
      const small = preview.getBoundingClientRect();
      const large = showreel.getBoundingClientRect();
      const range = bounds.height * .55;
      const progress = Math.max(0, Math.min(1, 1 - large.top / Math.max(1, range)));
      const reduced = reducedMotion.matches;
      const blend = reduced ? Number(large.top <= 0) : progress * progress * (3 - 2 * progress);
      const interpolate = (from: number, to: number) => from + (to - from) * blend;
      const previewTop = reduced ? small.top : Math.max(small.top, Math.min(
        (bounds.height - small.height) / 2,
        large.top - small.height,
      ));

      const width = interpolate(small.width, large.width);
      const height = interpolate(small.height, large.height);
      const centerX = interpolate(small.left + small.width / 2, large.left + large.width / 2);
      const centerY = interpolate(previewTop + small.height / 2, large.top + large.height / 2);

      layer.style.setProperty("--showreel-x", `${centerX - width / 2 - bounds.left}px`);
      layer.style.setProperty("--showreel-y", `${centerY - height / 2 - bounds.top}px`);
      layer.style.setProperty("--showreel-width", `${width}px`);
      layer.style.setProperty("--showreel-height", `${height}px`);
      // Scale the running player as a unit so Vimeo never has to resize mid-transition.
      for (const [variant, aspect] of [["desktop", 16 / 9], ["mobile", 9 / 16]] as const) {
        const playerWidth = Math.max(large.width, large.height * aspect, 1);
        const scale = Math.max(width, height * aspect) / playerWidth;
        layer.style.setProperty(`--showreel-${variant}-width`, `${playerWidth}px`);
        layer.style.setProperty(`--showreel-${variant}-scale`, String(scale));
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(paint);
    };

    let nearby = false;
    const visibility = new IntersectionObserver(([entry]) => {
      nearby = entry.isIntersecting;
      schedule();
    }, { rootMargin: "100% 0px" });
    visibility.observe(wrapper);
    const onScroll = () => { if (nearby) schedule(); };
    paint();
    const observer = new ResizeObserver(schedule);
    observer.observe(wrapper);
    observer.observe(preview);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", schedule);
    reducedMotion.addEventListener("change", schedule);
    return () => {
      visibility.disconnect();
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", schedule);
      reducedMotion.removeEventListener("change", schedule);
      cancelAnimationFrame(frame);
    };
  }, []);

  return <div ref={layerRef} className="showreel-layer">
    <div className="video-expansion__frame">
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
  </div>;
}
