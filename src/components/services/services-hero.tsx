import type { ReactNode } from "react";
import type { ServicesHeroImage } from "@/sanity/services";
import { PerspectiveImageFan } from "./perspective-image-fan";

type ServicesHeroProps = {
  images: ServicesHeroImage[];
  title?: ReactNode;
  description?: ReactNode;
  imageLayout?: "fan" | "brand-identity";
};

export function ServicesHero({
  images,
  title = <>Brand &amp; digital,<br />built to perform</>,
  description,
  imageLayout = "fan",
}: ServicesHeroProps) {
  return <section className="services-hero" aria-labelledby="services-hero-title">
    <div className="services-hero__canvas">
      <div className="home-hero__shade services-hero__radial" aria-hidden="true" />
      <h1 id="services-hero-title" className="services-hero__title">{title}</h1>
      {description && <p className="services-hero__description">{description}</p>}
      <PerspectiveImageFan images={images} layout={imageLayout} />
      <div className="services-hero__side-shade" aria-hidden="true" />
      <div className="services-hero__bottom-shade" aria-hidden="true" />
    </div>
  </section>;
}
