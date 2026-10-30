import type { Project } from "./project";
import { importedProjects } from "./imported-projects";
import dogsAndCatsAssets from "./dogs-and-cats-assets.json";

export const retiredProjectSlugs = new Set(["wg1", "project3"]);
export const localProjects: Project[] = [...importedProjects, {
  slug: "dogs-and-cats", name: "Dogs & Cats", client: "Dogs & Cats", year: "",
  introduction: "Dogs & Cats is a cheerful branding project inspired by the joy, chaos, and charm pets bring to everyday life. It celebrates the bond between pets and their owners through playful humor, muddy paws, dramatic meows, and plenty of happy moments.",
  services: ["Brand Identity", "Packaging Design", "Brand Collaterals"],
  background: "#FFF4DD", foreground: "#3E2017",
  listingImage: { url: "/assets/projects/dogs-and-cats/cover.webp", width: 1920, height: 1080 },
  listingDescription: "A playful pet-store identity spanning packaging, signage, social, and merchandise.",
  listingColor: "#86C4FE", listingOrder: 8, showInProjects: true, featuredOnHomepage: false,
  media: dogsAndCatsAssets.map((image, index) => ({
    _key: `dogs-and-cats-${index + 1}`, _type: "imagePanel", image,
    alt: `Dogs & Cats pet-store brand identity, packaging, and applications - case study panel ${index + 1}`,
  })),
  details: [
    { _key: "about", title: "About the project", body: "Dogs & Cats is a cheerful branding project inspired by the joy, chaos, and charm pets bring to everyday life. The identity celebrates the bond between pets and their owners through playful humor, muddy paws, dramatic meows, and happy moments." },
    { _key: "identity", title: "The identity", body: "The logo brings a dog and cat into a soft, rounded frame, creating a warm, playful identity that feels familiar and easy to recognize. A palette of pink, yellow, blue, cream, and dark brown carries the character across the brand." },
    { _key: "characters", title: "Same characters, different moments", body: "The character system is built to flex across packaging, signage, social, and merchandise without losing recognition. Different poses and moods keep the brand playful and familiar." },
    { _key: "applications", title: "Brand applications", body: "The case study presents the identity across everyday brand pieces, packaging, digital storefront concepts, and the retail environment. These applications keep Dogs & Cats close, even beyond the store." },
  ],
  seoTitle: "Dogs & Cats | Pet Brand Identity & Packaging | Izart Studio",
  description: "Explore Dogs & Cats, a playful pet-store brand identity with character illustrations, packaging, and brand applications by Izart Studio.",
  socialImage: { url: "/assets/projects/dogs-and-cats/cover.webp", width: 1920, height: 1080 },
  indexable: true,
}];
