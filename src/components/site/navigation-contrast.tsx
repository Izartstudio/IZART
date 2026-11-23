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
    let timer = 0;
    const targets = Array.from(nav.querySelectorAll<HTMLElement>(".site-nav__logo,.site-nav__links"));
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
      return light;
    };
    const update = (now: number) => {
      frame = 0;
      if (nav.classList.contains("is-hidden") || nav.classList.contains("is-menu-open")) return;
      last = now;
      const visible = targets.filter(target => target.getClientRects().length > 0);
      const tones = visible.map(sample);
      visible.forEach((target, index) => {
        const color = tones[index] ? "#0b0b0b" : "#fff";
        if (target.style.getPropertyValue("--site-nav-difference-color") === color) return;
        target.style.setProperty("--site-nav-difference-color", color);
        target.style.setProperty("--site-nav-logo-filter", tones[index] ? "invert(1)" : "none");
      });
    };
    const schedule = () => {
      if (frame || timer) return;
      const delay = Math.max(0, 80 - (performance.now() - last));
      if (!delay) frame = requestAnimationFrame(update);
      else timer = window.setTimeout(() => { timer = 0; frame = requestAnimationFrame(update); }, delay);
    };
    const state = new MutationObserver(schedule);
    state.observe(nav, { attributes: true, attributeFilter: ["class"] });
    nav.addEventListener("transitionend", schedule);
    schedule();
    addEventListener("scroll", schedule, { passive: true });
    addEventListener("resize", schedule);
    addEventListener("pageshow", schedule);
    return () => {
      cancelAnimationFrame(frame);
      clearTimeout(timer);
      state.disconnect();
      nav.removeEventListener("transitionend", schedule);
      removeEventListener("scroll", schedule); removeEventListener("resize", schedule); removeEventListener("pageshow", schedule);
      nav.querySelectorAll<HTMLElement>(".site-nav__logo,.site-nav__links").forEach(element => {
        element.style.removeProperty("--site-nav-difference-color"); element.style.removeProperty("--site-nav-logo-filter");
      });
    };
  }, [pathname]);
  return null;
}
