export type PortfolioSettings = {
  heading: string; gridIntroduction: string; galleryLabel: string; gridLabel: string;
  defaultView: "gallery" | "grid"; showArchive: boolean; archiveHeading: string;
  useCmsProjects: boolean; orderedSlugs: string[];
};
export const defaultPortfolioSettings: PortfolioSettings = {
  heading: "Projects by Izart Studio",
  gridIntroduction: "Brand strategy and identity design, built from the inside out. Every project begins with a point of view and becomes a system the world remembers.",
  galleryLabel: "Gallery View", gridLabel: "Grid View", defaultView: "gallery",
  showArchive: true, archiveHeading: "Explore our case studies", useCmsProjects: false, orderedSlugs: [],
};
