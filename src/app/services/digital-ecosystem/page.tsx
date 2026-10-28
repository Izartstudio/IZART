import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { ContactForm } from "@/components/home/contact-form.client";
import { ServicesIntroduction } from "@/components/home/services-introduction";
import { ServicesList } from "@/components/home/services-list.client";
import { OutcomeSection } from "@/components/services/outcome-section";
import { ProcessFaq } from "@/components/services/process-faq.client";
import { ServicesHero } from "@/components/services/services-hero";
import { SiteFooter } from "@/components/site/site-footer";
import { getServicesHeroImages } from "@/sanity/services";

const title = "Digital Ecosystem | Izart Studio";
const description = "Digital experiences designed and built as one connected ecosystem.";

export const metadata: Metadata = pageMetadata("/website-design-and-development", { title: title, description: description });

export default async function DigitalEcosystemPage() {
  const images = await getServicesHeroImages();

  return <>
    <main id="main">
      <ServicesHero
        images={images}
        title="Digital Ecosystem"
        description={description}
      />
      <ServicesIntroduction />
      <ServicesList />
      <OutcomeSection />
      <ProcessFaq />
      <ContactForm />
    </main>
    <SiteFooter />
  </>;
}
