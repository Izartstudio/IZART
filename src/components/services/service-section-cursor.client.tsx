"use client";

import { useEffect, useRef, type RefObject } from "react";
import styles from "./services-showcase.module.css";

export function ServiceSectionCursor({ stageRef }: { stageRef: RefObject<HTMLDivElement | null> }) {
  const cursorRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const stage = stageRef.current, cursor = cursorRef.current;
    if (!stage || !cursor) return;
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    let frame = 0;
    let inside = false;
    let x = 0, y = 0;
    const hide = () => { delete stage.dataset.cursorVisible; };
    const paint = () => {
      frame = 0;
      if (!inside || !finePointer.matches || document.hidden) { hide(); return; }
      const bounds = stage.getBoundingClientRect();
      const target = document.elementFromPoint(x, y);
      if (x < bounds.left || x > bounds.right || y < bounds.top || y > bounds.bottom || !target || !stage.contains(target)) { hide(); return; }
      cursor.style.transform = `translate3d(${x - bounds.left - 54}px,${y - bounds.top - 54}px,0)`;
      stage.dataset.cursorVisible = "true";
    };
    const requestPaint = () => { if (!frame) frame = window.requestAnimationFrame(paint); };
    const move = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") { inside = false; hide(); return; }
      inside = true; x = event.clientX; y = event.clientY; requestPaint();
    };
    const leave = () => { inside = false; hide(); };
    stage.addEventListener("pointerenter", move);
    stage.addEventListener("pointermove", move);
    stage.addEventListener("pointerleave", leave);
    window.addEventListener("scroll", requestPaint, { passive: true });
    window.addEventListener("resize", requestPaint);
    window.addEventListener("blur", leave);
    document.addEventListener("visibilitychange", leave);
    finePointer.addEventListener("change", leave);
    return () => {
      window.cancelAnimationFrame(frame); hide();
      stage.removeEventListener("pointerenter", move);
      stage.removeEventListener("pointermove", move);
      stage.removeEventListener("pointerleave", leave);
      window.removeEventListener("scroll", requestPaint);
      window.removeEventListener("resize", requestPaint);
      window.removeEventListener("blur", leave);
      document.removeEventListener("visibilitychange", leave);
      finePointer.removeEventListener("change", leave);
    };
  }, [stageRef]);
  return <span ref={cursorRef} className={styles.serviceCursor} aria-hidden="true">
    <svg viewBox="0 0 108 108" fill="none" aria-hidden="true"><circle cx="54" cy="54" r="49" stroke="currentColor" strokeOpacity=".45" strokeWidth=".6" strokeDasharray="7 8" /></svg>
    <span>LEARN<br />MORE →</span>
  </span>;
}
