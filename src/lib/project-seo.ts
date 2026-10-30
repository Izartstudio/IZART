import type { Metadata, MetadataRoute } from "next";
import type { Project, VideoPanel } from "@/content/project";
import { site } from "./site";

const absolute = (url: string) => new URL(url, site.url).href;
function date(value?: string) {
  return value && Number.isFinite(Date.parse(value)) ? new Date(value).toISOString() : undefined;
}
export function projectImages(project: Project): string[] {
  return [...new Set([
    ...(project.listingImage ? [project.listingImage.url] : []),
    ...project.media.flatMap(panel => panel._type === "imagePanel" && !panel.decorative
      ? [panel.image.url, ...(panel.mobileImage ? [panel.mobileImage.url] : [])] : []),
  ])].map(absolute);
}
export function projectVideos(project: Project): VideoPanel[] {
  return project.media.filter((panel): panel is VideoPanel => panel._type === "videoPanel" &&
    panel.seo?.enabled === true && Boolean(panel.title?.trim() && panel.seo.description?.trim() && date(panel.seo.uploadDate) && panel.poster?.url && panel.url));
}
export function projectMetadata(project: Project): Metadata {
  const url = absolute(`/projects/${project.slug}`);
  const title = project.seoTitle?.trim() || `${project.name} | Izart Studio`;
  const description = project.description?.trim() || project.introduction;
  const firstImage = project.media.find(panel => panel._type === "imagePanel")?.image;
  const image = project.socialImage || project.listingImage || firstImage;
  const alt = project.socialImageAlt?.trim() || (!project.socialImage ? project.listingAlt?.trim() : undefined) || `${project.name} case study by Izart Studio`;
  const images = image ? [{ url: absolute(image.url), width: image.width, height: image.height, alt }] : [];
  const index = site.indexable && project.indexable;
  return {
    title: { absolute: title }, description,
    alternates: { canonical: url },
    openGraph: { type: "website", title, description, url, siteName: site.name, locale: "en_IN", images },
    twitter: { card: "summary_large_image", title, description, images },
    robots: { index, follow: true, googleBot: { index, follow: true, "max-image-preview": "large", "max-video-preview": -1 } },
  };
}
export function projectStructuredData(project: Project): Record<string, unknown> {
  const url = absolute(`/projects/${project.slug}`);
  const organizationId = absolute("/#organization");
  const imageObjects: Record<string, unknown>[] = [];
  const firstImage = project.media.find(panel => panel._type === "imagePanel")?.image;
  const cover = project.listingImage || firstImage;
  if (cover) imageObjects.push({
    "@type": "ImageObject", "@id": `${url}#cover`, contentUrl: absolute(cover.url), url: absolute(cover.url),
    name: `${project.name} case-study cover`, description: project.listingAlt || `${project.name} project artwork`,
    width: cover.width, height: cover.height,
  });
  for (const panel of project.media) {
    if (panel._type !== "imagePanel" || panel.decorative) continue;
    for (const [variant, image] of [["desktop", panel.image], ["mobile", panel.mobileImage]] as const) {
      if (!image) continue;
      imageObjects.push({
        "@type": "ImageObject", "@id": `${url}#image-${encodeURIComponent(panel._key)}-${variant}`,
        contentUrl: absolute(image.url), url: absolute(image.url), width: image.width, height: image.height,
        name: panel.imageTitle || `${project.name} project artwork`, description: panel.alt,
        ...(panel.caption ? { caption: panel.caption } : {}),
        ...(panel.creditText ? { creditText: panel.creditText } : {}),
        ...(panel.creatorName ? { creator: { "@type": "Person", name: panel.creatorName } } : {}),
        ...(panel.licenseUrl ? { license: panel.licenseUrl } : {}),
        ...(panel.rightsUrl ? { acquireLicensePage: panel.rightsUrl } : {}),
      });
    }
  }
  const videos = projectVideos(project).map(panel => ({
    "@type": "VideoObject", "@id": `${url}#video-${encodeURIComponent(panel._key)}`,
    name: panel.title, description: panel.seo!.description,
    thumbnailUrl: absolute(panel.poster.url), contentUrl: absolute(panel.url),
    uploadDate: date(panel.seo!.uploadDate),
    ...(panel.seo!.durationSeconds && panel.seo!.durationSeconds > 0 ? { duration: `PT${panel.seo!.durationSeconds}S` } : {}),
  }));
  const breadcrumbs = {
    "@type": "BreadcrumbList", "@id": `${url}#breadcrumbs`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: absolute("/") },
      { "@type": "ListItem", position: 2, name: "Projects", item: absolute("/projects") },
      { "@type": "ListItem", position: 3, name: project.name, item: url },
    ],
  };
  return { "@context": "https://schema.org", "@graph": [
    { "@type": "Organization", "@id": organizationId, name: site.name, url: site.url.href },
    { "@type": "WebPage", "@id": `${url}#webpage`, url, name: project.seoTitle || project.name,
      description: project.description || project.introduction, inLanguage: "en",
      mainEntity: { "@id": `${url}#work` }, breadcrumb: { "@id": breadcrumbs["@id"] },
      ...(cover ? { primaryImageOfPage: { "@id": `${url}#cover` } } : {}),
    },
    { "@type": "CreativeWork", "@id": `${url}#work`, url, name: project.name,
      description: project.description || project.introduction,
      creator: { "@id": organizationId }, mainEntityOfPage: { "@id": `${url}#webpage` },
      ...(project.services.length ? { keywords: project.services.join(", ") } : {}),
      ...(date(project.publishedAt) ? { datePublished: date(project.publishedAt) } : {}),
      ...(date(project.updatedAt) ? { dateModified: date(project.updatedAt) } : {}),
      image: imageObjects.map(image => ({ "@id": image["@id"] })),
      ...(videos.length ? { video: videos.map(video => ({ "@id": video["@id"] })) } : {}),
    }, breadcrumbs, ...imageObjects, ...videos,
  ] };
}
export function projectSitemapEntry(project: Project): MetadataRoute.Sitemap[number] {
  const videos = projectVideos(project).map(panel => ({
    title: panel.title, description: panel.seo!.description!, thumbnail_loc: absolute(panel.poster.url),
    content_loc: absolute(panel.url), publication_date: date(panel.seo!.uploadDate),
    ...(panel.seo!.durationSeconds ? { duration: Math.round(panel.seo!.durationSeconds) } : {}),
  }));
  return {
    url: absolute(`/projects/${project.slug}`),
    ...(date(project.updatedAt) ? { lastModified: date(project.updatedAt) } : {}),
    images: projectImages(project), ...(videos.length ? { videos } : {}),
  };
}
