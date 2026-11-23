import { ContactForm } from "@/components/home/contact-form.client";
import { SiteFooter } from "@/components/site/site-footer";
import { getServiceDetailContent, getServicesHeroImages } from "@/sanity/services";
import { defaultProcessSteps } from "./service-detail-defaults";
import { BrandProcess } from "./brand-process.client";
import { OutcomeSection } from "./outcome-section";
import { ProcessFaq } from "./process-faq.client";
import { ServicesShowcase } from "./services-showcase.client";
import { ServicesHero } from "./services-hero";

const brandIdentityProcessSteps = defaultProcessSteps.map((step, index) => index === 0 ? {
  ...step,
  description: "Understanding your market, competitors, and positioning gaps.",
} : step);

export async function ServiceDetailPage({ slug, title, description }: { slug: string; title: string; description: string }) {
  const [content, fallbackImages] = await Promise.all([getServiceDetailContent(slug), getServicesHeroImages()]);
  return <><main id="main">
    <ServicesHero images={content.heroImages || fallbackImages} title={content.title || title} description={content.description || description} imageLayout="brand-identity" />
    {slug === "digital-ecosystem" || slug === "spatial-design"
      ? <ServicesShowcase services={content.showcase?.states} heading={content.showcase?.heading} introduction={content.showcase?.description} />
      : <BrandProcess variant={slug === "brand-identity" ? "brand-identity" : "default"} steps={content.processSteps ?? (slug === "brand-identity" ? brandIdentityProcessSteps : undefined)} />}
    <OutcomeSection content={content.outcome} />
    <ProcessFaq entries={content.faqs} />
    <ContactForm />
  </main><SiteFooter /></>;
}
