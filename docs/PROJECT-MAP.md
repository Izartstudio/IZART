# Izart redesign — project map

Prepared 17 September 2026. Working scope: initialize the studio website foundation, with `/projects/wg1` as the first case-study reference. Site-wide routes are inventoried for preservation, not yet commissioned for visual implementation. Await the supplied design before building layouts, motion or scenes.

## Services route and SEO mapping (new design)

The shared Services navigation now targets `/services`. This is the canonical, indexable overview once `SITE_INDEXABLE=true` on production, and it is included in the generated sitemap. Its title, description, Open Graph/Twitter metadata, and visible H1 describe the overview. The proposed collection paths are `/services/branding`, `/services/digital-ecosystem`, `/services/brand-growth`, `/services/brand-launch-campaign-planning`, and `/services/spatial-design`. They are not built or linked yet and must not enter the sitemap until each has approved content and its own metadata. Do not redirect the existing `/brand-identity` or `/website-design-and-development` URLs until their replacement content and one-to-one mapping are agreed; these legacy pages may still be served by the live site.

## Existing site and evidence

Sources: [WG1](https://www.izart.in/projects/wg1), [sitemap](https://www.izart.in/sitemap.xml), [robots](https://www.izart.in/robots.txt). Raw extracted metadata, image attributes, JSON-LD and link targets are in `wg1-source-audit.json`; all 45 sitemap URLs are in `url-inventory.csv`. This is a sitemap inventory plus detailed inspection of WG1, not a full crawl or ranking audit. Traffic, indexing, backlinks, field performance and other pages' content have not been measured.

| Existing route family | Count | Intended treatment |
| --- | ---: | --- |
| `/` | 1 | Studio positioning, selected work, services, contact |
| `/projects` | 1 | Crawlable work index |
| `/projects/[slug]` | 10 | Shared case-study template; retain slugs |
| `/brand-identity`, `/website-design-and-development` | 2 | Preserve service landing pages |
| `/blogs` and `/blogs/[slug]` | 26 | Blog index plus 25 articles; retain editorial URLs |
| `/authors` and `/authors/[slug]` | 3 | Author index plus two profiles |
| `/careers`, `/manifesto` | 2 | Preserve existing informational routes |

Correction to the table should follow the CSV as source of truth if the live sitemap changes. Contact currently uses `#Get-Quote`, not a standalone sitemap URL. Preserve anchor functionality on pages where linked. Do not invent redirects for unchanged paths. If launch covers WG1 only, route only that path to Next.js and keep the rest of the existing site served; do not replace the full domain with this scaffold.

## WG1 content and interaction map

| Order | Block | Implementation / content work |
| --- | --- | --- |
| 1 | Shared header | Home, services, work, careers, resources, quote; real links and keyboard-operable menus |
| 2 | Project introduction | One H1, meaningful summary, client, services, year in server HTML |
| 3 | Lead artwork | Responsive image with dimensions; potential 3D enhancement only after design |
| 4 | Objective | Replace incorrect Manjn reference with approved WG1-specific copy |
| 5 | Approach | Editorial section describing project decisions; semantic H2 |
| 6 | Visual identity | Identity and packaging narrative with media |
| 7 | Gallery | Ordered media records, reviewed alt text, captions where useful, responsive sizes |
| 8 | Outcome | Replace repeated identity copy; use evidenced results, no invented metrics |
| 9 | Related projects | Crawlable cards with correct matching title, image and destination |
| 10 | Inquiry | Name, email, phone, website, services, budget, referral; labels, validation, success/error states |
| 11 | Footer | Contact details, social links, secondary navigation |

The current page exposes empty collection messages. Remove empty blocks rather than migrate them. Confirm related-project links against titles: extracted link destinations and visible case-study names require reconciliation. Form submission service, spam handling, email delivery and any analytics are pending decisions; no submissions are wired now.

## Observed SEO/content defects

- No canonical link found in the fetched WG1 HTML. Emit one absolute canonical for each completed page.
- All 18 image elements have empty or missing alt values. Review which are informative versus decorative; do not give decorative images unnecessary descriptions.
- Objective references another client; outcome duplicates identity copy. Editorial quality is a launch dependency.
- Existing CreativeWork JSON-LD identifies WG1 as creator, uses a relative URL, contains an empty service type and a modification date earlier than publication. Verify attribution and dates before migration; represent Izart as creator only after confirmation.
- Two Google verification meta tags exist, one with an apparent redundant prefix. Confirm the owned Search Console property and retain the correct verification method.
- Existing title, description and social image are present. Preserve intent and establish approved social images rather than losing them during redesign.
- Robots allows crawling and lists its sitemap twice. New configuration should use a single sitemap declaration.

## Architecture

Next.js App Router + strict TypeScript + React; Server Components by default. Static generation for stable portfolio/editorial content. Revalidation only when a CMS and publishing workflow require it. Start with typed local content; choose CMS after editing needs are known. CSS is neutral scaffolding pending design; no animation library or UI kit has been selected.

`src/app` owns routing and metadata; `src/content` owns approved content; `src/lib` owns shared configuration; `src/components/three` reserves isolated scene modules; `public/assets` will hold approved media; `docs` holds migration evidence and decisions. Expand routes from the inventory as scope is confirmed. Missing pages return real 404s.

Future project content contract: slug, name, summary, client, project year, services, ordered text/media sections, related slugs, title, description, social image, real publication/modification dates. Each media record needs source, width, height, alt, optional caption and poster. Year is not a publication timestamp. Avoid embedding layout markup into the content model.

## SEO implementation rules

1. Render headings, body text, navigation, images and links in initial HTML. Content must be usable with JavaScript disabled; no canvas-only text or scroll-gated copy.
2. Use per-route Metadata API titles, descriptions, canonical URLs and Open Graph/Twitter previews. Preserve the production host `https://www.izart.in` unless deliberately migrated.
3. Add Organization/WebSite at the appropriate site level and CreativeWork/BreadcrumbList for the finished case study. Blog articles can use Article with verified author profiles/dates. Schema must match visible content; it does not guarantee rich results.
4. Sitemap includes only completed canonical indexable URLs with genuine modification dates. No invented `lastModified: new Date()` values on every build. Preserve all in-scope old URLs; changed ones need one-hop permanent redirects to relevant replacements.
5. Preview deployments remain noindex. Current placeholder pages have explicit noindex even if the environment flag changes. At launch, complete the pages, remove their guards and enable indexing on the production deployment only. `robots.txt` allows crawling so noindex can be read; use access protection for private previews.
6. Use optimized responsive images, meaningful filenames and image dimensions. Give the LCP image priority only when measured; lazy-load below-fold media. Load licensed local fonts through Next font utilities once provided.
7. Link service pages to relevant work, cases to related work/services, and articles to relevant cases. Keep descriptive anchors, normal navigation and real 404 status codes.

## Three.js and performance

The server owns the page; isolated client components own scenes. Dynamically import scenes from client wrappers. Keep visible HTML and a dimensioned poster independent of WebGL. Honor reduced motion, handle unavailable WebGL/errors, load near the viewport or on demand, and pause offscreen. Do not block the hero image or main thread with model downloads. See `src/components/three/README.md`.

Acceptance targets for real mobile field data at the 75th percentile: LCP <= 2.5 s, INP <= 200 ms, CLS <= 0.1. These are targets, not current measurements. Establish transfer/scene budgets with the supplied design, measure Lighthouse as a lab diagnostic, then monitor field data after launch. Avoid adding dependencies globally for effects used on one page.

## Work sequence and release gates

1. Foundation now: route skeleton, typed facts, metadata conventions, preview indexing guard, URL inventory and content issues.
2. Design handoff: desktop/mobile layouts, typography/font licenses, assets, media order, intended 3D interactions, reduced-motion alternative, final copy and inquiry behavior.
3. Build semantic responsive pages and navigation; verify no-JS content and keyboard use.
4. Add image optimization, isolated motion/3D, responsive posters and failure fallbacks.
5. Add approved metadata, social art, structured data, inquiry integration and analytics if requested.
6. Before domain change: migrate all served routes or configure partial routing; validate redirects/status codes, canonicals, sitemap, robots, mobile layout, alt text, form delivery and performance. Compare old/new URL inventories. Preserve verification and capture Search Console baseline.
7. Deploy only when requested; submit sitemap and monitor indexing, errors and performance after launch.

## Decisions awaiting the design phase

Full-site versus WG1-only rollout; approved copy and assets; CMS ownership; 3D scope/models; hosting; form delivery; analytics/consent needs; canonical hostname if changing. These do not block initialization. No final visual design, CMS, backend, deployment or ranking gains are claimed by this scaffold.

## Technical references

- [Next.js installation](https://nextjs.org/docs/app/getting-started/installation)
- [Next.js Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Next.js lazy loading](https://nextjs.org/docs/app/guides/lazy-loading)
- [Google JavaScript SEO](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Core Web Vitals](https://web.dev/articles/vitals)
