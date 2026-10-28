import { defineArrayMember, defineField, defineType } from "sanity";

export const servicesPage = defineType({
  name: "servicesPage",
  title: "Services page",
  type: "document",
  fields: [
    defineField({
      name: "heroImages",
      title: "Hero images — left to right",
      type: "array",
      description: "Seven images fill the fixed perspective layout. Drag to reorder; crops adapt to any source aspect ratio.",
      of: [defineArrayMember({
        name: "heroImage",
        type: "object",
        fields: [
          defineField({ name: "image", type: "image", options: { hotspot: true }, validation: rule => rule.required() }),
          defineField({ name: "alt", type: "string", validation: rule => rule.required() }),
        ],
        preview: { select: { title: "alt", media: "image" } },
      })],
      validation: rule => rule.required().length(7),
    }),
  ],
  preview: { prepare: () => ({ title: "Services page" }) },
});
