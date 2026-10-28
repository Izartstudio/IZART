import Image from "next/image";

const logos = [
  { src: "/assets/about/haywardslogo.svg", alt: "Haywards 5000", width: 93, height: 31 },
  { src: "/assets/about/coindcxlogo.svg", alt: "CoinDCX", width: 91, height: 31 },
  { src: "/assets/about/obeeteelogo.svg", alt: "Obeetee Carpets", width: 98, height: 33 },
  { src: "/assets/about/routerlogo.svg", alt: "Router", width: 108, height: 36 },
  { src: "/assets/about/himslogo.svg", alt: "Hims", width: 110, height: 37 },
  { src: "/assets/about/adidaslogo.svg", alt: "Adidas", width: 62, height: 42 },
  { src: "/assets/about/budweiserlogo.svg", alt: "Budweiser", width: 101, height: 38 },
  { src: "/assets/about/mastersuninonlogo.svg", alt: "Masters' Union", width: 137, height: 17 },
  { src: "/assets/about/simbalogo.svg", alt: "Simba", width: 90, height: 45 },
  { src: "/assets/about/mrbeastlogo.svg", alt: "MrBeast", width: 129, height: 43 },
  { src: "/assets/about/phantomlogo.svg", alt: "Phantom", width: 91, height: 48 },
] as const;

export function ClientLogoStrip() {
  return <div className="about-stats__logos" aria-label="Selected clients">
    <div className="about-stats__logo-track">
      <LogoGroup />
      <LogoGroup duplicate />
    </div>
  </div>;
}

function LogoGroup({ duplicate = false }: { duplicate?: boolean }) {
  return <div className="about-stats__logo-group" aria-hidden={duplicate || undefined}>
    {logos.map(logo => <span className="about-stats__logo" key={logo.src}>
      <Image src={logo.src} alt={duplicate ? "" : logo.alt} width={logo.width} height={logo.height} />
    </span>)}
  </div>;
}
