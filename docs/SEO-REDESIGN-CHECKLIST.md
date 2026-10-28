# Izart SEO migration and development checklist

Audit: 27 October 2026. Goal: preserve the existing URLs and useful content while improving crawlability and performance. Rankings cannot be guaranteed; measure before and after launch.

## What the live crawl found

- 65 sitemap URLs; every one returned HTTP 200 during the audit.
- 9 blank titles, 10 missing descriptions, and no canonical link tags in the returned HTML.
- Original service addresses are `/brand-identity` and `/website-design-and-development`.
- 46 blog articles, 9 case studies, the author directory, 2 author profiles, manifesto, and primary landing pages.
- Original robots.txt allows crawling generally. No independent AI search/training policy existed.

Evidence: [metadata CSV](seo-audit/live-metadata.csv), [full metadata and links](seo-audit/live-metadata.json), [original sitemap](seo-audit/live-sitemap.xml), [original robots.txt](seo-audit/live-robots.txt), [URL mapping](url-inventory.csv). Compressed original HTML is in `seo-audit/html/`. JSON includes headings, image alt text, OG/Twitter, JSON-LD, verification, and hreflang where present. This is public crawl data, not a Search Console/backlink/log export; URLs absent from public discovery may exist.

## Implemented

- Existing service URLs remain canonical; newer `/services/...` aliases and `/digital-ecosystem` redirect directly with HTTP 308. Internal primary service links use the original addresses.
- Established populated titles and descriptions are retained through a shared metadata helper. Blank values receive page-specific fallbacks. Canonicals, Open Graph, Twitter cards, and social image fallbacks are supplied.
- All original sitemap URLs have corresponding routes. Author, manifesto, and six missing project pages use saved, sanitized source content in a simple responsive compatibility template. They preserve access and text; review and redesign these pages before launch. Three existing case studies retain their native templates and receive original project copy. Source images on compatibility pages remain on Webflow's CDN: migrate these assets before terminating Webflow hosting.
- Blog pagination and category links are server-rendered anchors, so later articles are discoverable without clicking JavaScript controls. Paginated pages have their own canonicals. Invalid page numbers return not-found.
- BlogPosting and breadcrumb JSON-LD, visible author profile links, related articles, and safe JSON serialization are present. No invented awards, ratings, dates, or employment facts are added.
- Sitemap includes original services, preserved pages, blogs, valid projects and careers. Aliases, sample project3 and non-indexable playground content are excluded.
- Starting a Sanity dataset no longer deletes imported blog URLs: published records override local entries by slug. Local projects also remain resolvable while moving content into Sanity. Preserve old slugs; use explicit redirects for approved slug changes.
- Preview noindex remains enabled by default. Production indexing is an explicit environment setting.
- AI search/discovery is separate from model training. Repeatable SEO, crawler-policy and performance tests are included.

## P0: before launch

- [ ] Export all indexed URLs, landing-page queries, clicks, impressions and positions from Search Console; export analytics landing-page traffic/conversions and backlink destinations. Reconcile these with `url-inventory.csv`. Public sitemap coverage is not proof of total historical URL coverage.
- [ ] Approve all 65 URL outcomes. Keep original URLs whenever possible. Redirect genuinely replaced content directly to its closest equivalent; do not redirect missing pages wholesale to the homepage. Retain permanent redirects at least a year, preferably indefinitely.
- [ ] Review preserved compatibility pages, native project content, all source image URLs and author details. Complete final layouts and migrate essential external images/files before decommissioning old hosting. Preserve image URLs or arrange individual image redirects when feasible.
- [ ] Replace placeholder/unfinished navigation destinations: `/about-us`, `/brand-masterclass`, `/store`, `/privacy-policy`, `/industries/...`, and unbuilt service subpages. These are redesign links, not original sitemap pages. Build real relevant content or remove the links; do not invent legal copy or create soft-404 stubs.
- [ ] Migrate internal links inside article paragraphs with their anchor text. The earlier article importer flattened inline formatting/links; original HTML snapshots are the comparison source. This work remains an editorial/content migration check, not a guarantee of exact rich-text parity.
- [ ] Configure production `SITE_URL=https://www.izart.in`, `SITE_INDEXABLE=true`, and `VERCEL_ENV=production` if using Vercel. Keep previews noindex and ideally behind deployment authentication. Never block Googlebot from reading a preview noindex directive and assume that removes an already indexed page.
- [ ] Preserve the existing Search Console property, verification method and analytics identifiers. Supply GOOGLE_SITE_VERIFICATION / BING_SITE_VERIFICATION if needed. Verify both www and non-www host behavior; configure one permanent redirect from alternate HTTP/host versions at the hosting layer.
- [ ] Configure Sanity project/dataset, publish and review all intended entries, compare every existing slug after the connection, and verify reads/caching during an outage. Local archive fallback intentionally retains old posts until deliberately retired.
- [ ] Run `npm ci`, `npm run lint`, `npm run typecheck`, `npm run build`, `npm run test:crawlers`. Start a production server and run HTTP tests as described below.
- [ ] Verify every canonical URL returns 200, one meaningful H1, indexable robots metadata, populated title/description and correct self canonical. Verify removed URLs return genuine 404/410, and approved redirects return one 301/308 hop.
- [ ] Check actual rendered and initial HTML with JavaScript disabled. Essential headings, text, links and metadata must exist without canvas/animation. Test mobile navigation, forms, keyboard access and reduced-motion settings.
- [ ] Validate structured data in Google's Rich Results Test and Schema Markup Validator. Do not expect FAQ rich results for a design studio. Add JobPosting only when genuine posted/expiry dates and required job details are available.
- [ ] Re-run performance tests on the actual production host in the target geography. Localhost has no realistic DNS/TLS/CDN/geographic cost. Check cold and warm cache behavior separately.

## Performance budgets and fixes while coding

| Metric | Target | How to test | How to improve |
| --- | --- | --- | --- |
| TTFB | ≤800 ms | curl repeated requests, field navigation timing | CDN cache, prerender stable pages, parallel CMS reads, avoid request-time dependency waterfalls; deploy near audience |
| FCP | ≤1.8 s | Lighthouse mobile lab + field browser data | Deliver HTML text immediately; reduce blocking CSS/JS, avoid font/animation gates; keep headings visible before hydration |
| LCP | ≤2.5 s | Lighthouse + field p75 | Prioritize only the actual hero/LCP image, accurate sizes, modern image formats, avoid autoplay video competing for bandwidth |
| CLS | ≤0.1 | Lighthouse + field p75 | Reserve image, video and embed dimensions; stable font metrics; avoid layout-changing reveal animations |
| INP | ≤200 ms | Real-user monitoring / CrUX, with actual interactions | Defer Three.js and expensive shaders, pause offscreen animations, reduce long tasks and event-handler work |
| TBT | ≤200 ms project lab budget | Lighthouse | Reduce/defer heavy client bundles; split nonessential motion; fewer hydration boundaries |

TTFB and FCP are diagnostic loading metrics, not Core Web Vitals. Core Web Vitals are LCP, CLS and INP. Lighthouse TBT is a lab responsiveness proxy; it does not measure field INP. Assess field targets at the 75th percentile separately for mobile and desktop. One lab sample is a smoke test; use the default three runs for release comparisons and a longer field collection window.

Specific redesign priorities:

- Keep static case studies/server-rendered article bodies cached. Blog listing is request-rendered because pagination uses query parameters, but CMS reads revalidate; measure CDN behavior before adding edge caching.
- The blog listing now sends only the visible posts as rendered server components, not the entire archive/body JSON to a client component.
- Avoid allowing the 3D homepage, image decoding or intro animations to delay visible headline content. Dynamically import noncritical motion, cap pixel ratio on mobile, and stop requestAnimationFrame loops when hidden/offscreen.
- Use `next/image` with accurate sizes for new assets, explicit aspect ratios, meaningful alt text, and modern formats. Compatibility-page images still need full migration and dimension review.
- Avoid eager loading entire carousels, decorative image stacks, all cursor images or below-fold content. Preload only evidence-backed critical resources.
- Keep third-party analytics deferred and measure its impact after adding real production tags. Do not add redundant trackers.
- Add real-user web-vitals reporting once the analytics destination and consent requirements are set. No telemetry has been sent to a new service in this task.

## AI crawlers

| Agents | Production default | Purpose |
| --- | --- | --- |
| Googlebot / bingbot / general crawlers | Allow public pages | Search, including Google's search AI features |
| OAI-SearchBot, Claude-SearchBot, PerplexityBot | Allow public pages | AI search discovery |
| ChatGPT-User, Claude-User, Perplexity-User | Allow public pages | User-directed retrieval; some may not honor robots preferences |
| GPTBot, ClaudeBot | Disallow | Training; enable with `AI_TRAINING_ALLOWED=true` |
| Google-Extended | Allow | Combined Gemini training **and grounding**; opt out with `GOOGLE_EXTENDED_ALLOWED=false` |

Named AI agents are disallowed on non-indexable previews. Public API/CGI paths are disallowed for the allowed crawler groups. robots.txt is voluntary, not authentication, and user-agent strings can be spoofed. Verify CDN/WAF rules against official operator IP lists; do not blanket-disable bot protection. Allowing crawlers does not guarantee AI inclusion/citations. No special AI schema or llms.txt file is required for Google Search AI features.

## Repeatable tests

```sh
# Public baseline refresh (Python 3 + beautifulsoup4 and system curl):
python3 scripts/audit-live-seo.py
# Review the snapshots before regenerating compatibility source:
python3 scripts/prepare-seo-migration.py

# Production-like local build; does not change your .env files:
SITE_INDEXABLE=true npm run build
SITE_INDEXABLE=true npm run start -- --port 3101

# In another terminal:
SEO_BASE_URL=http://127.0.0.1:3101 SEO_EXPECT_INDEXABLE=true npm run test:seo
npm run test:crawlers
PERF_BASE_URL=http://127.0.0.1:3101 npm run test:performance

# Against actual production after release:
PERF_BASE_URL=https://www.izart.in PERF_OUTPUT=docs/seo-audit/performance-production npm run test:performance
# TTFB-only baseline without Chrome:
PERF_BASE_URL=https://www.izart.in PERF_TTFB_ONLY=true npm run test:performance
```

Lighthouse uses installed Chrome (set CHROME_PATH if autodetection fails), simulated mobile throttling, and reports FCP, LCP, CLS, TBT, SEO and accessibility. Each report is saved as JSON and HTML, plus summary.json. Set PERF_PATHS to comma-separated paths, PERF_RUNS (default 3), PERF_OUTPUT and PERF_BASE_URL. Threshold failures exit nonzero. curl TTFB measures fresh connections from the test machine, including DNS/TLS, not just application processing time.

The SEO suite checks all 65 original URLs, populated and retained metadata, one H1, canonical, indexability, JSON-LD syntax, original sitemap coverage, direct service redirects, archive pagination links and unknown-page handling. Test preview mode too by rebuilding without production indexing and omitting SEO_EXPECT_INDEXABLE. Schema syntax checks do not replace semantic validator review.

## Launch and monitoring

- [ ] Keep the domain unchanged; preserve DNS/TLS and configure hosting redirects before cutover. Retain a rollback deploy and the original HTML/content archive.
- [ ] Re-run the HTTP gate against production; check robots.txt and sitemap.xml directly. Confirm intended Googlebot and AI crawler responses at the WAF layer.
- [ ] Submit the canonical production sitemap in Search Console. Inspect the homepage, both service pages, top case studies and high-traffic articles. No domain change means no Change of Address request is needed.
- [ ] Monitor crawl errors, unexpected noindex, duplicate canonicals, redirect chains, indexing, queries, organic leads, mobile usability and Core Web Vitals daily during launch week, then weekly for at least 8 weeks.
- [ ] Compare like-for-like date periods and queries, annotate launch day, and distinguish ranking changes from seasonal demand and tracking changes. Investigate page/query-specific losses before changing established URLs again.

## References

- [Google migration guidance](https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes)
- [Crawlable links](https://developers.google.com/search/docs/crawling-indexing/links-crawlable)
- [Pagination](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading)
- [Google AI features](https://developers.google.com/search/docs/appearance/ai-features)
- [TTFB](https://web.dev/articles/ttfb), [FCP](https://web.dev/articles/fcp)
- [OpenAI crawler controls](https://developers.openai.com/api/docs/bots)
- [Anthropic crawler controls](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler)
- [Perplexity crawlers](https://docs.perplexity.ai/docs/resources/perplexity-crawlers)
- [Google-Extended](https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers)
