"use client";
import { useEffect } from "react";
import { luminance } from "@/lib/project-theme";
export function ProjectNavigationTheme({ foreground }: { foreground: string }) {
  useEffect(() => {
    const nav = document.querySelector<HTMLElement>(".site-nav");
    if (!nav) return;
    const previous = nav.dataset.projectTone;
    nav.dataset.projectTone = luminance(foreground) < .5 ? "light" : "dark";
    return () => { if (previous === undefined) delete nav.dataset.projectTone; else nav.dataset.projectTone = previous; };
  }, [foreground]);
  return null;
}
