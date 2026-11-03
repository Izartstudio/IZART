import { notFound } from "next/navigation";
import { ServiceDetailPage } from "@/components/services/service-detail-page";
import { getServiceDetailContent } from "@/sanity/services";
import { showcaseServices } from "@/components/services/service-showcase-data";
import { pageMetadata } from "@/lib/seo";

const services = showcaseServices.filter(service => service.href.startsWith("/services/"));
export function generateStaticParams() { return services.map(service => ({ service: service.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ service: string }> }) {
  const { service: slug } = await params;
  const service = services.find(item => item.slug === slug);
  const content = service ? await getServiceDetailContent(slug) : {};
  return service ? pageMetadata(service.href, { title: `${content.title || service.title} | Izart Studio`, description: content.description || service.description }) : {};
}
export default async function ServiceDetail({ params }: { params: Promise<{ service: string }> }) {
  const { service: slug } = await params;
  const service = services.find(item => item.slug === slug);
  if (!service) notFound();
  return <ServiceDetailPage slug={service.slug} title={service.title} description={service.description} />;
}
