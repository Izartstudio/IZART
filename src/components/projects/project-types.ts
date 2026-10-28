import type { Project, ProjectImage } from "@/content/project";

export type ListingProject = Project & { listingImage: ProjectImage };
export type ProjectsView = "gallery" | "grid";

