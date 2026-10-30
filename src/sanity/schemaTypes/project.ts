import { defineArrayMember, defineField, defineType } from "sanity";
export const imagePanel = defineType({
  name: "imagePanel", title: "Image", type: "object",
  fields: [
    defineField({ name: "label", title: "Editor label", type: "string" }),
    defineField({ name: "image", type: "image", validation: r => r.required(), description: "Complete composition. Displayed in full, without cropping." }),
    defineField({ name: "mobileImage", title: "Optional mobile composition", type: "image" }),
    defineField({ name: "decorative", type: "boolean", initialValue: false }),
    defineField({ name: "alt", title: "Image description", type: "string", validation: r => r.custom((value, context) => (context.parent as { decorative?: boolean })?.decorative || value?.trim() ? true : "Describe the image, or mark it decorative.") }),
    defineField({ name: "imageTitle", title: "Image title (metadata)", type: "string", description: "Short, accurate name for this visual. Does not add a heading to the design." }),
    defineField({ name: "caption", title: "Artwork caption (metadata)", type: "string", description: "Describe what the artwork depicts or says. Not displayed as an extra caption; do not add unrelated keywords." }),
    defineField({ name: "creditText", title: "Image credit", type: "string", description: "Only supply an accurate, approved credit." }),
    defineField({ name: "creatorName", title: "Image creator", type: "string", description: "Actual creator's name; leave blank when unknown." }),
    defineField({ name: "licenseUrl", title: "License information URL", type: "url", validation: r => r.uri({ scheme: ["https"] }), description: "Optional real license page for this image. Do not use the project URL as a placeholder." }),
    defineField({ name: "rightsUrl", title: "Licensing enquiry URL", type: "url", validation: r => r.uri({ scheme: ["https"] }) }),
  ], preview: { select: { title: "label", media: "image" }, prepare: ({ title, media }) => ({ title: title || "Image panel", media }) },
});
export const videoPanel = defineType({
  name: "videoPanel", title: "Video", type: "object",
  fields: [
    defineField({ name: "title", type: "string", validation: r => r.required() }),
    defineField({ name: "video", type: "file", options: { accept: "video/mp4,video/webm" }, validation: r => r.required(), description: "Use compressed MP4 or WebM. Streaming integration can be added for longer films." }),
    defineField({ name: "poster", type: "image", validation: r => r.required(), description: "Match the video's aspect ratio." }),
    defineField({ name: "mode", type: "string", initialValue: "controls", options: { list: [{ title: "Play on click", value: "controls" }, { title: "Muted loop when visible", value: "loop" }] }, validation: r => r.required() }),
    defineField({ name: "captions", type: "file", options: { accept: ".vtt" }, description: "English WebVTT captions for speech or meaningful audio." }),
    defineField({ name: "seo", title: "Video search metadata", type: "object", description: "Only enable for a prominent project film, not a decorative loop. These fields add metadata without changing the video design.", fields: [
      defineField({ name: "enabled", title: "Include VideoObject structured data", type: "boolean", initialValue: false }),
      defineField({ name: "description", type: "text", rows: 3 }),
      defineField({ name: "uploadDate", title: "Actual first publication date", type: "datetime" }),
      defineField({ name: "durationSeconds", title: "Duration in seconds", type: "number", validation: r => r.positive() }),
    ], validation: r => r.custom((value: { enabled?: boolean; description?: string; uploadDate?: string } | undefined) => !value?.enabled || (value.description?.trim() && value.uploadDate) ? true : "Enabled video metadata requires an accurate description and first publication date.") }),
  ], preview: { select: { title: "title", media: "poster" } },
});
export const project = defineType({
  name: "project", title: "Case study", type: "document",
  groups: [{ name: "seo", title: "SEO & sharing" }],
  fields: [
    defineField({ name: "name", type: "string", validation: r => r.required() }),
    defineField({ name: "slug", type: "slug", options: { source: "name" }, validation: r => r.required() }),
    defineField({ name: "client", type: "string", validation: r => r.required() }),
    defineField({ name: "year", type: "string", description: "Optional. For example: 2025-26. Leave blank when the year is unknown." }),
    defineField({ name: "introduction", type: "text", rows: 4, validation: r => r.required() }),
    defineField({ name: "logo", title: "Hero logo image", type: "image", description: "Transparent logo on the right side of the hero. No automatic crop." }),
    defineField({ name: "colorOverrides", title: "Cover colors - optional overrides", type: "object", description: "Leave empty to sample the cover automatically. Text is corrected when needed to maintain at least 4.5:1 contrast. Blob colors may be toned down for readability.", fields: [
      ...[
        ["portfolioBackground", "Portfolio background"], ["blobOne", "First blob color"],
        ["blobTwo", "Second blob color"], ["heroBackground", "Inner-page background"], ["foreground", "Preferred text color"],
      ].map(([name, title]) => defineField({ name, title, type: "string", validation: r => r.regex(/^#[\da-fA-F]{6}$/), description: "Optional hex color, for example #182817. Clear to return to automatic colors." })),
    ] }),
    defineField({ name: "services", type: "array", of: [defineArrayMember({ type: "string" })], validation: r => r.required().min(1).max(8).unique() }),
    defineField({ name: "showInProjects", title: "Show on projects page", type: "boolean", initialValue: true }),
    defineField({ name: "listingOrder", title: "Projects page order", type: "number", initialValue: 999, validation: r => r.integer().min(0) }),
    defineField({ name: "listingImage", title: "Projects page image", type: "image", options: { hotspot: true, metadata: ["palette", "lqip"] }, description: "Optional cover for Gallery and Grid views. The first case-study image is used when empty." }),
    defineField({ name: "listingAlt", title: "Cover image description", type: "string", description: "Describe the cover artwork for accessibility." }),
    defineField({ name: "listingDescription", title: "Projects page summary", type: "text", rows: 3, description: "Optional short gallery summary. The project introduction is used when empty." }),
    defineField({ name: "featuredOnHomepage", title: "Feature on homepage", type: "boolean", initialValue: false, description: "Adds this project to the homepage showcase." }),
    defineField({ name: "homepageOrder", title: "Homepage showcase order", type: "number", initialValue: 999, hidden: ({ parent }) => !parent?.featuredOnHomepage, validation: r => r.integer().min(0) }),
    defineField({ name: "homepageImage", title: "Homepage showcase image", type: "image", hidden: ({ parent }) => !parent?.featuredOnHomepage, description: "Portrait artwork for the homepage card. The projects-page image is used when empty." }),
    defineField({ name: "homepageHoverVideo", title: "Homepage hover video", type: "file", options: { accept: "video/mp4,video/webm" }, hidden: ({ parent }) => !parent?.featuredOnHomepage, description: "Optional muted video displayed while the showcase card is hovered or keyboard-focused." }),
    defineField({ name: "media", title: "Case-study media", type: "array", of: [defineArrayMember({ type: "imagePanel" }), defineArrayMember({ type: "videoPanel" })], validation: r => r.required().min(1).max(30), description: "Drag to reorder. One full-width image or video per item; maximum 30 combined." }),
    defineField({ name: "details", title: "Project details accordion", type: "array", description: "Editorial content for the slide-up project details view. Drag to reorder.", of: [defineArrayMember({ name: "projectDetail", title: "Accordion item", type: "object", fields: [
      defineField({ name: "title", type: "string", validation: r => r.required() }),
      defineField({ name: "body", type: "text", rows: 6, validation: r => r.required() }),
    ], preview: { select: { title: "title", subtitle: "body" } } })], validation: r => r.max(12) }),
    defineField({ name: "seoTitle", group: "seo", type: "string", validation: r => r.required() }),
    defineField({ name: "description", group: "seo", title: "SEO description", type: "text", rows: 3, validation: r => r.required() }),
    defineField({ name: "socialImage", group: "seo", type: "image" }),
    defineField({ name: "socialImageAlt", title: "Social preview image description", group: "seo", type: "string", description: "Accurate description of the sharing image. No visible design changes." }),
    defineField({ name: "publishedAt", title: "Case-study first publication date", group: "seo", type: "datetime", description: "Optional actual publication date. Leave empty if unknown; never substitute the import date." }),
    defineField({ name: "indexable", group: "seo", title: "Ready for search indexing", type: "boolean", initialValue: false, description: "Enable after copy, alt text, assets, and SEO review. The deployment must also allow indexing." }),
  ], preview: { select: { title: "name", subtitle: "year", media: "logo" } },
});
