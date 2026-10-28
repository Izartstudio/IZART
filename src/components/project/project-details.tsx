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
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [settling, setSettling] = useState(false);
  const [placeholderHeight, setPlaceholderHeight] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(project.details?.[0]?._key || null);
  const enabled = Boolean(project.details?.length && project.media.length);

  useEffect(() => {
    const update = () => {
      if (open || !gallery.current) return;
      const { top } = gallery.current.getBoundingClientRect();
      // Match the reference: media starts below the remaining services row.
      // No end boundary: keep the control available through the rest of the page.
      setVisible(top <= window.innerHeight * 0.14);
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
    document.body.style.overflow = "hidden";
    const hero = document.querySelector<HTMLElement>(".project-hero");
    const previousInert = hero?.inert;
    if (hero) hero.inert = true;
    const target = media.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    const scale = target.width / old.media.width;
    media.scrollTop = Math.max(0, -old.media.top) * scale;
    const mediaStart = `translate(${-target.left}px, ${Math.max(0, old.media.top) - target.top}px) scale(${1 / scale})`;
    const panelStart = { left: `${old.button.left - panelRect.left}px`, top: `${old.button.top - panelRect.top}px`, width: `${old.button.width}px`, height: `${old.button.height}px`, boxShadow: "15px 15px 15px #0004" };
    const panelEnd = { left: "0px", top: "0px", width: `${panelRect.width}px`, height: `${panelRect.height}px`, boxShadow: "0px 0px 0px #0000" };
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const options = { duration: reduced ? 0 : motion.expand, easing };
    const revealOptions = { duration: reduced ? 0 : motion.reveal, delay: reduced ? 0 : motion.revealDelay, easing, fill: "both" as FillMode };
    content.inert = true;
    const movement = [
      media.animate([{ transform: mediaStart }, { transform: "none" }], options),
      panel.animate([panelStart, panelEnd], options),
    ];
    const reveal = content.animate([
      { opacity: 0 },
      { opacity: 1 },
    ], revealOptions);
    animations.current = [...movement, reveal];
    // Focus the workspace while the panel is blank; no premature close-button outline.
    workspace.current?.focus({ preventScroll: true });
    Promise.all(movement.map(animation => animation.finished)).then(() => { busy.current = false; }).catch(() => {});
    reveal.finished.then(() => {
      content.inert = false;
    }).catch(() => {});
    return () => {
      animations.current.forEach(animation => animation.cancel());
      content.inert = false;
      document.body.style.overflow = previousOverflow;
      if (hero) hero.inert = previousInert || false;
    };
  }, [open]);

  const show = () => {
    if (busy.current || !gallery.current || !trigger.current) return;
    busy.current = true;
    const media = gallery.current.getBoundingClientRect();
    origin.current = { button: trigger.current.getBoundingClientRect(), media, documentTop: media.top + window.scrollY, scrollY: window.scrollY };
    setPlaceholderHeight(media.height);
    setOpen(true);
  };
  const close = async () => {
    if (busy.current) return;
    busy.current = true;
    const media = gallery.current!;
    const target = media.getBoundingClientRect();
    const panelRect = surface.current!.getBoundingClientRect();
    const old = origin.current;
    const fullWidth = shell.current!.getBoundingClientRect().width;
    const scale = fullWidth / target.width;
    const scrollY = media.scrollTop > 0 ? old.documentTop + media.scrollTop * scale : Math.min(old.scrollY, old.documentTop);
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
    <div ref={shell} className={`project-details-shell${open ? " is-open" : ""}`} style={open ? { height: placeholderHeight } : undefined}>
      <div ref={workspace} className="project-details-workspace" tabIndex={-1} role={open ? "dialog" : undefined} aria-modal={open || undefined} aria-label={open ? `${project.name} project details` : undefined}
        onKeyDown={event => {
          if (!open) return;
          if (event.key === "Escape") { event.preventDefault(); void close(); }
          if (event.key === "Tab") {
            const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>(focusable)).filter(item => !item.closest('[inert]') && item.getClientRects().length);
            const first = items[0]; const last = items[items.length - 1];
            if (document.activeElement === workspace.current) { event.preventDefault(); (event.shiftKey ? last : first)?.focus(); }
            else if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
          }
        }}>
        {enabled && <div className="project-details-panel" inert={!open} aria-hidden={!open}>
          <div ref={surface} className="project-details-surface" />
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
        <div ref={gallery} id="case-study-media" className="project-media project-details-gallery" tabIndex={open ? 0 : undefined} role={open ? "region" : undefined} aria-label={open ? "Case-study images and videos" : undefined}>{children}</div>
      </div>
    </div>
    {enabled && <button ref={trigger} className={`project-details-trigger${visible ? " is-visible" : ""}${open ? " is-expanded" : ""}${settling ? " is-settling" : ""}`} aria-haspopup="dialog" aria-expanded={open} tabIndex={visible && !open ? 0 : -1} onClick={show}><span>Project Details</span><span aria-hidden="true">[ + ]</span></button>}
  </>;
}
