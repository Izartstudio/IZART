"use client";

import Link from "next/link";
import { ScrollIndicator } from "@/components/site/scroll-indicator";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { showcaseServices as defaultShowcaseServices, serviceScrollState, type ShowcaseService } from "./service-showcase-data";
import styles from "./services-showcase.module.css";
import { ServiceCrt } from "./service-crt.client";
import { ServiceSectionCursor } from "./service-section-cursor.client";

export function ServicesShowcase({ circularCursor = true, stickyIntro: pinIntro = true, crtEffect = true, services, heading = "Our Services", introduction = "Strategic branding and digital design that drives measurable impact. We create cohesive brand identities and conversion-optimized interfaces that help businesses stand out, connect authentically, and grow consistently." }: { services?: ShowcaseService[]; heading?: string; introduction?: string; circularCursor?: boolean; stickyIntro?: boolean; crtEffect?: boolean }) {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const update = () => setMobile(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  const stickyIntro = pinIntro && !mobile;
  const showcaseServices = services?.length ? services : defaultShowcaseServices;
  const hostRef = useRef<HTMLElement>(null);
  const introRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const host = hostRef.current, sticky = stickyRef.current, fill = fillRef.current, intro = introRef.current;
    if (!host || !sticky || !fill || !intro) return;
    let frame = 0;
    let selected = -1;
    const update = () => {
      frame = 0;
      const introHeight = stickyIntro ? 0 : intro.offsetHeight;
      host.style.setProperty("--services-intro-height", `${introHeight}px`);
      host.style.setProperty("--services-heading-height", `${intro.offsetHeight}px`);
      const bounds = host.getBoundingClientRect();
      const state = serviceScrollState(-bounds.top - introHeight, host.offsetHeight - introHeight - sticky.offsetHeight, showcaseServices.length);
      // The stylesheet owns direction (horizontal on desktop, vertical on mobile).
      // Clear transforms left by the earlier renderer or a preserved dev session.
      fill.style.removeProperty("transform");
      fill.style.setProperty("--services-progress", String(state.progress));
      if (selected !== state.active) {
        if (selected >= 0 && stageRef.current) {
          stageRef.current.dataset.paperDirection = state.active < selected ? "down" : "up";
        }
        selected = state.active;
        setActive(state.active);
      }
    };
    const requestUpdate = () => { if (!frame) frame = window.requestAnimationFrame(update); };

    const observer = new ResizeObserver(requestUpdate);
    observer.observe(host); observer.observe(sticky); observer.observe(intro); observer.observe(document.body);
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    window.addEventListener("pageshow", requestUpdate);
    document.addEventListener("visibilitychange", requestUpdate);
    update();
    return () => {
      window.cancelAnimationFrame(frame); observer.disconnect();
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      window.removeEventListener("pageshow", requestUpdate);
      document.removeEventListener("visibilitychange", requestUpdate);
    };
  }, [stickyIntro, showcaseServices]);

  const previous = showcaseServices[active - 1];
  const introContent = <>
      <header ref={introRef} className={styles.intro}>
        <h2 id="services-showcase-title" className={styles.label}>{heading}<i aria-hidden="true" /><i aria-hidden="true" /><i aria-hidden="true" /><i aria-hidden="true" /></h2>
        <p>{introduction}</p>
      </header>
  </>;
  return <section ref={hostRef} className={`${styles.showcase}${stickyIntro ? ` ${styles.pinnedIntro}` : ""}`} style={{ "--service-count": showcaseServices.length, ...(stickyIntro ? { "--services-intro-height": "0px" } : {}) } as CSSProperties} aria-labelledby="services-showcase-title">

    {!stickyIntro && introContent}
    <div ref={stickyRef} className={styles.sticky}>
      <div ref={stageRef} className={`${styles.stage}${circularCursor ? ` ${styles.hasCursor}` : ""}`}>
        {circularCursor && <Link className={styles.stageLink} href={showcaseServices[active].href} aria-label={`Learn more about ${showcaseServices[active].title}`} />}
        {showcaseServices.map((item, index) => <ServiceMedia key={item.slug} service={item} index={index} active={index === active} />)}
        {crtEffect && <ServiceCrt stageRef={stageRef} active={active} poster={showcaseServices[active].image} mobilePoster={showcaseServices[active].mobileImage} />}
        <div className={styles.shade} />
        <div className={styles.entryFade} aria-hidden="true" />
        {stickyIntro && introContent}
        <div className={styles.content}>
          {previous && <p className={styles.previous} aria-hidden="true">{String(active).padStart(2,"0")}{"//"} &nbsp; {previous.title}</p>}
          <div className={styles.timeline} aria-hidden="true"><span ref={fillRef} className={styles.fill} /></div>
          <div className={styles.copies}>
            {showcaseServices.map((service, index) => <div className={styles.copy} key={service.slug} data-active={active === index} aria-hidden={active !== index} inert={active !== index}>
              <h3><span>{String(index + 1).padStart(2,"0")}{"//"}</span><span>{service.title}</span></h3>
              <div className={styles.details}><p className={styles.description}>{service.description}</p>{(!circularCursor || mobile) && <Link className={styles.learn} href={service.href} aria-label={`Learn more about ${service.title}`}>Learn More <span aria-hidden="true">→</span></Link>}</div>
            </div>)}
          </div>
        </div>
        <div className={styles.scrollCue}><ScrollIndicator /></div>
        {circularCursor && <ServiceSectionCursor stageRef={stageRef} />}
      </div>
    </div>
  </section>;
}

function ServiceMedia({ service, index, active }: {
  service: ShowcaseService;
  index: number;
  active: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const { image, mobileImage, video, mobileVideo } = service;

  useEffect(() => {
    const element = ref.current;
    if (!element || !video) return;
    if (!active) {
      element.pause();
      // Preserve the last frame through the paper turn.
      const release = window.setTimeout(() => {
        element.dataset.ready = "false";
        element.removeAttribute("src");
        element.load();
      }, 900);
      return () => window.clearTimeout(release);
    }
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mobile = window.matchMedia("(max-width: 767px)");
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    let visible = false;
    let disposed = false;
    let shouldPlay = false;
    let pending = false;
    let playRequest = 0;
    element.currentTime = 0;

    const update = () => {
      shouldPlay = visible && !document.hidden && !motion.matches && !connection?.saveData;
      if (!shouldPlay) { element.pause(); return; }
      const source = mobile.matches ? mobileVideo || video : video;
      if (element.getAttribute("src") !== source) {
        playRequest += 1;
        pending = false;
        element.dataset.ready = "false";
        element.src = source;
        element.load();
      }
      // Avoid repeated play promises during visibility/resize events.
      if (pending || !element.paused) return;
      pending = true;
      const request = ++playRequest;
      void element.play().then(() => {
        if (disposed || !shouldPlay) element.pause();
      }).catch(() => {
        if (!disposed && request === playRequest) element.dataset.ready = "false";
      }).finally(() => { if (request === playRequest) pending = false; });
    };
    const playing = () => {
      if (disposed || !shouldPlay) { element.pause(); return; }
      element.dataset.ready = "true";
    };
    const failed = () => { element.dataset.ready = "false"; };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); });
    observer.observe(element);
    element.addEventListener("playing", playing);
    element.addEventListener("error", failed);
    document.addEventListener("visibilitychange", update);
    window.addEventListener("pageshow", update);
    motion.addEventListener("change", update);
    mobile.addEventListener("change", update);
    return () => {
      disposed = true;
      shouldPlay = false;
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
      window.removeEventListener("pageshow", update);
      motion.removeEventListener("change", update);
      mobile.removeEventListener("change", update);
      element.removeEventListener("playing", playing);
      element.removeEventListener("error", failed);
      element.pause();
    };
  }, [active, video, mobileVideo]);

  useEffect(() => {
    const element = ref.current;
    return () => {
      if (!element) return;
      element.pause();
      element.removeAttribute("src");
      element.load();
    };
  }, []);

  return <div className={styles.media} data-service-media={index} data-active={active} aria-hidden="true">
    <picture>
      {mobileImage && <source media="(max-width: 767px)" srcSet={mobileImage} />}
      {/* Native picture selects one already-compressed poster without fetching both variants. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image} alt="" width={1440} height={810} loading="lazy" decoding="async" />
    </picture>
    {video && <video ref={ref} muted loop playsInline preload="none" disablePictureInPicture tabIndex={-1} />}
  </div>;
}
