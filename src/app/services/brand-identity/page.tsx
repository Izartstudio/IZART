import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { ContactForm } from "@/components/home/contact-form.client";
import { OutcomeSection } from "@/components/services/outcome-section";
import { ProcessFaq } from "@/components/services/process-faq.client";
import { BrandProcess } from "@/components/services/brand-process.client";
import { ServicesHero } from "@/components/services/services-hero";
import { SiteFooter } from "@/components/site/site-footer";
import { getServicesHeroImages } from "@/sanity/services";

const title = "Brand Identity | Izart Studio";
const description = "Define a distinct visual and verbal system that makes your brand instantly recognizable - across every screen, surface, and touchpoint.";

export const metadata: Metadata = pageMetadata("/brand-identity", { title: title, description: description });

export default async function BrandIdentityPage() {
  const images = await getServicesHeroImages();

  return <>
    <main id="main">
      <ServicesHero
        images={images}
        title="Brand Identity Development"
        description={description}
        imageLayout="brand-identity"
      />
      <BrandProcess />
      <OutcomeSection />
      <ProcessFaq />
      <ContactForm />
    </main>
    <SiteFooter />
  </>;
}
