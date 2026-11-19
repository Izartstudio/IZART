import { getCliClient } from "sanity/cli";
import { createReadStream } from "node:fs";
import path from "node:path";
import { defaultHomeServices, homeServicesDocumentId, type ServicesImage } from "../src/content/home-services";

const client = getCliClient({ apiVersion: "2026-09-17" }).withConfig({ useCdn: false, perspective: "raw" });

async function main() {
  const existing = await client.fetch<string | null>(
    '*[_id in [$id, "drafts." + $id]][0]._id',
    { id: homeServicesDocumentId },
  );
  if (existing) {
    console.log("Homepage Our Services already exists in Sanity.");
    return;
  }

  const uploads = new Map<string, Promise<string>>();
  async function image({ src, alt }: ServicesImage) {
    let upload = uploads.get(src);
    if (!upload) {
      upload = client.assets.upload(src.endsWith(".svg") ? "file" : "image", createReadStream(path.resolve("public", "." + src)), {
        filename: path.basename(src),
      }).then(asset => asset._id);
      uploads.set(src, upload);
    }
    return { _type: src.endsWith(".svg") ? "file" : "image", asset: { _type: "reference", _ref: await upload }, ...(alt ? { alt } : {}) };
  }

  const { services, ...fields } = defaultHomeServices;
  const tabs = await Promise.all(services.map(async ({ id, background, project, ...service }) => ({
    ...service,
    _key: id,
    _type: "homeService",
    ...(background.src.endsWith(".svg") ? { backgroundSvg: await image(background) } : { background: await image(background) }),
    project: { ...project, image: await image(project.image) },
  })));
  await client.createIfNotExists({ _id: homeServicesDocumentId, _type: "homeServices", ...fields, services: tabs });
  console.log(`Homepage Our Services is ready in Sanity with ${tabs.length} tabs and ${uploads.size} images.`);
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
