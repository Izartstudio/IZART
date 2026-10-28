import "server-only";
import { cache } from "react";
import { createClient } from "@sanity/client";
import type { PlaygroundPageData } from "@/content/playground";

const fallbackImages = [
  ["/assets/playground/art-16.webp", 900, 900],
  ["/assets/playground/art-17.webp", 900, 900],
  ["/assets/playground/art-18.webp", 900, 900],
  ["/assets/playground/art-14.webp", 900, 900],
  ["/assets/playground/art-13.webp", 900, 900],
  ["/assets/playground/art-15.webp", 900, 900],
  ["/assets/playground/art-12.webp", 900, 900],
  ["/assets/playground/art-11.webp", 900, 900],
  ["/assets/playground/art-6.webp", 900, 900],
  ["/assets/playground/art-5.webp", 900, 900],
] as const;

const names = ["Hint Saint", "Xevar", "Revolution", "After Hours", "Motion Effect", "Nocturne", "Outsider", "Static Bloom", "Red Room", "Kiyo"];
const genreNames = ["Rock N Roll", "Hip Hop", "Electronic", "Soul"];

const fallback: PlaygroundPageData = {
  title: "Playground",
  seoTitle: "Playground — Experimental Work",
  description: "Explore experimental artwork, identities and visual projects from Izart Studio.",
  indexable: false,
  genres: genreNames.map((name, genreIndex) => ({
    _key: `genre-${genreIndex}`,
    name,
    slug: name.toLowerCase().replaceAll(" ", "-"),
    accent: ["#99180b", "#581326", "#13245a", "#5d3216"][genreIndex],
    cards: fallbackImages.map((image, cardIndex) => {
      const shifted = fallbackImages[(cardIndex + genreIndex * 2) % fallbackImages.length];
      return {
        _key: `${genreIndex}-${cardIndex}`,
        title: names[(cardIndex + genreIndex * 2) % names.length],
        year: "2026",
        eyebrow: "Case study",
        href: cardIndex < 3 ? "/projects/seraano" : undefined,
        image: { url: shifted[0], width: shifted[1], height: shifted[2], alt: `${names[cardIndex]} project artwork` },
      };
    }),
  })),
};

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
      "cards": cards[]{_key, title, year, eyebrow, "href": select(defined(project->slug.current) => "/projects/" + project->slug.current),
        "image": {"url": image.asset->url, "width": image.asset->metadata.dimensions.width, "height": image.asset->metadata.dimensions.height, alt}
      }
    }
  }`, {}, { next: { revalidate: 60 } });
  if (!page?.genres?.length || page.genres.some(genre => genre.cards.length < 8 || genre.cards.some(card => !card.image?.url))) return fallback;
  return page;
});
