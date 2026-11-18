import { defineArrayMember, defineField, defineType } from "sanity";

export const servicesPage = defineType({
  name: "servicesPage",
  title: "Services page",
  type: "document",
  fields: [
    defineField({
      name: "heroImages",
      title: "Hero images",
      type: "array",
      description: "Add at least 32 product images for the full perspective sequence. Every image is used; order controls its place around the rotating globe.",
      of: [defineArrayMember({
        name: "heroImage",
        type: "object",
        fields: [
          defineField({ name: "image", type: "image", options: { hotspot: true }, validation: rule => rule.required() }),
          defineField({ name: "alt", type: "string", validation: rule => rule.required() }),
        ],
        preview: { select: { title: "alt", media: "image" } },
      })],
      validation: rule => rule.required().min(32),
    }),
    defineField({
      name: "heroLabels",
      title: "Hero category labels",
      type: "array",
      description: "Five floating industry labels shown between the images. They disappear as the globe forms.",
      of: [defineArrayMember({ type: "string" })],
      validation: rule => rule.required().length(5),
      initialValue: ["Beauty & Personal Care", "Food & Beverage", "Fashion & Lifestyle", "Property & Living", "Technology & Education"],
    }),
  ],
  preview: { prepare: () => ({ title: "Services page" }) },
});
