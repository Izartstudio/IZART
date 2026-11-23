"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { heroImages } from "@/content/hero-images";
import { ArtworkStrip } from "./artwork-strip";

export function FooterImageCycle() {
  const hostRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const image = imageRef.current;
    if (!host || !image) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const ready = new Set([heroImages[0]]);
    let visible = false;
    let loading = false;
    let disposed = false;
    let index = 0;
    let timer: ReturnType<typeof setInterval> | undefined;

    const stop = () => {
      clearInterval(timer);
      timer = undefined;
    };
    const sync = () => {
      stop();
      if (!visible || document.hidden || motion.matches) return;
      if (!loading) {
        loading = true;
        heroImages.slice(1).forEach(src => {
          const preload = new window.Image();
          preload.src = src;
          void preload.decode().then(() => {
            if (!disposed) ready.add(src);
          }).catch(() => undefined);
        });
      }
      timer = setInterval(() => {
        for (let offset = 1; offset < heroImages.length; offset += 1) {
          const next = (index + offset) % heroImages.length;
          if (ready.has(heroImages[next])) {
            index = next;
            image.src = heroImages[index];
            break;
          }
        }
      }, 250);
    };

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    observer.observe(host);
    motion.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    return () => {
      disposed = true;
      stop();
      observer.disconnect();
      motion.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return <div ref={hostRef} className="site-footer__marquee-feature">
    <Image ref={imageRef} src={heroImages[0]} alt="" width={270} height={270} unoptimized />
    <ArtworkStrip />
    <ArtworkStrip edge="bottom" />
  </div>;
}
