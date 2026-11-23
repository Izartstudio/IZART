import { getCliClient } from "sanity/cli";
import { createReadStream } from "node:fs";
import path from "node:path";
import { heroLeftImages, heroRightImages } from "../src/content/hero-images";
const client = getCliClient({ apiVersion: "2026-09-17" }).withConfig({ useCdn: false });
async function main() {
  const exists = await client.fetch('count(*[_id in ["industries-hero", "drafts.industries-hero"]])');
  if (exists) { console.log("Industries Hero already exists; preserved existing content."); return; }
  const assets = new Map<string, string>();
  for (const src of new Set([...heroLeftImages, ...heroRightImages])) {
    const asset = await client.assets.upload("image", createReadStream(path.resolve("public", `.${src}`)), { filename: path.basename(src) });
    assets.set(src, asset._id);
  }
  const images = (urls: string[]) => urls.map((src, index) => ({ _type: "image", _key: `image-${index}`, asset: { _type: "reference", _ref: assets.get(src) } }));
  await client.createIfNotExists({ _id: "industries-hero", _type: "industriesHero", title: "Built Across Industries.\nDesigned to Stand Apart.", mobileTitle: "Built Across\nIndustries.\nDesigned to\nStand Apart.", buttonLabel: "Explore industries", mobileButtonLabel: "Explore", buttonHref: "/industries#industry-work", leftImages: images(heroLeftImages), rightImages: images(heroRightImages) });
  console.log("Published Industries Hero with independently editable copy and image sets.");
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
