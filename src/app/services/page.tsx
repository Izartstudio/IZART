import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { ServicesHero } from "@/components/services/services-hero";
import { ServicesShowcase } from "@/components/services/services-showcase.client";
import { OutcomeSection } from "@/components/services/outcome-section";
import { ProcessFaq } from "@/components/services/process-faq.client";
import { ContactForm } from "@/components/home/contact-form.client";
import { SiteFooter } from "@/components/site/site-footer";
import { getServicesHeroImages } from "@/sanity/services";

const title = "Brand & Digital Services | Izart Studio";
const description = "Brand and digital, built to perform. Explore Izart Studio's branding, digital ecosystem, brand growth, campaign planning, and spatial design services.";
export const metadata: Metadata = pageMetadata("/services", { title: title, description: description });

export default async function ServicesPage() {
  const images = await getServicesHeroImages();
  return <><main id="main">
    <ServicesHero images={images} />
    <ServicesShowcase />
    <OutcomeSection />
    <ProcessFaq />
    <ContactForm />
  </main><SiteFooter /></>;
}
