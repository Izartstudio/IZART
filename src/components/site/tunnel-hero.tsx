import { HeroTunnel } from "@/components/home/hero-tunnel.client";
import type { BrandHeroContent } from "./brand-hero";
import { ScrollIndicator } from "./scroll-indicator";
import { SiteButton } from "./site-button";

export function TunnelHero({ content, id }: { content: BrandHeroContent; id: string }) {
  return <section className="home-hero" aria-labelledby={id}>
    <HeroTunnel leftImages={content.leftImages} rightImages={content.rightImages} />
    <div className="home-hero__shade" aria-hidden="true" />
    <div className="home-hero__content">
      <h1 id={id} style={{ whiteSpace: "pre-line" }}>
        <span className="home-hero__desktop-title">{content.title}</span>
        <span className="home-hero__mobile-title">{content.mobileTitle || content.title}</span>
      </h1>
      <SiteButton className="home-view-work" href={content.buttonHref}>
        <span className="home-hero__desktop-title">{content.buttonLabel}</span>
        <span className="home-hero__mobile-title">{content.mobileButtonLabel || content.buttonLabel}</span>
      </SiteButton>
    </div>
    <ScrollIndicator />
  </section>;
}
