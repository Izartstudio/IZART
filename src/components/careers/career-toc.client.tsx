"use client";

import { useEffect, useMemo, useState } from "react";

const baseItems = [
  ["about", "About Us"],
  ["team", "The Team"],
  ["responsibilities", "What You’ll Do"],
] as const;

export function CareerToc({ hasRequirements }: { hasRequirements: boolean }) {
  const items = useMemo(() => hasRequirements ? [...baseItems, ["requirements", "Job Requirements"] as const] : [...baseItems], [hasRequirements]);
  const [active, setActive] = useState<string>(items[0][0]);

  useEffect(() => {
    const sections = items.map(([id]) => document.getElementById(id)).filter((node): node is HTMLElement => Boolean(node));
    const update = () => {
      const marker = Math.min(window.innerHeight * 0.32, 220);
      let current = sections[0]?.id || items[0][0];
      for (const section of sections) if (section.getBoundingClientRect().top <= marker) current = section.id;
      setActive(current);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, [items]);

  return <aside className="career-detail__toc">
    <p>Table of Contents</p>
    <nav aria-label="Job description sections">
      {items.map(([id, label]) => <a href={`#${id}`} aria-current={active === id ? "location" : undefined} key={id}>{label}</a>)}
    </nav>
  </aside>;
}
