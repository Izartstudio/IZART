# Blog content

Routes: `/blogs` and `/blogs/[slug]`. The root layout supplies the shared navbar; both routes include the shared footer.

`src/content/blogs.json` contains 46 articles imported from https://www.izart.in/blogs, with local cover images in `public/assets/blogs`. Existing opinion articles are categorized as Op-Ed; News remains empty until news articles are published.

The registered `blogPost` schema in `src/sanity/schemaTypes/blog-post.ts` provides title, slug, author, category, excerpt, cover, publication date, ordered content blocks, and FAQ entries. Body blocks support paragraphs, headings, quotes, lists, and images. Headings automatically populate the article contents sidebar.

Configure `SANITY_PROJECT_ID`, `SANITY_DATASET` (defaults to production), and optionally `SANITY_API_READ_TOKEN` for the website. Configure `SANITY_STUDIO_PROJECT_ID` and optionally `SANITY_STUDIO_DATASET` for Studio. Publish blog articles in Studio. Published Sanity articles replace the local archive when at least one exists; an empty dataset or fetch failure uses the local archive. Fetches revalidate every 60 seconds.

The summary buttons open external AI services. Gemini opens its application because it does not provide a supported prompt URL. Sharing requires an explicit click and copying shows an inline confirmation.
