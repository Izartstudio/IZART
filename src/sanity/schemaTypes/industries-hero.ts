import { defineField, defineType } from "sanity";
export const industriesHero = defineType({
  name: "industriesHero", title: "Industries Hero", type: "document",
  fields: [
    defineField({ name: "title", title: "Desktop heading", type: "text", rows: 3, validation: rule => rule.required() }),
    defineField({ name: "mobileTitle", title: "Mobile heading", type: "text", rows: 3 }),
    defineField({ name: "buttonLabel", type: "string", validation: rule => rule.required() }),
    defineField({ name: "mobileButtonLabel", type: "string" }),
    defineField({ name: "buttonHref", title: "Button link", type: "string", validation: rule => rule.required().custom(value => typeof value === "string" && /^\/(?!\/)/.test(value) ? true : "Use a site path starting with /.") }),
    ...["leftImages", "rightImages"].map(name => defineField({ name, title: name === "leftImages" ? "Hero images — first set" : "Hero images — second set", type: "array", of: [{ type: "image", options: { hotspot: true } }], validation: rule => rule.min(1) })),
  ],
  preview: { prepare: () => ({ title: "Industries Hero" }) },
});
