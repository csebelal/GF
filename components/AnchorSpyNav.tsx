"use client";

import { useEffect, useMemo, useState } from "react";

export interface AnchorSpyItem {
  id: string;
  label: string;
}

/**
 * In-page anchor navigation chips that highlight whichever section is currently
 * centered/active during vertical scroll.
 */
export function AnchorSpyNav({
  items,
  ariaLabel = "Page sections",
}: {
  items: AnchorSpyItem[];
  ariaLabel?: string;
}) {
  const ids = useMemo(() => items.map((item) => item.id), [items]);
  const [activeId, setActiveId] = useState<string>(ids[0] ?? "");

  useEffect(() => {
    if (ids.length === 0) return;

    let frame = 0;
    const elements = ids.map((id) => ({ id, el: document.getElementById(id) }));

    const updateActive = () => {
      frame = 0;
      const anchorY = window.innerHeight * 0.32;
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 48;

      if (atBottom) {
        const lastId = ids[ids.length - 1];
        setActiveId((prev) => (prev === lastId ? prev : lastId));
        return;
      }

      let current = ids[0];
      for (const entry of elements) {
        if (!entry.el || !entry.el.isConnected) {
          entry.el = document.getElementById(entry.id);
        }
        if (!entry.el) continue;
        if (entry.el.getBoundingClientRect().top <= anchorY) {
          current = entry.id;
        }
      }
      setActiveId((prev) => (prev === current ? prev : current));
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(updateActive);
    };

    updateActive();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ids]);

  return (
    <nav aria-label={ariaLabel}>
      <ul className="flex flex-wrap gap-2">
        {items.map((item) => {
          const isCurrent = activeId === item.id;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={isCurrent ? "location" : undefined}
                onClick={() => setActiveId(item.id)}
                className={`chip min-h-10 px-3.5 text-sm transition-colors duration-200 ${
                  isCurrent
                    ? "border-accent bg-accent-soft font-semibold text-accent-strong"
                    : "hover:border-line-strong hover:text-ink"
                }`}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
