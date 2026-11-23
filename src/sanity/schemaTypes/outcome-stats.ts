import { defineArrayMember, defineField, defineType } from "sanity";

import { defaultOutcomeStats } from "@/content/outcome-stats";

export const outcomeStats = defineType({
  name: "outcomeStats",
  title: "Outcome Stats",
  type: "document",
  fields: [defineField({
    name: "stats", type: "array", initialValue: defaultOutcomeStats,
    validation: rule => rule.required().length(3),
    of: [defineArrayMember({ type: "object", fields: [
      defineField({ name: "label", type: "string", validation: rule => rule.required() }),
      defineField({ name: "value", type: "number", validation: rule => rule.required().integer().min(0) }),
      defineField({ name: "suffix", type: "string" }),
    ] })],
  })],
  preview: { prepare: () => ({ title: "Outcome Stats" }) },
});
