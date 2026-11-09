"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    __revealReady?: boolean;
  }
}

/**
 * Client-side effects shared by every page:
 * - Reveals [data-reveal] blocks as they scroll into view.
 * - Moves focus to the new page's main heading after client-side navigation,
 *   so keyboard and screen-reader users start at the top of the new content.
 */
export function SiteEffects() {
  const pathname = usePathname();
  const lastPathname = useRef(pathname);

  useEffect(() => {
    if (pathname?.startsWith("/admin")) return;
    window.__revealReady = true;
    const root = document.documentElement;
    if (!root.classList.contains("reveal-on")) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );

    const frame = requestAnimationFrame(() => {
      document.querySelectorAll("[data-reveal]:not(.is-visible)").forEach((el) => observer.observe(el));
    });
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [pathname]);

  useEffect(() => {
    // Compare paths rather than counting renders, so StrictMode's double effects
    // never treat the initial load as a navigation.
    if (lastPathname.current === pathname) return;
    lastPathname.current = pathname;
    if (window.location.hash) return;
    const heading = document.querySelector<HTMLElement>("main h1") ?? document.getElementById("main");
    if (!heading) return;
    if (!heading.hasAttribute("tabindex")) heading.setAttribute("tabindex", "-1");
    heading.focus({ preventScroll: true });
  }, [pathname]);

  return null;
}
