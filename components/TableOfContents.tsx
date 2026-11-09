"use client";

import { useEffect, useRef, useState } from "react";

export interface TocItem {
  id: string;
  text: string;
  /** 1 = page section, 2 = document heading, 3 = sub-heading */
  level: 1 | 2 | 3;
}

interface TableOfContentsProps {
  items: TocItem[];
  variant: "desktop" | "mobile";
}

function useActiveHeading(ids: string[]) {
  const [active, setActive] = useState(ids[0]);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top - 150 <= 0) current = id;
        else break;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ids]);

  return active;
}

/** "On this page" navigation: sticky list on desktop, collapsible on mobile. */
export function TableOfContents({ items, variant }: TableOfContentsProps) {
  const ids = items.map((item) => item.id);
  const idsKey = ids.join("|");
  const stableIds = useStableArray(ids, idsKey);
  const active = useActiveHeading(stableIds);
  const detailsRef = useRef<HTMLDetailsElement>(null);

  const list = (
    <ol className="border-l border-line">
      {items.map((item) => {
        const isActive = active === item.id;
        return (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={isActive ? "location" : undefined}
              onClick={() => {
                if (detailsRef.current) detailsRef.current.open = false;
              }}
              className={`-ml-px flex min-h-9 items-center border-l-2 py-1 leading-snug transition-colors ${
                item.level === 1 ? "pl-4 font-medium" : item.level === 2 ? "pl-4" : "pl-7 text-[0.8125rem]"
              } ${
                isActive
                  ? "border-accent text-ink"
                  : "border-transparent text-muted hover:border-line-strong hover:text-ink"
              }`}
            >
              {item.text}
            </a>
          </li>
        );
      })}
    </ol>
  );

  if (variant === "mobile") {
    return (
      <details ref={detailsRef} className="group card overflow-hidden">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 text-[0.9375rem] font-semibold text-ink [&::-webkit-details-marker]:hidden">
          On this page
          <span aria-hidden className="text-muted transition-transform group-open:rotate-180">
            ▾
          </span>
        </summary>
        <nav aria-label="On this page" className="max-h-[60vh] overflow-y-auto border-t border-line px-4 py-3 text-sm">
          {list}
        </nav>
      </details>
    );
  }

  return (
    <nav aria-label="On this page" className="text-sm">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-muted">On this page</p>
      {list}
    </nav>
  );
}

function useStableArray(ids: string[], key: string) {
  const ref = useRef<{ key: string; ids: string[] }>({ key, ids });
  if (ref.current.key !== key) ref.current = { key, ids };
  return ref.current.ids;
}
