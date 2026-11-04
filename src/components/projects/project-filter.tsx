"use client";
import { useEffect, useId, useRef, useState } from "react";

export function ProjectFilter({ label, allLabel, value, options, onChange }: { label: string; allLabel: string; value: string; options: string[]; onChange: (value: string) => void }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);
  const focusOption = (index: number) => requestAnimationFrame(() => root.current?.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]')[index]?.focus());
  return <div ref={root} className="project-filter" onKeyDown={event => {
    if (event.key === "Escape") { event.preventDefault(); setOpen(false); trigger.current?.focus(); }
    if (!open) return;
    const items = [...(root.current?.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]') || [])];
    const index = items.indexOf(document.activeElement as HTMLButtonElement);
    if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      const next = event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : (index + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
      items[next]?.focus();
    }
    if (event.key === "Tab") setOpen(false);
  }}>
    <span className="project-filter__label" id={`${id}-label`}>{label}</span>
    <button ref={trigger} className="project-filter__trigger" type="button" aria-haspopup="menu" aria-expanded={open} aria-controls={`${id}-menu`} aria-labelledby={`${id}-label ${id}-value`} onClick={() => setOpen(!open)} onKeyDown={event => {
      if (!open && (event.key === "ArrowDown" || event.key === "ArrowUp")) { event.preventDefault(); setOpen(true); focusOption(event.key === "ArrowDown" ? 0 : options.length); }
    }}><span id={`${id}-value`}>{value || allLabel}</span><span aria-hidden="true">{open ? "−" : "+"}</span></button>
    {open && <div className="project-filter__menu" id={`${id}-menu`} role="menu" aria-labelledby={`${id}-label`}>
      {["", ...options].map(option => <button type="button" role="menuitemradio" aria-checked={value === option} key={option} onClick={() => { setOpen(false); trigger.current?.focus(); onChange(option); }}><span>{option || allLabel}</span><span aria-hidden="true">{value === option ? "[ × ]" : "[   ]"}</span></button>)}
    </div>}
  </div>;
}
