"use client";

import { useEffect, useRef, useState } from "react";

export function CareersDivider({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: "0px 0px -12%", threshold: 0.15 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return <span ref={ref} className={`careers-divider ${visible ? "is-drawn" : ""} ${className}`} aria-hidden="true">
    <svg viewBox="0 0 2 100" preserveAspectRatio="none"><path pathLength="1" d="M1 0V100" /></svg>
  </span>;
}
