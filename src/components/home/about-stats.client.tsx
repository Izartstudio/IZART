import { AboutIntroduction } from "./about-introduction";
import { ClientLogoStrip } from "./client-logo-strip";
import { VideoExpansion } from "./video-expansion.client";
import { StatsGrid } from "./stats-grid";

export function AboutStats() {
  return <div className="about-theme">
    <section id="about-izart" className="about-stats" aria-label="About Izart and company statistics">
      <div className="about-stats__video-slot" aria-hidden="true" />
      <div className="about-stats__content">
        <AboutIntroduction />
        <ClientLogoStrip />
        <StatsGrid />
      </div>
    </section>
    <section className="video-expansion" aria-label="Izart studio showreel" />
    <VideoExpansion />
  </div>;
}
