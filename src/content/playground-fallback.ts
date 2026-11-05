import type { PlaygroundPageData } from "./playground";

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

export const playgroundFallback: PlaygroundPageData = {
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

