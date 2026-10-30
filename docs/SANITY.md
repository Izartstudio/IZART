# Run Sanity locally

## 1. Connect a Sanity project

Create or select your project at https://www.sanity.io/manage and note its project ID and dataset name. This repository does not create an account or dataset automatically.

In the repository root, create or update `.env.local` without replacing existing form credentials:

```dotenv
SANITY_PROJECT_ID=your_project_id
SANITY_DATASET=production
SANITY_STUDIO_PROJECT_ID=your_project_id
SANITY_STUDIO_DATASET=production
```

Both applications must point at the same project and dataset. For a private dataset, also set a server-only `SANITY_API_READ_TOKEN` with read access. Never put a write token in a `NEXT_PUBLIC_` or `SANITY_STUDIO_` variable.

## 2. Sign in and start Studio

Use Node 22 or newer. From the project folder:

```sh
cd /Users/manyaagureja/Downloads/Izart-Redesign
npx sanity login
npm run studio
```

Open http://localhost:3333 and sign in. If prompted, add `http://localhost:3333` as an allowed Studio origin in your Sanity project settings.

Start the website in a separate terminal:

```sh
cd /Users/manyaagureja/Downloads/Izart-Redesign
npm run dev
```

Open http://localhost:3000/projects. Restart both processes after changing environment variables. Studio supports `SANITY_STUDIO_*` variables from `.env.local`; if your shell or CLI does not load them, export those two variables in that terminal before starting Studio.

## 3. Import the current portfolio and all its assets

Once connected, run in a separate terminal:

```sh
npm run sanity:import-projects
```

This uses your local CLI login and needs permission to write to the dataset. It uploads the optimized covers, homepage images, case-study image panels, and any configured videos/posters/captions. It creates the eight current case studies and the Portfolio page document. Shared images are uploaded once per run; Sanity identifies asset content on upload.

The importer creates published documents. It does not overwrite existing published projects or settings when re-run. If a project with the same slug already exists, its current editor content is retained: edit that document in Studio to replace older media. Avoid importing while someone is editing an unpublished draft of the same project.

The Portfolio page document is created with **Manage all projects in Sanity** enabled. In that mode, the website uses published CMS projects only. A deleted or unpublished project no longer reappears from local fallback content. If Portfolio page already existed, enable that setting yourself after confirming the import is complete.

Without a configured CMS, the current local projects remain available. Before CMS-only mode, published projects override local projects with the same slug; hidden published projects also suppress their local counterparts. Drafts are not served publicly. WG1 and the old duplicate placeholder remain retired.

## What you can edit

**Portfolio page:** page heading, grid introduction, view labels, initial Gallery/Grid view, ordered project references, and the case-study link archive.

**Case study:** client/name/year, introduction, services, cover and cover description, gallery summary, listing order/visibility, homepage image/video/order, optional logo, SEO/social image, and the details accordion. Drag image/video panels to reorder; up to 30 combined panels. Image panels support separate mobile artwork and alt text. Videos support posters, playback mode, and WebVTT captions.

**Cover colors - optional overrides:** portfolio background, two blob colors, inner-page background, and preferred text color. Leave fields empty for automatic sampling from the actual project cover. Old hard-coded fixture colors are not treated as overrides. Clear an override to restore automatic colors. Text is corrected when necessary to maintain at least 4.5:1 contrast; blob colors can be toned down for legibility.

Cover sampling runs server-side on a small image. Samples are bounded and cached; Sanity palette metadata is a fallback if its image CDN is unavailable. Local covers use the same extraction logic. Colors are included in server-rendered content, so a visitor does not need an extra full-cover download to discover the theme.

## Publish changes

Publish the edited document. Website data revalidates after approximately 60 seconds; the first request can receive the previous version while regeneration completes. No webhook or draft preview is configured. For production, set the same server-side Sanity environment variables on the host and deploy the updated code. Enabling project indexing still requires the deployment's `SITE_INDEXABLE` setting.
