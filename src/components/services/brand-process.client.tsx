"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { defaultProcessSteps, type ServiceProcessStep } from "./service-detail-defaults";

export function BrandProcess({ steps = defaultProcessSteps }: { steps?: ServiceProcessStep[] }) {
  const processSteps = steps.length ? steps : defaultProcessSteps;
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let target = 0;
    let current = 0;
    let targetParallaxX = 0;
    let targetParallaxY = 0;
    let parallaxX = 0;
    let parallaxY = 0;

    const measure = () => {
      const start = section.offsetTop;
      const distance = Math.max(1, section.offsetHeight - window.innerHeight);
      target = Math.max(0, Math.min(1, (window.scrollY - start) / distance));
      const nextStep = Math.min(processSteps.length - 1, Math.floor(target * processSteps.length));
      setActiveStep(previous => previous === nextStep ? previous : nextStep);
    };

    const render = () => {
      current = reducedMotion ? target : current + (target - current) * .09;
      parallaxX += (targetParallaxX - parallaxX) * .075;
      parallaxY += (targetParallaxY - parallaxY) * .075;
      track.style.transform = `translate3d(${-current * (processSteps.length - 1) * 100}vw,0,0)`;
      section.style.setProperty("--process-parallax-x", `${parallaxX}px`);
      section.style.setProperty("--process-parallax-y", `${parallaxY}px`);
      const isMoving = Math.abs(target - current) > .0001
        || Math.abs(targetParallaxX - parallaxX) > .05
        || Math.abs(targetParallaxY - parallaxY) > .05;
      if (!reducedMotion && isMoving) frame = requestAnimationFrame(render);
      else frame = 0;
    };

    const update = () => {
      measure();
      if (!frame) frame = requestAnimationFrame(render);
    };

    const moveScene = (event: PointerEvent) => {
      if (reducedMotion || event.pointerType === "touch") return;
      const bounds = section.getBoundingClientRect();
      targetParallaxX = (0.5 - event.clientX / bounds.width) * 54;
      targetParallaxY = (0.5 - event.clientY / window.innerHeight) * 30;
      if (!frame) frame = requestAnimationFrame(render);
    };

    const resetScene = () => {
      targetParallaxX = 0;
      targetParallaxY = 0;
      if (!frame) frame = requestAnimationFrame(render);
    };

    update();
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", update);
    section.addEventListener("pointermove", moveScene, { passive: true });
    section.addEventListener("pointerleave", resetScene);
    return () => {
      removeEventListener("scroll", update);
      removeEventListener("resize", update);
      section.removeEventListener("pointermove", moveScene);
      section.removeEventListener("pointerleave", resetScene);
      cancelAnimationFrame(frame);
    };
  }, [processSteps]);

  const step = processSteps[activeStep];

  return <section ref={sectionRef} className="brand-process" aria-labelledby="brand-process-title">
    <div className="brand-process__sticky">
      <div ref={trackRef} className="brand-process__track" aria-hidden="true">
        {processSteps.map((item, stepIndex) => <div className="brand-process__scene" key={item.number}>
          {item.images.map((image, imageIndex) => <div className={`brand-process__image brand-process__image--${imageIndex + 1}`} key={image}>
            <Image
              src={image.startsWith("/") || image.startsWith("https://") ? image : `/assets/services/process/${image}.png`}
              alt=""
              fill
              sizes="20vw"
              priority={stepIndex === 0}
            />
          </div>)}
        </div>)}
      </div>
      <h2 id="brand-process-title" className="brand-process__label">Our Process</h2>
      <article className="brand-process__card">
        <div className="brand-process__card-copy" key={step.number}>
          <div className="brand-process__weeks">
            <span>{step.weekStart}</span>
            <i aria-hidden="true" />
            <span>{step.weekEnd}</span>
          </div>
          <div className="brand-process__content">
            <strong>{step.number}</strong>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
          </div>
        </div>
      </article>
    </div>
  </section>;
}
