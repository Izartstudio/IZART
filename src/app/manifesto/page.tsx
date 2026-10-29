import Image from "next/image";
import { ContactForm } from "@/components/home/contact-form.client";
import { SiteFooter } from "@/components/site/site-footer";
import { JsonLd } from "@/components/seo/json-ld";
import { breadcrumbData, pageMetadata } from "@/lib/seo";
import content from "@/content/manifesto.json";
import styles from "./manifesto.module.css";

export const metadata = pageMetadata("/manifesto", {
  title: "Our Manifesto | Izart Studio",
  description: "Discover Izart Studio’s approach to strategy, design, digital systems, and long-term brand custodianship.",
});

export default function ManifestoPage() {
  return <>
    <main id="main" className={styles.page}>
      <JsonLd data={breadcrumbData([{ name: "Home", path: "/" }, { name: "Manifesto", path: "/manifesto" }])} />
      <article className={styles.column}>
        <header className={styles.heading}>
          <h1>Manifesto</h1>
          <Image src="/assets/manifesto/izart-wordmark.svg" alt="Izart Studio" width={195} height={36} unoptimized />
        </header>
        <div className={styles.body}>
          {content.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        </div>
        <section className={styles.faq} aria-labelledby="manifesto-faq-title">
          <h2 id="manifesto-faq-title">Frequently asked questions</h2>
          <div className={styles.questions}>
            {content.faq.map(item => <details key={item.question} className={styles.question}>
              <summary><h3>{item.question}</h3><span className={styles.indicator} aria-hidden="true" /></summary>
              <div className={styles.answer}>{item.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
            </details>)}
          </div>
        </section>
      </article>
      <ContactForm />
    </main>
    <SiteFooter />
  </>;
}
