"use client";

import { useEffect, useRef, useState } from "react";

type Stat = { _key: string; label: string; value: number; suffix?: string };

export function OutcomeStats({ stats }: { stats: Stat[] }) {
  const list = useRef<HTMLDListElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!list.current || !("IntersectionObserver" in window) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const body = list.current.nextElementSibling;
    body?.setAttribute("data-reveal", "pending");
    const bodyObserver = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      body?.setAttribute("data-reveal", "visible");
      bodyObserver.disconnect();
    }, { rootMargin: "0px 0px -35px" });
    if (body) bodyObserver.observe(body);
    let frame = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      const start = performance.now();
      const animate = (now: number) => {
        const elapsed = Math.min(1, (now - start) / 750);
        setProgress(1 - (1 - elapsed) ** 3);
        if (elapsed < 1) frame = requestAnimationFrame(animate);
      };
      frame = requestAnimationFrame(animate);
    }, { threshold: .2 });
    observer.observe(list.current);
    return () => {
      observer.disconnect();
      bodyObserver.disconnect();
      body?.removeAttribute("data-reveal");
      cancelAnimationFrame(frame);
    };
  }, []);

  return <dl ref={list} className="outcome-stats">
    {stats.map(stat => <div key={stat._key}>
      <dt>{stat.label}</dt>
      <dd>
        <span className="sr-only">{stat.value}{stat.suffix}</span>
        <span className="outcome-stats__animated" aria-hidden="true">{Math.round(stat.value * progress)}{stat.suffix}</span>
        <span className="outcome-stats__static" aria-hidden="true">{stat.value}{stat.suffix}</span>
      </dd>
    </div>)}
  </dl>;
}
