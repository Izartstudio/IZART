# Image-only case-study SEO

The presentation remains unchanged. No extra visible copy, captions, sections, or hidden keyword blocks are added.

## In Sanity

Open **Case study > SEO & sharing**:

- Write a unique SEO title and description for this particular project. These now take precedence over the historical SEO import.
- Upload a social-sharing image and describe that image accurately. Without one, the project cover or first media image is used.
- Add the actual first publication date if known. Leave it blank if not known.
- Enable **Ready for search indexing** only when ready. The production deployment must also have `SITE_INDEXABLE=true`, the correct `SITE_URL`, and allow indexing. This change does not enable indexing on previews.

For every image panel:

- Write a concise, specific image description (alt text), describing the important artwork and meaningful words it contains. Do not paste the entire case study or repeat keywords.
- Mark only genuinely decorative images as decorative; they receive empty alt text and are excluded from the case-study image sitemap and image structured data.
- Optional image title and artwork caption supply image metadata; they do not introduce visible captions. Describe content represented by the actual artwork.
- Credit, creator, and licensing links are optional. Enter verified information only. Leaving them blank is preferable to claiming rights you do not hold.
- Upload a separate mobile composition where the design needs it. It is included in image discovery too.

For project films:

- Supply a clear title, a real poster image, and captions when there is speech or meaningful audio.
- Enable **Video search metadata** only when the film is a prominent part of the page, rather than a decorative background loop.
- Supply an accurate description and actual first publication date. Duration is optional and must be accurate.
- Only complete, enabled records produce VideoObject markup and video sitemap entries. Eligibility for video search is not guaranteed; Google considers the actual page and prominence of the video.

Publish the edited document. Website data normally refreshes through the existing 60-second revalidation. Restart Studio if new fields do not appear during development. Running the existing importer again does not overwrite existing editor content.

## Included in code

- Self-referencing canonical URLs and unique project titles/descriptions.
- Open Graph and Twitter preview data, actual image dimensions, and image descriptions.
- Consistent per-project and deployment-level indexing controls, with large image previews allowed.
- WebPage, CreativeWork, BreadcrumbList, and ImageObject structured data based on actual project assets.
- Optional VideoObject data for complete, explicitly enabled video records.
- Project image URLs in the main XML sitemap, with optional qualified video records.
- Existing responsive image rendering, dimensions, eager first-media loading, and lazy loading below the fold are preserved.

Structured data is not a substitute for readable page content and does not guarantee rankings or rich results. The image-only layout can be retained, but accurate image descriptions and metadata cannot provide the same editorial context as a fully written case study.

## Sources

- https://developers.google.com/search/docs/appearance/google-images
- https://developers.google.com/search/docs/appearance/structured-data/sd-policies
- https://developers.google.com/search/docs/appearance/structured-data/image-license-metadata
- https://developers.google.com/search/docs/appearance/structured-data/video
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/image-sitemaps
