import "server-only";
import { cache } from "react";
import { createClient } from "@sanity/client";
import { defaultOutcomeStats } from "@/content/outcome-stats";

const client = process.env.SANITY_PROJECT_ID ? createClient({
  projectId: process.env.SANITY_PROJECT_ID,
  dataset: process.env.SANITY_DATASET || "production",
  apiVersion: "2026-09-17",
  useCdn: false,
  perspective: "published",
  token: process.env.SANITY_API_READ_TOKEN,
}) : null;

export const getOutcomeStats = cache(async () => {
  try {
    const stats = await client?.fetch<typeof defaultOutcomeStats | null>(
      '*[_id == "outcome-stats"][0].stats[]{_key,label,value,suffix}', {}, { next: { revalidate: 60 } },
    );
    return stats?.length === 3 && stats.every(stat => stat.label && Number.isSafeInteger(stat.value) && stat.value >= 0)
      ? stats : defaultOutcomeStats;
  } catch (error) {
    console.error("Unable to load Outcome Stats", error);
    return defaultOutcomeStats;
  }
});
