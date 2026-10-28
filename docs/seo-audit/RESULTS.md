# Verification results — 27 October 2026

## URL preservation

Production-like HTTP gate: **65/65 original URLs passed**. Titles and descriptions retained where present, populated fallbacks, one H1, self canonical, indexability and JSON-LD syntax checked. Sitemap coverage, direct service redirects and crawlable blog pagination passed. See `local-verification.json` for per-page results.

Crawler unit tests: **all 8 policy combinations passed**. New deployed robots.txt behavior is checked by the HTTP gate too.

## Live TTFB baseline

Three fresh curl connections per URL from this machine. Sample p75 is the maximum of these three observations; this is not field p75 or a geographic SLA.

| URL | Sample p75 TTFB |
| --- | ---: |
| https://www.izart.in/ | 200 ms |
| https://www.izart.in/blogs | 132 ms |
| https://www.izart.in/brand-identity | 46 ms |
| https://www.izart.in/blogs/best-branding-for-startups-differentiation-vs-distinction | 97 ms |

## Redesign simulated mobile lab smoke test

One Lighthouse run per URL on a **local production build**, not next dev. Network/CPU are simulated mobile. These are not comparable production-host TTFB results, nor real-user Core Web Vitals.

| Page | FCP | LCP | CLS | TBT | Budget |
| --- | ---: | ---: | ---: | ---: | --- |
| /blogs | 0.92 s | 2.37 s | 0.000 | 34 ms | Pass |
| /brand-identity | 0.94 s | 2.83 s | 0.077 | 97 ms | Needs improvement |
| /blogs/best-branding-for-startups-differentiation-vs-distinction | 1.06 s | 1.97 s | 0.000 | 20 ms | Pass |

All three measured pages meet the FCP target. **Brand Identity does not meet the 2.5-second LCP budget** in this sample (2.83 seconds). The performance command correctly exits nonzero. Its report identifies the animated hero image fan: a lazily loaded image becomes the largest visible element during animation. Improve stable hero composition, eager loading/priority of the actual initial visible LCP image, motion timing, and duplicated offscreen image loading. Do not preload all 15 slots. CLS is within the 0.1 budget but fan motion contributes to shifts. Re-test three or more runs after that targeted design/performance change.

Lighthouse reports are alongside this file under `performance/`; live TTFB data is under `performance-live/`. Homepage/other templates and deployed production FCP still need the full default release suite. Field INP has not been measured; real interactions and field collection are required.

## Launch conditions

This work is local and has not been deployed. Production SITE_INDEXABLE is deliberately opt-in; previews stay noindex by default. The new author/manifesto/missing-case-study pages use original content in a compatibility template and need visual/editorial approval. Webflow CDN assets, historical URLs outside the public sitemap, lost inline article links from the earlier import, unfinished redesign navigation destinations, Search Console verification, and actual host-level redirects/WAF behavior remain launch checks. See `../SEO-REDESIGN-CHECKLIST.md`.
