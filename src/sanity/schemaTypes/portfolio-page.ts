import { defineArrayMember, defineField, defineType } from "sanity";
import { defaultPortfolioSettings } from "../../content/portfolio-page";
export const portfolioPage = defineType({
  name: "portfolioPage", title: "Portfolio page", type: "document",
  fields: [
    defineField({ name: "heading", title: "Page heading", type: "string", initialValue: defaultPortfolioSettings.heading, validation: r => r.required() }),
    defineField({ name: "gridIntroduction", title: "Grid introduction", type: "text", rows: 4, initialValue: defaultPortfolioSettings.gridIntroduction }),
    defineField({ name: "galleryLabel", type: "string", initialValue: "Gallery View" }),
    defineField({ name: "gridLabel", type: "string", initialValue: "Grid View" }),
    defineField({ name: "defaultView", type: "string", initialValue: "gallery", options: { list: ["gallery", "grid"] } }),
    defineField({ name: "showArchive", title: "Show case-study link archive", type: "boolean", initialValue: true }),
    defineField({ name: "archiveHeading", type: "string", initialValue: defaultPortfolioSettings.archiveHeading }),
    defineField({ name: "projects", title: "Optional portfolio order", type: "array", of: [defineArrayMember({ type: "reference", to: [{ type: "project" }] })], description: "Drag projects into order. Other visible projects follow their own order setting.", validation: r => r.unique() }),
    defineField({ name: "useCmsProjects", title: "Manage all projects in Sanity", type: "boolean", initialValue: false, description: "Enable after importing. Local fallback projects then disappear, so unpublishing and deleting in Sanity also removes them from the website." }),
  ],
  preview: { prepare: () => ({ title: "Portfolio page" }) },
});
