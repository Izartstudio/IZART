import Image from "next/image";

export function OutcomeSection() {
  return <section className="outcome-section" aria-labelledby="outcome-title">
    <div className="outcome-section__left">
      <h2 id="outcome-title" className="services-introduction__label outcome-section__label">
        The Outcome
        <i className="services-introduction__corner services-introduction__corner--tl" aria-hidden="true" />
        <i className="services-introduction__corner services-introduction__corner--tr" aria-hidden="true" />
        <i className="services-introduction__corner services-introduction__corner--bl" aria-hidden="true" />
        <i className="services-introduction__corner services-introduction__corner--br" aria-hidden="true" />
      </h2>
      <p className="outcome-section__summary">
        A complete, documented brand identity system - logo suite, color system, typography, visual language, verbal guidelines, and a design system ready for deployment across digital and physical environments.
      </p>
    </div>
    <div className="outcome-section__right">
      <div className="outcome-section__block">
        <h3>Benefit</h3>
        <p>Brands with strong, consistent identities generate higher customer trust, lower cost-per-acquisition, and stronger recall. Izart&apos;s identity systems are built not just for launch day, but for the full arc of your brand&apos;s growth.</p>
      </div>
      <div className="outcome-section__block">
        <h3 className="outcome-section__why-title">Why <Image src="/assets/site/logo.svg" alt="Izart Studio" width={157} height={20} /></h3>
        <p>We approach brand identity as infrastructure, not decoration. Every decision we make is anchored in market insight, audience psychology, and long-term scalability - ensuring your brand holds its ground in competitive categories and scales without losing coherence.</p>
      </div>
    </div>
  </section>;
}
