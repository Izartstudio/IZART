import type { NextConfig } from "next";
const config: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  async redirects() {
    return [
      { source: "/services/brand-identity", destination: "/brand-identity", permanent: true },
      { source: "/services/digital-ecosystem", destination: "/website-design-and-development", permanent: true },
      { source: "/digital-ecosystem", destination: "/website-design-and-development", permanent: true },
    ];
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.prod.website-files.com" }, { protocol: "https", hostname: "cdn.sanity.io", pathname: "/images/**" }],
  },
};
export default config;
