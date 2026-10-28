"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { ServicesHeroImage } from "@/sanity/services";

type Props = {
  images: ServicesHeroImage[];
  layout?: "fan" | "brand-identity";
};

/** Seven fixed slots traced from the 1440 × 900 services-hero artwork. */
export function PerspectiveImageFan({ images, layout = "fan" }: Props) {
  const [step, setStep] = useState(0);
  const [resetting, setResetting] = useState(false);
  const [started, setStarted] = useState(false);
  const visibleImages = images.slice(0, 7);
  const sequence = [...visibleImages, ...visibleImages, visibleImages[0]];

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let current = 0;
    let timer = 0;
    let firstFrame = 0;
    let secondFrame = 0;
    const advance = () => {
      if (current === 7) {
        setResetting(true);
        current = 0;
        setStep(0);
        firstFrame = window.requestAnimationFrame(() => {
          secondFrame = window.requestAnimationFrame(() => {
            setResetting(false);
            current = 1;
            setStep(1);
          });
        });
      } else {
        current += 1;
        setStep(current);
      }
    };
    const start = window.setTimeout(() => {
      setStarted(true);
      advance();
      timer = window.setInterval(advance, 850);
    }, 650);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(timer);
      window.cancelAnimationFrame(firstFrame);
      window.cancelAnimationFrame(secondFrame);
    };
  }, []);

  return <div className={`services-fan${layout === "brand-identity" ? " services-fan--brand-identity" : ""}${started ? "" : " services-fan--intro"}${resetting ? " services-fan--resetting" : ""}`}>
    {sequence.map((image, index) => {
      const slot = layout === "brand-identity"
        ? Math.max(-2, Math.min(8, index - step))
        : Math.max(-1, Math.min(7, index - step));
      return <div className={`services-fan__slot services-fan__slot--${slot}`} key={`${image.url}-${index}`} aria-hidden={slot < 0 || slot > 6}>
      <Image
        src={image.url}
        alt={slot >= 0 && slot <= 6 ? image.alt : ""}
        fill
        sizes="(max-width: 700px) 55vw, 25vw"
        priority={index === 3}
        unoptimized={image.url.startsWith("http")}
        style={{ objectFit: "cover", objectPosition: image.position || "center" }}
      />
    </div>;})}
  </div>;
}
