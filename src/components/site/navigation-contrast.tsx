"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Read painted section backgrounds rather than blending against the nav's own blur layers. */
export function NavigationContrast() {
  const pathname = usePathname();
  useEffect(() => {
    const nav = document.querySelector<HTMLElement>(".site-nav");
    if (!nav) return;
    let frame = 0;
    let until = 0;
    let last = 0;
    const sample = (target: HTMLElement) => {
      const bounds = target.getBoundingClientRect();
      const x = bounds.left + bounds.width / 2;
      const y = nav.offsetHeight / 2;
      const layers = document.elementsFromPoint(x, y).filter(element => !element.closest(".site-nav,.menu-overlay"));
      const seen = new Set<Element>();
      let remaining = 1, r = 0, g = 0, b = 0;
      for (const layer of layers) {
        for (let element: Element | null = layer; element && remaining > .01; element = element.parentElement) {
          if (seen.has(element)) continue;
          seen.add(element);
          const color = getComputedStyle(element).backgroundColor.match(/[\d.]+/g)?.map(Number);
          if (!color || color.length < 3) continue;
          const alpha = (color[3] ?? 1) * remaining;
          r += color[0] * alpha; g += color[1] * alpha; b += color[2] * alpha;
          remaining -= alpha;
        }
        if (remaining < .01) break;
      }
      const linear = (value: number) => { const v = value / 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; };
      const light = .2126 * linear(r) + .7152 * linear(g) + .0722 * linear(b) > .179;
      target.style.setProperty("--site-nav-difference-color", light ? "#0b0b0b" : "#fff");
      target.style.setProperty("--site-nav-logo-filter", light ? "invert(1)" : "none");
    };
    const update = (now: number) => {
      frame = 0;
      if (now - last > 80) {
        last = now;
        nav.querySelectorAll<HTMLElement>(".site-nav__logo,.site-nav__links").forEach(sample);
      }
      if (now < until) frame = requestAnimationFrame(update);
    };
    const schedule = () => { until = performance.now() + 1200; if (!frame) frame = requestAnimationFrame(update); };
    schedule();
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    addEventListener("pageshow", schedule);
    return () => {
      cancelAnimationFrame(frame);
      removeEventListener("scroll", schedule); removeEventListener("resize", schedule); removeEventListener("pageshow", schedule);
      nav.querySelectorAll<HTMLElement>(".site-nav__logo,.site-nav__links").forEach(element => {
        element.style.removeProperty("--site-nav-difference-color"); element.style.removeProperty("--site-nav-logo-filter");
      });
    };
  }, [pathname]);
  return null;
}
