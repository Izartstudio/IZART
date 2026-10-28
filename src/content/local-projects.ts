import type { Project } from "./project";
import assets from "./seraano-assets.json";
const ordered = assets.filter(a => !a.url.includes('moodboard')).sort((a,b) => Number(a.url.match(/seraano(\d+)/)?.[1]) - Number(b.url.match(/seraano(\d+)/)?.[1]));
const loupeImage = { url: "/assets/projects/loupe.png", width: 1223, height: 688 };
export const localProjects: Project[] = [{
  slug: "seraano", name: "Seraano", client: "Seraano", year: "2025-26",
  introduction: "Seraano is a luxury villa community by Aarza Realty, resting along the Chapora River backwaters in Camurlim, North Goa. Eight residences shaped by the land they stand on. Contemporary architecture that listens to the village before it speaks for itself.",
  services: ["Branding", "Packaging Design", "Website UI UX"],
  listingImage: ordered[0], listingColor: "#182817", listingOrder: 1, showInProjects: true,
  background: "#000000", foreground: "#ffffff",
  media: ordered.map((image, i) => ({ _key: `seraano-${i}`, _type: "imagePanel", image, alt: `Seraano brand identity and applications — artwork ${i + 1}` })),
  seoTitle: "Seraano — Brand Identity & Design | Izart Studio",
  description: "Explore Izart Studio’s brand identity and design for Seraano, a luxury villa community by Aarza Realty in North Goa.",
  socialImage: ordered[0], indexable: false,
  // Preview copy based on the supplied project description; replace with approved copy in Sanity.
  details: [
    { _key: "objective", title: "The objective", body: "Introduce Seraano, a collection of eight residences by Aarza Realty in Camurlim, North Goa. The identity reflects the quiet setting along the Chapora River backwaters and an architecture shaped by its surroundings." },
    { _key: "approach", title: "The approach", body: "The case study brings together the landscape, architecture, and daily life of the community. Natural textures and a restrained palette establish the tone across the visual presentation." },
    { _key: "identity", title: "Visual identity", body: "A flowing wordmark, muted greens, and warm neutral tones connect the brand to its setting. The following artwork presents the identity across imagery, print, and brand applications." },
    { _key: "outcome", title: "Outcome", body: "A connected collection of brand applications for Seraano. Browse the artwork alongside these project details to explore the visual system." },
  ],
}, {
  slug: "wg1", name: "WG1", client: "WG1", year: "2025",
  introduction: "WG1 is a nutraceutical brand built around foundational daily nutrition. Izart Studio developed its brand strategy, visual identity, and packaging around a calm, dependable daily ritual.",
  services: ["Brand Strategy", "Visual Identity", "Packaging"], background: "#000000", foreground: "#ffffff", media: [],
  seoTitle: "WG1 | Nutraceutical Brand Identity & Packaging | Izart Studio",
  description: "Explore Izart Studio’s brand strategy, visual identity, and packaging design for WG1.", indexable: false,
  listingImage: ordered[1], listingColor: "#182817", listingOrder: 2, showInProjects: true,
}, {
  slug: "project3", name: "project3", client: "project3", year: "2025",
  introduction: "WG1 is a nutraceutical brand built around foundational daily nutrition. Izart Studio developed its brand strategy, visual identity, and packaging around a calm, dependable daily ritual.",
  services: ["Brand Strategy", "Visual Identity", "Packaging"], background: "#000000", foreground: "#ffffff", media: [],
  seoTitle: "WG1 | Nutraceutical Brand Identity & Packaging | Izart Studio",
  description: "Explore Izart Studio’s brand strategy, visual identity, and packaging design for WG1.", indexable: false,
  listingImage: ordered[1], listingColor: "#182817", listingOrder: 2, showInProjects: true,
}, {
  slug: "loupe", name: "Loupe", client: "Loupe", year: "",
  introduction: "", services: [],
  background: "#0a0c08", foreground: "#ffffff",
  listingImage: loupeImage, listingOrder: 4, showInProjects: true,
  featuredOnHomepage: false,
  media: [{ _key: "loupe-cover", _type: "imagePanel", image: loupeImage, alt: "Loupe jewellery website displayed on a phone beside a ruby ring" }],
  seoTitle: "Loupe | Izart Studio", description: "Loupe — a project by Izart Studio.",
  socialImage: loupeImage, indexable: false,
}];
