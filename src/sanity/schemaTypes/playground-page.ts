import { defineArrayMember, defineField, defineType } from "sanity";

const card = defineArrayMember({
  name: "playgroundCard",
  title: "Project card",
  type: "object",
  fields: [
    defineField({ name: "title", type: "string", validation: rule => rule.required() }),
    defineField({ name: "year", type: "string", initialValue: "2026", validation: rule => rule.regex(/^\d{4}$/) }),
    defineField({ name: "eyebrow", title: "Small label", type: "string", initialValue: "Case study" }),
    defineField({ name: "project", title: "Case-study link", type: "reference", to: [{ type: "project" }], description: "Optional. Clicking the arrow in the active card opens this project." }),
    defineField({ name: "image", type: "image", options: { hotspot: true }, validation: rule => rule.required() }),
    defineField({ name: "alt", title: "Image description", type: "string", validation: rule => rule.required() }),
  ],
  preview: { select: { title: "title", subtitle: "eyebrow", media: "image" } },
});

export const playgroundPage = defineType({
  name: "playgroundPage",
  title: "Playground page",
  type: "document",
  fields: [
    defineField({ name: "title", type: "string", initialValue: "Playground", validation: rule => rule.required() }),
    defineField({
      name: "genres",
      type: "array",
      description: "Drag to set scroll order. Each genre is one future audio state; audio is intentionally not modelled yet.",
      of: [defineArrayMember({
        name: "playgroundGenre",
        title: "Genre",
        type: "object",
        fields: [
          defineField({ name: "name", type: "string", validation: rule => rule.required() }),
          defineField({ name: "slug", type: "slug", options: { source: (_, context) => (context.parent as { name?: string })?.name || "genre" }, validation: rule => rule.required() }),
          defineField({ name: "accent", title: "Scene glow", type: "string", initialValue: "#a61b0b", validation: rule => rule.required().regex(/^#[\da-fA-F]{6}$/) }),
          defineField({ name: "cards", type: "array", of: [card], validation: rule => rule.required().min(8).max(10), description: "Eight to ten cards. Drag to change their place in the cyclic scene." }),
        ],
        preview: { select: { title: "name", subtitle: "slug.current", media: "cards.0.image" } },
      })],
      validation: rule => rule.required().min(1),
    }),
    defineField({ name: "seoTitle", type: "string", initialValue: "Playground — Experimental Work", validation: rule => rule.required() }),
    defineField({ name: "description", title: "SEO description", type: "text", rows: 3, validation: rule => rule.required() }),
    defineField({ name: "indexable", title: "Ready for search indexing", type: "boolean", initialValue: false }),
  ],
  preview: { prepare: () => ({ title: "Playground page" }) },
});
