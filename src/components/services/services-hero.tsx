import type { ReactNode } from "react";
import type { ServicesHeroImage } from "@/sanity/services";
import { PerspectiveImageFan } from "./perspective-image-fan";
import { ServicesHeroMosaic } from "./services-hero-mosaic.client";

type ServicesHeroProps = {
  images: ServicesHeroImage[];
  labels?: string[];
  title?: ReactNode;
  description?: ReactNode;
  imageLayout?: "fan" | "brand-identity";
  animation?: boolean;
};

export function ServicesHero({
  images,
  labels = [],
  title = <>Brand &amp; digital,<br />built to perform</>,
  description,
  imageLayout = "fan",
  animation = false,
}: ServicesHeroProps) {
  if (animation) return <ServicesHeroMosaic images={images} labels={labels} />;
  return <section className={`services-hero${imageLayout === "brand-identity" ? " services-hero--brand-identity" : ""}`} aria-labelledby="services-hero-title">
    <div className="services-hero__canvas">
      <div className="services-hero__radial" aria-hidden="true" />
      <h1 id="services-hero-title" className="services-hero__title">{title}</h1>
      {description && <p className="services-hero__description">{description}</p>}
      <PerspectiveImageFan images={images} layout={imageLayout} />
      <div className="services-hero__side-shade" aria-hidden="true" />
      <div className="services-hero__bottom-shade" aria-hidden="true" />
    </div>
  </section>;
}
