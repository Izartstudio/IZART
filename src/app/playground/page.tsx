import type { Metadata } from "next";
import { PlaygroundPageView } from "@/components/playground/playground-page.client";
import { getPlaygroundPage } from "@/sanity/playground";
import { site } from "@/lib/site";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPlaygroundPage();
  const index = site.indexable && page.indexable;
  return {
    title: { absolute: `${page.seoTitle} | ${site.name}` },
    description: page.description,
    alternates: { canonical: "/playground" },
    robots: { index, follow: true },
    openGraph: { title: page.seoTitle, description: page.description, url: "/playground", type: "website", siteName: site.name },
    twitter: { card: "summary_large_image", title: page.seoTitle, description: page.description },
  };
}

export default async function PlaygroundPage() {
  return <PlaygroundPageView page={await getPlaygroundPage()} />;
}
