import "server-only";
import { cache } from "react";
import { createClient } from "@sanity/client";
import type { BrandHeroContent } from "@/components/site/brand-hero";
const fallback: BrandHeroContent = {
  title: "Built Across Industries.\nDesigned to Stand Apart.",
  buttonLabel: "Explore industries", buttonHref: "/industries#industry-work",
};
const client = process.env.SANITY_PROJECT_ID ? createClient({ projectId: process.env.SANITY_PROJECT_ID, dataset: process.env.SANITY_DATASET || "production", apiVersion: "2026-09-17", useCdn: false, perspective: "published", token: process.env.SANITY_API_READ_TOKEN }) : null;
export const getIndustriesHero = cache(async (): Promise<BrandHeroContent> => {
  if (!client) return fallback;
  try {
    const data = await client.fetch<Partial<BrandHeroContent> | null>('*[_type == "industriesHero" && _id == "industries-hero"][0]{title,mobileTitle,buttonLabel,mobileButtonLabel,buttonHref,"leftImages":leftImages[].asset->url,"rightImages":rightImages[].asset->url}', {}, { next: { revalidate: 60 } });
    return { title: data?.title?.trim() || fallback.title, mobileTitle: data?.mobileTitle?.trim(), buttonLabel: data?.buttonLabel?.trim() || fallback.buttonLabel, mobileButtonLabel: data?.mobileButtonLabel?.trim(), buttonHref: data?.buttonHref && /^\/(?!\/)/.test(data.buttonHref) ? data.buttonHref : fallback.buttonHref, leftImages: data?.leftImages?.filter(Boolean).length ? data.leftImages.filter(Boolean) : undefined, rightImages: data?.rightImages?.filter(Boolean).length ? data.rightImages.filter(Boolean) : undefined };
  } catch (error) { console.error("Unable to load Industries Hero", error); return fallback; }
});
