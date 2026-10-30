import { getCliClient } from "sanity/cli";
import { createReadStream } from "node:fs";
import path from "node:path";
import { localProjects } from "../src/content/local-projects";
import { defaultPortfolioSettings } from "../src/content/portfolio-page";
import type { ProjectImage } from "../src/content/project";

// Run through `sanity exec --with-user-token`; credentials never enter the browser.
const client = getCliClient({ apiVersion: "2026-09-17" }).withConfig({ useCdn: false });
const assets = new Map<string, string>();
async function upload(url: string, type: "image" | "file") {
  const key = `${type}:${url}`;
  const cached = assets.get(key);
  if (cached) return cached;
  if (!url.startsWith("/assets/")) throw new Error(`Expected a local asset: ${url}`);
  const root = path.resolve("public");
  const file = path.resolve(root, "." + url);
  if (!file.startsWith(root + path.sep)) throw new Error("Invalid asset path");
  const asset = await client.assets.upload(type, createReadStream(file), { filename: path.basename(file) });
  assets.set(key, asset._id);
  return asset._id;
}
async function image(asset?: ProjectImage) {
  return asset ? { _type: "image", asset: { _type: "reference", _ref: await upload(asset.url, "image") } } : undefined;
}
async function file(url?: string) {
  return url ? { _type: "file", asset: { _type: "reference", _ref: await upload(url, "file") } } : undefined;
}
async function main() {
  const references: { _key: string; _type: "reference"; _ref: string }[] = [];
  for (const project of [...localProjects].sort((a, b) => (a.listingOrder ?? 999) - (b.listingOrder ?? 999))) {
    // Re-running the import must never overwrite changes made by an editor.
    const existing = await client.fetch<{ _id: string } | null>('*[_type == "project" && slug.current == $slug && !(_id in path("drafts.**"))][0]{_id}', { slug: project.slug });
    const id = existing?._id || `project-${project.slug}`;
    if (!existing) {
      const media = [];
      for (const panel of project.media) {
        media.push(panel._type === "imagePanel"
          ? { _key: panel._key, _type: "imagePanel", image: await image(panel.image), mobileImage: await image(panel.mobileImage), alt: panel.alt, decorative: panel.decorative || false, imageTitle: panel.imageTitle, caption: panel.caption, creditText: panel.creditText, creatorName: panel.creatorName, licenseUrl: panel.licenseUrl, rightsUrl: panel.rightsUrl }
          : { _key: panel._key, _type: "videoPanel", video: await file(panel.url), poster: await image(panel.poster), title: panel.title, mode: panel.mode, captions: await file(panel.captionsUrl), seo: panel.seo });
      }
      await client.createIfNotExists({
        _id: id, _type: "project", slug: { _type: "slug", current: project.slug },
        name: project.name, client: project.client, year: project.year,
        introduction: project.introduction, services: project.services,
        listingImage: await image(project.listingImage), listingAlt: project.listingAlt || `${project.name} case-study cover`,
        listingDescription: project.listingDescription, listingOrder: project.listingOrder,
        showInProjects: project.showInProjects !== false, featuredOnHomepage: project.featuredOnHomepage || false,
        homepageOrder: project.homepageOrder, homepageImage: await image(project.homepageImage), homepageHoverVideo: await file(project.homepageHoverVideo),
        logo: await image(project.logo), socialImage: await image(project.socialImage),
        colorOverrides: project.colorOverrides, media,
        details: project.details?.map(item => ({ ...item, _type: "projectDetail" })),
        seoTitle: project.seoTitle, description: project.description, socialImageAlt: project.socialImageAlt, publishedAt: project.publishedAt, indexable: project.indexable,
      });
      console.log(`Imported ${project.name}`);
    } else console.log(`Kept existing ${project.name}; edit its artwork in Studio if needed.`);
    references.push({ _key: project.slug, _type: "reference", _ref: id });
  }
  const settings = Object.fromEntries(Object.entries(defaultPortfolioSettings).filter(([key]) => key !== "orderedSlugs"));
  await client.createIfNotExists({ _id: "portfolio-page", _type: "portfolioPage", ...settings, projects: references, useCmsProjects: true });
  console.log("Import complete. Existing published documents were preserved. Open Portfolio page and Case study in Studio to edit.");
}
main().catch(error => { console.error(error instanceof Error ? error.message : "Import failed"); process.exitCode = 1; });
