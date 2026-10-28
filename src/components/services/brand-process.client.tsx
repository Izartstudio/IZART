"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const processSteps = [
  {
    weekStart: "Week 01",
    weekEnd: "Week 02",
    number: "01",
    title: "Brand Workshop",
    description: "Deep alignment with founders on business, audience, and ambition. We surface what the brand needs to mean.",
    images: ["6a1fd36c6df76cc8544441a2", "6a1fd36c1a0f910156add78f", "6a1fd36df0f473c176096798", "6a1fd36dad0e35796b5837ab", "6a1fd36d450bf157f8f7424b", "6a1fcca321243b7c5ff37226", "6a1fd36ce697e71acd37f07b", "6a1fd36c8264778479d37da2", "6a1fd36cd5b6c7f6ec0eb342"],
  },
  {
    weekStart: "Week 02",
    weekEnd: "Week 03",
    number: "02",
    title: "Cultural Listening",
    description: "Reading the cultural and competitive terrain to find where the brand can stand alone.",
    images: ["6a1fd3d35dea8574d11e2bf1", "6a1fd3d4a75a30b1accef035", "6a1fd3d34e1ce8c9581fd24c", "6a1fd3d4c257715c4dc3e9b9", "6a1fd3d47cfb09bb6bfd01f5", "6a1fd3d41a0f910156ae0906", "6a1fd3d360c25a95e44c1ffe", "6a1fd3d4926a8ad261da3e30", "6a1fd3d370e05321b1ec1ca4"],
  },
  {
    weekStart: "Week 03",
    weekEnd: "Week 04",
    number: "03",
    title: "Brand Strategy",
    description: "Locking the brand's positioning, narrative, audience, and the strategic foundation that everything visual will sit on.",
    images: ["6a1fd4938618e804e36c4ad7", "6a1fd4936855a94cc688e2de", "6a1fd493966bb733704c55f6", "6a1fd494305eddf3aa13d9d7", "6a1fd493db6cc5cf2d55a1be", "6a1fd493d790b3f42949cd1d", "6a1fd493288bfc22a2b58858", "6a1fd4938264778479d43a15", "6a1fd4938618e804e36c4ad4"],
  },
  {
    weekStart: "Week 04",
    weekEnd: "Week 05",
    number: "04",
    title: "Visual Directions",
    description: "Exploring two to three creative directions in parallel. Each one a distinct, complete answer to the strategy.",
    images: ["6a1fd501fdd5ade0d4f7caa8", "6a1fd500d5b6c7f6ec0f931e", "6a1fd50037309d828b74ce57", "6a1fd500961cf83ec417c5fa", "6a1fd500c544e27b9e25c80f", "6a1fd500450bf157f8f84657", "6a1fd5004b6bd9d9ecf9a52b", "6a1fd500c257715c4dc47fcc", "6a1fd500ae02932f4c3ca665"],
  },
  {
    weekStart: "Week 05",
    weekEnd: "Week 07",
    number: "05",
    title: "Identity System",
    description: "Building the chosen direction into a full identity: logo suite, type system, colour, visual language, verbal voice.",
    images: ["6a1fd5ca9652b68b677de471", "6a1fd5ca6dc94d2a179137fe", "6a1fd5ca0e71de90c38dba97", "6a1fd5ca43244fa9125e5bfb", "6a1fd5cad98e31286b6a8f2e", "6a1fd5ca796deb958e2280cb", "6a1fd5cadb6cc5cf2d565fe8", "6a1fd500961cf83ec417c5fa", "6a1fd5ca1e7b98c7a642f7b7"],
  },
  {
    weekStart: "Week 07",
    weekEnd: "Week 08",
    number: "06",
    title: "Brand Guidelines + Handoff",
    description: "Documentation, brand guidelines, and a design system handover ready for deployment across digital and physical surfaces.",
    images: ["6a1fd682ee13b256f4eee6e3", "6a1fd108dda7063ac0881a27", "6a1fd6831ba1997555c0b494", "6a1fd36ce697e71acd37f07b", "6a1fd6831ba1997555c0b498", "6a1fd10850cb4e7040be7856", "6a1fd682a2dc27843efc45f1", "6a1fd6831e7b98c7a6436da9", "6a1fd68221243b7c5ff8ef23"],
  },
] as const;

export function BrandProcess() {
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
  }, []);

  const step = processSteps[activeStep];

  return <section ref={sectionRef} className="brand-process" aria-labelledby="brand-process-title">
    <div className="brand-process__sticky">
      <div ref={trackRef} className="brand-process__track" aria-hidden="true">
        {processSteps.map((item, stepIndex) => <div className="brand-process__scene" key={item.number}>
          {item.images.map((image, imageIndex) => <div className={`brand-process__image brand-process__image--${imageIndex + 1}`} key={image}>
            <Image
              src={`/assets/services/process/${image}.png`}
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
