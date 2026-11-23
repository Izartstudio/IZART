import { ContactForm } from "@/components/home/contact-form.client";
import { WhyUs } from "@/components/industries/why-us";
import { ProcessFaq } from "@/components/services/process-faq.client";
import { SiteFooter } from "@/components/site/site-footer";
import { Showcase } from "@/components/home/showcase";
import { getIndustriesProjects } from "@/sanity/projects";
import { BrandProcess } from "@/components/services/brand-process.client";
import { defaultProcessSteps } from "@/components/services/service-detail-defaults";
import { OutcomeSection } from "@/components/services/outcome-section";
import { TunnelHero } from "@/components/site/tunnel-hero";
import { getIndustriesHero } from "@/sanity/industries-hero";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 60;
export const metadata = pageMetadata("/industries", {
  title: "Industries | Izart Studio",
  description: "Brand identity and digital design for beauty, food, real estate, jewellery, and the brands shaping what comes next.",
});

const industryProcessSteps = defaultProcessSteps.map((step, index) => index === 0 ? {
  ...step,
  description: "Understanding your market, competitors, and positioning gaps.",
} : step);

export default async function IndustriesPage() {
  const [hero, projects] = await Promise.all([getIndustriesHero(), getIndustriesProjects()]);
  return <><main id="main">
    <TunnelHero content={hero} id="industries-title" />
    <BrandProcess id="industry-work" variant="industries" steps={industryProcessSteps} />
    <OutcomeSection />
    <Showcase variant="industries" projects={projects} />
    <WhyUs />
    <ProcessFaq />
    <ContactForm />
  </main><SiteFooter /></>;
}
