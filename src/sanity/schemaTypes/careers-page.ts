import { defineArrayMember, defineField, defineType } from "sanity";

const requiredCopy = (name: string, title: string, rows = 3) => defineField({ name, title, type: "text", rows, validation: rule => rule.required() });

export const careersPage = defineType({
  name: "careersPage",
  title: "Careers page",
  type: "document",
  fields: [
    requiredCopy("heroTitle", "Hero title", 2),
    requiredCopy("heroIntroduction", "Hero introduction", 2),
    defineField({ name: "archiveImages", title: "Archive images", type: "array", description: "The first five images fill the fixed staggered composition. Hotspots control responsive crops.", of: [defineArrayMember({ name: "archiveImage", type: "object", fields: [
      defineField({ name: "image", type: "image", options: { hotspot: true }, validation: rule => rule.required() }),
      defineField({ name: "alt", type: "string", description: "Leave empty only when the image is decorative." }),
      defineField({ name: "label", type: "string", validation: rule => rule.required() }),
    ], preview: { select: { title: "label", media: "image" } } })], validation: rule => rule.required().min(5).max(5) }),
    defineField({ name: "workTitle", title: "Work heading", type: "string", validation: rule => rule.required() }),
    requiredCopy("workCopy", "Work copy", 9),
    defineField({ name: "disciplineTitle", title: "Discipline heading", type: "string", validation: rule => rule.required() }),
    requiredCopy("disciplineCopy", "Discipline copy", 6),
    defineField({ name: "teamImage", title: "We are image", type: "object", fields: [
      defineField({ name: "image", type: "image", options: { hotspot: true }, validation: rule => rule.required() }),
      defineField({ name: "alt", type: "string" }),
    ], validation: rule => rule.required() }),
    defineField({ name: "jobs", title: "Job postings", type: "array", description: "Add, remove, and reorder roles. The careers table expands automatically.", of: [defineArrayMember({ name: "job", type: "object", fields: [
      defineField({ name: "role", type: "string", validation: rule => rule.required() }),
      defineField({ name: "slug", type: "slug", options: { source: "role" }, validation: rule => rule.required() }),
      defineField({ name: "heroTitle", title: "Hero title", type: "string", description: "Defaults visually to the role, but can be written separately for the inner page." }),
      defineField({ name: "workType", title: "Work type", type: "string", validation: rule => rule.required() }),
      defineField({ name: "experience", type: "string", validation: rule => rule.required() }),
      defineField({ name: "location", type: "string", validation: rule => rule.required() }),
      defineField({ name: "summary", type: "text", rows: 3, validation: rule => rule.required() }),
      defineField({ name: "applyLabel", title: "Apply button label", type: "string", initialValue: "Apply Now" }),
      defineField({ name: "applyUrl", title: "Application URL", type: "url", validation: rule => rule.uri({ allowRelative: true, scheme: ["http", "https", "mailto"] }) }),
      defineField({ name: "aboutTitle", title: "About heading", type: "string", initialValue: "ABOUT US" }),
      defineField({ name: "aboutCopy", title: "About paragraphs", type: "array", of: [defineArrayMember({ type: "text", rows: 3 })], validation: rule => rule.required().min(1) }),
      defineField({ name: "teamTitle", title: "Team heading", type: "string", initialValue: "THE TEAM" }),
      defineField({ name: "teamCopy", title: "Team paragraphs", type: "array", of: [defineArrayMember({ type: "text", rows: 3 })], validation: rule => rule.required().min(1) }),
      defineField({ name: "responsibilitiesTitle", title: "Responsibilities heading", type: "string", initialValue: "WHAT YOU’LL DO" }),
      defineField({ name: "responsibilities", type: "array", of: [defineArrayMember({ type: "string" })], validation: rule => rule.required().min(1) }),
      defineField({ name: "requirementsTitle", title: "Requirements heading", type: "string", initialValue: "JOB REQUIREMENTS" }),
      defineField({ name: "requirements", type: "array", of: [defineArrayMember({ type: "string" })] }),
    ], preview: { select: { title: "role", subtitle: "location" } } })] }),
  ],
  preview: { prepare: () => ({ title: "Careers page" }) },
});
