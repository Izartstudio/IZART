"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { CareersImage } from "@/sanity/careers";

function ArchiveCard({ image, index }: { image: CareersImage; index: number }) {
  return <figure className={`careers-archive careers-archive--${index + 1}`} style={{ "--archive-index": index } as React.CSSProperties}>
    <div className="careers-media">
      <Image src={image.url} alt={image.alt} fill sizes="(max-width: 700px) 88vw, 22vw" style={{ objectPosition: image.position || "50% 50%" }} />
    </div>
    <figcaption>{image.label}</figcaption>
  </figure>;
}

export function CareersArchiveGrid({ images }: { images: CareersImage[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: "0px 0px -8%", threshold: 0.08 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return <div ref={ref} className={`careers-work__reveal${visible ? " is-visible" : ""}`}>
    <svg className="careers-work__ruler" viewBox="0 0 1440 25" preserveAspectRatio="none" aria-hidden="true">
      <path className="careers-work__ruler-line" pathLength="1" d="M0 .5H1440" />
      <path className="careers-work__ruler-ticks" pathLength="1" d="M50 0V20M271 0V20M335 0V20M509 0V20M573 0V20M866 0V20M930 0V20M1104 0V20M1169 0V20M1390 0V20" />
    </svg>
    <div className="careers-work__gallery">
      {images.map((image, index) => <ArchiveCard image={image} index={index} key={`${image.label}-${index}`} />)}
    </div>
  </div>;
}
