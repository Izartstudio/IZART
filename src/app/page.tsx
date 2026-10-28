import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { Homepage } from "@/components/home/homepage";
import { site } from "@/lib/site";
import { getHomepageProjects } from "@/sanity/projects";

const title = "Izart Studio | A Multi Disciplinary Design Agency | Branding, Web Design, Content IPs";
const description = "Izart is a creative studio helping consumer and enterprise facing businesses stand out with differential brand strategy, visual identity, immersive websites, motion graphic design, and content IPs.";

export const metadata: Metadata = pageMetadata("/", { title: title, description: description });

export default async function Home() {
  const projects = await getHomepageProjects();
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Organization", "@id": `${site.url.href}#organization`, name: site.name, url: site.url.href, email: "operations@izart.in", telephone: "+91-97111-06474" },
      { "@type": "WebSite", "@id": `${site.url.href}#website`, url: site.url.href, name: site.name, publisher: { "@id": `${site.url.href}#organization` } },
    ],
  };

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
    <Homepage projects={projects} />
  </>;
}
