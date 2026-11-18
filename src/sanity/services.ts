import "server-only";
import { cache } from "react";
import { createClient } from "@sanity/client";

export type ServicesHeroImage = { url: string; alt: string; position?: string };

export type ServicesHeroData = { images: ServicesHeroImage[]; labels: string[] };

export const fallbackHeroLabels = [
  "Beauty & Personal Care",
  "Food & Beverage",
  "Fashion & Lifestyle",
  "Property & Living",
  "Technology & Education",
];

const fallbackImages: ServicesHeroImage[] = [
  ...["Brand Identity", "Digital Experience", "Packaging Design", "Visual System", "Art Direction", "Campaign Design", "Studio Work"].map((alt, index) => ({ url: `/assets/services/hero/slot-${index}.webp`, alt })),
  ...[
    ["Plattr", "/assets/projects/plattr/panel-01.webp"],
    ["Benicio", "/assets/projects/benicio/panel-01.webp"],
    ["Dogs & Cats", "/assets/projects/dogs-and-cats/panel-01.webp"],
    ["Loupe", "/assets/projects/loupe/panel-01.webp"],
    ["Ritva", "/assets/projects/ritva/panel-01.webp"],
    ["Seraano", "/assets/projects/seraano/panel-01.webp"],
    ["Soak Studio", "/assets/projects/soak-studio/panel-01.webp"],
    ["10x10", "/assets/projects/10x10/panel-02.webp"],
    ["Loupe Identity", "/assets/projects/loupe/panel-03.webp"],
    ["Plattr Campaign", "/assets/projects/plattr/panel-02.webp"],
    ["Benicio Story", "/assets/projects/benicio/panel-02.webp"],
    ["Dogs & Cats Story", "/assets/projects/dogs-and-cats/panel-02.webp"],
    ["Loupe Story", "/assets/projects/loupe/panel-02.webp"],
    ["Ritva Story", "/assets/projects/ritva/panel-02.webp"],
    ["Seraano Story", "/assets/projects/seraano/panel-02.webp"],
    ["Soak Story", "/assets/projects/soak-studio/panel-02.webp"],
    ["10x10 Story", "/assets/projects/10x10/panel-03.webp"],
    ["Plattr Detail", "/assets/projects/plattr/panel-03.webp"],
    ["Benicio Detail", "/assets/projects/benicio/panel-03.webp"],
    ["Dogs & Cats Detail", "/assets/projects/dogs-and-cats/panel-03.webp"],
    ["Loupe Detail", "/assets/projects/loupe/panel-04.webp"],
    ["Ritva Detail", "/assets/projects/ritva/panel-03.webp"],
    ["Seraano Detail", "/assets/projects/seraano/panel-03.webp"],
    ["Soak Detail", "/assets/projects/soak-studio/panel-03.webp"],
    ["10x10 Detail", "/assets/projects/10x10/panel-04.webp"],
  ].map(([alt, url]) => ({ url, alt })),
];

const client = process.env.SANITY_PROJECT_ID ? createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET || "production",
  apiVersion: "2026-09-17",
  useCdn: false,
  perspective: "published",
  token: process.env.SANITY_API_READ_TOKEN,
}) : null;

export const getServicesHeroData = cache(async (): Promise<ServicesHeroData> => {
  if (!client) return { images: fallbackImages, labels: fallbackHeroLabels };
  const content = await client.fetch<{ heroLabels?: string[]; heroImages?: Array<{ url?: string; alt?: string; hotspot?: { x: number; y: number } }> } | null>(
    '*[_type == "servicesPage"][0]{heroLabels, "heroImages": heroImages[]{alt, "url": image.asset->url + "?w=640&auto=format&q=80", "hotspot": image.hotspot}}',
    {},
    { next: { revalidate: 60 } },
  );
  if (!content?.heroImages?.length) return { images: fallbackImages, labels: fallbackHeroLabels };
  const usableImages = content.heroImages.filter(image => image.url);
  if (!usableImages.length) return { images: fallbackImages, labels: fallbackHeroLabels };
  const cmsImages = usableImages.map((image, index) => ({
    url: image.url!,
    alt: image.alt || fallbackImages[index]?.alt || "Izart Studio project",
    position: image.hotspot ? `${image.hotspot.x * 100}% ${image.hotspot.y * 100}%` : undefined,
  }));
  // Keep the transition richly populated while the Sanity list is being filled;
  // once the CMS list reaches 32 items, the scene is entirely Sanity-driven.
  let images: ServicesHeroImage[];
  if (cmsImages.length >= 32) images = cmsImages;
  else {
  const used = new Set(cmsImages.map(image => image.url));
    images = [...cmsImages, ...fallbackImages.slice(7).filter(image => !used.has(image.url)).slice(0, 32 - cmsImages.length)];
  }
  const labels = fallbackHeroLabels.map((fallback, index) => content.heroLabels?.[index]?.trim() || fallback);
  return { images, labels };
});

export const getServicesHeroImages = cache(async (): Promise<ServicesHeroImage[]> => {
  return (await getServicesHeroData()).images;
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
