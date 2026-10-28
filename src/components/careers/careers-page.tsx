import Image from "next/image";
import type { CareersPageData } from "@/sanity/careers";
import { CareersDivider } from "./careers-divider.client";
import { CareersHeroBackground } from "./careers-hero-background";
import { CareersArchiveGrid } from "./careers-archive-grid.client";

export function CareersPage({ data }: { data: CareersPageData }) {
  return <main id="main" className="careers-page">
    <section className="careers-hero" aria-labelledby="careers-title">
      <CareersHeroBackground />
      <div className="careers-hero__copy">
        <h1 id="careers-title">{data.heroTitle}</h1>
        <p>{data.heroIntroduction}</p>
      </div>
    </section>

    <section className="careers-work" aria-labelledby="careers-work-title">
      <CareersArchiveGrid images={data.archiveImages} />
      <div className="careers-editorial careers-editorial--work">
        <CareersDivider />
        <h2 id="careers-work-title">{data.workTitle}</h2>
        <p>{data.workCopy}</p>
        <CareersDivider className="careers-divider--below" />
      </div>
    </section>

    <section className="careers-discipline" aria-labelledby="careers-discipline-title">
      <CareersDivider />
      <div className="careers-editorial careers-editorial--discipline">
        <h2 id="careers-discipline-title">{data.disciplineTitle}</h2>
        <p>{data.disciplineCopy}</p>
      </div>
      <div className="careers-statement">
        <span>WE</span>
        <div className="careers-media careers-statement__media">
          <Image src={data.teamImage.url} alt={data.teamImage.alt} fill sizes="(max-width: 700px) 70vw, 35vw" style={{ objectPosition: data.teamImage.position || "50% 50%" }} />
        </div>
        <span>ARE</span>
      </div>
      <Image className="careers-wordmark" src="/assets/careers/izartstudio.svg" alt="Izart Studio" width={656} height={110} />
    </section>

    <section className="careers-openings" aria-labelledby="careers-openings-title">
      <h2 id="careers-openings-title" className="sr-only">Open roles</h2>
      <div className="careers-jobs" role="table" aria-label="Current job openings">
        <div className="careers-job careers-job--head" role="row">
          <span role="columnheader">Role</span><span role="columnheader">Work type</span><span role="columnheader">Location</span>
        </div>
        {data.jobs.map(job => {
          const content = <><span>{job.role}</span><span>{job.workType}</span><span>{job.location}</span></>;
          return job.slug
            ? <a className="careers-job" href={`/careers/${job.slug}`} key={job.id} role="row">{content}</a>
            : <div className="careers-job" key={job.id} role="row">{content}</div>;
        })}
      </div>
    </section>
  </main>;
}
