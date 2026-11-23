import { getOutcomeStats } from "@/sanity/outcome-stats";
import { OutcomeStats } from "./outcome-stats.client";

export type ServiceOutcome = { summary?: string; benefit?: string; why?: string };

export async function OutcomeSection({ content = {} }: { content?: ServiceOutcome }) {
  return <section className="outcome-section" aria-labelledby="outcome-title">
    <OutcomeStats stats={await getOutcomeStats()} />
    <div className="outcome-section__body">
      <h2 id="outcome-title" className="section-selection outcome-section__label">
        <span className="section-selection__text">The Outcome</span>
        {["top", "right", "bottom", "left"].map(edge => <i key={edge} className={`selection-border selection-border--${edge}`} aria-hidden="true" />)}
      </h2>
      <div className="outcome-section__copy">
        <p>{content.summary || "We specialize in crafting unique brands and delivering seamless experiences that empower businesses to effectively differentiate themselves. Our goal is to help them engage meaningfully with their audiences while successfully expanding across diverse markets."}</p>
        <p>{content.benefit || "We create unique brands and seamless experiences that empower businesses to differentiate themselves, engage meaningfully with their audiences, and expand successfully across various markets."}</p>
        <div className="outcome-section__takeaway">
          <h3>What you take away</h3>
          <p>{content.why || "A clearly defined brand position, along with a distinctive identity system, creates a cohesive experience across both digital and physical touchpoints. Additionally, adaptable brand assets are essential, ensuring that they are prepared for whatever comes next."}</p>
        </div>
      </div>
    </div>
  </section>;
}
