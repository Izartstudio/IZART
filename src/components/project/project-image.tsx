import { getImageProps } from "next/image";
import type { ProjectImage } from "@/content/project";

// Sanity performs the transformation; local fixtures use Next's image optimizer.
function sanityLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  const url = new URL(src);
  url.searchParams.set("w", String(width));
  url.searchParams.set("q", String(quality || 80));
  url.searchParams.set("auto", "format");
  url.searchParams.set("fit", "max");
  return url.href;
}
export function ProjectImageView({ image, mobileImage, alt, eager = false, sizes = "100vw", className }: {
  image: ProjectImage; mobileImage?: ProjectImage; alt: string; eager?: boolean; sizes?: string; className?: string;
}) {
  const propsFor = (asset: ProjectImage) => getImageProps({
    src: asset.url, width: asset.width, height: asset.height, alt, sizes,
    loading: eager ? "eager" : "lazy", fetchPriority: eager ? "high" : "auto",
    ...(asset.url.startsWith("https://cdn.sanity.io/") ? { loader: sanityLoader } : {}),
  }).props;
  const desktop = propsFor(image);
  const mobile = mobileImage ? propsFor(mobileImage) : undefined;
  return <picture className={className}>
    {mobile && <source media="(max-width: 600px)" srcSet={mobile.srcSet} sizes={sizes} width={mobile.width} height={mobile.height} />}
    {/* getImageProps supplies responsive optimization without client JavaScript. */}
    <img {...desktop} alt={alt} />
  </picture>;
}
