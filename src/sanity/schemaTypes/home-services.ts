import { defineArrayMember, defineField, defineType } from "sanity";
import { defaultHomeServices, isServicesHref } from "../../content/home-services";

const linkField = (title: string) => defineField({
  name: "href", title, type: "string",
  description: "Use a relative site path or an HTTPS URL.",
  validation: rule => rule.required().custom(value => !value || isServicesHref(value) || "Enter a site path or HTTPS URL."),
});

export const homeServices = defineType({
  name: "homeServices",
  title: "Homepage Our Services",
  type: "document",
  fields: [
    defineField({ name: "heading", title: "Accessible section heading", type: "string", initialValue: defaultHomeServices.heading, validation: rule => rule.required() }),
    defineField({ name: "introduction", type: "text", rows: 3, initialValue: defaultHomeServices.introduction, validation: rule => rule.required() }),
    defineField({ name: "learnMoreLabel", title: "Learn More cursor label", type: "string", initialValue: defaultHomeServices.learnMoreLabel, validation: rule => rule.required() }),
    defineField({ name: "services", title: "Service tabs", type: "array", validation: rule => rule.required().min(1), of: [
      defineArrayMember({
        name: "homeService",
        type: "object",
        fields: [
          defineField({ name: "title", type: "string", validation: rule => rule.required() }),
          defineField({ name: "description", type: "text", rows: 3, validation: rule => rule.required() }),
          linkField("Learn More destination"),
          defineField({ name: "background", title: "Full-screen background", type: "image", options: { hotspot: true }, validation: rule => rule.required().assetRequired() }),
          defineField({
            name: "project", title: "Featured project card", type: "object", validation: rule => rule.required(),
            fields: [
              defineField({
                name: "image", type: "image", options: { hotspot: true }, validation: rule => rule.required().assetRequired(),
                fields: [defineField({ name: "alt", title: "Alternative text", type: "string", validation: rule => rule.required() })],
              }),
              defineField({ name: "label", title: "Link label", type: "string", initialValue: "View Projects", validation: rule => rule.required() }),
              defineField({ name: "year", title: "Header year", type: "string", validation: rule => rule.regex(/^\d{4}$/) }),
              linkField("Project destination"),
            ],
          }),
        ],
        preview: { select: { title: "title", media: "background" } },
      }),
    ] }),
    defineField({ name: "industries", type: "array", of: [defineArrayMember({ type: "string" })], initialValue: defaultHomeServices.industries, validation: rule => rule.required().min(1) }),
    defineField({
      name: "industriesLink", title: "View All Industries link", type: "object", initialValue: defaultHomeServices.industriesLink, validation: rule => rule.required(),
      fields: [
        defineField({ name: "label", type: "string", validation: rule => rule.required() }),
        linkField("Industries destination"),
      ],
    }),
  ],
  preview: { prepare: () => ({ title: "Homepage Our Services" }) },
});
