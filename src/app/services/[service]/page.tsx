import { notFound } from "next/navigation";
import Link from "next/link";
import { showcaseServices } from "@/components/services/service-showcase-data";
import { ContactForm } from "@/components/home/contact-form.client";
import { SiteFooter } from "@/components/site/site-footer";
import { pageMetadata } from "@/lib/seo";
import styles from "./service-detail.module.css";

const services = showcaseServices.filter(service => service.href.startsWith("/services/"));
export function generateStaticParams() { return services.map(service => ({ service: service.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ service: string }> }) {
  const { service: slug } = await params;
  const service = services.find(item => item.slug === slug);
  return service ? pageMetadata(service.href, { title: `${service.title} | Izart Studio`, description: service.description }) : {};
}
export default async function ServiceDetail({ params }: { params: Promise<{ service: string }> }) {
  const { service: slug } = await params;
  const service = services.find(item => item.slug === slug);
  if (!service) notFound();
  return <><main id="main"><section className={styles.hero} style={{ backgroundImage: `linear-gradient(90deg,#000c,#0005),url('${service.image}')` }}>
    <Link href="/services" className={styles.back}>All Services ↗</Link>
    <h1>{service.title}</h1><p>{service.description}</p><Link href="#Get-Quote" className={styles.cta}>Discuss your project ↗</Link>
  </section><section className={styles.details}><h2>Built around your brand</h2><p>{service.details}</p></section><ContactForm /></main><SiteFooter /></>;
}
