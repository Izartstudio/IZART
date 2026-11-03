import { ScrollIndicator } from "@/components/site/scroll-indicator";
import { SiteButton } from "@/components/site/site-button";
import type { HomepageProject } from "@/sanity/projects";
import { AboutStats } from "./about-stats.client";
import { ContactForm } from "./contact-form.client";
import { HeroTunnel } from "./hero-tunnel.client";
import { ServicesShowcase } from "@/components/services/services-showcase.client";
import { Showcase } from "./showcase";
import { VideoExpansion } from "./video-expansion.client";
import { SiteFooter } from "@/components/site/site-footer";

export function Homepage({ projects }: { projects: HomepageProject[] }) {
  return <><main id="main" className="home">
    <section className="home-hero" aria-labelledby="home-title">
      <HeroTunnel />
      <div className="home-hero__shade" aria-hidden="true" />
      <div className="home-hero__content">
        <h1 id="home-title">Creative solutions<br />for timeless brands</h1>
        <SiteButton className="home-view-work" href="/projects">View Work</SiteButton>
      </div>
      <ScrollIndicator />
    </section>
    <Showcase projects={projects} />
    <ServicesShowcase scrollLed circularCursor stickyIntro crtEffect />
    <AboutStats><VideoExpansion /></AboutStats>
    <ContactForm />
  </main><SiteFooter /></>;
}
