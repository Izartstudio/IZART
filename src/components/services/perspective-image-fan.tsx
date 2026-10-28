"use client";

import Image from "next/image";
import { useEffect, useRef, type CSSProperties } from "react";
import type { ServicesHeroImage } from "@/sanity/services";
import { FAN_INTRO_MS, FAN_START_MS, FAN_STEP_MS, fanBounds, fanEntrance, sampleFan, type FanLayout } from "./fan-motion";

type Props = { images: ServicesHeroImage[]; layout?: FanLayout };

function panelStyle(panel: ReturnType<typeof sampleFan>): CSSProperties {
  return {
    transform: `translate3d(${panel.x}cqw,${panel.y}cqh,0)`,
    width: `${panel.width}%`, height: `${panel.height}%`, opacity: panel.opacity,
    clipPath: `polygon(${Array.from({ length: 4 }, (_, i) => `${panel.corners[i * 2]}% ${panel.corners[i * 2 + 1]}%`).join(",")})`,
  };
}

/** One visible-time clock owns every panel; React never drives animation frames. */
export function PerspectiveImageFan({ images, layout = "fan" }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const visibleImages = images.slice(0, 7);
  const { min, max } = fanBounds(layout);
  const count = visibleImages.length;
  // Buffers on both sides repeat the source sequence, including short CMS lists.
  const panels = count ? Array.from({ length: count + max - min + 1 }, (_, i) => {
    const position = i + min;
    return { position, image: visibleImages[((position % count) + count) % count] };
  }) : [];

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !count) return;
    const nodes = Array.from(host.querySelectorAll<HTMLElement>(".services-fan__slot"));
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let elapsed = 0;
    let previousTime: number | null = null;
    let frame = 0;
    let inView = true;
    let focused = true;
    let disposed = false;

    const paint = () => {
      const phase = motion.matches ? 0 : Math.max(0, elapsed - FAN_START_MS) / FAN_STEP_MS % count;
      const entrance = motion.matches || elapsed >= FAN_INTRO_MS ? 1 : fanEntrance(elapsed / FAN_INTRO_MS);
      nodes.forEach((node, index) => {
        const position = index + min - phase;
        const hidden = position <= min || position >= max;
        node.style.visibility = hidden ? "hidden" : "visible";
        if (hidden) return;
        const panel = sampleFan(position, layout);
        const style = panelStyle(panel);
        // Match the original entrance, with the translation outside the layout
        // transform so it cannot fight the circulating motion.
        const scale = panel.entryScale + (1 - panel.entryScale) * entrance;
        node.style.transform = `${style.transform} translateX(${panel.entryX * (1 - entrance)}%) scale(${scale})`;
        node.style.width = String(style.width);
        node.style.height = String(style.height);
        node.style.clipPath = String(style.clipPath);
        node.style.opacity = String(panel.opacity * entrance);
      });
    };
    const running = () => !disposed && !document.hidden && focused && inView && !motion.matches;
    const tick = (time: number) => {
      frame = 0;
      if (!running()) return;
      // Never consume hidden time or catch up after a stalled frame.
      if (previousTime !== null) elapsed += Math.max(0, Math.min(time - previousTime, 40));
      previousTime = time;
      paint();
      frame = window.requestAnimationFrame(tick);
    };
    const reconcile = () => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      previousTime = null;
      if (motion.matches) paint();
      if (running()) frame = window.requestAnimationFrame(tick);
    };
    const blur = () => { focused = false; reconcile(); };
    const focus = () => { focused = true; reconcile(); };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      reconcile();
    });
    observer.observe(host);
    document.addEventListener("visibilitychange", reconcile);
    window.addEventListener("blur", blur);
    window.addEventListener("focus", focus);
    window.addEventListener("pageshow", focus);
    motion.addEventListener("change", reconcile);
    paint();
    reconcile();
    return () => {
      disposed = true;
      if (frame) window.cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener("visibilitychange", reconcile);
      window.removeEventListener("blur", blur);
      window.removeEventListener("focus", focus);
      window.removeEventListener("pageshow", focus);
      motion.removeEventListener("change", reconcile);
    };
  }, [count, layout, min, max, images]);

  return <div ref={hostRef} className="services-fan" aria-hidden="true">
    {panels.map(({ image, position }) => <div className="services-fan__slot" key={position} style={{ ...panelStyle(sampleFan(position, layout)), opacity: 0 }}>
      <Image src={image.url} alt="" fill sizes="(max-width: 700px) 55vw, 25vw"
        loading="eager"
        fetchPriority={position === 3 ? "high" : "auto"}
        unoptimized={image.url.startsWith("http")}
        style={{ objectFit: "cover", objectPosition: image.position || "center" }} />
    </div>)}
  </div>;
}
