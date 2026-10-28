export const site = {
  name: "Izart Studio",
  url: new URL(process.env.SITE_URL || "https://www.izart.in"),
  indexable: process.env.SITE_INDEXABLE === "true" &&
    (!process.env.VERCEL_ENV || process.env.VERCEL_ENV === "production"),
};
