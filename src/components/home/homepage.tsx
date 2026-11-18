import { ScrollIndicator } from "@/components/site/scroll-indicator";
import { SiteButton } from "@/components/site/site-button";
import type { HomepageProject } from "@/sanity/projects";
import { AboutStats } from "./about-stats.client";
import { ContactForm } from "./contact-form.client";
import { HeroTunnel } from "./hero-tunnel.client";
import type { HomeServicesContent } from "@/content/home-services";
import { HomeServices } from "./services/home-services.client";
import { Showcase } from "./showcase";
import { VideoExpansion } from "./video-expansion.client";
import { SiteFooter } from "@/components/site/site-footer";

export function Homepage({ projects, services }: { projects: HomepageProject[]; services: HomeServicesContent }) {
  return <><main id="main" className="home">
    <section className="home-hero" aria-labelledby="home-title">
      <HeroTunnel />
      <div className="home-hero__shade" aria-hidden="true" />
      <div className="home-hero__content">
        <h1 id="home-title"><span className="home-hero__desktop-title">Creative solutions<br />for timeless brands</span><span className="home-hero__mobile-title">Creative<br />solutions for<br />timeless brands</span></h1>
        <SiteButton className="home-view-work" href="/projects"><span className="home-hero__desktop-title">View Work</span><span className="home-hero__mobile-title">Explore</span></SiteButton>
      </div>
      <ScrollIndicator />
    </section>
    <Showcase projects={projects} />
    <HomeServices content={services} />
    <AboutStats><VideoExpansion /></AboutStats>
    <ContactForm animatedBackground />
  </main><SiteFooter /></>;
}
