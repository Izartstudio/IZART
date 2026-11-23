import "server-only";
import { cache } from "react";
import { createClient } from "@sanity/client";
import { defaultHomeServices, homeServicesDocumentId, isServicesHref, type HomeServicesContent } from "@/content/home-services";

const client = process.env.SANITY_PROJECT_ID ? createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET || "production",
  apiVersion: "2026-09-17",
  perspective: "published",
  useCdn: false,
  token: process.env.SANITY_API_READ_TOKEN,
}) : null;

const projection = '{ "src": asset->url, alt, "position": select(defined(hotspot) => string(hotspot.x * 100) + "% " + string(hotspot.y * 100) + "%") }';

// The published SVGs match these local source files byte for byte. Use their
// pre-rendered WebP equivalents and keep newly uploaded artwork CMS-driven.
const serviceSvgHashes = [
  "ebc28b14b84131a33cd6f251bc81803696811b15",
  "7ae014975ee46f1e3ca50cfebdcca7cc9baa84f1",
  "5eae6169f444eec2151a89224091e9a8ec6a7903",
  "dd9cc8621c5589c1e58474d257cb8434598f1c05",
  "04ee61d5a9f594b85e854c1c4be82cd0d418faaf",
];

export const getHomeServices = cache(async (): Promise<HomeServicesContent> => {
  if (!client) return defaultHomeServices;
  try {
    const result = await client.fetch<HomeServicesContent | null>(
      `*[_id == $id && _type == "homeServices"][0]{
        heading, introduction, learnMoreLabel, industries, industriesLink,
        services[]{"id": _key, title, description, href, "background": select(defined(backgroundSvg.asset) => {"src": backgroundSvg.asset->url}, background${projection}), project{label, href, year, image${projection}}}
      }`,
      { id: homeServicesDocumentId },
      { next: { revalidate: 60 } },
    );
    if (!result) return defaultHomeServices;
    const services = (result.services ?? []).filter(service =>
      service.id && service.title?.trim() && service.description?.trim() && isServicesHref(service.href) &&
      service.background?.src && service.project?.image?.src && service.project.label?.trim() && isServicesHref(service.project.href),
    );
    return {
      heading: result.heading?.trim() || defaultHomeServices.heading,
      introduction: result.introduction?.trim() || defaultHomeServices.introduction,
      learnMoreLabel: result.learnMoreLabel?.trim() || defaultHomeServices.learnMoreLabel,
      industries: result.industries?.filter(industry => industry?.trim()) ?? defaultHomeServices.industries,
      industriesLink: result.industriesLink?.label?.trim() && isServicesHref(result.industriesLink.href)
        ? result.industriesLink : defaultHomeServices.industriesLink,
      services: services.length ? services.map(service => {
        const assetHash = service.background.src.match(/^https:\/\/cdn\.sanity\.io\/files\/[^/]+\/[^/]+\/([a-f0-9]{40})\.svg$/)?.[1];
        const index = assetHash ? serviceSvgHashes.indexOf(assetHash) : -1;
        return index < 0 ? service : {
          ...service,
          background: { ...service.background, src: `/assets/home/services/service-${index + 1}-fallback.webp` },
        };
      }) : defaultHomeServices.services,
    };
  } catch (error) {
    console.error("Unable to load Homepage Our Services from Sanity.", error);
    return defaultHomeServices;
  }
});
