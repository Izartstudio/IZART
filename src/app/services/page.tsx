import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { TunnelHero } from "@/components/site/tunnel-hero";
import { HomeServices } from "@/components/home/services/home-services.client";
import { OutcomeSection } from "@/components/services/outcome-section";
import { ProcessFaq } from "@/components/services/process-faq.client";
import { ContactForm } from "@/components/home/contact-form.client";
import { SiteFooter } from "@/components/site/site-footer";
import { getServicesHeroData } from "@/sanity/services";
import { getHomeServices } from "@/sanity/home-services";

const title = "Brand & Digital Services | Izart Studio";
const description = "Brand and digital, built to perform. Explore Izart Studio's branding, digital ecosystem, brand growth, campaign planning, and spatial design services.";
export const metadata: Metadata = pageMetadata("/services", { title: title, description: description });

export default async function ServicesPage() {
  const [{ images }, services] = await Promise.all([getServicesHeroData(), getHomeServices()]);
  return <><main id="main">
    <TunnelHero id="services-hero-title" content={{
      title: "Brand & digital,\nbuilt to perform",
      buttonLabel: "Explore services",
      buttonHref: "#our-services",
      leftImages: images.filter((_, index) => index % 2 === 0).map(image => image.url),
      rightImages: images.filter((_, index) => index % 2 === 1).map(image => image.url),
    }} />
    <div id="our-services"><HomeServices content={services} /></div>
    <OutcomeSection />
    <ProcessFaq />
    <ContactForm />
  </main><SiteFooter /></>;
}
