import Link from "next/link";
import { CareerApplicationForm } from "./career-application-form.client";
import type { CareerJob } from "@/sanity/careers";
import { CareersHeroBackground } from "./careers-hero-background";
import { CareerToc } from "./career-toc.client";

export function CareerJobPage({ job }: { job: CareerJob }) {
  return <main id="main" className="career-detail">
    <section className="career-detail__hero" aria-labelledby="career-job-title">
      <CareersHeroBackground />
      <div className="career-detail__hero-copy">
        <h1 id="career-job-title">{job.heroTitle || job.role}</h1>
        <p>{job.summary}</p>
        <a className="career-detail__apply" href="#apply">{job.applyLabel || "Apply Now"}</a>
      </div>
      <dl className="career-detail__facts">
        <div><dt>Role</dt><dd>{job.role}</dd></div>
        <div><dt>Experience</dt><dd>{job.experience}</dd></div>
        <div><dt>Location</dt><dd>{job.location}</dd></div>
      </dl>
    </section>

    <section className="career-detail__content">
      <CareerToc hasRequirements={job.requirements.length > 0} />

      <div className="career-detail__article">
        <section id="about"><h2>{job.aboutTitle}</h2>{job.aboutCopy.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</section>
        <section id="team"><h2>{job.teamTitle}</h2>{job.teamCopy.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</section>
        <section id="responsibilities" className="career-detail__list"><h2>{job.responsibilitiesTitle}</h2>
          <ol>{job.responsibilities.map((item, index) => <li key={index}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></li>)}</ol>
        </section>
        {job.requirements.length > 0 && <section id="requirements" className="career-detail__list"><h2>{job.requirementsTitle}</h2>
          <ol>{job.requirements.map((item, index) => <li key={index}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></li>)}</ol>
        </section>}
        <Link className="career-detail__back" href="/careers">← Back to careers</Link>
      </div>
    </section>
    <CareerApplicationForm role={job.role} slug={job.slug} />
  </main>;
}
