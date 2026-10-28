import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CareerJobPage } from "@/components/careers/career-job-page";
import { SiteFooter } from "@/components/site/site-footer";
import { getCareerJob, getCareerJobSlugs } from "@/sanity/careers";
import { site } from "@/lib/site";

export const revalidate = 60;
export async function generateStaticParams() { return (await getCareerJobSlugs()).map(slug => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const job = await getCareerJob(slug);
  if (!job) return {};
  const title = `${job.role} | Careers at Izart Studio`;
  return { title: { absolute: title }, description: job.summary, alternates: { canonical: `/careers/${slug}` }, openGraph: { title, description: job.summary, url: `/careers/${slug}`, siteName: site.name, type: "website" } };
}
export default async function CareerJobRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = await getCareerJob(slug);
  if (!job) notFound();
  return <><CareerJobPage job={job} /><SiteFooter /></>;
}
