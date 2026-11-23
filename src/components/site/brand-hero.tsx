import { SiteButton } from "@/components/site/site-button";
import { HeroImageField } from "@/components/home/hero-image-field.client";
import styles from "@/components/home/hero-image-field.module.css";
import { HeroExplore } from "@/components/home/hero-explore.client";

export type BrandHeroContent = {
  title: string;
  mobileTitle?: string;
  buttonLabel: string;
  mobileButtonLabel?: string;
  buttonHref: string;
  leftImages?: string[];
  rightImages?: string[];
};
const homepageHero: BrandHeroContent = {
  title: "Creative solution\nfor timeless brands",
  mobileTitle: "Creative solution\nfor timeless brands",
  buttonLabel: "View Work", mobileButtonLabel: "Explore", buttonHref: "/projects",
};
function Lines({ text }: { text: string }) {
  return text.split("\n").map((line, index) => <span key={index}>{index > 0 && <br />}{line}</span>);
}
export function BrandHero({ content = homepageHero, id = "home-title", showAction = false, projectImages }: { content?: BrandHeroContent; id?: string; showAction?: boolean; projectImages?: string[] }) {
  return <section className={styles.hero} aria-labelledby={id}>
    <HeroImageField leftImages={content.leftImages} rightImages={content.rightImages} projectImages={projectImages} />
    <div className={styles.copy}>
      <span className={styles.cross} aria-hidden="true" />
      <h1 id={id} className={styles.title}><span className={styles.desktop}><Lines text={content.title} /></span><span className={styles.mobile}><Lines text={content.mobileTitle || content.title} /></span></h1>
      {showAction && <SiteButton className={styles.action} href={content.buttonHref}><span className={styles.desktop}>{content.buttonLabel}</span><span className={styles.mobile}>{content.mobileButtonLabel || content.buttonLabel}</span></SiteButton>}
    </div>
    {Boolean(projectImages?.length) && <HeroExplore />}
  </section>;
}
