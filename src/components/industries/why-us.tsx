"use client";

import { useEffect, useRef } from "react";
import styles from "./why-us.module.css";

const reasons = [
  { title: "Strategic by nature", description: "Every creative decision begins with a clear understanding of the business." },
  { title: "Built around context", description: "Our work responds to the needs of each industry, audience and market." },
  { title: "Connected by design", description: "We build cohesive brand experiences across physical and digital environments." },
];

export function WhyUs() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    section.dataset.reveal = "pending";
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      section.dataset.reveal = "visible";
      observer.disconnect();
    }, { threshold: .18 });
    observer.observe(section);
    return () => {
      observer.disconnect();
      delete section.dataset.reveal;
    };
  }, []);

  return <section ref={sectionRef} className={styles.section} aria-labelledby="industries-why-us">
    <h2 id="industries-why-us" className="section-selection">
      <span className="section-selection__text">Why Us</span>
      {["top", "right", "bottom", "left"].map(edge => <i key={edge} className={`selection-border selection-border--${edge}`} aria-hidden="true" />)}
    </h2>
    <p className={styles.intro}>Good branding starts with understanding the business, its people, and environment. We apply strategic thinking and design expertise to create distinctive brand experiences grounded in business realities.</p>
    <ol className={styles.reasons} role="list">
      {reasons.map((reason, index) => <li key={reason.title}>
        <h3>{reason.title}</h3>
        <p>{reason.description}</p>
        <span className={styles.number} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
      </li>)}
    </ol>
  </section>;
}
