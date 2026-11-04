"use client";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import type { Project } from "@/content/project";
import { ProjectImageView } from "./project-image";

const motion = {
  expand: 820,
  revealDelay: 520,
  reveal: 360,
  close: 620,
};
const easing = "cubic-bezier(.32, .72, 0, 1)";
const focusable = 'button, a[href], video[controls], [tabindex="0"]';

export function ProjectDetails({ project, children }: { project: Project; children: ReactNode }) {
  const shell = useRef<HTMLDivElement>(null);
  const gallery = useRef<HTMLDivElement>(null);
  const surface = useRef<HTMLDivElement>(null);
  const workspace = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const origin = useRef({ button: { left: 0, top: 0, width: 0, height: 0 }, media: { left: 0, top: 0, width: 0, height: 0 }, documentTop: 0, scrollY: 0 });
  const animations = useRef<Animation[]>([]);
  const busy = useRef(false);
  const mobileDrawer = useRef(false);
  const scrim = useRef<HTMLButtonElement>(null);
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [drawerClosing, setDrawerClosing] = useState(false);
  const [settling, setSettling] = useState(false);
  const [placeholderHeight, setPlaceholderHeight] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(project.details?.[0]?._key || null);
  const enabled = Boolean(project.details?.length && project.media.length);

  useEffect(() => {
    const update = () => {
      if (open || !gallery.current) return;
      const { top, bottom } = gallery.current.getBoundingClientRect();
      // Show only while the viewport is within the case-study media.
      // Hide as soon as Latest Work starts entering the screen.
      setVisible(top <= window.innerHeight * 0.14 && bottom >= window.innerHeight - 1);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => { window.removeEventListener("scroll", update); window.removeEventListener("resize", update); };
  }, [open]);

  useLayoutEffect(() => {
    if (!open) return;
    const media = gallery.current!;
    const panel = surface.current!;
    const content = copy.current!;
    const old = origin.current;
    const previousOverflow = document.body.style.overflow;
    if (window.matchMedia("(max-width: 767px)").matches) document.body.style.overflow = "hidden";
    const hero = document.querySelector<HTMLElement>(".project-hero");
    const previousInert = hero?.inert;
    if (hero) hero.inert = true;
    mobileDrawer.current = window.matchMedia("(max-width: 767px)").matches;
    if (mobileDrawer.current) {
      const drawer = panel.parentElement!;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const animation = drawer.animate([{ transform: "translateY(100%)" }, { transform: "translateY(0)" }], { duration: reduced ? 0 : 480, easing });
      const fade = scrim.current?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: reduced ? 0 : 480, easing });
      animations.current = fade ? [animation, fade] : [animation];
      content.inert = false;
      workspace.current?.focus({ preventScroll: true });
      animation.finished.then(() => { busy.current = false; closeButton.current?.focus({ preventScroll: true }); }).catch(() => {});
      return () => {
        animations.current.forEach(item => item.cancel());
        drawer.removeAttribute("style");
        document.body.style.overflow = previousOverflow;
        if (hero) hero.inert = previousInert || false;
      };
    }
    const target = media.getBoundingClientRect();
    const scale = target.width / old.media.width;
    window.scrollTo({ top: target.top + window.scrollY + Math.max(0, -old.media.top) * scale, behavior: "instant" });
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const animation = content.animate([{ opacity: 0 }, { opacity: 1 }], { duration: reduced ? 0 : 360, easing });
    animations.current = [animation];
    content.inert = false;
    animation.finished.then(() => { busy.current = false; }).catch(() => {});
    return () => {
      animations.current.forEach(item => item.cancel());
      document.body.style.overflow = previousOverflow;
      if (hero) hero.inert = previousInert || false;
    };
  }, [open]);

  const show = () => {
    if (busy.current || !gallery.current || !trigger.current) return;
    busy.current = true;
    setDrawerClosing(false);
    mobileDrawer.current = window.matchMedia("(max-width: 767px)").matches;
    const media = gallery.current.getBoundingClientRect();
    origin.current = { button: trigger.current.getBoundingClientRect(), media, documentTop: media.top + window.scrollY, scrollY: window.scrollY };
    setPlaceholderHeight(media.height);
    setOpen(true);
  };
  const close = async () => {
    if (busy.current) return;
    busy.current = true;
    if (mobileDrawer.current) {
      const drawer = surface.current!.parentElement!;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      animations.current.forEach(animation => animation.cancel());
      const options = { duration: reduced ? 0 : 480, easing: "cubic-bezier(.4,0,.2,1)", fill: "forwards" as FillMode };
      const bounds = drawer.getBoundingClientRect();
      const button = trigger.current!.getBoundingClientRect();
      // Lock the source rectangle: dynamic viewport units must not change mid-morph.
      Object.assign(drawer.style, { left: `${bounds.left}px`, top: `${bounds.top}px`, bottom: "auto", width: `${bounds.width}px`, height: `${bounds.height}px` });
      setDrawerClosing(true);
      copy.current!.inert = true;
      workspace.current?.focus({ preventScroll: true });
      origin.current.button = button;
      const animation = drawer.animate([
        { transformOrigin: "top left", transform: "translate3d(0,0,0) scale(1,1)", borderRadius: "0px" },
        { transformOrigin: "top left", transform: `translate3d(${button.left - bounds.left}px,${button.top - bounds.top}px,0) scale(${button.width / bounds.width},${button.height / bounds.height})`, borderRadius: "0px" },
      ], options);
      const hideCopy = copy.current!.animate([{ opacity: 1 }, { opacity: 0 }], { ...options, duration: reduced ? 0 : 160 });
      const fade = scrim.current?.animate([{ opacity: 1 }, { opacity: 0 }], options);
      animations.current = fade ? [animation, fade, hideCopy] : [animation, hideCopy];
      try { await Promise.all(animations.current.map(item => item.finished)); } catch { return; }
      setSettling(true); setOpen(false);
      return;
    }
    const media = gallery.current!;
    const target = media.getBoundingClientRect();
    const panelRect = surface.current!.getBoundingClientRect();
    const old = origin.current;
    const fullWidth = shell.current!.getBoundingClientRect().width;
    const scale = fullWidth / target.width;
    const scrollY = old.documentTop + Math.max(0, -target.top) * scale;
    const button = trigger.current!.getBoundingClientRect();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const contentOpacity = getComputedStyle(copy.current!).opacity;
    animations.current.forEach(animation => animation.cancel());
    copy.current!.inert = true;
    workspace.current?.focus({ preventScroll: true });
    const options = { duration: reduced ? 0 : motion.close, easing, fill: "forwards" as FillMode };
    animations.current = [
      media.animate([{ transform: "none" }, { transform: `translate(${-target.left}px, ${Math.max(0, old.documentTop - scrollY) - target.top}px) scale(${scale})` }], options),
      surface.current!.animate([
        { left: "0px", top: "0px", width: `${panelRect.width}px`, height: `${panelRect.height}px`, boxShadow: "0px 0px 0px #0000" },
        { left: `${button.left - panelRect.left}px`, top: `${button.top - panelRect.top}px`, width: `${button.width}px`, height: `${button.height}px`, boxShadow: "15px 15px 15px #0004" },
      ], options),
      copy.current!.animate([{ opacity: contentOpacity }, { opacity: 0 }], { ...options, duration: reduced ? 0 : 160 }),
    ];
    try { await Promise.all(animations.current.map(animation => animation.finished)); } catch { return; }
    // Restore normal document geometry before the next paint, preserving gallery progress.
    origin.current.scrollY = scrollY;
    // Keep transitions disabled while the animated panel hands its final frame
    // back to the fixed trigger. Re-enabling them in the same commit can make
    // the browser briefly replay the trigger's entrance transition.
    setSettling(true);
    setOpen(false);
  };

  useLayoutEffect(() => {
    if (!open && origin.current.media.width) {
      window.scrollTo({ top: origin.current.scrollY, behavior: "instant" });
      trigger.current?.focus({ preventScroll: true });
    }
    if (!open && settling) {
      let secondFrame = 0;
      const firstFrame = requestAnimationFrame(() => {
        secondFrame = requestAnimationFrame(() => {
          setSettling(false);
          busy.current = false;
        });
      });
      return () => {
        cancelAnimationFrame(firstFrame);
        cancelAnimationFrame(secondFrame);
      };
    }
  }, [open, settling]);

  return <>
    <div ref={shell} className={`project-details-shell${open ? " is-open" : ""}`} style={open && mobileDrawer.current ? { height: placeholderHeight } : undefined}>
      <div ref={workspace} className="project-details-workspace" tabIndex={-1} role={open ? "dialog" : undefined} aria-modal={open && mobileDrawer.current || undefined} aria-label={open ? `${project.name} project details` : undefined}
        onKeyDown={event => {
          if (!open) return;
          if (event.key === "Escape") { event.preventDefault(); void close(); }
          if (event.key === "Tab" && mobileDrawer.current) {
            const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(focusable)).filter(item => !item.closest('[inert]') && item.getClientRects().length);
            const first = items[0]; const last = items[items.length - 1];
            if (document.activeElement === workspace.current) { event.preventDefault(); (event.shiftKey ? last : first)?.focus(); }
            else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
          }
        }}>
        {open && <button ref={scrim} className="project-details-scrim" tabIndex={-1} aria-label="Close project details" onClick={() => void close()} />}
        {drawerClosing && open && <div className="project-details-trigger is-visible project-details-morph-label" aria-hidden="true" style={{ left: origin.current.button.left, top: origin.current.button.top, width: origin.current.button.width, height: origin.current.button.height }}><span>Project Details</span><span>[ + ]</span></div>}
        {enabled && <div className="project-details-panel" inert={!open} aria-hidden={!open}>
          <div ref={surface} className={`project-details-surface${drawerClosing ? " is-morphing-to-trigger" : ""}`} />

          <div ref={copy} className="project-details-copy" tabIndex={open ? 0 : -1} role="region" aria-label="Project description">
            <button ref={closeButton} className="project-details-close" aria-label="Close project details" onClick={() => void close()}><span aria-hidden="true">[ − ]</span></button>
          <div className="project-details-brand">{project.logo ? <ProjectImageView image={project.logo} alt={`${project.client} logo`} sizes="180px" /> : <p>{project.name}</p>}</div>
          <div className="project-accordion">{project.details?.map((detail, index) => {
            const active = expanded === detail._key;
            const id = `project-detail-${index}`;
            return <div className={`project-accordion-item${active ? " is-expanded" : ""}`} key={detail._key}>
              <h2><button aria-expanded={active} aria-controls={id} onClick={() => setExpanded(active ? null : detail._key)}>{detail.title}<span aria-hidden="true">{active ? "[ − ]" : "[ + ]"}</span></button></h2>
              <div id={id} className="project-accordion-body" inert={!active}><div>{detail.body.split(/\n\s*\n/).map((paragraph, i) => <p key={i}>{paragraph}</p>)}</div></div>
            </div>;
          })}</div>
          </div>
        </div>}
        <div ref={gallery} id="case-study-media" className="project-media project-details-gallery" inert={open && mobileDrawer.current} tabIndex={open ? 0 : undefined} role={open ? "region" : undefined} aria-label={open ? "Case-study images and videos" : undefined}>{children}</div>
      </div>
    </div>
    {enabled && <button ref={trigger} className={`project-details-trigger${visible ? " is-visible" : ""}${open ? " is-expanded" : ""}${settling ? " is-settling" : ""}`} aria-haspopup="dialog" aria-expanded={open} tabIndex={visible && !open ? 0 : -1} onClick={show}><span>Project Details</span><span aria-hidden="true">[ + ]</span></button>}
  </>;
}
