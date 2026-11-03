import "server-only";
import { cache } from "react";
import { createClient } from "@sanity/client";

export type ServicesHeroImage = { url: string; alt: string; position?: string };

const fallbackImages: ServicesHeroImage[] = Array.from({ length: 7 }, (_, index) => ({
  url: `/assets/services/hero/slot-${index}.webp`,
  alt: "",
}));

const client = process.env.SANITY_PROJECT_ID ? createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET || "production",
  apiVersion: "2026-09-17",
  useCdn: false,
  perspective: "published",
  token: process.env.SANITY_API_READ_TOKEN,
}) : null;

export const getServicesHeroImages = cache(async (): Promise<ServicesHeroImage[]> => {
  if (!client) return fallbackImages;
  const images = await client.fetch<Array<{ url?: string; alt?: string; hotspot?: { x: number; y: number } }> | null>(
    '*[_type == "servicesPage"][0].heroImages[]{alt, "url": image.asset->url, "hotspot": image.hotspot}',
    {},
    { next: { revalidate: 60 } },
  );
  if (!images || images.length !== 7 || images.some(image => !image.url)) return fallbackImages;
  return images.map((image, index) => ({
    url: image.url!,
    alt: image.alt || fallbackImages[index].alt,
    position: image.hotspot ? `${image.hotspot.x * 100}% ${image.hotspot.y * 100}%` : undefined,
  }));
});

export type ServiceDetailContent = {
  showcase?: { heading?: string; description?: string; states?: import("@/components/services/service-showcase-data").ShowcaseService[] };
  title?: string;
  description?: string;
  heroImages?: ServicesHeroImage[];
  processSteps?: import("@/components/services/service-detail-defaults").ServiceProcessStep[];
  outcome?: { summary?: string; benefit?: string; why?: string };
  faqs?: { question: string; answer: string }[];
};

export const getServiceDetailContent = cache(async (slug: string): Promise<ServiceDetailContent> => {
  if (!client) return {};
  const content = await client.fetch<ServiceDetailContent | null>(
    `*[_type == "serviceDetailPage" && service == $slug][0]{title, description,
      "heroImages": heroImages[]{alt, "url": asset->url},
      "processSteps": processSteps[]{weekStart, weekEnd, number, title, description, "images": images[].asset->url},
      showcase{heading, description, "states": states[]{"slug": _key, title, description, href, "image": image.asset->url, "mobileImage": mobileImage.asset->url, "video": video.asset->url, "mobileVideo": mobileVideo.asset->url}},
      outcome, faqs[]{question, answer}}`,
    { slug }, { next: { revalidate: 60 } },
  );
  if (!content) return {};
  return {
    ...content,
    outcome: content.outcome || undefined,
    showcase: content.showcase ? { ...content.showcase, states: content.showcase.states?.filter(state => state.title && state.image && /^(\/(?!\/)|https:\/\/)/.test(state.href || "")) } : undefined,
    heroImages: content.heroImages?.length === 7 && content.heroImages.every(image => image.url) ? content.heroImages : undefined,
    processSteps: content.processSteps?.length ? content.processSteps.map((step, index) => ({ ...step, number: String(index + 1).padStart(2, "0"), images: (step.images || []).filter(Boolean) })) : undefined,
    faqs: content.faqs?.length ? content.faqs : undefined,
  };
});
