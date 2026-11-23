"use client";

import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";

import { useSectionCursor } from "@/hooks/use-section-cursor";
import { ScrollIndicator, projectProgressLeft } from "@/components/site/scroll-indicator";

const compactQuery = "(max-width: 991px)";
const subscribeCompact = (notify: () => void) => {
  const query = window.matchMedia(compactQuery);
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
};
const getCompactSnapshot = () => window.matchMedia(compactQuery).matches;
const getServerSnapshot = () => false;

export function ShowcaseMotion({ children, projectCount, bridge, header, latestWork = false }: { children: ReactNode; projectCount: number; bridge?: ReactNode; header?: ReactNode; latestWork?: boolean }) {
  const compact = useSyncExternalStore(subscribeCompact, getCompactSnapshot, getServerSnapshot);
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  const navigateRef = useRef<(index: number) => void>(() => undefined);

  const stickyRef = useRef<HTMLDivElement>(null);
  useSectionCursor(stickyRef, cursorRef, ".showcase__sticky:not([data-cards-hidden])");

  useEffect(() => {
    const section = sectionRef.current;
    const sticky = stickyRef.current;
    const track = trackRef.current;
    const indicator = progressRef.current;
    if (!section || !track || !indicator) return;
    const intro = track.querySelector<HTMLElement>(".showcase__intro");
    const projectList = track.querySelector<HTMLElement>(".showcase__list");

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let cards = Array.from(track.querySelectorAll<HTMLElement>(".showcase-card"));
    const bridge = track.querySelector<HTMLElement>(".point-to-pixel");
    const bridgeSteps = Array.from(bridge?.querySelectorAll<HTMLElement>("[data-bridge-step]") ?? [], element => ({
      element,
      at: Number(element.dataset.bridgeAt || 0),
    }));
    const fromThreshold = bridgeSteps[0]?.at ?? .08;
    let bridgeStart = 0;
    const gallery = section.closest<HTMLElement>(".project-details-gallery");
    const shell = section.closest<HTMLElement>(".project-details-shell");
    let scrollRoot: HTMLElement | null = null;
    let viewportWidth = window.innerWidth;
    let viewportHeight = window.innerHeight;
    const scrollPosition = () => scrollRoot ? scrollRoot.scrollTop : window.scrollY;
    let projectOffsets: number[] = [];
    let frame = 0;
    let travel = 0;
    let sectionTop = 0;
    let currentOffset = 0;
    let targetOffset = 0;
    let firstFrame = true;

    const render = () => {
      frame = 0;
      // The sticky container releases at the native scroll boundary. The bridge
      // must reach its final horizontal offset on that same frame.
      if (firstFrame || bridge) {
        currentOffset = targetOffset = readTarget();
        firstFrame = false;
      }
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
      // The flex rail positions the end ticks half a tick-width inside its edges.
      indicator.style.left = projectProgressLeft(progress);

      if (bridge) {
        const bridgeLeft = bridgeStart - currentOffset;
        const fadeProgress = 1 - Math.min(1, Math.max(0, (bridgeLeft - viewportWidth * .5) / (viewportWidth * .5)));
        const bridgeProgress = Math.min(1, Math.max(0, (viewportWidth * .82 - bridgeLeft) / Math.max(1, viewportWidth)));
        const cardsHidden = bridgeProgress >= Math.max(0, fromThreshold - .02);
        if (sticky?.hasAttribute("data-cards-hidden") !== cardsHidden) {
          sticky?.toggleAttribute("data-cards-hidden", cardsHidden);
        }
        if (indicator.parentElement) indicator.parentElement.style.opacity = String(1 - fadeProgress);
        if (intro) intro.style.opacity = String(1 - fadeProgress);
        if (projectList) projectList.style.opacity = String(1 - fadeProgress);
        for (const { element, at } of bridgeSteps) {
          element.classList.toggle("is-active", bridgeProgress >= at);
        }
      }
      if (currentOffset !== targetOffset) frame = requestAnimationFrame(render);
    };

    const readTarget = () => motionQuery.matches ? 0 : Math.min(travel, Math.max(0, scrollPosition() - sectionTop));
    const updateTarget = () => {
      targetOffset = readTarget();
      if (!frame) frame = requestAnimationFrame(render);
    };
    const onScroll = () => {
      if (readTarget() !== targetOffset) updateTarget();
    };
    const measure = () => {
      cards = Array.from(track.querySelectorAll<HTMLElement>(".showcase-card"));
      scrollRoot = gallery && shell?.classList.contains("is-open") && getComputedStyle(gallery).overflowY === "auto" ? gallery : null;
      viewportWidth = section.clientWidth;
      viewportHeight = scrollRoot?.clientHeight || window.innerHeight;
      section.style.setProperty("--showcase-viewport-width", `${viewportWidth}px`);
      section.style.setProperty("--showcase-viewport-height", `${viewportHeight}px`);
      travel = Math.max(0, track.scrollWidth - viewportWidth);
      sectionTop = section.getBoundingClientRect().top - (scrollRoot?.getBoundingClientRect().top || 0) + scrollPosition();
      const trackLeft = track.getBoundingClientRect().left;
      bridgeStart = bridge ? bridge.getBoundingClientRect().left - trackLeft : 0;
      const firstCardLeft = cards[0]?.getBoundingClientRect().left ?? trackLeft;
      projectOffsets = cards.map(card => {
        const rect = card.getBoundingClientRect();
        if (header) return rect.left - firstCardLeft;
        return Math.max(0, rect.left - trackLeft + rect.width / 2 - viewportWidth / 2);
      });
      const lastProjectOffset = Math.max(0, projectOffsets.at(-1) ?? 0);
      // A standalone rail ends at the last card center. When Point to Pixel
      // follows the cards, allow the track to continue into that animation.
      travel = bridge ? Math.max(travel, lastProjectOffset) : lastProjectOffset;
      section.style.setProperty("--showcase-travel", `${travel}px`);
      currentOffset = Math.min(travel, currentOffset);
      updateTarget();
    };
    navigateRef.current = (index) => {
      const offset = Math.min(travel, Math.max(0, projectOffsets[index] ?? 0));
      const options: ScrollToOptions = { top: sectionTop + offset, behavior: "instant" };
      if (scrollRoot) scrollRoot.scrollTo(options);
      else window.scrollTo(options);
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
    if (gallery) observer.observe(gallery);
    const modeObserver = new MutationObserver(measure);
    if (shell) modeObserver.observe(shell, { attributes: true, attributeFilter: ["class"] });
    gallery?.addEventListener("scroll", onScroll, { passive: true });
    motionQuery.addEventListener("change", measure);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure, { passive: true });
    cards.forEach((card) => {
      card.addEventListener("pointerenter", playVideo);
      card.addEventListener("pointerleave", pauseVideo);
      card.addEventListener("focus", playVideo);
      card.addEventListener("blur", pauseVideo);
    });
    return () => {
      cancelAnimationFrame(frame);
      sticky?.removeAttribute("data-cards-hidden");
      navigateRef.current = () => undefined;
      observer.disconnect();
      modeObserver.disconnect();
      gallery?.removeEventListener("scroll", onScroll);
      motionQuery.removeEventListener("change", measure);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      cards.forEach((card) => {
        card.removeEventListener("pointerenter", playVideo);
        card.removeEventListener("pointerleave", pauseVideo);
        card.removeEventListener("focus", playVideo);
        card.removeEventListener("blur", pauseVideo);
      });
    };
  }, [children, projectCount, compact, latestWork, header]);

  return <>{header && <div className="showcase-industries-intro">{header}</div>}<section ref={sectionRef} className={`showcase${latestWork ? " showcase--latest" : header ? " showcase--industries" : ""}`} aria-labelledby="showcase-title">
    <div ref={stickyRef} className="showcase__sticky">
      <div ref={trackRef} className="showcase__track">{children}{!compact && bridge}</div>
      <ScrollIndicator variant="ruler" count={projectCount} className="showcase-progress" markerRef={progressRef}>
        <div className="showcase-progress__navigation" role="group" aria-label="Navigate showcase projects">
          {Array.from({ length: projectCount }, (_, index) => (
            <button key={index} type="button" aria-label={`Scroll to project ${index + 1}`}
              style={{ left: projectProgressLeft(projectCount > 1 ? index / (projectCount - 1) : .5) }}
              onClick={() => navigateRef.current(index)} />
          ))}
        </div>
      </ScrollIndicator>
      {!latestWork && <span ref={cursorRef} className="showcase__cursor" aria-hidden="true">View case<br />study →</span>}
    </div>
  </section>{compact && bridge}</>;
}
