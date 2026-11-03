"use client";
import Image from "next/image";
import { NavigationContrast } from "./navigation-contrast";
import Link from "next/link";
import type { MouseEvent } from "react";
import { useEffect, useState, useRef } from "react";
import { ArrowIcon, SiteButton } from "./site-button";

type Item = { label: string; href: string; children?: Item[] };
const sections: Record<string, Item[]> = {
  Services: [
    { label: "Branding", href: "/brand-identity", children: [{ label: "Brand Strategy", href: "/brand-identity/brand-strategy" }, { label: "Visual Identity", href: "/brand-identity" }] },
    { label: "Digital Ecosystem", href: "/website-design-and-development", children: [{ label: "Website Design", href: "/website-design-and-development" }, { label: "Webflow Development", href: "/website-design-and-development/webflow-development" }, { label: "App Development", href: "/website-design-and-development/app-development" }] },
    { label: "Brand Growth", href: "/services/brand-growth", children: [{ label: "Campaign Strategy", href: "/services/brand-growth/campaign-strategy" }, { label: "Social Media", href: "/services/brand-growth/social-media" }, { label: "Content Systems", href: "/services/brand-growth/content-systems" }] },
    { label: "Brand Launch & Campaign Planning", href: "/services/brand-launch", children: [{ label: "Launch Strategy", href: "/services/brand-launch/launch-strategy" }, { label: "Creative Campaigns", href: "/services/brand-launch/creative-campaigns" }] },
    { label: "Spatial Design", href: "/services/spatial-design", children: [{ label: "Retail Design", href: "/services/spatial-design/retail-design" }, { label: "Exhibition Design", href: "/services/spatial-design/exhibition-design" }] },
  ],
  Industries: [{ label: "Consumer Brands", href: "/industries/consumer-brands" }, { label: "Technology", href: "/industries/technology" }, { label: "Real Estate", href: "/industries/real-estate" }, { label: "Hospitality", href: "/industries/hospitality" }],
  Resources: [{ label: "Insights", href: "/blogs" }, { label: "Case Studies", href: "/projects" }, { label: "Brand Masterclass", href: "/brand-masterclass" }],
};
const utilities = [["Careers", "/careers"], ["Manifesto", "/manifesto"], ["About Us", "/about-us"], ["Brand Masterclass", "/brand-masterclass"], ["Store", "/store"]] as const;
const socials = [["Instagram", "https://www.instagram.com/izart_studio/", "ig"], ["Behance", "https://www.behance.net/izartstudio_", "Bē"], ["Pinterest", "https://in.pinterest.com/izartstudio/", "p"], ["LinkedIn", "https://www.linkedin.com/company/izart-media", "in"]] as const;

export function SiteNavigation() {
  const [compact, setCompact] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 991px)");
    const update = () => setCompact(query.matches);
    update(); query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  const [open, setOpen] = useState(false);
  const [present, setPresent] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [section, setSection] = useState<string | null>(null);
  const [child, setChild] = useState<string | null>(null);
  const close = () => setOpen(false);
  useEffect(() => {
    if (!present) return;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") { close(); toggleRef.current?.focus(); }
      if (event.key !== "Tab") return;
      const controls = [...(menuRef.current?.querySelectorAll<HTMLElement>('a[href],button:not(:disabled)') || []), ...(toggleRef.current ? [toggleRef.current] : [])].filter(node => node.getClientRects().length && !node.closest("[inert]"));
      const index = controls.indexOf(document.activeElement as HTMLElement);
      if (event.shiftKey && index <= 0) { event.preventDefault(); controls.at(-1)?.focus(); }
      else if (!event.shiftKey && (index < 0 || index === controls.length - 1)) { event.preventDefault(); controls[0]?.focus(); }
    };
    addEventListener("keydown", escape);
    return () => { document.body.style.overflow = old; removeEventListener("keydown", escape); };
  }, [present]);
  useEffect(() => {
    if (open) { setPresent(true); return; }
    const resetTimer = window.setTimeout(() => {
      setPresent(false);
      setSection(null);
      setChild(null);
    }, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 520);
    return () => window.clearTimeout(resetTimer);
  }, [open]);
  useEffect(() => {
    let previousY = Math.max(window.scrollY, 0);
    let frame = 0;
    const update = () => {
      frame = 0;
      const currentY = Math.max(window.scrollY, 0);
      const delta = currentY - previousY;
      if (present || currentY < 80) setHidden(false);
      else if (delta > 5) setHidden(true);
      else if (delta < -5) setHidden(false);
      previousY = currentY;
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [present]);
  const activate = (name: string) => { setSection(name); setChild(null); };
  const showDefault = () => { setSection(null); setChild(null); };
  const activateChild = (item: Item) => { if (!compact && item.children) setChild(item.label); };
  const followSecondaryLink = (event: MouseEvent<HTMLAnchorElement>, item: Item) => {
    if (item.children && window.matchMedia("(hover: none)").matches && child !== item.label) {
      event.preventDefault();
      setChild(item.label);
      return;
    }
    close();
  };
  return <>
    <NavigationContrast />
    <div ref={menuRef} id="open-menu-navigation" className={`menu-overlay${open ? " is-open" : ""}`} aria-hidden={!open} inert={!open ? true : undefined}>
      {compact && section && <div className="menu-overlay__backbar"><button type="button" onClick={() => { setChild(null); setSection(null); }}>← Back</button><span>{section}</span></div>}
      <div className={`menu-overlay__body${section ? " has-section" : ""}${child ? " has-child" : ""}`}>
        <div className="menu-overlay__primary">
          <div className="menu-overlay__main-links">
            {Object.keys(sections).map(name => <button type="button" className={section === name ? "is-active" : ""} key={name} onClick={() => activate(name)} onPointerEnter={event => { if (!compact && event.pointerType === "mouse") activate(name); }} onFocus={() => { if (!compact) activate(name); }} aria-expanded={section === name}><span>{name}</span><ArrowIcon /></button>)}
            <Link href="/projects" onClick={close} onPointerEnter={() => { if (!compact) showDefault(); }} onFocus={() => { if (!compact) showDefault(); }}>Portfolio</Link>
          </div>
          <div className="menu-overlay__utility">{utilities.map(([label, href]) => <Link href={href} key={label} onClick={close} onPointerEnter={() => { if (!compact) showDefault(); }} onFocus={() => { if (!compact) showDefault(); }}>{label}</Link>)}</div>
        </div>
        <article className={`menu-overlay__project${section ? "" : " is-visible"}`} aria-hidden={Boolean(section)} inert={section ? true : undefined}>
          <div className="menu-overlay__project-media"><Image src="/assets/projects/benicio/cover.webp" alt="Benicio Homes project artwork" width={1920} height={1080} priority /></div>
          <div className="menu-overlay__project-copy">
            <p>Latest Project · Real Estate</p>
            <h2>BENICIO HOMES</h2>
          </div>
          <Link className="menu-overlay__project-cta" href="/projects/benicio" onClick={close}>View Project <span aria-hidden="true">→</span></Link>
        </article>
        {Object.entries(sections).map(([sectionName, sectionItems]) => <nav className={`menu-overlay__secondary${section === sectionName ? " is-visible" : ""}`} aria-label={`${sectionName} navigation`} aria-hidden={section !== sectionName} inert={section !== sectionName ? true : undefined} key={sectionName}>
          {sectionItems.map((item, itemIndex) => compact ? <div className="menu-overlay__mobile-service" key={item.label}>
            <div className="menu-overlay__mobile-row">
              <Link href={item.href} onClick={close}><span>{item.label} <span aria-hidden="true">↗</span></span></Link>
              {item.children && <button type="button" aria-label={`${child === item.label ? "Collapse" : "Expand"} ${item.label} services`} aria-expanded={child === item.label} aria-controls={`mobile-services-${sectionName}-${itemIndex}`} onClick={() => setChild(child === item.label ? null : item.label)}><svg viewBox="0 0 20 20" width="20" height="20" fill="none" aria-hidden="true"><path d="m5 7.5 5 5 5-5" stroke="currentColor" strokeWidth="1.5" /></svg></button>}
            </div>
            {item.children && <div id={`mobile-services-${sectionName}-${itemIndex}`} className="menu-overlay__mobile-dropdown" inert={child !== item.label} aria-hidden={child !== item.label} data-open={child === item.label}>
              <div>{item.children.map(page => <Link href={page.href} key={page.label} onClick={close}>{page.label}<span aria-hidden="true">↗</span></Link>)}</div>
            </div>}
          </div> : <Link href={item.href} className={child === item.label ? "is-active" : ""} key={item.label} onClick={event => followSecondaryLink(event, item)} onPointerEnter={() => activateChild(item)} onFocus={() => activateChild(item)} aria-expanded={item.children ? child === item.label : undefined}><span>{item.label}</span>{item.children && <ArrowIcon />}</Link>)}
        </nav>)}
        {!compact && Object.entries(sections).flatMap(([sectionName, sectionItems]) => sectionItems.filter(item => item.children).map(item => <nav className={`menu-overlay__tertiary${section === sectionName && child === item.label ? " is-visible" : ""}`} aria-label={`${item.label} pages`} aria-hidden={section !== sectionName || child !== item.label} inert={section !== sectionName || child !== item.label ? true : undefined} key={`${sectionName}-${item.label}`}>
          {item.children!.map(page => <Link href={page.href} key={page.label} onClick={close}>{page.label}</Link>)}
        </nav>))}
      </div>
      {compact && <Link className="menu-overlay__mobile-quote" href="/#Get-Quote" onClick={close}>Get Quote <span aria-hidden="true">→</span></Link>}
      <nav className="menu-overlay__social" aria-label="Social media">{socials.map(([label, href, icon]) => <a href={href} target="_blank" rel="noreferrer" key={label}><i aria-hidden="true">{icon}</i>{label}</a>)}</nav>
    </div>
    <header className={`site-nav${hidden ? " is-hidden" : ""}${open ? " is-menu-open" : ""}`}>
    <div className="site-nav__backdrop" aria-hidden="true"><span /><span /><span /><span /></div>
    <div className="site-nav__inner">
      <Link className="site-nav__logo" href="/" aria-label="Izart Studio home" onClick={close}><Image src="/assets/site/logo.svg" alt="Izart Studio" width={157} height={20} priority /></Link>
      <nav className="site-nav__links" aria-label="Primary navigation"><Link href="/services" onClick={close}>Services</Link><Link href="/projects" onClick={close}>Portfolio</Link><Link href="/careers" onClick={close}>Careers</Link><Link href="/manifesto" onClick={close}>Manifesto</Link></nav>
      <div className="site-nav__actions"><SiteButton className="site-nav__quote" href="/#Get-Quote" icon={<ArrowIcon />}>Get Quote</SiteButton><button ref={toggleRef} className="site-nav__menu" type="button" aria-expanded={open} aria-controls="open-menu-navigation" aria-label={open ? "Close menu" : "Open menu"} onClick={() => { if (open) close(); else { setHidden(false); setOpen(true); } }}><span /><span /><span /></button></div>
    </div>
    </header>
  </>;
}
