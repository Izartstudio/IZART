"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getImageProps } from "next/image";
import { createPaperRenderer, type PaperRenderer } from "../paper-renderer";
import type { ListingProject } from "../project-types";
import { DESKTOP_CARD_STEP, DESKTOP_EXIT_RUNWAY, MOBILE_CARD_STEP, MOBILE_EXIT_RUNWAY, MOBILE_QUERY } from "./constants";

import { createProjectTheme, type ProjectTheme } from "@/lib/project-theme";
type BackdropState = { current: number; themes: [ProjectTheme, ProjectTheme] };

export function useProjectGallery(projects: ListingProject[], enabled: boolean) {
  const [active, setActive] = useState(0);
  const initialTheme = projects[0]?.theme || createProjectTheme([]);
  const [backdrop, setBackdrop] = useState<BackdropState>({ current: 0, themes: [initialTheme, initialTheme] });
  const hostRef = useRef<HTMLElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<PaperRenderer | null>(null);
  const enabledRef = useRef(enabled);
  const activeRef = useRef(0);
  const targetProgress = useRef(0);
  const displayProgress = useRef(0);
  const lastTime = useRef(0);
  const frameId = useRef(0);
  const scrollStart = useRef(0);
  const scrollDistance = useRef(1);
  const viewport = useRef({ width: 0, height: 0 });
  // WebGL needs CORS-clean textures. Normal <img> elements can display an
  // external asset even when that same response is forbidden as a GL texture.
  // Next's existing allowlisted optimizer gives the renderer same-origin URLs.
  const imageSources = useMemo(() => projects.map(project => getImageProps({
    src: project.listingImage.url,
    width: Math.min(1920, project.listingImage.width),
    height: Math.max(1, Math.round(project.listingImage.height * Math.min(1920, project.listingImage.width) / project.listingImage.width)),
    alt: "", quality: 75,
  }).props.src), [projects]);
  const sourceKey = imageSources.join("\u0000");

  const select = useCallback((index: number) => {
    if (activeRef.current === index) return;
    activeRef.current = index;
    setActive(index);
    const theme = projects[index]?.theme || createProjectTheme([]);
    setBackdrop(previous => {
      const next = 1 - previous.current;
      const themes: [ProjectTheme, ProjectTheme] = [...previous.themes];
      themes[next] = theme;
      return { current: next, themes };
    });
  }, [projects]);

  const requestRender = useCallback(() => {
    if (frameId.current || !enabledRef.current) return;
    function tick(time: number) {
      frameId.current = 0;
      if (!enabledRef.current) return;
      const renderer = rendererRef.current;
      const dt = Math.min(48, Math.max(1, time - (lastTime.current || time - 16)));
      lastTime.current = time;
      if (!renderer) displayProgress.current = Math.round(targetProgress.current);
      else {
        const smoothing = 1 - Math.exp(-dt * .016);
        displayProgress.current += (targetProgress.current - displayProgress.current) * smoothing;
        if (Math.abs(targetProgress.current - displayProgress.current) < .00006) displayProgress.current = targetProgress.current;
      }
      select(Math.min(projects.length - 1, Math.max(0, Math.round(displayProgress.current))));
      const painted = renderer?.render(displayProgress.current) ?? false;
      if (canvasRef.current) canvasRef.current.dataset.painted = String(painted);
      if (Math.abs(targetProgress.current - displayProgress.current) > .00006) frameId.current = requestAnimationFrame(tick);
    }
    frameId.current = requestAnimationFrame(tick);
  }, [projects.length, select]);

  const updateTarget = useCallback(() => {
    if (!enabledRef.current) return;
    const normalized = Math.min(1, Math.max(0, (window.scrollY - scrollStart.current) / scrollDistance.current));
    targetProgress.current = normalized * Math.max(0, projects.length - 1);
    requestRender();
  }, [projects.length, requestRender]);

  const measure = useCallback(() => {
    const host = hostRef.current, gallery = galleryRef.current;
    if (!host || !gallery || !enabledRef.current) return;
    const nav = document.querySelector<HTMLElement>(".site-nav");
    // The nav's hide/show transform must not resize or reposition the gallery.
    // Reserve its original layout height even when returning with a hidden nav.
    const clearance = nav && nav.offsetHeight > 0 ? nav.offsetHeight + 12 : 96;
    host.style.setProperty("--projects-nav-offset", `${clearance}px`);
    const offset = Number.parseFloat(getComputedStyle(gallery).top) || 0;
    scrollStart.current = Math.max(0, host.getBoundingClientRect().top + window.scrollY - offset);
    const mobile = matchMedia(MOBILE_QUERY).matches;
    const cardStep = gallery.offsetHeight * (mobile ? MOBILE_CARD_STEP : DESKTOP_CARD_STEP);
    scrollDistance.current = Math.max(1, Math.max(0, projects.length - 1) * cardStep);
    const exitRunway = gallery.offsetHeight * (mobile ? MOBILE_EXIT_RUNWAY : DESKTOP_EXIT_RUNWAY);
    host.style.height = `${gallery.offsetHeight + scrollDistance.current + exitRunway}px`;
    rendererRef.current?.resize();
    updateTarget();
  }, [projects.length, updateTarget]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const stop = () => {
      cancelAnimationFrame(frameId.current);
      frameId.current = 0;
      lastTime.current = 0;
    };
    const start = () => {
      stop();
      canvas.dataset.painted = "false";
      rendererRef.current?.dispose();
      rendererRef.current = null;
      if (!motion.matches) {
        try { rendererRef.current = createPaperRenderer(canvas, imageSources); }
        catch (error) { console.warn("IZART paper renderer fallback:", error); }
      }
      requestRender();
    };
    const resume = () => {
      if (document.hidden) { stop(); return; }
      stop();
      // Repaint after history/tab restoration even when scroll progress is unchanged.
      measure();
      requestRender();
    };
    const lost = (event: Event) => {
      event.preventDefault(); stop(); canvas.dataset.painted = "false";
    };
    const onTexture = () => requestRender();
    canvas.addEventListener("iz-texture-ready", onTexture);
    canvas.addEventListener("webglcontextlost", lost);
    canvas.addEventListener("webglcontextrestored", start);
    window.addEventListener("pageshow", resume);
    document.addEventListener("visibilitychange", resume);
    motion.addEventListener("change", start);
    // Restore the original initialization order. Geometry is measured on the
    // following animation frame, after the sticky gallery has its layout.
    start();
    return () => {
      stop();
      canvas.removeEventListener("iz-texture-ready", onTexture);
      canvas.removeEventListener("webglcontextlost", lost);
      canvas.removeEventListener("webglcontextrestored", start);
      window.removeEventListener("pageshow", resume);
      document.removeEventListener("visibilitychange", resume);
      motion.removeEventListener("change", start);
      rendererRef.current?.dispose(); rendererRef.current = null;
      canvas.dataset.painted = "false";
    };
    // The renderer depends on the cover sources, not palette or text updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceKey]);

  useEffect(() => {
    enabledRef.current = enabled;
    if (!enabled) {
      cancelAnimationFrame(frameId.current);
      frameId.current = 0;
      return;
    }
    const start = requestAnimationFrame(() => { measure(); requestRender(); });
    return () => cancelAnimationFrame(start);
  }, [enabled, measure, requestRender]);

  useEffect(() => {
    let disposed = false;
    let measurementFrame = 0;
    const scheduleMeasure = () => {
      if (disposed || measurementFrame) return;
      measurementFrame = requestAnimationFrame(() => {
        measurementFrame = 0;
        measure();
      });
    };
    const onScroll = () => updateTarget();
    const onResize = () => {
      const widthChanged = innerWidth !== viewport.current.width;
      const heightChanged = Math.abs(innerHeight - viewport.current.height) > 2;
      if (!widthChanged && matchMedia("(pointer: coarse)").matches) return;
      if (!widthChanged && !heightChanged) return;
      viewport.current = { width: innerWidth, height: innerHeight };
      scheduleMeasure();
    };
    viewport.current = { width: innerWidth, height: innerHeight };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    const nav = document.querySelector<HTMLElement>(".site-nav");
    const observer = nav && window.ResizeObserver ? new ResizeObserver(scheduleMeasure) : null;
    if (nav && observer) observer.observe(nav);

    document.fonts?.ready.then(scheduleMeasure);
    return () => {
      disposed = true;
      cancelAnimationFrame(measurementFrame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      observer?.disconnect();
      cancelAnimationFrame(frameId.current);
      // Strict Mode replays effects. A cancelled ID must never block the new loop.
      frameId.current = 0;
      lastTime.current = 0;
    };
  }, [measure, updateTarget]);

  const goTo = useCallback((index: number) => {
    const destination = Math.min(projects.length - 1, Math.max(0, Math.round(index)));
    const top = Math.max(0, scrollStart.current + scrollDistance.current * destination / Math.max(1, projects.length - 1));
    window.scrollTo({ top, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }, [projects.length]);

  return { active, backdrop, hostRef, galleryRef, canvasRef, goTo };
}
