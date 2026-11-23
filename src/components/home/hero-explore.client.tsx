"use client";

import { useEffect, useRef, useState } from "react";
import { SiteButton } from "@/components/site/site-button";

type GalleryImage = { src: string; x: number; y: number; width: number; height: number };

export function HeroExplore() {
  const button = useRef<HTMLButtonElement>(null);
  const [entering, setEntering] = useState(false);
  const cancelTransition = useRef<(() => void) | null>(null);
  const release = useRef(() => {});
  useEffect(() => {
    const hero = button.current?.closest("section");
    if (!hero || !document.querySelector(".home .showcase")) return;
    const root = document.documentElement;
    let transitioning = false;
    const sync = () => {
      root.toggleAttribute("data-hero-locked", transitioning || window.scrollY < 2);
    };
    release.current = () => { transitioning = false; sync(); };
    const hold = () => { transitioning = true; sync(); };
    hero.addEventListener("hero:capture", hold);
    window.addEventListener("scroll", sync, { passive: true });
    sync();
    return () => {
      cancelTransition.current?.();
      hero.removeEventListener("hero:capture", hold);
      window.removeEventListener("scroll", sync);
      root.removeAttribute("data-hero-locked");
    };
  }, []);

  const explore = async () => {
    const hero = button.current?.closest("section");
    const showcase = document.querySelector<HTMLElement>(".home .showcase");
    if (!hero || !showcase || cancelTransition.current) return;
    setEntering(true);
    let images: GalleryImage[] = [];
    hero.dispatchEvent(new CustomEvent("hero:capture", { detail: (cards: GalleryImage[]) => { images = cards; } }));
    // Capture already ranks distinct visible artworks by their prominence.
    const list = showcase.querySelector<HTMLOListElement>(".showcase__list");
    if (list && images.length) {
      const items = Array.from(list.children);
      const promoted = images.flatMap(image => {
        const item = items.find(child => child.querySelector<HTMLElement>("[data-artwork]")?.dataset.artwork === image.src);
        return item ? [item] : [];
      });
      list.prepend(...promoted);
    }
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const overlay = document.createElement("div");
    Object.assign(overlay.style, { position: "fixed", inset: "0", zIndex: "1000", pointerEvents: "none", overflow: "hidden" });
    document.body.appendChild(overlay);
    const artwork = Array.from(showcase.querySelectorAll<HTMLElement>("[data-artwork]"));
    const artworkBySource = new Map(artwork.map(media => [media.dataset.artwork, media]));
    const tiles = images.map(image => {
      const tile = document.createElement("img");
      const projectImage = artworkBySource.get(image.src)?.querySelector("img");
      tile.src = projectImage?.currentSrc || image.src;
      tile.alt = "";
      Object.assign(tile.style, { position: "absolute", left: `${image.x}px`, top: `${image.y}px`, width: `${image.width}px`, height: `${image.height}px`, objectFit: "cover", willChange: "transform" });
      overlay.appendChild(tile);
      return tile;
    });
    const animations: Animation[] = [];
    const heroProperties = ["position", "inset", "width", "z-index"];
    const initialHeroStyles = heroProperties.map(property => hero.style.getPropertyValue(property));
    let cancelled = false;
    const restoreHero = () => {
      heroProperties.forEach((property, index) => {
        hero.style.setProperty(property, initialHeroStyles[index]);
      });
      hero.dispatchEvent(new Event("hero:restore"));
      overlay.remove();
      animations.forEach(animation => animation.cancel());
    };
    cancelTransition.current = () => {
      cancelled = true;
      restoreHero();
      cancelTransition.current = null;
    };
    try {
      // Removing the hero from document flow brings the live showcase underneath it.
      Object.assign(hero.style, { position: "fixed", inset: "0", width: "100%" });
      window.dispatchEvent(new Event("resize"));
      hero.style.zIndex = "5";
      const timing: KeyframeAnimationOptions = { duration: reduced ? 0 : 1900, easing: "cubic-bezier(.45,0,.18,1)", fill: "both" };
      animations.push(hero.animate([
        { opacity: 1 }, { opacity: .92, offset: .48 }, { opacity: 0 },
      ], timing));
      const stage = showcase.querySelector<HTMLElement>(".showcase__track");
      const destinations = Array.from(showcase.querySelectorAll<HTMLElement>(".showcase-card__media"));
      const ordered = [...images].sort((a, b) => destinations.findIndex(el => el.dataset.artwork === a.src) - destinations.findIndex(el => el.dataset.artwork === b.src));
      const step = Math.min(innerWidth / (ordered.length + 1), innerHeight * .22);
      tiles.forEach((tile, index) => {
        const target = Array.from(destinations).find(media => media.dataset.artwork === images[index].src)?.getBoundingClientRect();
        if (!target) return;
        const source = images[index];
        tile.style.transformOrigin = "top left";
        const rowX = innerWidth / 2 + (ordered.indexOf(source) - ordered.length / 2) * step;
        const rowScale = step * .8 / source.width;
        const rowY = innerHeight / 2 - source.height * rowScale / 2;
        const row = `translate(${rowX - source.x}px,${rowY - source.y}px) scale(${rowScale})`;
        const landing = `translate(${target.left - source.x}px,${target.top - source.y}px) scale(${target.width / source.width},${target.height / source.height})`;
        animations.push(tile.animate([
          { transform: "none", opacity: .75 },
          { transform: row, opacity: 1, offset: .48 },
          { transform: landing, opacity: 1 },
        ], timing));
      });
      if (stage) animations.push(stage.animate([
        { scale: ".62", opacity: 0 }, { scale: ".62", opacity: 0, offset: .48 }, { scale: "1", opacity: 1 },
      ], timing));
      await Promise.allSettled(animations.map(animation => animation.finished));
    } finally {
      if (!cancelled) {
        // Restore document flow and keep the showcase at the same visual position.
        restoreHero();
        if (hero.isConnected && showcase.isConnected) {
          window.scrollTo({ top: showcase.getBoundingClientRect().top + window.scrollY, behavior: "instant" });
          window.dispatchEvent(new Event("resize"));
        }
        cancelTransition.current = null;
        release.current();
        setEntering(false);
      }
    }
  };
  return <SiteButton as="button" custom ref={button} onClick={explore} disabled={entering} className="hero-explore">Explore <span aria-hidden="true">↗</span></SiteButton>;
}
