import Image from "next/image";
import Link from "next/link";

const quickLinks = [
  ["Work", "/projects"],
  ["Contact", "/#Get-Quote"],
  ["Authors", "/authors"],
  ["Careers", "/careers"],
  ["Blog", "/blogs"],
  ["Privacy Policy", "/privacy-policy"],
] as const;

const socialLinks = [
  ["Behance", "https://www.behance.net/izartstudio_", "be"],
  ["LinkedIn", "https://www.linkedin.com/company/izart-media", "in"],
  ["Instagram", "https://www.instagram.com/izart_studio/", "ig"],
  ["Pinterest", "https://in.pinterest.com/izartstudio/", "p"],
] as const;

function MarqueeGroup({ duplicate = false }: { duplicate?: boolean }) {
  return <div className="site-footer__marquee-group" aria-hidden={duplicate || undefined}>
    <Image className="site-footer__wordmark" src="/assets/footer/footerlogo.svg" alt="" width={788} height={100} unoptimized />
    <Image className="site-footer__marquee-feature" src="/assets/footer/marquee-feature.png" alt="" width={270} height={270} />
    <Image className="site-footer__wordmark" src="/assets/footer/footerlogo.svg" alt="" width={788} height={100} unoptimized />
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
    </div>

    <p className="site-footer__copyright">{new Date().getFullYear()}. All Rights Reserved</p>
  </footer>;
}
