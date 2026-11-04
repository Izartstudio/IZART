import { serviceSubpages } from "../../content/service-subpages";
import { defineArrayMember, defineField, defineType } from "sanity";

const image = () => defineArrayMember({ type: "image", options: { hotspot: true }, fields: [defineField({ name: "alt", type: "string", title: "Alternative text" })] });
export const serviceDetailPage = defineType({
  name: "serviceDetailPage", title: "Service detail pages", type: "document",
  fields: [
    defineField({ name: "service", title: "Service", type: "string", options: { list: [
      { title: "Branding", value: "brand-identity" }, { title: "Digital Ecosystem", value: "digital-ecosystem" },
      { title: "Brand Growth", value: "brand-growth" }, { title: "Brand Launch & Campaign Planning", value: "brand-launch" },
      { title: "Spatial Design", value: "spatial-design" },
      ...serviceSubpages.map(page => ({ title: page.title, value: page.slug })),
    ] }, validation: rule => rule.required().custom(async (value, context) => {
      if (!value) return true;
      const id = context.document?._id.replace(/^drafts\./, "");
      const duplicate = await context.getClient({ apiVersion: "2026-09-17" }).fetch<number>(
        'count(*[_type == "serviceDetailPage" && service == $service && !(_id in [$id, $draft])])',
        { service: value, id: id || "", draft: `drafts.${id}` },
      );
      return duplicate === 0 || "A page already exists for this service. Edit that page instead.";
    }) }),
    defineField({ name: "title", title: "Hero heading", type: "string" }),
    defineField({ name: "description", title: "Hero description", type: "text", rows: 3 }),
    defineField({ name: "heroImages", title: "Hero images — left to right", type: "array", of: [image()], description: "Leave empty to use the shared service images. Provide exactly seven to replace them.", validation: rule => rule.custom(value => !value?.length || value.length === 7 || "Provide seven images.") }),
    defineField({ name: "showcase", title: "Our Services showcase", type: "object",
      description: "Independent content for Digital Ecosystem or Spatial Design. Empty fields use the homepage defaults.",
      hidden: ({ document }) => !["digital-ecosystem", "spatial-design"].includes(String(document?.service)),
      fields: [
        defineField({ name: "heading", type: "string", title: "Section heading" }),
        defineField({ name: "description", type: "text", title: "Introduction" }),
        defineField({ name: "states", title: "Service states — drag to reorder", type: "array", of: [defineArrayMember({ type: "object", fields: [
          defineField({ name: "title", type: "string", validation: rule => rule.required() }),
          defineField({ name: "description", type: "text", validation: rule => rule.required() }),
          defineField({ name: "href", title: "Learn more destination", type: "string", validation: rule => rule.required().custom(value => !value || /^(\/(?!\/)|https:\/\/)/.test(value) || "Use a site path or HTTPS URL.") }),
          defineField({ name: "image", title: "Desktop poster / fallback", type: "image", options: { hotspot: true }, validation: rule => rule.required() }),
          defineField({ name: "mobileImage", title: "Mobile poster / fallback", type: "image", options: { hotspot: true } }),
          defineField({ name: "video", title: "Desktop video", type: "file", options: { accept: "video/mp4,video/webm" } }),
          defineField({ name: "mobileVideo", title: "Mobile video", type: "file", options: { accept: "video/mp4,video/webm" } }),
        ], preview: { select: { title: "title", media: "image" } } })] }),
      ],
    }),
    defineField({ name: "processSteps", title: "Our Process", type: "array", of: [defineArrayMember({ type: "object", fields: [
      defineField({ name: "weekStart", type: "string" }), defineField({ name: "weekEnd", type: "string" }),
      defineField({ name: "title", type: "string", validation: rule => rule.required() }),
      defineField({ name: "description", type: "text", rows: 3 }),
      defineField({ name: "images", type: "array", of: [image()], validation: rule => rule.max(9) }),
    ], preview: { select: { title: "title", subtitle: "weekStart" } } })] }),
    defineField({ name: "outcome", title: "The Outcome", type: "object", fields: [
      defineField({ name: "summary", type: "text" }), defineField({ name: "benefit", type: "text" }), defineField({ name: "why", title: "Why Izart", type: "text" }),
    ] }),
    defineField({ name: "faqs", title: "Frequently Asked Questions", type: "array", of: [defineArrayMember({ type: "object", fields: [
      defineField({ name: "question", type: "string", validation: rule => rule.required() }),
      defineField({ name: "answer", type: "text", validation: rule => rule.required() }),
    ], preview: { select: { title: "question" } } })] }),
  ],
  preview: { select: { title: "service", subtitle: "title" } },
});
