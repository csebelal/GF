"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { primaryNav, profile as staticProfile } from "@/content/site";
import { CVDownload } from "./CVDownload";
import { Close, Menu } from "./Icons";

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

  const profile = customProfile ?? staticProfile;
  const headerSettings = profile?.headerSettings;
  const navItems = headerSettings?.navItems?.length ? headerSettings.navItems : primaryNav;
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

  const close = useCallback((returnFocus = true) => {
    setOpen(false);
    if (returnFocus) buttonRef.current?.focus();
  }, []);

  // Close the menu after navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
        className={`mx-auto max-w-[78rem] rounded-2xl border bg-white/85 backdrop-blur-md transition-[box-shadow,border-color] duration-300 supports-[backdrop-filter]:bg-white/75 ${
          scrolled || open ? "border-line shadow-float" : "border-line/70 shadow-none"
        }`}
      >
        <div className="flex h-16 items-center justify-between gap-4 pl-3 pr-2 sm:pl-4">
          <Link href="/" className="group flex min-h-11 items-center gap-3 rounded-lg pr-2" aria-label={`${brandName}, home`}>
            {showAvatar && (
              <img
                src={profile.portrait?.avatar || profile.portrait?.src}
                alt=""
                width={36}
                height={36}
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
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`relative inline-flex min-h-10 items-center rounded-lg px-3.5 text-[0.9375rem] font-medium transition-colors ${
                        active ? "bg-tint text-ink" : "text-body hover:bg-tint/70 hover:text-ink"
                      }`}
                    >
                      {item.label}
                      {active ? <span aria-hidden className="absolute inset-x-3.5 -bottom-[3px] h-[2px] rounded-full bg-accent" /> : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            {highlight && highlight.show !== false && highlight.href ? (
              <Link
                href={highlight.href}
                aria-current={isActive(pathname, highlight.href) ? "page" : undefined}
                className={`inline-flex min-h-10 items-center rounded-lg px-3 text-[0.9375rem] font-medium transition-colors ${
                  isActive(pathname, highlight.href) ? "text-accent" : "text-body hover:text-ink"
                }`}
              >
                {highlight.label}
              </Link>
            ) : null}
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
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      onClick={() => close(false)}
                      className={`flex min-h-12 items-center justify-between rounded-xl px-3 text-base font-medium ${
                        active ? "bg-tint text-ink" : "text-body hover:bg-tint/70 hover:text-ink"
                      }`}
                    >
                      {item.label}
                      {active ? <span aria-hidden className="size-1.5 rounded-full bg-accent" /> : null}
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
      </div>
    </header>
  );
}
