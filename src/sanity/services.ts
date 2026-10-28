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
