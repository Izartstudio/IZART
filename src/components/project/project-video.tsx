"use client";
import { useEffect, useRef, useState } from "react";
import type { VideoPanel } from "@/content/project";
export function ProjectVideo({ panel }: { panel: VideoPanel }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let visible = false;
    let manuallyPaused = false;
    let automaticPause = false;
    const sync = () => {
      if (panel.mode !== "loop") return;
      if (visible && !document.hidden && !motion.matches && !manuallyPaused) {
        video.play().catch(() => { /* Native controls remain available if autoplay is blocked. */ });
      } else if (!video.paused) { automaticPause = true; video.pause(); }
    };
    const pause = () => { if (!automaticPause) manuallyPaused = true; automaticPause = false; };
    const play = () => { manuallyPaused = false; };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }, { threshold: 0.15 });
    observer.observe(video);
    motion.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    video.addEventListener("pause", pause);
    video.addEventListener("play", play);
    return () => { observer.disconnect(); motion.removeEventListener("change", sync); document.removeEventListener("visibilitychange", sync); video.removeEventListener("pause", pause); video.removeEventListener("play", play); };
  }, [panel.mode]);
  return <div className="project-video">
    <video ref={ref} controls playsInline preload="none" muted={panel.mode === "loop"} loop={panel.mode === "loop"}
      poster={panel.poster.url} width={panel.poster.width} height={panel.poster.height} aria-label={panel.title} onError={() => setFailed(true)}>
      <source src={panel.url} />
      {panel.captionsUrl && <track kind="captions" src={panel.captionsUrl} srcLang="en" label="English" default />}
      <a href={panel.url}>Watch {panel.title}</a>
    </video>
    {failed && <p className="video-error">This video could not load. <a href={panel.url}>Open video</a></p>}
  </div>;
}
