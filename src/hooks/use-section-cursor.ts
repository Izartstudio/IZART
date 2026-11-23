"use client";

import { useEffect, type RefObject } from "react";

/** Keep one cursor attached to the section while its content moves beneath it. */
export function useSectionCursor(
  hostRef: RefObject<HTMLElement | null>,
  cursorRef: RefObject<HTMLElement | null>,
  targetSelector: string,
) {
  useEffect(() => {
    const host = hostRef.current;
    const cursor = cursorRef.current;
    if (!host || !cursor) return;
    const fine = window.matchMedia("(any-hover: hover) and (any-pointer: fine)");
    let frame = 0;
    let x = 0;
    let y = 0;
    let inside = false;
    const hide = () => {
      cursor.classList.remove("is-visible");
      host.removeAttribute("data-cursor-visible");
    };
    const paint = () => {
      frame = 0;
      const target = document.elementFromPoint(x, y)?.closest(targetSelector);
      if (!inside || !fine.matches || document.hidden || !target || !host.contains(target)) {
        hide();
        return;
      }
      const bounds = host.getBoundingClientRect();
      cursor.style.transform = `translate3d(${x - bounds.left + host.scrollLeft}px,${y - bounds.top + host.scrollTop}px,0) translate(-50%,-50%)`;
      cursor.classList.add("is-visible");
      host.setAttribute("data-cursor-visible", "");
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(paint); };
    const move = (event: PointerEvent) => {
      inside = event.pointerType === "mouse";
      x = event.clientX;
      y = event.clientY;
      schedule();
    };
    const leave = () => { inside = false; hide(); };
    const panels = new MutationObserver(schedule);
    panels.observe(host, { subtree: true, attributes: true, attributeFilter: ["hidden", "data-cards-hidden"] });
    host.addEventListener("pointermove", move);
    host.addEventListener("pointerenter", move);
    host.addEventListener("pointerleave", leave);
    host.addEventListener("pointercancel", leave);
    window.addEventListener("scroll", schedule, true);
    window.addEventListener("resize", schedule);
    window.addEventListener("blur", leave);
    document.addEventListener("visibilitychange", leave);
    fine.addEventListener("change", leave);
    return () => {
      cancelAnimationFrame(frame);
      panels.disconnect();
      hide();
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerenter", move);
      host.removeEventListener("pointerleave", leave);
      host.removeEventListener("pointercancel", leave);
      window.removeEventListener("scroll", schedule, true);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("blur", leave);
      document.removeEventListener("visibilitychange", leave);
      fine.removeEventListener("change", leave);
    };
  }, [hostRef, cursorRef, targetSelector]);
}
