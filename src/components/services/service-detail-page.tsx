import { ContactForm } from "@/components/home/contact-form.client";
import { SiteFooter } from "@/components/site/site-footer";
import { getServiceDetailContent, getServicesHeroImages } from "@/sanity/services";
import { BrandProcess } from "./brand-process.client";
import { OutcomeSection } from "./outcome-section";
import { ProcessFaq } from "./process-faq.client";
import { ServicesShowcase } from "./services-showcase.client";
import { ServicesHero } from "./services-hero";

export async function ServiceDetailPage({ slug, title, description }: { slug: string; title: string; description: string }) {
  const [content, fallbackImages] = await Promise.all([getServiceDetailContent(slug), getServicesHeroImages()]);
  return <><main id="main">
    <ServicesHero images={content.heroImages || fallbackImages} title={content.title || title} description={content.description || description} imageLayout="brand-identity" />
    {slug === "digital-ecosystem" || slug === "spatial-design"
      ? <ServicesShowcase scrollLed circularCursor stickyIntro crtEffect services={content.showcase?.states} heading={content.showcase?.heading} introduction={content.showcase?.description} />
      : <BrandProcess steps={content.processSteps} />}
    <OutcomeSection content={content.outcome} />
    <ProcessFaq entries={content.faqs} />
    <ContactForm />
  </main><SiteFooter /></>;
}
