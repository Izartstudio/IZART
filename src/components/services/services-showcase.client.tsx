"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { showcaseServices, serviceScrollState, type ShowcaseService } from "./service-showcase-data";
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
      if (selected !== state.active) {
        selected = state.active;
        fill.style.setProperty("--services-progress", "0");
        setActive(state.active);
      }
    };
    const requestUpdate = () => { if (!frame) frame = window.requestAnimationFrame(update); };

    // Bound the transition lock by time, never by pointer movement or the end
    // of a wheel burst. Continuous scrolling can advance again after each fade.
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lockedUntil = 0;
    let lastWheel = -Infinity;
    let wheelTotal = 0;
    let touchY = 0;
    let touchConsumed = false;
    const geometry = () => {
      const start = window.scrollY + host.getBoundingClientRect().top + intro.offsetHeight;
      const travel = host.offsetHeight - intro.offsetHeight - sticky.offsetHeight;
      return { start, end: start + travel, step: travel / showcaseServices.length };
    };
    const excluded = (target: EventTarget | null) => {
      if (document.body.style.overflow === "hidden") return true;
      if (!(target instanceof Element)) return false;
      return Boolean(target.closest("input, textarea, select, [contenteditable='true'], [role='dialog']"));
    };
    const navigate = (direction: number, distance: number) => {
      const { start, end, step } = geometry();
      const y = window.scrollY;
      if (step <= 0) return false;
      const entering = direction > 0 && y < start && y + distance >= start;
      const reentering = direction < 0 && y > end && y + distance <= end;
      if (!entering && !reentering && (y < start - 1 || y > end + 1)) return false;
      if (performance.now() < lockedUntil) return true;
      const current = Math.max(0, selected);
      // Let the document scroll normally out of the first/last state.
      if (!entering && !reentering &&
        ((direction < 0 && current === 0) ||
         (direction > 0 && current === showcaseServices.length - 1))) return false;
      const next = entering ? 0 : reentering ? showcaseServices.length - 1 : current + direction;
      lockedUntil = performance.now() + (motion.matches ? 250 : 1100);
      window.scrollTo({ top: start + (next + 0.5) * step, behavior: motion.matches ? "instant" : "smooth" });
      return true;
    };
    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey || excluded(event.target) || Math.abs(event.deltaX) > Math.abs(event.deltaY) || !event.deltaY) return;
      const now = performance.now();
      if (now - lastWheel > 200) wheelTotal = 0;
      lastWheel = now;
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1);
      const { start, end } = geometry();
      const inside = window.scrollY >= start - 1 && window.scrollY <= end + 1;
      if (Math.sign(delta) !== Math.sign(wheelTotal)) wheelTotal = 0;
      wheelTotal += delta;
      if (inside && now < lockedUntil) {
        event.preventDefault();
        wheelTotal = 0;
        return;
      }
      if (inside && Math.abs(wheelTotal) < 36) {
        const atExit = (delta < 0 && selected === 0) || (delta > 0 && selected === showcaseServices.length - 1);
        if (!atExit) event.preventDefault();
        return;
      }
      if (navigate(Math.sign(delta), delta)) { event.preventDefault(); wheelTotal = 0; }
    };
    const touchStart = (event: TouchEvent) => {
      touchY = event.touches[0]?.clientY ?? 0;
      touchConsumed = false;
    };
    const touchMove = (event: TouchEvent) => {
      if (event.touches.length !== 1 || excluded(event.target)) return;
      const delta = touchY - event.touches[0].clientY;
      if (touchConsumed) { event.preventDefault(); return; }
      const { start, end } = geometry();
      const inside = window.scrollY >= start - 1 && window.scrollY <= end + 1;
      if (inside && Math.abs(delta) < 42) {
        const atExit = (delta < 0 && selected === 0) || (delta > 0 && selected === showcaseServices.length - 1);
        if (!atExit) event.preventDefault();
        return;
      }
      if (Math.abs(delta) >= 42 && navigate(Math.sign(delta), delta)) { event.preventDefault(); touchConsumed = true; }
    };
    const keyDown = (event: KeyboardEvent) => {
      if (excluded(event.target) || event.altKey || event.ctrlKey || event.metaKey ||
        (event.target instanceof Element && event.target.closest("a, button, summary"))) return;
      const direction = event.key === "ArrowDown" || event.key === "PageDown" || (event.key === " " && !event.shiftKey) ? 1
        : event.key === "ArrowUp" || event.key === "PageUp" || (event.key === " " && event.shiftKey) ? -1 : 0;
      const { start, end } = geometry();
      if (!direction || window.scrollY < start - 1 || window.scrollY > end + 1) return;
      if (event.repeat || navigate(direction, direction * window.innerHeight)) event.preventDefault();
    };
    window.addEventListener("wheel", wheel, { passive: false });
    window.addEventListener("touchstart", touchStart, { passive: true });
    window.addEventListener("touchmove", touchMove, { passive: false });
    window.addEventListener("keydown", keyDown);
    const observer = new ResizeObserver(requestUpdate);
    observer.observe(host); observer.observe(sticky); observer.observe(intro); observer.observe(document.body);
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    window.addEventListener("pageshow", requestUpdate);
    document.addEventListener("visibilitychange", requestUpdate);
    update();
    return () => {
      window.cancelAnimationFrame(frame); observer.disconnect();
      window.removeEventListener("wheel", wheel);
      window.removeEventListener("touchstart", touchStart);
      window.removeEventListener("touchmove", touchMove);
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      window.removeEventListener("pageshow", requestUpdate);
      document.removeEventListener("visibilitychange", requestUpdate);
    };
  }, []);

  const updatePlaybackProgress = useCallback((progress: number) => {
    fillRef.current?.style.setProperty("--services-progress", String(progress));
  }, []);
  const advanceAfterPlayback = useCallback((index: number) => {
    const host = hostRef.current, intro = introRef.current, sticky = stickyRef.current;
    if (!host || !intro || !sticky || document.hidden) return;
    const top = window.scrollY + host.getBoundingClientRect().top;
    const travel = host.offsetHeight - intro.offsetHeight - sticky.offsetHeight;
    const next = index + 1;
    const destination = next < showcaseServices.length
      ? top + intro.offsetHeight + (next + 0.5) * travel / showcaseServices.length
      : top + host.offsetHeight;
    window.scrollTo({ top: destination, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }, []);

  const previous = showcaseServices[active - 1];
  return <section ref={hostRef} className={styles.showcase} style={{ "--service-count": showcaseServices.length } as CSSProperties} aria-labelledby="services-showcase-title">
      <header ref={introRef} className={styles.intro}>
        <h2 id="services-showcase-title" className={styles.label}>Our Services<i aria-hidden="true" /><i aria-hidden="true" /><i aria-hidden="true" /><i aria-hidden="true" /></h2>
        <p>Strategic branding and digital design that drives measurable impact. We create cohesive brand identities and conversion-optimized interfaces that help businesses stand out, connect authentically, and grow consistently.</p>
      </header>
    <div ref={stickyRef} className={styles.sticky}>
      <div className={styles.stage}>
        {showcaseServices.map((item, index) => <ServiceMedia key={item.slug} service={item} index={index} active={index === active} onProgress={updatePlaybackProgress} onComplete={advanceAfterPlayback} />)}
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

function ServiceMedia({ service, index, active, onProgress, onComplete }: {
  service: ShowcaseService;
  index: number;
  active: boolean;
  onProgress: (progress: number) => void;
  onComplete: (index: number) => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const { image, mobileImage, video, mobileVideo } = service;

  useEffect(() => {
    const element = ref.current;
    if (!element || !video) return;
    if (!active) {
      element.pause();
      // Preserve the last frame through the existing background crossfade.
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
    let progressFrame = 0;
    let completed = false;
    let advanced = false;
    const advance = () => {
      if (!disposed && completed && !advanced && !document.hidden) {
        advanced = true;
        onComplete(index);
      }
    };
    const reportProgress = () => {
      progressFrame = 0;
      if (disposed) return;
      const duration = element.duration;
      onProgress(Number.isFinite(duration) && duration > 0 ? Math.min(1, element.currentTime / duration) : 0);
      if (!element.paused && !element.ended && !document.hidden) progressFrame = window.requestAnimationFrame(reportProgress);
    };
    const stopProgress = () => { window.cancelAnimationFrame(progressFrame); progressFrame = 0; };
    const ended = () => {
      stopProgress();
      if (disposed || completed) return;
      completed = true;
      onProgress(1);
      advance();
    };
    // A fresh visit to a state starts a single playback, rather than a loop.
    element.currentTime = 0;
    onProgress(0);

    const update = () => {
      if (completed) { element.pause(); advance(); return; }
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
      stopProgress();
      reportProgress();
    };
    const failed = () => { element.dataset.ready = "false"; };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); });
    observer.observe(element);
    element.addEventListener("playing", playing);
    element.addEventListener("error", failed);
    element.addEventListener("pause", stopProgress);
    element.addEventListener("ended", ended);
    document.addEventListener("visibilitychange", update);
    window.addEventListener("pageshow", update);
    motion.addEventListener("change", update);
    mobile.addEventListener("change", update);
    return () => {
      disposed = true;
      shouldPlay = false;
      stopProgress();
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
      window.removeEventListener("pageshow", update);
      motion.removeEventListener("change", update);
      mobile.removeEventListener("change", update);
      element.removeEventListener("playing", playing);
      element.removeEventListener("error", failed);
      element.removeEventListener("pause", stopProgress);
      element.removeEventListener("ended", ended);
      element.pause();
    };
  }, [active, video, mobileVideo, index, onProgress, onComplete]);

  useEffect(() => {
    const element = ref.current;
    return () => {
      if (!element) return;
      element.pause();
      element.removeAttribute("src");
      element.load();
    };
  }, []);

  return <div className={styles.media} data-active={active} aria-hidden="true">
    <picture>
      {mobileImage && <source media="(max-width: 767px)" srcSet={mobileImage} />}
      {/* Native picture selects one already-compressed poster without fetching both variants. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image} alt="" width={1440} height={810} loading="lazy" decoding="async" />
    </picture>
    {video && <video ref={ref} muted playsInline preload="none" disablePictureInPicture tabIndex={-1} />}
  </div>;
}
