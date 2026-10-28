import "server-only";
import { cache } from "react";
import { createClient } from "@sanity/client";

export type CareersImage = { url: string; alt: string; label: string; position?: string };
export type CareerJob = {
  id: string; slug: string; role: string; heroTitle: string; workType: string; experience: string; location: string;
  summary: string; applyLabel: string; applyUrl?: string; aboutTitle: string; aboutCopy: string[]; teamTitle: string;
  teamCopy: string[]; responsibilitiesTitle: string; responsibilities: string[]; requirementsTitle: string; requirements: string[];
};
export type CareersPageData = {
  heroTitle: string;
  heroIntroduction: string;
  workTitle: string;
  workCopy: string;
  archiveImages: CareersImage[];
  disciplineTitle: string;
  disciplineCopy: string;
  teamImage: CareersImage;
  jobs: CareerJob[];
};

const fallbackImages = [
  ["/assets/home/showcase/project1.png", "Archive Item 01"],
  ["/assets/home/showcase/project2.png", "Archive Item 02"],
  ["/assets/home/showcase/project3.png", "Archive Item 03"],
  ["/assets/services/example.png", "Archive Item 04"],
  ["/assets/site/open-menu-project.png", "Archive Item 05"],
] as const;

const jobCopy = {
  summary: "We want you if you have a perfect combination of design skills, leadership and a fantastic ability to bring innovations to the product while owning your successes and failures.",
  applyLabel: "Apply Now",
  aboutTitle: "ABOUT US",
  aboutCopy: ["Izart is a design studio that believes thoughtful design can transform how a product is accessed and understood. We combine storytelling with robust processes to create premium digital experiences."],
  teamTitle: "THE TEAM",
  teamCopy: ["We are a holistic design studio working with ambitious businesses to create brands and digital products that hold up over time.", "Our approach combines research, strategy, visual identity, product design and motion. We value clear thinking, considered execution and people who care deeply about the work."],
  responsibilitiesTitle: "WHAT YOU’LL DO",
  responsibilities: [
    "Take ownership of multiple design projects in a focused studio environment.",
    "Be an advocate for design and bring a clear point of view to every project.",
    "Collaborate closely with designers, strategists and developers.",
    "Align design decisions with the wider goals of each project.",
    "Share feedback generously and contribute to a culture of continuous learning.",
    "Manage your schedule and deliver considered work on time.",
    "Participate in regular reviews and respond constructively to feedback.",
    "Stay curious about the industry and bring new ideas into the studio.",
  ],
  requirementsTitle: "JOB REQUIREMENTS",
  requirements: ["A strong portfolio demonstrating clear thinking and craft.", "Excellent communication, collaboration and presentation skills.", "The ability to work from our New Delhi studio."],
} satisfies Partial<CareerJob>;

const fallbackJobs: CareerJob[] = [
  ["visual-designer", "Visual Designer", "2+ Years"],
  ["ui-ux-designer", "UI UX Designer", "2+ Years"],
  ["graphic-designer", "Graphic Designer", "2+ Years"],
  ["motion-graphic-designer", "Motion Graphic Designer", "2+ Years"],
].map(([slug, role, experience]) => ({ id: slug, slug, role, heroTitle: role.toUpperCase(), workType: "Full Time", experience, location: "In-Office (New Delhi)", ...jobCopy } as CareerJob));

const fallback: CareersPageData = {
  heroTitle: "WORK WORTH\nCARING ABOUT",
  heroIntroduction: "We’re a lean team building brands,\nwebsites and ideas with intention.",
  workTitle: "THE WORK",
  workCopy: "We work on brand strategy, visual identity, websites, packaging, and content systems for businesses that take their own brand seriously. The discipline is design, but most of what makes the work good lives upstream of it. Before a logo is ever drawn, we are working out what a business is trying to say in the world and why it should be heard. That part of the work shapes everything downstream. Once the thinking is clear, the visuals sharpen, decisions get easier, and the output starts to carry meaning beyond what it looks like.",
  archiveImages: fallbackImages.map(([url, label]) => ({ url, label, alt: "" })),
  disciplineTitle: "THE DISCIPLINE",
  disciplineCopy: "The way we work is straightforward. We think first, then we build. Execution waits until the thinking is ready, and if something feels off, we pause and fix it before moving ahead. That often means asking better questions, challenging assumptions, and stepping back when the work calls for it. The pace can feel slower at the start, and it leads to work that holds up over time, instead of work that has to be reworked again and again.",
  teamImage: { url: "/assets/home/showcase/project1.png", alt: "Izart Studio team", label: "" },
  jobs: fallbackJobs,
};

const client = process.env.SANITY_PROJECT_ID ? createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET || "production",
  apiVersion: "2026-10-01",
  useCdn: false,
  perspective: "published",
  token: process.env.SANITY_API_READ_TOKEN,
}) : null;

type RawCareers = Omit<CareersPageData, "archiveImages" | "teamImage" | "jobs"> & {
  archiveImages?: Array<{ url?: string; alt?: string; label?: string; hotspot?: { x: number; y: number } }>;
  teamImage?: { url?: string; alt?: string; hotspot?: { x: number; y: number } };
  jobs?: Array<Partial<CareerJob>>;
};

export const getCareersPage = cache(async (): Promise<CareersPageData> => {
  if (!client) return fallback;
  const value = await client.fetch<RawCareers | null>(`*[_type == "careersPage"][0]{
    heroTitle, heroIntroduction, workTitle, workCopy, disciplineTitle, disciplineCopy,
    archiveImages[]{label, alt, "url": image.asset->url, "hotspot": image.hotspot},
    teamImage{alt, "url": image.asset->url, "hotspot": image.hotspot},
    jobs[]{"id": _key, "slug": slug.current, role, heroTitle, workType, experience, location, summary, applyLabel, applyUrl,
      aboutTitle, aboutCopy, teamTitle, teamCopy, responsibilitiesTitle, responsibilities, requirementsTitle, requirements}
  }`, {}, { next: { revalidate: 60 } });
  if (!value) return fallback;
  const mapImage = (image: NonNullable<RawCareers["archiveImages"]>[number], index: number): CareersImage => ({
    url: image.url || fallback.archiveImages[index]?.url || fallback.teamImage.url,
    alt: image.alt || "",
    label: image.label || `Archive Item ${String(index + 1).padStart(2, "0")}`,
    position: image.hotspot ? `${image.hotspot.x * 100}% ${image.hotspot.y * 100}%` : undefined,
  });
  return {
    ...fallback,
    ...value,
    archiveImages: value.archiveImages?.length ? value.archiveImages.slice(0, 5).map(mapImage) : fallback.archiveImages,
    teamImage: value.teamImage?.url ? {
      url: value.teamImage.url,
      alt: value.teamImage.alt || "",
      label: "",
      position: value.teamImage.hotspot ? `${value.teamImage.hotspot.x * 100}% ${value.teamImage.hotspot.y * 100}%` : undefined,
    } : fallback.teamImage,
    jobs: value.jobs?.filter(job => job.role && job.workType && job.location).map((job, index) => {
      const local = fallbackJobs.find(item => item.slug === job.slug) || fallbackJobs[0];
      const slug = job.slug || `${job.role}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      return {
        ...local,
        id: job.id || `${job.role}-${index}`, slug, role: job.role!, heroTitle: job.heroTitle || job.role!,
        workType: job.workType!, experience: job.experience || local.experience, location: job.location!,
        summary: job.summary || local.summary, applyLabel: job.applyLabel || local.applyLabel, applyUrl: job.applyUrl,
        aboutTitle: job.aboutTitle || local.aboutTitle, aboutCopy: job.aboutCopy?.length ? job.aboutCopy : local.aboutCopy,
        teamTitle: job.teamTitle || local.teamTitle, teamCopy: job.teamCopy?.length ? job.teamCopy : local.teamCopy,
        responsibilitiesTitle: job.responsibilitiesTitle || local.responsibilitiesTitle,
        responsibilities: job.responsibilities?.length ? job.responsibilities : local.responsibilities,
        requirementsTitle: job.requirementsTitle || local.requirementsTitle,
        requirements: job.requirements || local.requirements,
      } as CareerJob;
    }) || fallback.jobs,
  };
});

export const getCareerJobSlugs = cache(async () => (await getCareersPage()).jobs.map(job => job.slug).filter(Boolean));
export const getCareerJob = cache(async (slug: string) => (await getCareersPage()).jobs.find(job => job.slug === slug) || null);
