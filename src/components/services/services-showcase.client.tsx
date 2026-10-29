"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { showcaseServices, serviceScrollState } from "./service-showcase-data";
import styles from "./services-showcase.module.css";

export function ServicesShowcase() {
  const hostRef = useRef<HTMLElement>(null);
  const introRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const host = hostRef.current, sticky = stickyRef.current, fill = fillRef.current, intro = introRef.current;
    if (!host || !sticky || !fill || !intro) return;
    let frame = 0;
    let selected = -1;
    const update = () => {
      frame = 0;
      host.style.setProperty("--services-intro-height", `${intro.offsetHeight}px`);
      const bounds = host.getBoundingClientRect();
      const state = serviceScrollState(-bounds.top - intro.offsetHeight, host.offsetHeight - intro.offsetHeight - sticky.offsetHeight, showcaseServices.length);
      // The stylesheet owns direction (horizontal on desktop, vertical on mobile).
      // Clear transforms left by the earlier renderer or a preserved dev session.
      fill.style.removeProperty("transform");
      fill.style.setProperty("--services-progress", String(state.progress));
      if (selected !== state.active) { selected = state.active; setActive(state.active); }
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
  }, []);

  const previous = showcaseServices[active - 1];
  return <section ref={hostRef} className={styles.showcase} style={{ "--service-count": showcaseServices.length } as CSSProperties} aria-labelledby="services-showcase-title">
      <header ref={introRef} className={styles.intro}>
        <h2 id="services-showcase-title" className={styles.label}>Our Services<i aria-hidden="true" /><i aria-hidden="true" /><i aria-hidden="true" /><i aria-hidden="true" /></h2>
        <p>Strategic branding and digital design that drives measurable impact. We create cohesive brand identities and conversion-optimized interfaces that help businesses stand out, connect authentically, and grow consistently.</p>
      </header>
    <div ref={stickyRef} className={styles.sticky}>
      <div className={styles.stage}>
        {showcaseServices.map((item, index) => <ServiceMedia key={item.slug} image={item.image} video={item.video} active={index === active} />)}
        <div className={styles.shade} />
        <div className={styles.entryFade} aria-hidden="true" />
        <div className={styles.content}>
          {previous && <p className={styles.previous} aria-hidden="true">{String(active).padStart(2,"0")}{"//"} &nbsp; {previous.title}</p>}
          <div className={styles.timeline} aria-hidden="true"><span ref={fillRef} className={styles.fill} /></div>
          <div className={styles.copies}>
            {showcaseServices.map((service, index) => <div className={styles.copy} key={service.slug} data-active={active === index} aria-hidden={active !== index} inert={active !== index}>
              <h3><span>{String(index + 1).padStart(2,"0")}{"//"}</span><span>{service.title}</span></h3>
              <div className={styles.details}><p className={styles.description}>{service.description}</p><Link className={styles.learn} href={service.href} aria-label={`Learn more about ${service.title}`}>Learn More <span aria-hidden="true">→</span></Link></div>
            </div>)}
          </div>
        </div>
        <Link className={styles.quote} href="#Get-Quote">Get Quote</Link>
      </div>
    </div>
  </section>;
}

function ServiceMedia({ image, video, active }: { image: string; video?: string; active: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let inView = false;
    const update = () => {
      if (active && inView && !document.hidden && !motion.matches) void element.play().catch(() => undefined);
      else element.pause();
    };
    const observer = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; update(); });
    observer.observe(element);
    update(); document.addEventListener("visibilitychange", update); motion.addEventListener("change", update);
    return () => { observer.disconnect(); element.pause(); document.removeEventListener("visibilitychange", update); motion.removeEventListener("change", update); };
  }, [active, video]);
  return <div className={styles.media} data-active={active} data-tone={image.includes("brand-identity") ? "blue" : "dark"} aria-hidden="true">
    <Image src={image} alt="" width={1440} height={810} sizes="(max-width: 767px) 240vw, 100vw" loading="eager" />
    {video && <video ref={ref} src={video} poster={image} muted loop playsInline preload="none" onPlaying={event => { event.currentTarget.dataset.ready = "true"; }} onError={event => { event.currentTarget.dataset.ready = "false"; }} />}
  </div>;
}
