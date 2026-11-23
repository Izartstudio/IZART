"use client";

import { useRef, type RefObject } from "react";
import { useSectionCursor } from "@/hooks/use-section-cursor";
import styles from "./services-showcase.module.css";

export function ServiceSectionCursor({ stageRef }: { stageRef: RefObject<HTMLDivElement | null> }) {
  const cursorRef = useRef<HTMLSpanElement>(null);
  useSectionCursor(stageRef, cursorRef, "[data-service-cursor-target]");
  return <span ref={cursorRef} className={styles.serviceCursor} aria-hidden="true">
    <svg viewBox="0 0 108 108" fill="none" aria-hidden="true"><circle cx="54" cy="54" r="49" stroke="currentColor" strokeOpacity=".45" strokeWidth=".6" strokeDasharray="7 8" /></svg>
    <span>LEARN<br />MORE →</span>
  </span>;
}
