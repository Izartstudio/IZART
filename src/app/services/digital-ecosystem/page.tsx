import { pageMetadata } from "@/lib/seo";
import { getServiceDetailContent } from "@/sanity/services";
import { ServiceDetailPage } from "@/components/services/service-detail-page";
const title = "Digital Ecosystem";
const description = "Digital experiences designed and built as one connected ecosystem.";
export async function generateMetadata() {
  const content = await getServiceDetailContent("digital-ecosystem");
  return pageMetadata("/website-design-and-development", { title: `${content.title || title} | Izart Studio`, description: content.description || description });
}
export default function Page() { return <ServiceDetailPage slug="digital-ecosystem" title={title} description={description} />; }
