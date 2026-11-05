import "server-only";
import { cache } from "react";
import { createClient } from "@sanity/client";
import type { PlaygroundPageData } from "@/content/playground";

import { playgroundFallback as fallback } from "@/content/playground-fallback";

const client = process.env.SANITY_PROJECT_ID ? createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET || "production",
  apiVersion: "2026-09-17",
  useCdn: false,
  perspective: "published",
  token: process.env.SANITY_API_READ_TOKEN,
}) : null;

export const getPlaygroundPage = cache(async (): Promise<PlaygroundPageData> => {
  if (!client) return fallback;
  const page = await client.fetch<PlaygroundPageData | null>(`*[_type == "playgroundPage"][0]{
    title, seoTitle, description, "indexable": coalesce(indexable, false),
    "genres": genres[]{_key, name, "slug": slug.current, accent,
      track{title, artist, "url": audio.asset->url},
      "cards": cards[]{_key, title, year, eyebrow, "href": select(defined(project->slug.current) => "/projects/" + project->slug.current),
        "image": {"url": image.asset->url, "width": image.asset->metadata.dimensions.width, "height": image.asset->metadata.dimensions.height, alt}
      }
    }
  }`, {}, { next: { revalidate: 60 } });
  if (!page?.genres?.length || page.genres.some(genre => genre.cards.length < 8 || genre.cards.some(card => !card.image?.url))) return fallback;
  return page;
});
