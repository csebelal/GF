"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { shouldUnoptimizeImage } from "@/lib/image-utils";
import { safeHref } from "@/lib/security/sanitize";
import { CVDownload } from "./CVDownload";
import { Close, Menu } from "./Icons";

const DEFAULT_NAV = [
  { href: "/", label: "Home" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/expertise", label: "Expertise" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

interface HeaderProps {
  profile?: any;
}

export function Header({ profile: customProfile }: HeaderProps = {}) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const profile = customProfile ?? {};
  const headerSettings = profile?.headerSettings;
  const navItems = headerSettings?.navItems?.length ? headerSettings.navItems : DEFAULT_NAV;
  const highlight = headerSettings?.highlightLink;
  const brandName = headerSettings?.brandTitle || profile.name;
  const brandRole = headerSettings?.brandSubtitle !== undefined && headerSettings.brandSubtitle !== "" ? headerSettings.brandSubtitle : profile.jobTitle;
  const showAvatar = headerSettings?.showAvatar !== false;
  const showCv = headerSettings?.showCvButton !== false;
  const cvLabel = headerSettings?.cvButtonLabel || "Download CV";
  const mobileEmailLabel = headerSettings?.mobileEmailButtonLabel || `Email ${profile.shortName || profile.name}`;

  const mobileItems = [...navItems];
  if (highlight && highlight.show !== false && highlight.href) {
    if (!mobileItems.some((item) => item.href === highlight.href)) {
      mobileItems.push({ href: highlight.href, label: highlight.label });
    }
  }

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const scrolledRef = useRef(false);

  const isCaseStudy = /^\/portfolio\/[^/]+/.test(pathname || "");

  const close = useCallback((returnFocus = true) => {
    setOpen(false);
    if (returnFocus) buttonRef.current?.focus();
  }, []);

  // Close the menu after navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    let frame = 0;

    const updateOnScroll = () => {
      frame = 0;
      const y = window.scrollY;
      const nextScrolled = y > 8;
      if (scrolledRef.current !== nextScrolled) {
        scrolledRef.current = nextScrolled;
        setScrolled(nextScrolled);
      }

      if (!isCaseStudy && progressBarRef.current) {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const progress = maxScroll > 0 ? Math.min(Math.max(y / maxScroll, 0), 1) : 0;
        progressBarRef.current.style.transform = `scaleX(${progress})`;
      }
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(updateOnScroll);
    };

    updateOnScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [isCaseStudy]);

  // Keyboard support while the mobile menu is open: Escape closes, Tab stays inside.
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>("a, button")?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab" || !panel) return;
      const focusables = [buttonRef.current, ...panel.querySelectorAll<HTMLElement>("a, button")].filter(
        (el): el is HTMLElement => Boolean(el),
      );
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    const onResize = () => {
      if (window.innerWidth >= 1024) setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
    };
  }, [open, close]);

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-5">
      <div
        className={`relative mx-auto max-w-[78rem] transform-gpu rounded-2xl border bg-white/95 transition-[box-shadow,border-color] duration-200 supports-[backdrop-filter]:bg-white/92 backdrop-blur-[4px] ${
          scrolled || open ? "border-line shadow-float" : "border-line/70 shadow-none"
        }`}
      >
        <div className="flex h-16 items-center justify-between gap-4 pl-3 pr-2 sm:pl-4">
          <Link href="/" className="group flex min-h-11 items-center gap-3 rounded-lg pr-2" aria-label={`${brandName}, home`}>
            {showAvatar && (
              <Image
                src={profile.portrait?.avatar || profile.portrait?.src || ""}
                alt=""
                width={36}
                height={36}
                loading="eager"
                decoding="async"
                unoptimized={shouldUnoptimizeImage(profile.portrait?.avatar || profile.portrait?.src)}
                className="size-9 rounded-full object-cover ring-1 ring-line"
              />
            )}
            <span className="leading-tight">
              <span className="block text-[0.9375rem] font-semibold tracking-tight text-ink">{brandName}</span>
              {brandRole ? <span className="hidden text-xs text-muted sm:block">{brandRole}</span> : null}
            </span>
          </Link>

          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-1">
              {navItems.map((item: any) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={safeHref(item.href, "/")}
                      aria-current={active ? "page" : undefined}
                      className={`relative inline-flex min-h-10 items-center rounded-lg px-3.5 text-[0.9375rem] font-medium transition-colors duration-200 ${
                        active ? "bg-tint text-ink" : "text-body hover:bg-tint/70 hover:text-ink"
                      }`}
                    >
                      {item.label}
                      <span
                        aria-hidden
                        className={`absolute inset-x-3.5 -bottom-[3px] h-[2px] origin-center rounded-full bg-accent transition-transform duration-300 ease-out ${
                          active ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"
                        }`}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            {highlight && highlight.show !== false && highlight.href ? (() => {
              const highlightActive = isActive(pathname, highlight.href);
              return (
                <Link
                  href={safeHref(highlight.href, "/experience")}
                  aria-current={highlightActive ? "page" : undefined}
                  className={`relative inline-flex min-h-10 items-center rounded-lg px-3 text-[0.9375rem] font-medium transition-colors duration-200 ${
                    highlightActive ? "bg-accent-soft/75 text-accent-strong" : "text-body hover:bg-tint/70 hover:text-ink"
                  }`}
                >
                  {highlight.label}
                  <span
                    aria-hidden
                    className={`absolute inset-x-3 -bottom-[3px] h-[2px] origin-center rounded-full bg-accent transition-transform duration-300 ease-out ${
                      highlightActive ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0"
                    }`}
                  />
                </Link>
              );
            })() : null}
            {showCv && <CVDownload variant="primary" size="sm" cv={profile.cv} label={cvLabel} />}
          </div>

          <button
            ref={buttonRef}
            type="button"
            className="inline-flex size-11 items-center justify-center rounded-xl text-ink transition-colors hover:bg-tint lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <Close className="text-[1.4rem]" /> : <Menu className="text-[1.4rem]" />}
          </button>
        </div>

        <div
          id="mobile-menu"
          ref={panelRef}
          hidden={!open}
          className="border-t border-line px-3 pb-4 pt-2 lg:hidden"
        >
          <nav aria-label="Mobile">
            <ul className="grid gap-0.5">
              {mobileItems.map((item: any) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={safeHref(item.href, "/")}
                      aria-current={active ? "page" : undefined}
                      onClick={() => close(false)}
                      className={`flex min-h-12 items-center justify-between rounded-xl px-3 text-base font-medium transition-colors duration-200 ${
                        active ? "bg-tint text-ink" : "text-body hover:bg-tint/70 hover:text-ink"
                      }`}
                    >
                      {item.label}
                      <span
                        aria-hidden
                        className={`size-1.5 rounded-full bg-accent transition-transform duration-200 ${
                          active ? "scale-100 opacity-100" : "scale-0 opacity-0"
                        }`}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="mt-3 grid gap-2 px-1 sm:grid-cols-2">
            {showCv && <CVDownload variant="primary" showMeta cv={profile.cv} label={cvLabel} />}
            <a href={`mailto:${profile.email}`} className="btn btn-secondary">
              {mobileEmailLabel}
            </a>
          </div>
        </div>
        {!isCaseStudy && (
          <div aria-hidden className="pointer-events-none absolute inset-x-4 bottom-0 h-[2px] overflow-hidden rounded-full">
            <div
              ref={progressBarRef}
              className={`h-full origin-left bg-accent/70 transition-[transform,opacity] duration-150 ease-out ${
                scrolled ? "opacity-100" : "opacity-0"
              }`}
              style={{ transform: "scaleX(0)" }}
            />
          </div>
        )}
      </div>
    </header>
  );
}
