"use client";

import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";

const compactQuery = "(max-width: 991px)";
const subscribeCompact = (notify: () => void) => {
  const query = window.matchMedia(compactQuery);
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
};
const getCompactSnapshot = () => window.matchMedia(compactQuery).matches;
const getServerSnapshot = () => false;

export function ShowcaseMotion({ children, projectCount, bridge }: { children: ReactNode; projectCount: number; bridge?: ReactNode }) {
  const compact = useSyncExternalStore(subscribeCompact, getCompactSnapshot, getServerSnapshot);
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    const indicator = progressRef.current;
    if (!section || !track || !indicator) return;
    const intro = track.querySelector<HTMLElement>(".showcase__intro");
    const projectList = track.querySelector<HTMLElement>(".showcase__list");

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const cards = Array.from(track.querySelectorAll<HTMLElement>(".showcase-card"));
    const bridge = track.querySelector<HTMLElement>(".point-to-pixel");
    let projectOffsets: number[] = [];
    let frame = 0;
    let travel = 0;
    let sectionTop = 0;
    let currentOffset = 0;
    let targetOffset = 0;

    const render = () => {
      frame = 0;
      currentOffset += (targetOffset - currentOffset) * (motionQuery.matches ? 1 : .14);
      if (Math.abs(targetOffset - currentOffset) < .1) currentOffset = targetOffset;
      // Match the marker to the card at the viewport center, using the same
      // eased offset as the track rather than the raw document scroll position.
      let projectPosition = 0;
      for (let index = 1; index < projectOffsets.length; index += 1) {
        const previous = projectOffsets[index - 1];
        const next = projectOffsets[index];
        if (currentOffset >= next) projectPosition = index;
        else {
          projectPosition = index - 1 + Math.max(0, (currentOffset - previous) / Math.max(1, next - previous));
          break;
        }
      }
      const progress = projectOffsets.length > 1 ? projectPosition / (projectOffsets.length - 1) : .5;
      track.style.transform = `translate3d(${-currentOffset}px,0,0)`;
      indicator.style.left = `${progress * 100}%`;

      if (bridge) {
        const bridgeLeft = bridge.offsetLeft - currentOffset;
        const fadeProgress = 1 - Math.min(1, Math.max(0, (bridgeLeft - window.innerWidth * .5) / (window.innerWidth * .5)));
        if (indicator.parentElement) indicator.parentElement.style.opacity = String(1 - fadeProgress);
        if (intro) intro.style.opacity = String(1 - fadeProgress);
        if (projectList) projectList.style.opacity = String(1 - fadeProgress);
        const bridgeProgress = Math.min(1, Math.max(0, (window.innerWidth * .82 - bridgeLeft) / window.innerWidth));
        bridge.querySelectorAll<HTMLElement>("[data-bridge-step]").forEach((step) => {
          const activationPoint = Number(step.dataset.bridgeAt || 0);
          step.classList.toggle("is-active", bridgeProgress >= activationPoint);
        });
      }
      if (currentOffset !== targetOffset) frame = requestAnimationFrame(render);
    };

    const updateTarget = () => {
      targetOffset = motionQuery.matches ? 0 : Math.min(travel, Math.max(0, window.scrollY - sectionTop));
      if (!frame) frame = requestAnimationFrame(render);
    };
    const measure = () => {
      travel = Math.max(0, track.scrollWidth - window.innerWidth);
      section.style.setProperty("--showcase-travel", `${travel}px`);
      sectionTop = section.getBoundingClientRect().top + window.scrollY;
      const trackLeft = track.getBoundingClientRect().left;
      projectOffsets = cards.map(card => {
        const rect = card.getBoundingClientRect();
        return rect.left - trackLeft + rect.width / 2 - window.innerWidth / 2;
      });
      currentOffset = Math.min(travel, currentOffset);
      updateTarget();
    };
    const playVideo = (event: Event) => {
      const video = (event.currentTarget as HTMLElement).querySelector("video");
      if (video) void video.play().catch(() => undefined);
    };
    const pauseVideo = (event: Event) => {
      const video = (event.currentTarget as HTMLElement).querySelector("video");
      if (video) { video.pause(); video.currentTime = 0; }
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    observer.observe(section);
    observer.observe(document.body);
    motionQuery.addEventListener("change", measure);
    window.addEventListener("scroll", updateTarget, { passive: true });
    window.addEventListener("resize", measure, { passive: true });
    cards.forEach((card) => {
      card.addEventListener("pointerenter", playVideo);
      card.addEventListener("pointerleave", pauseVideo);
      card.addEventListener("focus", playVideo);
      card.addEventListener("blur", pauseVideo);
    });
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      motionQuery.removeEventListener("change", measure);
      window.removeEventListener("scroll", updateTarget);
      window.removeEventListener("resize", measure);
      cards.forEach((card) => {
        card.removeEventListener("pointerenter", playVideo);
        card.removeEventListener("pointerleave", pauseVideo);
        card.removeEventListener("focus", playVideo);
        card.removeEventListener("blur", pauseVideo);
      });
    };
  }, [children, projectCount, compact]);

  return <><section ref={sectionRef} className="showcase" aria-labelledby="showcase-title">
    <div className="showcase__sticky">
      <div ref={trackRef} className="showcase__track">{children}{!compact && bridge}</div>
      <div className="showcase-progress" aria-hidden="true">
        <div className="showcase-progress__ticks">{Array.from({ length: Math.max(1, (projectCount - 1) * 4 + 1) }, (_, index) => <i className={index % 4 === 0 ? "is-major" : ""} key={index} />)}</div>
        <span ref={progressRef} className="showcase-progress__marker" />
      </div>
    </div>
  </section>{compact && bridge}</>;
}
