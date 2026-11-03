import { pageMetadata } from "@/lib/seo";
import { getServiceDetailContent } from "@/sanity/services";
import { ServiceDetailPage } from "@/components/services/service-detail-page";
const title = "Brand Identity Development";
const description = "Define a distinct visual and verbal system that makes your brand instantly recognizable - across every screen, surface, and touchpoint.";
export async function generateMetadata() {
  const content = await getServiceDetailContent("brand-identity");
  return pageMetadata("/brand-identity", { title: `${content.title || title} | Izart Studio`, description: content.description || description });
}
export default function Page() { return <ServiceDetailPage slug="brand-identity" title={title} description={description} />; }
