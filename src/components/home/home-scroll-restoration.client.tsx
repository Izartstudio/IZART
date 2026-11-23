"use client";

import { useLayoutEffect } from "react";

let savedScroll: number | undefined;

export function HomeScrollRestoration() {
  useLayoutEffect(() => {
    const previousPosition = savedScroll;
    // Run before paint, after Next's route scroll and the sticky sections' setup.
    const frame = requestAnimationFrame(() => {
      if (window.location.pathname !== "/" || window.location.hash) return;
      if (previousPosition !== undefined) window.scrollTo({ top: previousPosition, behavior: "instant" });
      savedScroll = window.scrollY;
    });
    const save = () => {
      if (window.location.pathname === "/") savedScroll = window.scrollY;
    };
    window.addEventListener("scroll", save, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", save);
    };
  }, []);

  return null;
}
