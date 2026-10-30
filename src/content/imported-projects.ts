import type { Project, ProjectImage } from "./project";
import assets0 from "./10x10-assets.json";
import assets1 from "./benicio-assets.json";
import assets2 from "./loupe-assets.json";
import assets3 from "./ritva-assets.json";
import assets4 from "./soak-studio-assets.json";
import assets5 from "./seraano-assets.json";
import assets6 from "./plattr-assets.json";

type ImportedCaseStudy = {
  slug: string; name: string; client: string; year: string; services: string[];
  background: string; foreground: string; introduction: string; approach: string;
  listingOrder: number; assets: ProjectImage[];
};
function createCaseStudy(item: ImportedCaseStudy): Project {
  const cover = { url: `/assets/projects/${item.slug}/cover.webp`, width: 1920, height: 1080 };
  return {
    slug: item.slug, name: item.name, client: item.client, year: item.year,
    introduction: item.introduction, services: item.services,
    background: item.background, foreground: item.foreground,
    listingImage: cover, listingColor: item.background, listingOrder: item.listingOrder,
    listingDescription: item.introduction, showInProjects: true,
    featuredOnHomepage: true, homepageOrder: item.listingOrder, homepageImage: cover,
    media: item.assets.map((image, index) => ({
      _key: `${item.slug}-${index + 1}`, _type: "imagePanel", image,
      alt: `${item.name} - ${item.services.join(", ").toLowerCase()} case study, panel ${index + 1}`,
    })),
    details: [
      { _key: "about", title: "About the project", body: item.introduction },
      { _key: "approach", title: "The approach", body: item.approach },
    ],
    seoTitle: `${item.name} | ${item.services[0]} | Izart Studio`,
    description: item.introduction, socialImage: cover, indexable: true,
  };
}

// Supplied case-study artwork is authoritative while these projects are local.
export const importedProjects: Project[] = [
  createCaseStudy({ ...{"slug": "10x10", "name": "10x10", "client": "10x10 Booths", "year": "2025-26", "services": ["Brand Strategy", "Visual Identity", "Website Design"], "background": "#121212", "foreground": "#ffffff", "introduction": "10x10 Booths is a full-service exhibition partner delivering custom booths, modular systems, technology integration, and on-ground execution across major trade shows. The project repositions the business as one partner for strategy, design, fabrication, logistics, technology, and execution.", "approach": "The identity and website bring the breadth of the exhibition offering into one connected system, moving beyond the perception of a booth fabrication company.", "listingOrder": 1}, assets: assets0 }),
  createCaseStudy({ ...{"slug": "benicio", "name": "Benicio Homes", "client": "Benicio Homes", "year": "", "services": ["Brand Identity", "Visual Identity"], "background": "#e1d9ca", "foreground": "#27231e", "introduction": "Benicio Homes is a Goan real estate developer creating designer homes shaped by tropical architecture, raw materials, and a close relationship with nature. The identity carries an architectural, restrained visual language rooted in how the homes are made.", "approach": "A grounded wordmark, soft architectural arcs, and a mark inspired by laterite stone connect the identity to the buildings. The visual system extends across layouts, plans, and customer and vendor touchpoints.", "listingOrder": 2}, assets: assets1 }),
  createCaseStudy({ ...{"slug": "loupe", "name": "Loupe", "client": "Loupe", "year": "", "services": ["UX Strategy", "UI UX Design", "Website Design"], "background": "#0a0c08", "foreground": "#ffffff", "introduction": "Loupe is a trust-first, two-sided gemstone marketplace connecting buyers with verified sellers. Its digital experience simplifies discovery, conversation, and decision-making while helping sellers manage and grow their businesses.", "approach": "The case study follows the buyer and seller experience through discovery, onboarding, product evaluation, and interaction. Typography, interface design, and user journeys support a precise and considered marketplace.", "listingOrder": 3}, assets: assets2 }),
  createCaseStudy({ ...{"slug": "ritva", "name": "Ritva", "client": "Ritva", "year": "", "services": ["Brand Identity", "Packaging Design"], "background": "#FBF9D5", "foreground": "#2B5C47", "introduction": "Ritva is an Indian beverage brand built around the drinks people grew up with. Its identity gives remembered flavours a visual language that connects traditional Indian drinks with modern life.", "approach": "The case study presents the visual identity, colour system, and packaging across the beverage range.", "listingOrder": 4}, assets: assets3 }),
  createCaseStudy({ ...{"slug": "soak-studio", "name": "Soak Studio", "client": "Soak Studio", "year": "", "services": ["Brand Identity", "Packaging Design", "Digital Design"], "background": "#FFFAE7", "foreground": "#56341D", "introduction": "Soak Studio is a body-care brand bringing face-grade science and familiar sensory comfort to everyday routines. Its visual world is warm, grounded, and made for real Indian bathrooms.", "approach": "The case study brings together the wordmark, packaging, imagery, and digital applications around a calm, sensory approach to body care.", "listingOrder": 5}, assets: assets4 }),
  createCaseStudy({ ...{"slug": "seraano", "name": "Seraano by Aarza", "client": "Aarza Realty", "year": "", "services": ["Brand Identity", "Brand Collaterals"], "background": "#d9d8ce", "foreground": "#324a38", "introduction": "Seraano by Aarza is a collection of eight residences along the Chapora River backwaters in Camurlim, North Goa. Its identity draws on the landscape, architecture, and quiet character of its setting.", "approach": "A flowing wordmark, natural greens, and warm neutrals connect the brand across printed matter, merchandise, property imagery, and villa presentations.", "listingOrder": 6}, assets: assets5 }),
  createCaseStudy({ ...{"slug": "plattr", "name": "Plattr", "client": "Plattr", "year": "", "services": ["Brand Identity", "Packaging Design", "Brand Collaterals"], "background": "#075a35", "foreground": "#ffffff", "introduction": "Plattr is a food brand with a bold, colourful visual world. The case study presents its brand story, logo system, packaging, and applications across digital, print, and physical touchpoints.", "approach": "Expressive lettering, vivid colours, and repeating graphic elements connect the identity across food packaging, menus, merchandise, and campaign applications.", "listingOrder": 7}, assets: assets6 }),
];
