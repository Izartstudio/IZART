import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import type { Project } from "@/content/project";
import { createProjectTheme, isHex, paletteFromPixels } from "./project-theme";

const palettes = new Map<string, { expires: number; promise: Promise<string[]> }>();
async function getPalette(url: string): Promise<string[]> {
  const cached = palettes.get(url);
  if (cached && cached.expires > Date.now()) return cached.promise;
  const promise = (async () => {
    let source: Buffer;
    if (url.startsWith("/assets/")) {
      const root = path.join(process.cwd(), "public");
      const file = path.resolve(root, "." + url);
      if (!file.startsWith(root + path.sep)) return [];
      source = await readFile(file);
    } else {
      // Only sample the trusted asset CDN, never editor-supplied arbitrary URLs.
      const remote = new URL(url);
      if (remote.protocol !== "https:" || remote.hostname !== "cdn.sanity.io") return [];
      remote.searchParams.set("w", "48"); remote.searchParams.set("h", "48"); remote.searchParams.set("fit", "crop");
      const response = await fetch(remote, { redirect: "error", signal: AbortSignal.timeout(4000), next: { revalidate: 3600 } });
      if (!response.ok) return [];
      source = Buffer.from(await response.arrayBuffer());
    }
    const pixels = await sharp(source).resize(48, 48, { fit: "cover" }).flatten({ background: "#ffffff" }).toColourspace("srgb").removeAlpha().raw().toBuffer();
    return paletteFromPixels(pixels);
  })().catch(() => []);
  if (palettes.size >= 128) palettes.delete(palettes.keys().next().value!);
  palettes.set(url, { expires: Date.now() + 300_000, promise });
  return promise;
}
export async function withProjectTheme(project: Project): Promise<Project> {
  const cover = project.listingImage || project.media.find(panel => panel._type === "imagePanel")?.image;
  const palette = cover ? await getPalette(cover.url) : [];
  // Sanity's stored metadata is a no-download fallback if its image CDN is unavailable.
  const fallback = Object.values(project.listingPalette || {}).map(item => item?.background).filter(isHex);
  const theme = createProjectTheme(palette.length ? palette : fallback, project.colorOverrides);
  return { ...project, theme, background: theme.heroBackground, foreground: theme.heroForeground, listingColor: theme.background };
}
