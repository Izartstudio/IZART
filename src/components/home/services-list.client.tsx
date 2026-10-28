"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";

const services = [
  {
    title: "Branding",
    href: "/brand-identity",
    image: "/assets/services/example.png",
    marquee: ["Brand Strategy", "Visual Identity", "Naming", "Verbal Identity"],
  },
  {
    title: "Digital Ecosystem",
    href: "/website-design-and-development",
    image: "/assets/services/example.png",
    marquee: ["Webflow Development", "Website Development", "App Development"],
  },
  {
    title: "Brand Growth",
    image: "/assets/services/example.png",
    marquee: ["Campaign Strategy", "Social Media", "Content Systems"],
  },
  {
    title: "Brand Launch & Campaign Planning",
    image: "/assets/services/example.png",
    marquee: ["Launch Strategy", "Creative Campaigns", "Go-to-market"],
  },
  {
    title: "Spatial Design",
    image: "/assets/services/example.png",
    marquee: ["Retail Design", "Exhibition Design", "Environmental Graphics"],
  },
] as const;

const cursorWidth = 176;
const cursorHeight = 90;

export function ServicesList() {
  const sectionRef = useRef<HTMLElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const pointerRef = useRef({ targetX: 0, targetY: 0, currentX: 0, currentY: 0, initialized: false });
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let revealTimer = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        section.classList.add("is-visible");
        revealTimer = window.setTimeout(() => section.classList.add("has-revealed"), 1100);
        observer.disconnect();
      }
    }, { threshold: .18 });

    observer.observe(section);
    return () => {
      window.clearTimeout(revealTimer);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    let frame = 0;
    const animate = () => {
      const cursor = cursorRef.current;
      const pointer = pointerRef.current;
      if (cursor && pointer.initialized) {
        pointer.currentX += (pointer.targetX - pointer.currentX) * .11;
        pointer.currentY += (pointer.targetY - pointer.currentY) * .11;
        cursor.style.transform = `translate3d(${pointer.currentX}px,${pointer.currentY}px,0)`;
      }
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  const moveCursor = (event: ReactPointerEvent<HTMLElement>) => {
    const section = sectionRef.current;
    const cursor = cursorRef.current;
    if (!section || !cursor) return;
    const bounds = section.getBoundingClientRect();
    const row = (event.target as Element).closest<HTMLElement>(".services-list__item");
    const pointer = pointerRef.current;
    pointer.targetX = event.clientX - bounds.left - cursorWidth / 2;
    pointer.targetY = row
      ? row.offsetTop + (row.offsetHeight - cursorHeight) / 2
      : event.clientY - bounds.top - cursorHeight / 2;
    if (!pointer.initialized) {
      pointer.currentX = pointer.targetX;
      pointer.currentY = pointer.targetY;
      pointer.initialized = true;
      cursor.style.transform = `translate3d(${pointer.currentX}px,${pointer.currentY}px,0)`;
    }
  };

  const leaveServices = () => {
    setActiveIndex(-1);
    pointerRef.current.initialized = false;
  };

  return <section
    ref={sectionRef}
    className="services-list"
    aria-label="Services"
    onPointerMove={moveCursor}
    onPointerLeave={leaveServices}
  >
    <ul className="services-list__items">
      {services.map((service, index) => <li
        className={`services-list__item${activeIndex === index ? " is-active" : ""}`}
        key={service.title}
        style={{ "--service-index": index } as CSSProperties}
        tabIndex={"href" in service ? undefined : 0}
        onPointerEnter={(event) => { moveCursor(event); setActiveIndex(index); }}
        onFocus={() => setActiveIndex(index)}
        onBlur={() => setActiveIndex(-1)}
      >
        {"href" in service && <Link
          href={service.href}
          aria-label={service.title}
          style={{ position: "absolute", inset: 0, zIndex: 5, cursor: "inherit" }}
        />}
        <h3>{service.title}</h3>
        <div className="services-list__marquee" aria-hidden="true">
          <MarqueeGroup items={service.marquee} />
          <MarqueeGroup items={service.marquee} />
        </div>
      </li>)}
    </ul>
    <div ref={cursorRef} className={`services-list__cursor${activeIndex >= 0 ? " is-visible" : ""}`} aria-hidden="true">
      {services.map((service, index) => <Image
        className={activeIndex === index ? "is-active" : ""}
        src={service.image}
        width={cursorWidth}
        height={cursorHeight}
        alt=""
        loading="eager"
        key={service.title}
      />)}
    </div>
  </section>;
}

function MarqueeGroup({ items }: { items: readonly string[] }) {
  return <span className="services-list__marquee-group">
    {items.map(item => <span key={item}>/ &nbsp;{item}</span>)}
  </span>;
}
