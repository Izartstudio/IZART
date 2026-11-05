import { getCliClient } from "sanity/cli";
import { createReadStream } from "node:fs";
import path from "node:path";
import { playgroundFallback } from "../src/content/playground-fallback";

const client = getCliClient({ apiVersion: "2026-09-17" }).withConfig({ useCdn: false, perspective: "raw" });

async function main() {
  const existing = await client.fetch<{ _id: string; _rev: string; genres?: { _key: string; name: string; cards?: unknown[]; validCards: number }[] }[]>(
    '*[_type == "playgroundPage"]{_id,_rev,genres[]{..., "validCards":count(cards[defined(image.asset->url)])}}',
  );
  const published = existing.find(document => !document._id.startsWith("drafts."));
  const draft = existing.find(document => document._id.startsWith("drafts."));
  const current = draft ?? published;
  const complete = current?.genres?.length && current.genres.every(genre => genre.validCards >= 8);
  if (complete) {
    console.log(`Playground already has ${current.genres!.length} genres and ${current.genres!.reduce((total, genre) => total + (genre.cards?.length ?? 0), 0)} cards in ${draft ? "a draft" : "the published document"}.`);
    return;
  }
  const projectId = await client.fetch<string | null>('*[_type == "project" && slug.current == "seraano" && !(_id in path("drafts.**"))][0]._id');
  const assets = new Map<string, string>();
  const genres = [];
  for (const genre of playgroundFallback.genres) {
    const cards = [];
    for (const { image, href, ...card } of genre.cards) {
      let assetId = assets.get(image.url);
      if (!assetId) {
        const file = path.resolve("public", "." + image.url);
        const asset = await client.assets.upload("image", createReadStream(file), { filename: path.basename(file) });
        assetId = asset._id;
        assets.set(image.url, assetId);
      }
      cards.push({
        ...card, _type: "playgroundCard", alt: image.alt,
        image: { _type: "image", asset: { _type: "reference", _ref: assetId } },
        ...(href === "/projects/seraano" && projectId ? { project: { _type: "reference", _ref: projectId } } : {}),
      });
    }
    genres.push({
      _key: genre._key, _type: "playgroundGenre", name: genre.name, accent: genre.accent,
      slug: { _type: "slug", current: genre.slug }, cards,
    });
  }

  const id = current?._id ?? "playground-page";
  if (current) {
    const updatedGenres = [...(current.genres ?? [])];
    for (const localGenre of genres) {
      const index = updatedGenres.findIndex(genre => genre.name.toLowerCase() === localGenre.name.toLowerCase());
      if (index < 0) updatedGenres.push({ ...localGenre, validCards: localGenre.cards.length });
      else if (updatedGenres[index].validCards < 8) {
        const genre = updatedGenres[index];
        const existingCards = (genre.cards ?? []).filter(card => Boolean((card as { image?: { asset?: { _ref?: string } } }).image?.asset?._ref));
        const keys = new Set(existingCards.map(card => (card as { _key: string })._key));
        genre.cards = [...existingCards, ...localGenre.cards.filter(card => !keys.has(card._key))].slice(0, 10);
      }
    }
    await client.patch(id).ifRevisionId(current._rev).setIfMissing({
      title: playgroundFallback.title, seoTitle: playgroundFallback.seoTitle, description: playgroundFallback.description, indexable: false,
    }).set({ genres: updatedGenres.map(({ validCards: _validCards, ...genre }) => genre) }).commit();
  } else {
    await client.createIfNotExists({ ...playgroundFallback, _id: id, _type: "playgroundPage", genres });
  }
  const result = await client.fetch<{ genres: number; cards: number }>(
    '*[_id == $id][0]{"genres":count(genres),"cards":count(genres[].cards[])}', { id },
  );
  console.log(`Playground in Sanity: ${result.genres} genres, ${result.cards} cards. Uploaded ${assets.size} unique images.`);
}

main().catch(error => { console.error(error instanceof Error ? error.message : "Playground import failed"); process.exitCode = 1; });
