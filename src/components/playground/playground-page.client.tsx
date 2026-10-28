"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PlaygroundPageData } from "@/content/playground";
import { projectCard, worldPosition, wrap } from "./depth-stream";

type CardSelection = { genre: number; index: number };

export function PlaygroundPageView({ page }: { page: PlaygroundPageData }) {
  const host = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const decodedImages = useRef(new Set<string>());
  const imageRequest = useRef(0);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const switchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [activeGenre, setActiveGenre] = useState(0);
  const [selected, setSelected] = useState<CardSelection | null>(null);
  const [previousSelected, setPreviousSelected] = useState<CardSelection | null>(null);
  const [isCardOpen, setIsCardOpen] = useState(false);
  const [switchDirection, setSwitchDirection] = useState<-1 | 1>(1);
  const genre = page.genres[activeGenre];
  const overlayOpen = useRef(false);
  const navigateGenre = useRef<(index: number) => void>(() => undefined);

  const ensureImageReady = useCallback(async (url: string) => {
    if (decodedImages.current.has(url)) return true;
    const image = new window.Image();
    const loaded = new Promise<boolean>(resolve => {
      image.onload = () => resolve(true);
      image.onerror = () => resolve(false);
    });
    image.src = url;
    const didLoad = image.complete ? image.naturalWidth > 0 : await loaded;
    if (!didLoad) return false;
    try { await image.decode(); } catch { /* onload already confirmed usable pixels */ }
    decodedImages.current.add(url);
    return true;
  }, []);

  const openCard = useCallback(async (selection: CardSelection) => {
    const request = ++imageRequest.current;
    const card = page.genres[selection.genre].cards[selection.index];
    if (!await ensureImageReady(card.image.url) || request !== imageRequest.current) return;
    if (closeTimer.current) clearTimeout(closeTimer.current);
    if (switchTimer.current) clearTimeout(switchTimer.current);
    setPreviousSelected(null);
    setSelected(selection);
    overlayOpen.current = true;
    setIsCardOpen(true);
  }, [ensureImageReady, page.genres]);

  const closeCard = useCallback(() => {
    imageRequest.current += 1;
    overlayOpen.current = false;
    setIsCardOpen(false);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => {
      setSelected(null);
      setPreviousSelected(null);
    }, 520);
  }, []);

  const switchCard = useCallback(async (direction: -1 | 1) => {
    if (!selected) return;
    const cards = page.genres[selected.genre].cards;
    const nextSelection = { ...selected, index: (selected.index + direction + cards.length) % cards.length };
    const nextCard = cards[nextSelection.index];
    const request = ++imageRequest.current;
    if (!await ensureImageReady(nextCard.image.url) || request !== imageRequest.current) return;
    if (switchTimer.current) clearTimeout(switchTimer.current);
    setSwitchDirection(direction);
    setPreviousSelected(selected);
    setSelected(nextSelection);
    switchTimer.current = setTimeout(() => setPreviousSelected(null), 780);
  }, [ensureImageReady, page.genres, selected]);

  const goToGenre = useCallback((index: number) => navigateGenre.current(index), []);

  useEffect(() => {
    const container = stage.current;
    const scrollHost = host.current;
    if (!container || !scrollHost) return;
    const count = page.genres.length;
    const motionPreference = matchMedia("(prefers-reduced-motion: reduce)");
    const cards = Array.from(container.querySelectorAll<HTMLButtonElement>(".playground-card")).map(element => {
      const genreIndex = Number(element.dataset.genreIndex);
      const index = Number(element.dataset.cardIndex);
      return {
        element, genreIndex,
        birth: genreIndex + index / page.genres[genreIndex].cards.length,
        world: worldPosition(index, genreIndex),
        sharp: element.querySelector<HTMLElement>(".playground-card__sharp")!,
        blurred: element.querySelector<HTMLElement>(".playground-card__blurred")!,
      };
    });
    const ambient = container.querySelector<HTMLElement>(".playground-ambient")!;
    const grid = container.querySelector<HTMLElement>(".playground-grid")!;
    let width = container.clientWidth, height = container.clientHeight;
    let top = 0, distance = 1, cycle = 0, lastGenre = -1;
    // Start with an already populated tunnel; each genre occupies one scroll segment.
    let camera = .85, target = .85;
    let frame = 0, lastTime = 0, dirty = true;
    let scrollDirty = true;
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const measure = () => {
      width = container.clientWidth;
      height = container.clientHeight;
      top = scrollHost.getBoundingClientRect().top + window.scrollY;
      distance = Math.max(1, scrollHost.offsetHeight - window.innerHeight);
      dirty = true;
      scrollDirty = true;
      schedule();
    };
    const render = () => {
      const reduced = motionPreference.matches;
      const nextGenre = Math.floor(wrap(camera, count));
      if (nextGenre !== lastGenre) {
        lastGenre = nextGenre;
        setActiveGenre(nextGenre);
      }
      for (const card of cards) {
        const projection = projectCard(camera, card.birth, count);
        const visible = reduced ? card.genreIndex === nextGenre : projection.visible;
        card.element.hidden = !visible;
        if (!visible) continue;
        const scale = reduced ? .85 : projection.scale;
        const x = (card.world.x * width + pointer.x * 20) * scale;
        const y = (card.world.y * height + pointer.y * 14) * scale;
        card.element.style.transform = `translate3d(${x.toFixed(3)}px,${y.toFixed(3)}px,0) translate(-50%,-50%) scale(${scale.toFixed(5)})`;
        card.element.style.opacity = reduced ? "1" : projection.opacity.toFixed(4);
        card.element.style.zIndex = String(1000 - Math.round(projection.age * 500));
        const blur = reduced ? 0 : projection.blur;
        card.sharp.style.opacity = (1 - blur).toFixed(4);
        card.blurred.style.opacity = blur.toFixed(4);
        card.element.tabIndex = projection.opacity > .25 || reduced ? 0 : -1;
      }
      ambient.style.transform = `translate3d(${-pointer.x * 7}px,${-pointer.y * 5}px,0) scale(1.04)`;
      grid.style.transform = `translate3d(${-pointer.x * 4}px,${-pointer.y * 3}px,0) perspective(390px) rotateX(63deg) scale(1.5)`;
    };
    const tick = (time: number) => {
      frame = 0;
      const dt = lastTime ? Math.min(32, time - lastTime) : 16.67;
      lastTime = time;
      if (scrollDirty) {
        scrollDirty = false;
        const local = Math.max(0, Math.min(1, (window.scrollY - top) / distance));
        target = .85 + cycle + local * count;
        if (local >= 1) {
          // Recenter the physical scrollbar without resetting the virtual camera.
          cycle += count;
          window.scrollTo({ top: top + 1, behavior: "instant" });
        }
      }
      if (!overlayOpen.current) {
        const ease = motionPreference.matches ? 1 : 1 - Math.exp(-dt / 145);
        camera += (target - camera) * ease;
        if (Math.abs(target - camera) < .00001) camera = target;
      }
      const pointerEase = 1 - Math.exp(-dt / 180);
      pointer.x += (pointer.tx - pointer.x) * pointerEase;
      pointer.y += (pointer.ty - pointer.y) * pointerEase;
      if (dirty || !overlayOpen.current) render();
      dirty = false;
      if ((!overlayOpen.current && Math.abs(target - camera) > .00001) ||
        Math.abs(pointer.tx - pointer.x) > .0001 || Math.abs(pointer.ty - pointer.y) > .0001) {
        frame = requestAnimationFrame(tick);
      } else lastTime = 0;
    };
    function schedule() { if (!frame && !document.hidden) frame = requestAnimationFrame(tick); }
    const onScroll = () => { scrollDirty = true; schedule(); };
    const onPointer = (event: PointerEvent) => {
      if (motionPreference.matches || event.pointerType === "touch") return;
      pointer.tx = event.clientX / width * 2 - 1;
      pointer.ty = event.clientY / height * 2 - 1;
      schedule();
    };
    const resetPointer = () => { pointer.tx = 0; pointer.ty = 0; schedule(); };
    const resume = () => { lastTime = 0; dirty = true; scrollDirty = true; schedule(); };
    navigateGenre.current = index => {
      window.scrollTo({ top: top + distance * index / count, behavior: motionPreference.matches ? "instant" : "smooth" });
    };
    // Closing the dialog can leave a pending scroll target: resume without a new scroll.
    const observer = new MutationObserver(resume);
    observer.observe(container.querySelector(".playground-active")!, { attributes: true, attributeFilter: ["class"] });
    measure();
    render();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    container.addEventListener("pointermove", onPointer, { passive: true });
    container.addEventListener("pointerleave", resetPointer);
    document.addEventListener("visibilitychange", resume);
    motionPreference.addEventListener("change", resume);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      navigateGenre.current = () => undefined;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      container.removeEventListener("pointermove", onPointer);
      container.removeEventListener("pointerleave", resetPointer);
      document.removeEventListener("visibilitychange", resume);
      motionPreference.removeEventListener("change", resume);
    };
  }, [page.genres]);

  useEffect(() => {
    if (selected === null) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") closeCard(); };
    addEventListener("keydown", close);
    return () => removeEventListener("keydown", close);
  }, [closeCard, selected]);

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    if (switchTimer.current) clearTimeout(switchTimer.current);
  }, []);

  useEffect(() => {
    page.genres.forEach(item => item.cards.forEach(card => {
      void ensureImageReady(card.image.url);
    }));
  }, [ensureImageReady, page.genres]);

  const selectedGenre = selected ? page.genres[selected.genre] : null;
  const selectedCard = selected && selectedGenre ? selectedGenre.cards[selected.index] : null;
  const previousCard = previousSelected ? page.genres[previousSelected.genre].cards[previousSelected.index] : null;
  const sibling = (delta: number) => selected && selectedGenre ? selectedGenre.cards[(selected.index + delta + selectedGenre.cards.length) % selectedGenre.cards.length] : null;

  return <main id="main" className="playground" style={{ "--playground-accent": genre.accent } as CSSProperties}>
    <h1 className="sr-only">{page.title}</h1>
    <section ref={host} className="playground-scroll" style={{ height: `${(page.genres.length * 2.8 + 1) * 100}svh` }} aria-label="Playground genres">
      <div ref={stage} className="playground-stage">
        <div className="playground-ambient" aria-hidden="true" />
        <div className="playground-grid" aria-hidden="true" />

        <nav className="playground-rail" aria-label="Choose a genre">
          {page.genres.map((item, index) => <button key={item._key} type="button" aria-label={`Show ${item.name}`} aria-current={index === activeGenre ? "true" : undefined} onClick={() => goToGenre(index)} />)}
          <span className="playground-rail__marker" style={{ "--genre-index": activeGenre } as CSSProperties} aria-hidden="true" />
          <p className="playground-genre" style={{ "--genre-index": activeGenre } as CSSProperties} aria-live="polite">{genre.name}</p>
        </nav>

        <div className="playground-scenes" inert={isCardOpen}>
          {page.genres.flatMap((sceneGenre, genreIndex) => sceneGenre.cards.map((card, index) =>
            <button className="playground-card" type="button"
              data-card-index={index} data-genre-index={genreIndex}
              key={`${sceneGenre._key}-${card._key}`}
              onClick={() => void openCard({ genre: genreIndex, index })} aria-label={`Open ${card.title}`}>
              <Image className="playground-card__sharp" src={card.image.url} width={card.image.width} height={card.image.height} sizes="384px" alt={card.image.alt} loading="eager" />
              <Image className="playground-card__blurred" src={card.image.url} width={card.image.width} height={card.image.height} sizes="384px" alt="" aria-hidden="true" loading="eager" />
            </button>
          ))}
        </div>

        <div className={`playground-active${selectedCard ? isCardOpen ? " is-open" : " is-closing" : ""}`} aria-hidden={!isCardOpen} inert={!isCardOpen ? true : undefined}>
          <button className="playground-active__backdrop" type="button" aria-label="Close project" onClick={closeCard} />
          {selectedCard && <div className="playground-active__carousel" role="dialog" aria-modal="true" aria-label={`${selectedCard.title} project preview`} onClick={event => { if (event.target === event.currentTarget) closeCard(); }}>
            <button className="playground-active__side playground-active__side--previous" type="button" onClick={() => switchCard(-1)} aria-label="Previous project">
              <Image key={sibling(-1)!.image.url} src={sibling(-1)!.image.url} width={sibling(-1)!.image.width} height={sibling(-1)!.image.height} unoptimized alt="" />
            </button>
            <div className={`playground-active__primary${previousCard ? switchDirection > 0 ? " is-switching-next" : " is-switching-previous" : ""}`}>
              <h2 key={selectedCard._key}>{selectedCard.title}</h2>
              <div className="playground-active__media">
                <Image className="playground-active__media-base" src={selectedCard.image.url} width={selectedCard.image.width} height={selectedCard.image.height} sizes="376px" unoptimized alt="" />
                {previousCard && <Image className="playground-active__media-outgoing" src={previousCard.image.url} width={previousCard.image.width} height={previousCard.image.height} sizes="376px" unoptimized alt="" />}
                <Image key={selectedCard._key} className="playground-active__media-incoming" src={selectedCard.image.url} width={selectedCard.image.width} height={selectedCard.image.height} sizes="376px" unoptimized alt={selectedCard.image.alt} />
              </div>
              <div className="playground-active__controls">
                <button type="button" onClick={() => switchCard(-1)} aria-label="Previous project">
                  <svg viewBox="0 0 18 16" aria-hidden="true"><path d="M7.45 0 0 7.42l7.45 7.43 1.12-1.15-5.54-5.56 13.44.03V6.62H3.03l5.5-5.54L7.45 0Z" fill="currentColor" /></svg>
                </button>
                <time key={selectedCard._key}>{selectedCard.year || "2026"}</time>
                <button type="button" onClick={() => switchCard(1)} aria-label="Next project">
                  <svg viewBox="0 0 18 16" aria-hidden="true"><path d="m10.55 0 7.45 7.42-7.45 7.43-1.12-1.15 5.54-5.56-13.44.03V6.62h13.44L9.47 1.08 10.55 0Z" fill="currentColor" /></svg>
                </button>
              </div>
            </div>
            <button className="playground-active__side playground-active__side--next" type="button" onClick={() => switchCard(1)} aria-label="Next project">
              <Image key={sibling(1)!.image.url} src={sibling(1)!.image.url} width={sibling(1)!.image.width} height={sibling(1)!.image.height} unoptimized alt="" />
            </button>
          </div>}
        </div>

        <div className="playground-player" aria-label="Future genre player">
          <div className="playground-player__art"><Image src={genre.cards[0].image.url} width={genre.cards[0].image.width} height={genre.cards[0].image.height} alt="" /></div>
          <div className="playground-player__label"><span>Now exploring</span><strong>{genre.name}</strong></div>
          <span className="playground-player__wave" aria-hidden="true">{Array.from({ length: 15 }, (_, index) => <i key={index} />)}</span>
          <span className="playground-player__brand">PLAY.<em>GROUND</em></span>
        </div>
      </div>
    </section>
  </main>;
}
