export type ShowcaseService = {
  slug: string;
  title: string;
  description: string;
  href: string;
  image: string;
  video?: string;
  details: string;
};

/** Add a video URL to any state when its final film is ready; image remains its poster and fallback. */
export const showcaseServices: ShowcaseService[] = [
  { slug: "brand-identity", title: "Brand Identity", href: "/brand-identity", image: "/assets/services/showcase/brand-identity.png",
    description: "Define a distinct visual and verbal system that makes your brand instantly recognizable.",
    details: "Build a cohesive identity across your logo, typography, colour, visual language, and voice. We bring strategy and design together to create a brand system that stays consistent as your business grows." },
  { slug: "spatial-design", title: "Spatial Design", href: "/services/spatial-design", image: "/assets/services/showcase/digital-ecosystem.png",
    description: "Bring your brand into physical spaces through immersive, memorable experiences.",
    details: "Translate your brand into retail environments, exhibitions, and spaces people can experience. We connect environmental graphics, wayfinding, and spatial storytelling to create a coherent physical expression of your brand." },
  { slug: "digital-ecosystem", title: "Digital Ecosystem", href: "/website-design-and-development", image: "/assets/services/showcase/digital-ecosystem.png",
    description: "Design high-conversion digital experiences that are intuitive, fast, and visually compelling.",
    details: "Connect strategy, interface design, and development across websites and digital products. We create clear user journeys and scalable experiences that turn attention into action." },
  { slug: "brand-growth", title: "Brand Growth", href: "/services/brand-growth", image: "/assets/services/showcase/brand-identity.png",
    description: "Build content and campaigns that grow brand recognition and meaningful engagement.",
    details: "Create a consistent presence through campaign strategy, social media, and content systems. We help your brand develop a recognisable voice and a visual language that can adapt across channels." },
  { slug: "brand-launch", title: "Brand Launch & Campaign Planning", href: "/services/brand-launch", image: "/assets/services/showcase/digital-ecosystem.png",
    description: "Plan and launch creative campaigns that build momentum, visibility, and impact.",
    details: "Bring your brand to market with a clear story and a coordinated creative campaign. From launch strategy to campaign concepts and channel planning, we help each touchpoint work toward the same objective." },
];

export function serviceScrollState(scroll: number, travel: number, count: number) {
  const progress = travel > 0 ? Math.min(1, Math.max(0, scroll / travel)) : 0;
  const position = progress * count;
  const active = Math.min(Math.max(0, count - 1), Math.floor(position));
  return { active, progress, stateProgress: progress === 1 ? 1 : position - active };
}
