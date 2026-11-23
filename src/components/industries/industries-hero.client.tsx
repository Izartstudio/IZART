"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { ArtworkStrip } from "@/components/site/artwork-strip";
import { SiteButton, ArrowIcon } from "@/components/site/site-button";
import { ProjectImageView } from "@/components/project/project-image";
import type { ProjectImage } from "@/content/project";
import styles from "./industries-hero.module.css";

export type IndustryPreview = { name: string; project: string; href: string; image: ProjectImage };

export function IndustriesShowcase({ industries }: { industries: IndustryPreview[] }) {
  const [active, setActive] = useState(0);
  const id = useId();
  const selected = industries[active];

  return <section id="industry-work" className={styles.hero} aria-labelledby={`${id}-title`}>
    <div className={styles.copy}>
      <p className={styles.eyebrow}><span />Industries</p>
      <h2 id={`${id}-title`}>Different worlds.<br />Distinctive <em>brands.</em></h2>
      <p className={styles.intro}>From the products we reach for to the places we call home. We build brands that understand their world—and stand out in it.</p>
      <SiteButton href="/projects" className={styles.cta} icon={<ArrowIcon />}>Explore our work</SiteButton>
      {selected && <div className={styles.selector} role="group" aria-label="Preview work by industry">
        {industries.map((industry, index) => <button type="button" key={industry.name} aria-pressed={active === index}
          onClick={() => setActive(index)} onPointerEnter={event => { if (event.pointerType === "mouse") setActive(index); }}
          onFocus={() => setActive(index)}>
          {industry.name}<span aria-hidden="true">↗</span>
        </button>)}
      </div>}
    </div>
    {selected && <div className={styles.visual}>
      <div className={styles.guide} aria-hidden="true" />
      <div className={styles.stack}>
        <div className={styles.backCard} aria-hidden="true" />
        <div className={styles.middleCard} aria-hidden="true" />
        <Link className={styles.card} href={selected.href} aria-label={`View ${selected.project} case study`}>
          <ArtworkStrip />
          <div className={styles.artwork}>
            {industries.map((industry, index) => <div key={industry.href} className={styles.image} data-active={active === index} aria-hidden={active !== index}>
              <ProjectImageView image={industry.image} alt={index === active ? `${industry.project} brand artwork` : ""}
                sizes="(max-width: 767px) 84vw, 42vw" eager={index === 0} />
            </div>)}
            <span className={styles.view}>View case study <span aria-hidden="true">↗</span></span>
          </div>
          <ArtworkStrip edge="bottom" />
        </Link>
        <div className={styles.caption} aria-live="polite"><span>{selected.project}</span><span>{selected.name}</span></div>
      </div>
    </div>}
  </section>;
}
