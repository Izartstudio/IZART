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
      services: services.length ? services : defaultHomeServices.services,
    };
  } catch (error) {
    console.error("Unable to load Homepage Our Services from Sanity.", error);
    return defaultHomeServices;
  }
});
