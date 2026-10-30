import "server-only";
import { cache } from "react";
import { createClient } from "@sanity/client";
import { localProjects, retiredProjectSlugs } from "@/content/local-projects";
import { defaultPortfolioSettings, type PortfolioSettings } from "@/content/portfolio-page";
import { withProjectTheme } from "@/lib/project-theme.server";
import type { Project } from "@/content/project";
export const sanityConfigured = Boolean(process.env.SANITY_PROJECT_ID);
const client = sanityConfigured ? createClient({ projectId: process.env.SANITY_PROJECT_ID!, dataset: process.env.SANITY_DATASET || "production", apiVersion: "2026-09-17", useCdn: false, perspective: "published", token: process.env.SANITY_API_READ_TOKEN }) : null;
const image = '{"url": asset->url, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height}';
const projection = `{
  "slug": slug.current, name, client, "year": coalesce(year, ""), introduction, services,
  "background": coalesce(background, "#000000"), "foreground": coalesce(foreground, "#ffffff"), colorOverrides,
  "listingImage": listingImage${image}, listingDescription, listingAlt,
  "listingPalette": coalesce(listingImage.asset->metadata.palette, media[_type == "imagePanel"][0].image.asset->metadata.palette),
  "listingOrder": coalesce(listingOrder, 999), "showInProjects": coalesce(showInProjects, true),
  "featuredOnHomepage": coalesce(featuredOnHomepage, false), "homepageOrder": coalesce(homepageOrder, 999),
  "homepageImage": homepageImage${image}, "homepageHoverVideo": homepageHoverVideo.asset->url,
  "details": coalesce(details[]{_key, title, body}, []),
  "logo": logo${image}, seoTitle, description, socialImageAlt, publishedAt, "socialImage": socialImage${image},
  "indexable": coalesce(indexable, false), "updatedAt": _updatedAt,
  "media": coalesce(media[]{_key, _type, alt, decorative, imageTitle, caption, creditText, creatorName, licenseUrl, rightsUrl, title, mode, seo,
    "image": image${image}, "mobileImage": mobileImage${image},
    "poster": poster${image}, "url": video.asset->url, "captionsUrl": captions.asset->url}, [])
}`;
export const getPortfolioSettings = cache(async (): Promise<PortfolioSettings> => {
  if (!client) return defaultPortfolioSettings;
  const settings = await client.fetch<Partial<PortfolioSettings> | null>(`*[_type == "portfolioPage" && _id == "portfolio-page"][0]{heading, gridIntroduction, galleryLabel, gridLabel, defaultView, showArchive, archiveHeading, useCmsProjects, "orderedSlugs": projects[]->slug.current}`, {}, { next: { revalidate: 60 } });
  return { ...defaultPortfolioSettings, ...Object.fromEntries(Object.entries(settings || {}).filter(([, value]) => value != null)) };
});
export const getProject = cache(async (slug: string): Promise<Project | null> => {
  if (retiredProjectSlugs.has(slug)) return null;
  const local = localProjects.find(project => project.slug === slug);
  if (!client) return local ? withProjectTheme(local) : null;
  const [remote, settings] = await Promise.all([
    client.fetch<Project | null>(`*[_type == "project" && slug.current == $slug][0]${projection}`, { slug }, { next: { revalidate: 60 } }),
    getPortfolioSettings(),
  ]);
  const project = remote || (!settings.useCmsProjects ? local : null);
  if (!project) return null;
  if (project.media.length > 30) throw new Error("A case study cannot contain more than 30 media items.");
  return withProjectTheme(project);
});
export async function getProjectSlugs(): Promise<string[]> {
  const [remote, settings] = await Promise.all([
    client ? client.fetch<string[]>('*[_type == "project" && defined(slug.current)].slug.current', {}, { next: { revalidate: 60 } }) : [],
    getPortfolioSettings(),
  ]);
  return [...new Set([...(settings.useCmsProjects ? [] : localProjects.map(project => project.slug)), ...remote])].filter(slug => !retiredProjectSlugs.has(slug));
}
export const getProjects = cache(async (): Promise<(Project & { listingImage: NonNullable<Project["listingImage"]> })[]> => {
  const [remote, settings] = await Promise.all([
    client ? client.fetch<Project[]>(`*[_type == "project"]${projection}`, {}, { next: { revalidate: 60 } }) : [],
    getPortfolioSettings(),
  ]);
  const remoteSlugs = new Set(remote.map(project => project.slug));
  const projects = [...remote, ...(settings.useCmsProjects ? [] : localProjects.filter(project => !remoteSlugs.has(project.slug)))];
  const positions = new Map(settings.orderedSlugs.map((slug, index) => [slug, index]));
  const resolved = await Promise.all(projects
    .filter(project => project.showInProjects !== false && !retiredProjectSlugs.has(project.slug))
    .map(project => ({ ...project, listingImage: project.listingImage || project.media.find(panel => panel._type === "imagePanel")?.image }))
    .filter((project): project is Project & { listingImage: NonNullable<Project["listingImage"]> } => Boolean(project.listingImage))
    .map(async project => ({ ...await withProjectTheme(project), listingImage: project.listingImage })));
  return resolved.sort((a, b) => (positions.get(a.slug) ?? Infinity) - (positions.get(b.slug) ?? Infinity) || (a.listingOrder ?? 999) - (b.listingOrder ?? 999) || a.name.localeCompare(b.name));
});
export type HomepageProject = Pick<Project, "slug" | "name" | "services" | "homepageHoverVideo"> & { homepageImage: NonNullable<Project["homepageImage"]> };
export const getHomepageProjects = cache(async (): Promise<HomepageProject[]> => {
  const projects = await getProjects();
  return projects.filter(project => project.featuredOnHomepage === true)
    .sort((a, b) => (a.homepageOrder ?? a.listingOrder ?? 999) - (b.homepageOrder ?? b.listingOrder ?? 999))
    .map(project => ({ slug: project.slug, name: project.name, services: project.services, homepageImage: project.homepageImage || project.listingImage, homepageHoverVideo: project.homepageHoverVideo }));
});
