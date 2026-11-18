"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import { ScrollIndicator } from "@/components/site/scroll-indicator";
import type { HomeService, HomeServicesContent } from "@/content/home-services";
import styles from "./home-services.module.css";

export function HomeServices({ content }: { content: HomeServicesContent }) {
  const { heading, introduction, learnMoreLabel, services, industries, industriesLink } = content;
  const id = useId();
  const trackRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const count = services.length;

  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage || !count) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const { top, bottom } = track.getBoundingClientRect();
      const height = stage.offsetHeight;
      const travel = track.offsetHeight - height;
      const position = travel > 0 ? Math.min(count, Math.max(0, (-top / travel) * count)) : 0;
      stage.style.setProperty("--service-position", String(position));
      setActive(Math.min(count - 1, Math.floor(position)));
      track.toggleAttribute("data-pinned", top <= 1 && bottom >= height - 1);
    };
    const schedule = () => { if (!frame) frame = window.requestAnimationFrame(update); };

    const observer = new ResizeObserver(schedule);
    observer.observe(track);
    observer.observe(document.body);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("pageshow", schedule);
    update();
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("pageshow", schedule);
      track.removeAttribute("data-pinned");
    };
  }, [count]);

  useEffect(() => {
    const tabs = tabsRef.current;
    const tab = tabs?.children.item(active);
    if (!(tab instanceof HTMLElement) || !tabs || tabs.scrollWidth <= tabs.clientWidth) return;
    tabs.scrollLeft = tab.offsetLeft - (tabs.clientWidth - tab.offsetWidth) / 2;
  }, [active]);

  function select(index: number) {
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage) return;
    const start = window.scrollY + track.getBoundingClientRect().top;
    const travel = track.offsetHeight - stage.offsetHeight;
    const offset = ((index + .5) / count) * travel;
    window.scrollTo({ top: start + offset, behavior: "instant" });
    setActive(index);
  }

  function moveTab(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const next = {
      ArrowLeft: (index + count - 1) % count,
      ArrowRight: (index + 1) % count,
      Home: 0,
      End: count - 1,
    }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    select(next);
    const tab = tabsRef.current?.children.item(next);
    if (tab instanceof HTMLElement) tab.focus({ preventScroll: true });
  }

  if (!count) return null;

  return (
    <section className={styles.section} aria-labelledby={`${id}-heading`}>
      <h2 className="sr-only" id={`${id}-heading`}>{heading}</h2>
      <p className={styles.intro}>{introduction}</p>
      <div ref={trackRef} className={styles.track} style={{ "--tab-count": count } as CSSProperties}>
        <div ref={stageRef} className={styles.stage}>
          {services.map((service, index) => (
            <div key={service.id} className={styles.background} data-active={active === index}
              style={{ "--service-index": index } as CSSProperties} aria-hidden="true">
              <Image src={service.background.src} alt="" fill quality={90} sizes="max(100vw, 160svh)" style={{ objectPosition: service.background.position }} />
            </div>
          ))}
          <div className={styles.overlay} aria-hidden="true" />
          <div ref={tabsRef} className={styles.tabs} role="tablist" aria-label={heading}>
            {services.map((service, index) => (
              <button key={service.id} type="button" role="tab" id={`${id}-tab-${index}`}
                aria-selected={active === index} aria-controls={`${id}-panel-${index}`} tabIndex={active === index ? 0 : -1}
                onClick={() => select(index)} onKeyDown={event => moveTab(event, index)}>
                {service.title}
              </button>
            ))}
          </div>
          <div className={styles.panels}>
            {services.map((service, index) => (
              <div key={service.id} className={styles.panel} id={`${id}-panel-${index}`} role="tabpanel"
                aria-labelledby={`${id}-tab-${index}`} hidden={active !== index}>
                <ServiceDetails service={service} learnMoreLabel={learnMoreLabel} />
                <aside className={styles.sidebar}>
                  <ProjectCard project={service.project} />
                  <div className={styles.industries}>
                    <ul>{industries.map((industry, index) => <li key={`${industry}-${index}`}>{industry}</li>)}</ul>
                    <Link href={industriesLink.href}>{industriesLink.label} <span aria-hidden="true">→</span></Link>
                  </div>
                </aside>
              </div>
            ))}
          </div>
          <div className={styles.steps} aria-hidden="true">
            {services.map((service, index) => <i key={service.id} data-active={active === index} />)}
          </div>
          <div className={styles.scrollCue}><ScrollIndicator /></div>
        </div>
      </div>
    </section>
  );
}

function ServiceDetails({ service, learnMoreLabel }: { service: HomeService; learnMoreLabel: string }) {
  const cursorRef = useRef<HTMLSpanElement>(null);

  function moveCursor(event: PointerEvent<HTMLAnchorElement>) {
    const cursor = cursorRef.current;
    if (!cursor) return;
    if (event.pointerType !== "mouse") {
      cursor.removeAttribute("data-visible");
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    cursor.style.transform = `translate3d(${event.clientX - rect.left}px, ${event.clientY - rect.top}px, 0)`;
    cursor.setAttribute("data-visible", "");
  }

  function hideCursor() {
    cursorRef.current?.removeAttribute("data-visible");
  }

  return (
    <div className={styles.details}>
      <h3>{service.title}</h3>
      <p>{service.description}</p>
      <Link className={styles.learn} href={service.href} aria-label={`${learnMoreLabel} about ${service.title}`}
        onPointerEnter={moveCursor} onPointerMove={moveCursor} onPointerLeave={hideCursor} onPointerCancel={hideCursor}>
        <span className={styles.learnText}>{learnMoreLabel} <span aria-hidden="true">→</span></span>
        <span ref={cursorRef} className={styles.cursor} aria-hidden="true">
          <span>{learnMoreLabel} →</span>
        </span>
      </Link>
    </div>
  );
}

function ProjectCard({ project }: { project: HomeService["project"] }) {
  return (
    <Link href={project.href} className={styles.project}>
      <span className={styles.projectArtwork}>
        <Image src={project.image.src} alt={project.image.alt ?? ""} fill quality={90}
          sizes="(max-width: 767px) 40vw, 21vw" style={{ objectPosition: project.image.position }} />
      </span>
      <span className={styles.projectHeader}>
        <span className={styles.projectMark} aria-hidden="true" />
        <span className={styles.projectMeta}>
          <span className={styles.projectTriangle} aria-hidden="true" />
          {project.year}
        </span>
      </span>
      <span className={styles.projectLabel}>{project.label} <span aria-hidden="true">→</span></span>
    </Link>
  );
}
