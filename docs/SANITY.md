# Connect Sanity

The front end currently uses local sample content whenever SANITY_PROJECT_ID is unset. Seraano demonstrates the media layout with 17 existing artwork panels downloaded from the public Izart case study. WG1 uses the same template with hero facts only. Both samples are noindex. The Seraano logo and approved font file have not been provided: the logo area stays empty and the hero uses a system sans-serif until they are supplied. Sample artwork descriptions need editorial review before indexing.

## Setup after creating your Sanity project

1. Copy `.env.example` to `.env.local`. Set SANITY_PROJECT_ID and SANITY_STUDIO_PROJECT_ID to your actual project ID, and set both dataset variables. If the dataset is private, supply a server-only read token through SANITY_API_READ_TOKEN.
2. Restart Next.js with `npm run dev`. Run Studio with `npm run studio` in a separate terminal. Sanity Studio reads SANITY_STUDIO_* environment variables. For Studio CLI environments that do not read `.env.local`, set these variables in the shell or a local `.env` file (ignored by Git).
3. Configure your Sanity project's allowed Studio origin (normally http://localhost:3333), then sign in to Studio yourself.
4. Create a Case study document. Enter the hero content, upload the optional logo, and drag images/video into the ordered media field. The limit is 30 combined panels. Upload optional mobile compositions inside an image item; these do not increase the count.
5. Publish and visit `/projects/<slug>`. Published content refreshes through Next's 60-second revalidation; the first request after expiry can receive the cached version while regeneration occurs. No automatic webhook or draft preview is configured in this iteration.

When connected, Sanity is authoritative: a missing project returns 404 rather than silently serving a local sample. Drafts are not publicly exposed. Dataset/API failures surface as errors rather than disguised local content. Creating a document does not require adding a new route in code.

## Assets

Upload complete panel compositions individually. Use high-quality JPEG/PNG/WebP/AVIF sources, and keep their full aspect ratio. Sanity's image pipeline handles delivery sizes and format negotiation. Uploaded logo images are displayed with contain sizing. Mobile compositions can replace desktop panels below 600px without changing item order.

Videos currently use compressed MP4/WebM files uploaded to Sanity, with a required poster of the same aspect ratio. User-controlled videos use no preload. Muted loops play when visible unless reduced motion is requested; native controls provide pause/play. Include WebVTT captions for meaningful audio. Streaming can be added if the real assets require it. Do not upload 30 large uncompressed films.

## Publishing checklist

Review copy and informative alt text (the sample numbered descriptions are provisional), supply the genuine logo/font, verify desktop/mobile artwork, and test actual videos and captions. Set each finished project's indexing flag and SITE_INDEXABLE=true only on the final production deployment. The sitemap then includes eligible projects only. Preserve the remaining original site routes before replacing the full domain. Root currently redirects to Seraano for convenient local review; it is not the completed studio homepage.

Form, footer, global navigation, streaming service, and draft visual editing remain outside this iteration. No account has been created or connected.

## Dependency audit

On 17 September 2026, npm reported 13 transitive advisories (11 moderate, 2 high), in Sanity's CLI/tooling dependencies. Compatible `npm audit fix` did not resolve them; npm proposes a breaking Sanity downgrade. No forced downgrade was applied. Review these upstream dependencies before exposing/deploying Studio. Studio is not embedded into the public case-study page.

## Project details navigation

The optional Project details accordion array supplies headings and plain-text bodies for the slide-up view. It is separate from the 30-media limit. The bottom control appears when the media stream reaches 14% from the viewport top (with the services row still visible), stays available through the end of the page, and is omitted for projects without details or media. Desktop uses independent left/right scroll areas; mobile stacks those areas. The page and details workspace share a single mounted media stream. A transform animation expands the bottom control into the side panel while the gallery scales into the right column; closing preserves gallery reading position. Escape closes the details workspace; background scrolling is locked and focus returns to the trigger. Reduced motion disables the transitions. Local Seraano accordion copy is provisional, derived from the project description, and needs approval before launch.

Animation timing: panel and gallery share an 820ms transform transition. Text fades in without movement at 520ms over 360ms, overlapping the final settling motion. The panel gradient stays constant; there is no separate glow, shading reveal, or gradient animation. Closing takes 620ms and cancels unfinished text reveals. Reduced motion skips delays and movement. The opaque workspace keeps the underlying hero hidden.
