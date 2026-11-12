"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import {
  ArrowUpRight,
  Award,
  Briefcase,
  ChevronDown,
  Close,
  Folder,
  LayoutDashboard,
  LogOut,
  Menu,
  ImageIcon,
  Settings,
  User,
} from "@/components/Icons";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  hasSubmenu?: boolean;
}

const navItems: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/profile", label: "Profile & Site", icon: User, hasSubmenu: true },
  { href: "/admin/projects", label: "Projects", icon: Folder },
  { href: "/admin/experience", label: "Experience", icon: Briefcase },
  { href: "/admin/expertise", label: "Expertise & Approach", icon: Award },
  { href: "/admin/media", label: "Media Library", icon: ImageIcon },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

const profileSubItems = [
  { tab: "hero", label: "Hero & Home Fold" },
  { tab: "nav", label: "Menu & Header" },
  { tab: "footer", label: "Footer Settings" },
  { tab: "identity", label: "Identity & CV" },
  { tab: "about", label: "About Story & Principles" },
  { tab: "contact", label: "Contact Page & Cards" },
  { tab: "seo", label: "SEO & Settings" },
];

const focusRingClass =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e5f5b] focus-visible:ring-offset-2";

function SidebarNav({
  idPrefix,
  onNavigate,
}: {
  idPrefix: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "hero";
  const isProfileSection = pathname.startsWith("/admin/profile");
  const [profileOpen, setProfileOpen] = useState(true);

  useEffect(() => {
    if (isProfileSection) {
      setProfileOpen(true);
    }
  }, [isProfileSection]);

  const submenuId = `${idPrefix}-profile-submenu`;

  return (
    <nav aria-label="Primary admin navigation" className="flex-1 space-y-1">
      {navItems.map((item) => {
        const isActive =
          item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
        const Icon = item.icon;

        if (item.hasSubmenu) {
          return (
            <div key={item.href} className="space-y-1">
              <div
                className={`flex items-center justify-between rounded-xl transition-colors duration-200 ${
                  isActive
                    ? "bg-[#e1eeec] text-[#0a4744] font-semibold"
                    : "text-[#4c535b] hover:bg-[#f3efe8] hover:text-[#191c20]"
                }`}
              >
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={isActive ? "page" : undefined}
                  className={`flex min-h-[40px] flex-1 items-center gap-2.5 rounded-l-xl px-3.5 py-2 text-sm font-medium ${focusRingClass}`}
                >
                  <Icon className="size-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setProfileOpen((prev) => !prev)}
                  aria-expanded={profileOpen}
                  aria-controls={submenuId}
                  aria-label={profileOpen ? "Collapse Profile & Site submenu" : "Expand Profile & Site submenu"}
                  className={`flex min-h-[40px] min-w-[40px] cursor-pointer items-center justify-center rounded-r-xl text-[#4c535b] transition-colors duration-200 hover:text-[#191c20] ${focusRingClass}`}
                >
                  <ChevronDown
                    className={`size-4 transition-transform duration-200 ${
                      profileOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>

              {profileOpen && (
                <div
                  id={submenuId}
                  className="ml-4 space-y-0.5 border-l-2 border-[#d4cdc0] py-1 pl-3"
                >
                  {profileSubItems.map((sub) => {
                    const isSubActive =
                      isProfileSection &&
                      (currentTab === sub.tab || (!searchParams.get("tab") && sub.tab === "hero"));
                    return (
                      <Link
                        key={sub.tab}
                        href={`/admin/profile?tab=${sub.tab}`}
                        onClick={onNavigate}
                        aria-current={isSubActive ? "page" : undefined}
                        className={`block min-h-[34px] rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors duration-200 ${focusRingClass} ${
                          isSubActive
                            ? "bg-[#0e5f5b] font-semibold text-white"
                            : "text-[#4c535b] hover:bg-[#f3efe8] hover:text-[#191c20]"
                        }`}
                      >
                        {sub.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={isActive ? "page" : undefined}
            className={`flex min-h-[40px] items-center gap-2.5 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors duration-200 ${focusRingClass} ${
              isActive
                ? "bg-[#e1eeec] font-semibold text-[#0a4744]"
                : "text-[#4c535b] hover:bg-[#f3efe8] hover:text-[#191c20]"
            }`}
          >
            <Icon className="size-4 shrink-0" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change or Escape key
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileMenuOpen]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (e) {
      console.error(e);
      setLoggingOut(false);
    }
  };

  const currentNavTitle =
    navItems.find((n) =>
      n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href)
    )?.label || "Admin";

  return (
    <div className="flex min-h-screen bg-[#faf8f4]">
      <a href="#admin-main" className="skip-link">
        Skip to main content
      </a>

      {/* Desktop Sidebar */}
      <aside
        aria-label="Admin sidebar"
        className="hidden w-64 shrink-0 flex-col border-r border-[#e6e1d8] bg-white lg:sticky lg:top-0 lg:flex lg:h-screen"
      >
        <div className="flex h-16 items-center gap-3 border-b border-[#e6e1d8] px-5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-[#0e5f5b] text-sm font-bold text-white shadow-sm">
            A
          </div>
          <div className="min-w-0">
            <span className="block truncate text-sm font-bold leading-tight text-[#191c20]">
              Afrin Chishti
            </span>
            <span className="block text-xs font-medium text-[#4c535b]">Portfolio CMS</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3.5">
          <Suspense fallback={<div className="p-2 text-xs text-[#4c535b]">Loading navigation...</div>}>
            <SidebarNav idPrefix="desktop" />
          </Suspense>
        </div>

        <div className="space-y-1.5 border-t border-[#e6e1d8] p-3.5">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex min-h-[38px] items-center justify-between rounded-xl px-3.5 py-2 text-xs font-semibold text-[#0e5f5b] transition-colors duration-200 hover:bg-[#e1eeec] ${focusRingClass}`}
          >
            <span>View Public Site</span>
            <ArrowUpRight className="size-3.5" />
          </a>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className={`flex min-h-[38px] w-full cursor-pointer items-center justify-between rounded-xl px-3.5 py-2 text-left text-xs font-semibold text-[#b91c1c] transition-colors duration-200 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 ${focusRingClass}`}
          >
            <span>{loggingOut ? "Signing out..." : "Log Out"}</span>
            <LogOut className="size-3.5" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#e6e1d8] bg-white/95 px-3 backdrop-blur-sm sm:px-5">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-admin-nav"
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              className={`inline-flex min-h-[40px] min-w-[40px] cursor-pointer items-center justify-center rounded-xl border border-[#d4cdc0] text-[#191c20] transition-colors duration-200 hover:bg-[#f3efe8] lg:hidden ${focusRingClass}`}
            >
              {mobileMenuOpen ? <Close className="size-5" /> : <Menu className="size-5" />}
            </button>
            <h1 className="text-base font-semibold tracking-tight text-[#191c20] sm:text-lg">
              {currentNavTitle}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className={`hidden min-h-[36px] items-center gap-1.5 rounded-xl border border-[#d4cdc0] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#191c20] transition-colors duration-200 hover:border-[#0e5f5b] hover:text-[#0e5f5b] sm:inline-flex ${focusRingClass}`}
            >
              <span>View Site</span>
              <ArrowUpRight className="size-3.5" />
            </a>
            <div
              aria-label="Admin profile badge"
              className="flex size-9 items-center justify-center rounded-full border border-[#b9d6d2] bg-[#e1eeec] text-xs font-bold text-[#0a4744]"
            >
              AC
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            id="mobile-admin-nav"
            className="border-b border-[#e6e1d8] bg-white p-4 shadow-md lg:hidden"
          >
            <Suspense fallback={<div className="text-xs text-[#4c535b]">Loading navigation...</div>}>
              <SidebarNav idPrefix="mobile" onNavigate={() => setMobileMenuOpen(false)} />
            </Suspense>
            <div className="mt-4 space-y-1.5 border-t border-[#e6e1d8] pt-3">
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className={`flex min-h-[40px] items-center justify-between rounded-xl px-3.5 py-2 text-xs font-semibold text-[#0e5f5b] hover:bg-[#e1eeec] ${focusRingClass}`}
              >
                <span>View Public Site</span>
                <ArrowUpRight className="size-3.5" />
              </a>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className={`flex min-h-[40px] w-full cursor-pointer items-center justify-between rounded-xl px-3.5 py-2 text-left text-xs font-semibold text-[#b91c1c] hover:bg-red-50 disabled:opacity-50 ${focusRingClass}`}
              >
                <span>{loggingOut ? "Signing out..." : "Log Out"}</span>
                <LogOut className="size-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Main Content Container */}
        <main id="admin-main" tabIndex={-1} className="flex-1 px-3 py-4 sm:px-5 sm:py-5">
          <div className="mx-auto w-full max-w-[1600px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
