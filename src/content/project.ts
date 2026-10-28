export type ProjectImage = { url: string; width: number; height: number };
export type ImagePanel = { _key: string; _type: "imagePanel"; image: ProjectImage; mobileImage?: ProjectImage; alt: string; decorative?: boolean };
export type VideoPanel = { _key: string; _type: "videoPanel"; url: string; poster: ProjectImage; title: string; mode: "controls" | "loop"; captionsUrl?: string };
export type Project = {
  slug: string; name: string; client: string; year: string; introduction: string;
  services: string[]; logo?: ProjectImage; background: string; foreground: string;
  listingImage?: ProjectImage; listingDescription?: string; listingColor?: string;
  listingOrder?: number; showInProjects?: boolean;
  featuredOnHomepage?: boolean; homepageOrder?: number;
  homepageImage?: ProjectImage; homepageHoverVideo?: string;
  media: (ImagePanel | VideoPanel)[];
  details?: { _key: string; title: string; body: string }[];
  seoTitle: string; description: string; socialImage?: ProjectImage;
  indexable: boolean; updatedAt?: string;
};
