import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { CareersPage } from "@/components/careers/careers-page";
import { SiteFooter } from "@/components/site/site-footer";
import { getCareersPage } from "@/sanity/careers";

const title = "Careers | Izart Studio";
const description = "Join Izart Studio and help build brands, websites, and ideas with intention.";
export const metadata: Metadata = pageMetadata("/careers", { title: title, description: description });

export default async function CareersRoute() {
  const data = await getCareersPage();
  return <><CareersPage data={data} /><SiteFooter /></>;
}
