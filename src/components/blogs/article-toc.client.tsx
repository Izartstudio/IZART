'use client';

import { useEffect, useRef, useState } from 'react';

type TocItem = { id: string; text: string; level: number };

export function ArticleToc({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState(items[0]?.id);
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const sections = items.map(item => document.getElementById(item.id)).filter((node): node is HTMLElement => Boolean(node));
    let frame = 0;
    const update = () => {
      frame = 0;
      const marker = Math.min(window.innerHeight * 0.3, 180);
      let current = sections[0]?.id;
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= marker) current = section.id;
      }
      setActive(current);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [items]);

  useEffect(() => {
    const list = listRef.current;
    const link = list?.querySelector<HTMLElement>('[aria-current="location"]');
    if (!list || !link) return;
    const listBounds = list.getBoundingClientRect();
    const linkBounds = link.getBoundingClientRect();
    if (linkBounds.top < listBounds.top || linkBounds.bottom > listBounds.bottom) {
      list.scrollTop += linkBounds.top - listBounds.top - list.clientHeight / 2 + linkBounds.height / 2;
    }
  }, [active]);

  return <nav aria-label="Table of contents"><p>Table of Contents</p><ol ref={listRef}>{items.map(item => <li key={item.id} className={item.level > 2 ? 'is-subheading' : undefined}><a href={`#${item.id}`} aria-current={active === item.id ? 'location' : undefined}>{item.text}</a></li>)}</ol></nav>;
}
