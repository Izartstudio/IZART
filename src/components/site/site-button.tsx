import { ButtonBorder } from "./button-border";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Appearance = { children: ReactNode; icon?: ReactNode; custom?: boolean };
type SiteButtonProps = Appearance & (
  | (ComponentProps<typeof Link> & { as?: never })
  | (ComponentProps<"button"> & { as: "button" })
  | (ComponentProps<"a"> & { as: "a" })
);

export function SiteButton({ children, className, icon, custom, ...props }: SiteButtonProps) {
  const classes = custom ? className : ["site-button", className].filter(Boolean).join(" ");
  const contents = <>
    <ButtonBorder />
    {custom ? children : <span className="site-button__label">{children}</span>}
    {icon && <span className="site-button__icon" aria-hidden="true">{icon}</span>}
  </>;

  if (props.as === "button") {
    const { as: element, type = "button", ...attributes } = props;
    const Button = element;
    return <Button {...attributes} type={type} className={classes}>{contents}</Button>;
  }
  if (props.as === "a") {
    const { as: Anchor, ...attributes } = props;
    return <Anchor {...attributes} className={classes}>{contents}</Anchor>;
  }
  return <Link {...props} className={classes}>{contents}</Link>;
}

export function ArrowIcon() {
  return <svg viewBox="0 0 11 10" width="11" height="10" fill="none" aria-hidden="true">
    <path d="m5.49.506 4.494 4.494-4.494 4.494-.672-.658L8.22 5.434.002 5.448v-.924H8.22L4.846 1.15 5.49.506Z" fill="currentColor" />
  </svg>;
}
