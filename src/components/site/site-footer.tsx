import Image from "next/image";
import Link from "next/link";
import { ArtworkStrip } from "./artwork-strip";

const quickLinks = [
  ["Work", "/projects"],
  ["Contact", "/#Get-Quote"],
  ["Authors", "/authors"],
  ["Careers", "/careers"],
  ["Blog", "/blogs"],
] as const;

const socialLinks = [
  ["Behance", "https://www.behance.net/izartstudio_", "be"],
  ["LinkedIn", "https://www.linkedin.com/company/izart-media", "in"],
  ["Instagram", "https://www.instagram.com/izart_studio/", "ig"],
  ["Pinterest", "https://in.pinterest.com/izartstudio/", "p"],
] as const;

function MarqueeFeature() {
  return <div className="site-footer__marquee-feature">
    <Image src="/assets/footer/marquee-feature.png" alt="" width={270} height={270} />
    <ArtworkStrip />
    <ArtworkStrip edge="bottom" />
  </div>;
}

function MarqueeGroup({ duplicate = false }: { duplicate?: boolean }) {
  return <div className="site-footer__marquee-group" aria-hidden={duplicate || undefined}>
    <Image className="site-footer__wordmark" src="/assets/footer/footer.svg" alt="" width={1440} height={181} unoptimized />
  </div>;
}

export function SiteFooter() {
  return <footer className="site-footer">
    <div className="site-footer__top">
      <address className="site-footer__contact">
        <p><strong>M:</strong> <a href="tel:+919711106474">+91-97111 06474</a></p>
        <p><strong>E:</strong> <a href="mailto:operations@izart.in">operations@izart.in</a></p>
        <p><strong>A:</strong> B-40, Vasant Kunj, Sector D,<br />New Delhi 110070</p>
      </address>

      <nav className="site-footer__quick" aria-label="Footer navigation">
        <strong>Quick Links</strong>
        {quickLinks.map(([label, href]) => <Link href={href} key={label}>{label}</Link>)}
      </nav>

      <nav className="site-footer__social" aria-label="Social links">
        {socialLinks.map(([label, href, icon]) => <a href={href} key={label} target="_blank" rel="noreferrer">
          <i aria-hidden="true">{icon}</i><span>{label}</span>
        </a>)}
      </nav>
    </div>

    <div className="site-footer__marquee" aria-label="Izart Studio" tabIndex={0}>
      <div className="site-footer__marquee-track">
        <MarqueeGroup />
        <MarqueeGroup duplicate />
      </div>
      <MarqueeFeature />
    </div>

    <div className="site-footer__legal">
      <p>© Izart Content PVT LTD.</p>
      <nav aria-label="Legal information">
        <Link href="/privacy-policy">Privacy</Link>
        <Link href="/terms">Terms</Link>
      </nav>
    </div>
  </footer>;
}
