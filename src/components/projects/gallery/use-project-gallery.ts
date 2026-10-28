"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPaperRenderer, type PaperRenderer } from "../paper-renderer";
import type { ListingProject } from "../project-types";
import { DESKTOP_CARD_STEP, DESKTOP_EXIT_RUNWAY, MOBILE_CARD_STEP, MOBILE_EXIT_RUNWAY, MOBILE_QUERY } from "./constants";

type BackdropState = { current: number; colors: [string, string] };

export function useProjectGallery(projects: ListingProject[], enabled: boolean, colorsRef: React.RefObject<string[]>) {
  const [active, setActive] = useState(0);
  const initialColor = projects[0]?.listingColor || projects[0]?.background || "#132316";
  const [backdrop, setBackdrop] = useState<BackdropState>({ current: 0, colors: [initialColor, initialColor] });
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
  const imageSources = useMemo(() => projects.map(project => project.listingImage.url), [projects]);
  const sourceKey = imageSources.join("\u0000");

  const select = useCallback((index: number) => {
    if (activeRef.current === index) return;
    activeRef.current = index;
    setActive(index);
    const color = colorsRef.current[index] || projects[index]?.listingColor || projects[index]?.background || "#132316";
    setBackdrop(previous => {
      const next = 1 - previous.current;
      const colors: [string, string] = [...previous.colors];
      colors[next] = color;
      return { current: next, colors };
    });
  }, [colorsRef, projects]);

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
    const navRect = nav?.getBoundingClientRect();
    const clearance = navRect && navRect.height > 0 ? Math.max(0, navRect.bottom) + 12 : 96;
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
    const onColor = (event: Event) => {
      const { index, color } = (event as CustomEvent<{ index: number; color: string }>).detail;
      if (index !== activeRef.current) return;
      setBackdrop(previous => {
        if (previous.colors[previous.current] === color) return previous;
        const next = 1 - previous.current;
        const colors: [string, string] = [...previous.colors]; colors[next] = color;
        return { current: next, colors };
      });
    };
    window.addEventListener("iz-project-color", onColor);
    return () => window.removeEventListener("iz-project-color", onColor);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    try { rendererRef.current = createPaperRenderer(canvas, imageSources); }
    catch (error) { console.warn("IZART paper renderer fallback:", error); }
    const onTexture = () => requestRender();
    canvas.addEventListener("iz-texture-ready", onTexture);
    requestRender();
    return () => {
      cancelAnimationFrame(frameId.current);
      frameId.current = 0;
      lastTime.current = 0;
      canvas.removeEventListener("iz-texture-ready", onTexture);
      rendererRef.current?.dispose();
      rendererRef.current = null;
      canvas.dataset.painted = "false";
    };
    // sourceKey is the stable renderer lifecycle boundary; imageSources has the same contents.
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
