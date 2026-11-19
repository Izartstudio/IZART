export type ServicesImage = { src: string; alt?: string; position?: string };
export type ServicesLink = { label: string; href: string };

export type HomeService = {
  id: string;
  title: string;
  description: string;
  href: string;
  background: ServicesImage;
  project: ServicesLink & { image: ServicesImage; year?: string };
};

export type HomeServicesContent = {
  heading: string;
  introduction: string;
  learnMoreLabel: string;
  industries: string[];
  industriesLink: ServicesLink;
  services: HomeService[];
};

export const homeServicesDocumentId = "home-services";

const project = {
  label: "View Projects",
  year: "2026",
  href: "/projects",
  image: { src: "/assets/home/services/featured-project.webp", alt: "Fizzy Ultra brand artwork" },
};

export const defaultHomeServices: HomeServicesContent = {
  heading: "Our Services",
  introduction: "Strategic branding and digital design that drives measurable impact. We create cohesive brand identities and conversion-optimized interfaces that help businesses stand out, connect authentically, and grow consistently",
  learnMoreLabel: "Learn More",
  industries: ["Jewellery", "Health & Wellness", "Real Estate", "Food & Beverage"],
  industriesLink: { label: "View All Industries", href: "/projects" },
  services: [
    {
      id: "brand-identity",
      title: "Brand Identity",
      description: "Establish a unique visual and verbal identity that ensures your brand is instantly recognizable and memorable to your audience.",
      href: "/brand-identity",
      background: { src: "/assets/home/services/service-1.svg" },
      project,
    },
    {
      id: "spatial-design",
      title: "Spatial Design",
      description: "Bring your brand into physical spaces through immersive, memorable experiences.",
      href: "/services/spatial-design",
      background: { src: "/assets/home/services/service-2.svg" },
      project,
    },
    {
      id: "digital-ecosystem",
      title: "Digital Ecosystem",
      description: "Create a distinctive visual and verbal identity for your spatial design that makes it instantly recognizable and memorable to your audience.",
      href: "/website-design-and-development",
      background: { src: "/assets/home/services/service-3.svg" },
      project,
    },
    {
      id: "content-ips",
      title: "Content IPs",
      description: "Create a distinctive visual and verbal identity for your spatial design that makes it instantly recognizable and memorable to your audience.",
      href: "/services/brand-growth",
      background: { src: "/assets/home/services/service-4.svg" },
      project,
    },
    {
      id: "brand-launch",
      title: "Brand Launch & Campaigns",
      description: "Create a distinctive visual and verbal identity for your spatial design that makes it instantly recognizable and memorable to your audience.",
      href: "/services/brand-launch",
      background: { src: "/assets/home/services/service-5.svg" },
      project,
    },
  ],
};

export function isServicesHref(href: unknown): href is string {
  return typeof href === "string" && /^\/(?![\/\\])|^https:\/\/\S+$/i.test(href) && !/[\s\\]/.test(href);
}
