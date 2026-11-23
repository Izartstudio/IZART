"use client";

import { useSectionCursor } from "@/hooks/use-section-cursor";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
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
  const cursorRef = useRef<HTMLSpanElement>(null);
  useSectionCursor(stageRef, cursorRef, ".service-learn-target");

  useEffect(() => {
    const track = trackRef.current;
    const stage = stageRef.current;
    if (!track || !stage || !count) return;
    let frame = 0;
    let current = 0;
    let target = 0;
    let previousTime = 0;
    let selected = -1;
    let firstFrame = true;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const paint = (time: number) => {
      frame = 0;
      if (firstFrame) {
        current = target = readPosition();
        firstFrame = false;
      }
      const dt = previousTime ? Math.min((time - previousTime) / 1000, .064) : 1 / 60;
      previousTime = time;
      current += (target - current) * (motion.matches ? 1 : 1 - Math.exp(-18 * dt));
      if (Math.abs(current - target) < .0001) current = target;
      stage.style.setProperty("--service-position", String(current));
      const next = Math.min(count - 1, Math.floor(current));
      if (next !== selected) { selected = next; setActive(next); }
      if (current !== target) frame = requestAnimationFrame(paint);
      else previousTime = 0;
    };
    const readPosition = () => {
      const { top, bottom } = track.getBoundingClientRect();
      const height = stage.offsetHeight;
      const travel = track.offsetHeight - height;
      track.toggleAttribute("data-pinned", top <= 1 && bottom >= height - 1);
      return travel > 0 ? Math.min(count, Math.max(0, (-top / travel) * count)) : 0;
    };
    const update = () => {
      target = readPosition();
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const schedule = update;

    let nearby = false;
    const visibility = new IntersectionObserver(([entry]) => {
      nearby = entry.isIntersecting;
      schedule();
    }, { rootMargin: "100% 0px" });
    visibility.observe(track);
    const onScroll = () => { if (nearby) schedule(); };
    const observer = new ResizeObserver(schedule);
    observer.observe(track);
    observer.observe(document.body);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pageshow", schedule);
    update();
    return () => {
      visibility.disconnect();
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
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
  const service = services[Math.min(active, count - 1)];

  return (
    <section className={styles.section} aria-labelledby={`${id}-heading`}>
      <h2 className="sr-only" id={`${id}-heading`}>{heading}</h2>
      <p className={styles.intro}>{introduction}</p>
      <div ref={trackRef} className={styles.track} style={{ "--tab-count": count } as CSSProperties}>
        <div ref={stageRef} className={styles.stage}>
          {services.map((service, index) => (
            <div key={service.id} className={styles.background} data-active={active === index}
              style={{ "--service-index": index } as CSSProperties} aria-hidden="true">
              <Image src={service.background.src.replace(/^(\/assets\/home\/services\/service-[1-5])\.svg$/, "$1-fallback.webp")} alt="" fill
                sizes="(max-aspect-ratio: 8/5) 160svh, 100vw"
                fetchPriority={index === 0 || index === active ? "auto" : "low"}
                style={{ objectPosition: service.background.position }} />
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
            <div className={styles.panel} id={
              `${id}-panel-${active}`
            } role="tabpanel" aria-labelledby={`${id}-tab-${active}`}>
              <ServiceDetails service={service} learnMoreLabel={learnMoreLabel} />
              <aside className={styles.sidebar}>
                <ProjectCard project={service.project} />
                <div className={styles.industries}>
                  <ul>{industries.map((industry, index) => <li key={`${industry}-${index}`}>{industry}</li>)}</ul>
                  <Link href={industriesLink.href}>{industriesLink.label} <span aria-hidden="true">→</span></Link>
                </div>
              </aside>
            </div>
            {services.map((item, index) => index !== active && (
              <div key={item.id} id={`${id}-panel-${index}`} role="tabpanel"
                aria-labelledby={`${id}-tab-${index}`} hidden />
            ))}
          </div>
          <div className={styles.steps} aria-hidden="true">
            {services.map((service, index) => <i key={service.id} data-active={active === index} />)}
          </div>
          <span ref={cursorRef} className={styles.cursor} aria-hidden="true"><span>{learnMoreLabel} →</span></span>
          <div className={styles.scrollCue}><ScrollIndicator /></div>
        </div>
      </div>
    </section>
  );
}

function ServiceDetails({ service, learnMoreLabel }: { service: HomeService; learnMoreLabel: string }) {
  return (
    <div className={styles.details}>
      <h3>{service.title}</h3>
      <p>{service.description}</p>
      <Link className={`${styles.learn} service-learn-target`} href={service.href} aria-label={`${learnMoreLabel} about ${service.title}`}>
        <span className={styles.learnText}>{learnMoreLabel} <span aria-hidden="true">→</span></span>

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
