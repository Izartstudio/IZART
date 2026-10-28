import "server-only";
import { cache } from "react";
import { createClient } from "@sanity/client";
import { localProjects as originalLocalProjects } from "@/content/local-projects";
import supplements from "@/content/project-seo-supplements.json";
const localProjects = originalLocalProjects.map(project => {
  const source = (supplements as Record<string, { copy: string; image?: string }>)[project.slug];
  if (!source) return project.slug === 'project3' ? { ...project, showInProjects: false, featuredOnHomepage: false } : project;
  return { ...project, indexable: true, introduction: project.introduction || source.copy.split('\n\n')[0], details: source.copy ? [{ _key: 'original-project-copy', title: 'About the project', body: source.copy }] : project.details };
});
import type { Project } from "@/content/project";
export const sanityConfigured = Boolean(process.env.SANITY_PROJECT_ID);
const client = sanityConfigured ? createClient({ projectId: process.env.SANITY_PROJECT_ID!, dataset: process.env.SANITY_DATASET || "production", apiVersion: "2026-09-17", useCdn: false, perspective: "published", token: process.env.SANITY_API_READ_TOKEN }) : null;
const image = '{"url": asset->url, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height}';
const projection = `{
  "slug": slug.current, name, client, year, introduction, services,
  "background": coalesce(background, "#000000"), "foreground": coalesce(foreground, "#ffffff"),
  "listingImage": listingImage${image}, listingDescription, listingColor,
  "listingOrder": coalesce(listingOrder, 999), "showInProjects": coalesce(showInProjects, true),
  "featuredOnHomepage": coalesce(featuredOnHomepage, false), "homepageOrder": coalesce(homepageOrder, 999),
  "homepageImage": homepageImage${image}, "homepageHoverVideo": homepageHoverVideo.asset->url,
  "details": coalesce(details[]{_key, title, body}, []),
  "logo": logo${image}, seoTitle, description, "socialImage": socialImage${image},
  "indexable": coalesce(indexable, false), "updatedAt": _updatedAt,
  "media": coalesce(media[]{_key, _type, alt, decorative, title, mode,
    "image": image${image}, "mobileImage": mobileImage${image},
    "poster": poster${image}, "url": video.asset->url, "captionsUrl": captions.asset->url}, [])
}`;
export const getProject = cache(async (slug: string): Promise<Project | null> => {
  if (!client) return localProjects.find(p => p.slug === slug) || null;
  const result = await client.fetch<Project | null>(`*[_type == "project" && slug.current == $slug][0]${projection}`, { slug }, { next: { revalidate: 60 } });
  if (result && result.media.length > 30) throw new Error("A case study cannot contain more than 30 media items.");
  return result || localProjects.find(p => p.slug === slug) || null;
});
export async function getProjectSlugs(): Promise<string[]> {
  const remote = client ? await client.fetch<string[]>('*[_type == "project" && defined(slug.current)].slug.current', {}, { next: { revalidate: 60 } }) : [];
  return [...new Set([...localProjects.map(p => p.slug), ...remote])];
}

export const getProjects = cache(async (): Promise<(Project & { listingImage: NonNullable<Project["listingImage"]> })[]> => {
  const projects = client
    ? await client.fetch<Project[]>(`*[_type == "project" && coalesce(showInProjects, true)] | order(coalesce(listingOrder, 999) asc, name asc)${projection}`, {}, { next: { revalidate: 60 } })
    : localProjects.filter(project => project.showInProjects !== false);
  return projects
    .map(project => ({ ...project, listingImage: project.listingImage || project.media.find(panel => panel._type === "imagePanel")?.image }))
    .filter((project): project is Project & { listingImage: NonNullable<Project["listingImage"]> } => Boolean(project.listingImage))
    .sort((a, b) => (a.listingOrder ?? 999) - (b.listingOrder ?? 999));
});

export type HomepageProject = Pick<Project, "slug" | "name" | "services" | "homepageHoverVideo"> & {
  homepageImage: NonNullable<Project["homepageImage"]>;
};

const localShowcaseImages = [
  { url: "/assets/home/showcase/project1.png", width: 434, height: 544 },
  { url: "/assets/home/showcase/project2.png", width: 446, height: 556 },
  { url: "/assets/home/showcase/project3.png", width: 446, height: 556 },
] as const;

export const getHomepageProjects = cache(async (): Promise<HomepageProject[]> => {
  if (!client) {
    const homepageProjects = localProjects.filter(project => project.featuredOnHomepage !== false);
    return Array.from({ length: 6 }, (_, index) => {
      const project = homepageProjects[index % homepageProjects.length];
      return {
        slug: project.slug,
        name: project.name,
        services: project.services,
        homepageImage: localShowcaseImages[index % localShowcaseImages.length],
        homepageHoverVideo: index === 1 ? "/assets/home/showcase/logo-animation.mp4" : undefined,
      };
    });
  }

  const projects = await client.fetch<Project[]>(`*[_type == "project" && featuredOnHomepage == true] | order(coalesce(homepageOrder, 999) asc, name asc)${projection}`, {}, { next: { revalidate: 60 } });
  return projects
    .map(project => ({ ...project, homepageImage: project.homepageImage || project.listingImage }))
    .filter((project): project is Project & { homepageImage: NonNullable<Project["homepageImage"]> } => Boolean(project.homepageImage))
    .map(({ slug, name, services, homepageImage, homepageHoverVideo }) => ({ slug, name, services, homepageImage, homepageHoverVideo }));
});
