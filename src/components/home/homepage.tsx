import type { HomepageProject } from "@/sanity/projects";
import { AboutStats } from "./about-stats.client";
import { ContactForm } from "./contact-form.client";
import { BrandHero } from "@/components/site/brand-hero";
import type { HomeServicesContent } from "@/content/home-services";
import { HomeServices } from "./services/home-services.client";
import { HomeScrollRestoration } from "./home-scroll-restoration.client";
import { Showcase } from "./showcase";
import { SiteFooter } from "@/components/site/site-footer";

export function Homepage({ projects, services }: { projects: HomepageProject[]; services: HomeServicesContent }) {
  return <><main id="main" className="home">
    <HomeScrollRestoration />
    <BrandHero projectImages={projects.slice(0, 6).map(project => project.homepageImage.url)} />
    <Showcase projects={projects} />
    <HomeServices content={services} />
    <AboutStats />
    <ContactForm animatedBackground />
  </main><SiteFooter /></>;
}
