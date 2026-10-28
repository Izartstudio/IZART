import type { Metadata } from "next";
import { SiteNavigation } from "@/components/site/site-navigation";
import { site } from "@/lib/site";
import "./globals.css";
export const metadata: Metadata = {
  metadataBase: site.url,
  title: { default: site.name, template: `%s | ${site.name}` },
  description: "Izart Studio — branding, visual identity, and website design.",
  robots: { index: site.indexable, follow: true, googleBot: { index: site.indexable, follow: true, 'max-image-preview': 'large' } },
  openGraph: { siteName: site.name, type: 'website', locale: 'en_IN', images: [{ url: '/assets/site/open-menu-project.png', alt: 'Izart Studio' }] },
  twitter: { card: 'summary_large_image', images: ['/assets/site/open-menu-project.png'] },
  verification: { google: process.env.GOOGLE_SITE_VERIFICATION, other: process.env.BING_SITE_VERIFICATION ? { 'msvalidate.01': process.env.BING_SITE_VERIFICATION } : {} },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><a className="skip-link" href="#main">Skip to content</a><SiteNavigation />{children}</body></html>;
}
