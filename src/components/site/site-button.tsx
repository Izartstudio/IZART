import Link from "next/link";
import type { ReactNode } from "react";

type SiteButtonProps = {
  children: ReactNode;
  className?: string;
  href: string;
  icon?: ReactNode;
};

export function SiteButton({ children, className, href, icon }: SiteButtonProps) {
  return <Link className={`site-button${className ? ` ${className}` : ""}`} href={href}>
    <span className="site-button__label">{children}</span>
    {icon ? <span className="site-button__icon" aria-hidden="true">{icon}</span> : null}
  </Link>;
}

export function ArrowIcon() {
  return <svg viewBox="0 0 11 10" width="11" height="10" fill="none" aria-hidden="true">
    <path d="m5.49.506 4.494 4.494-4.494 4.494-.672-.658L8.22 5.434.002 5.448v-.924H8.22L4.846 1.15 5.49.506Z" fill="currentColor" />
  </svg>;
}
