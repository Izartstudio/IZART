import { SiteButton } from "@/components/site/site-button";
import type { HomepageProject } from "@/sanity/projects";
import { AboutStats } from "./about-stats.client";
import { ContactForm } from "./contact-form.client";
import { HeroTunnel } from "./hero-tunnel.client";
import { ServicesIntroduction } from "./services-introduction";
import { ServicesList } from "./services-list.client";
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
      <span className="home-hero__scroll" aria-hidden="true">
        <i />
        <svg viewBox="0 0 22 40" fill="none">
          <path d="m14.091 30.534-3.29 3.3-3.301-3.3.474-.464 2.5 2.499v-6.064h.664v6.064l2.5-2.489.453.454Z" fill="currentColor" />
        </svg>
      </span>
    </section>
    <Showcase projects={projects} />
    <ServicesIntroduction />
    <ServicesList />
    <AboutStats><VideoExpansion /></AboutStats>
    <ContactForm />
  </main><SiteFooter /></>;
}
