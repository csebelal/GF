"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/profile", label: "Profile & Site", hasSubmenu: true },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/experience", label: "Experience" },
  { href: "/admin/expertise", label: "Expertise & Approach" },
  { href: "/admin/media", label: "Media Library" },
  { href: "/admin/settings", label: "Settings" },
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

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
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

  return (
    <nav className="flex-1 space-y-1">
      {navItems.map((item) => {
        const isActive =
          item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);

        if (item.hasSubmenu) {
          return (
            <div key={item.href} className="space-y-1">
              <div
                className={`flex items-center justify-between rounded-lg transition ${
                  isActive
                    ? "bg-[#e1eeec] text-[#0e5f5b] font-semibold"
                    : "text-[#4c535b] hover:bg-[#f3efe8] hover:text-[#191c20]"
                }`}
              >
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className="flex-1 px-3.5 py-2.5 text-sm font-medium"
                >
                  {item.label}
                </Link>
                <button
                  type="button"
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="px-3 py-2 text-xs font-semibold text-[#646b73] hover:text-[#191c20]"
                  aria-label="Toggle Profile & Site submenu"
                >
                  {profileOpen ? "−" : "+"}
                </button>
              </div>

              {profileOpen && (
                <div className="ml-3 border-l-2 border-[#d4cdc0] pl-2.5 space-y-0.5 py-1">
                  {profileSubItems.map((sub) => {
                    const isSubActive =
                      isProfileSection &&
                      (currentTab === sub.tab || (!searchParams.get("tab") && sub.tab === "hero"));
                    return (
                      <Link
                        key={sub.tab}
                        href={`/admin/profile?tab=${sub.tab}`}
                        onClick={onNavigate}
                        className={`block rounded-md px-2.5 py-1.5 text-xs font-medium transition ${
                          isSubActive
                            ? "bg-[#0e5f5b] text-white font-semibold"
                            : "text-[#646b73] hover:bg-[#f3efe8] hover:text-[#191c20]"
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
            className={`block rounded-lg px-3.5 py-2.5 text-sm font-medium transition ${
              isActive
                ? "bg-[#e1eeec] text-[#0e5f5b] font-semibold"
                : "text-[#4c535b] hover:bg-[#f3efe8] hover:text-[#191c20]"
            }`}
          >
            {item.label}
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
    <div className="flex min-h-screen">
      {/* Sidebar Desktop */}
      <aside className="hidden w-64 flex-col border-r border-[#e6e1d8] bg-white lg:flex">
        <div className="flex h-16 items-center gap-3 border-b border-[#e6e1d8] px-6">
          <div className="flex size-9 items-center justify-center rounded-lg bg-[#0e5f5b] text-sm font-bold text-white">
            A
          </div>
          <div>
            <span className="block text-sm font-bold leading-none text-[#191c20]">Afrin Chishti</span>
            <span className="block text-[11px] font-medium text-[#646b73]">Portfolio Admin</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <Suspense fallback={<div className="text-xs text-[#646b73]">Loading navigation...</div>}>
            <SidebarNav />
          </Suspense>
        </div>

        <div className="border-t border-[#e6e1d8] p-4">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between rounded-lg px-3.5 py-2 text-xs font-semibold text-[#0e5f5b] hover:bg-[#e1eeec]"
          >
            <span>View Public Site</span>
          </a>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="mt-2 flex w-full items-center justify-between rounded-lg px-3.5 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            <span>{loggingOut ? "Signing out..." : "Log Out"}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#e6e1d8] bg-white px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg border border-[#d4cdc0] px-2.5 py-1 text-xs font-semibold text-[#4c535b] hover:bg-[#f3efe8] lg:hidden"
              aria-label="Toggle navigation"
            >
              Menu
            </button>
            <h1 className="text-base font-semibold text-[#191c20]">
              {currentNavTitle}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-1.5 rounded-lg border border-[#d4cdc0] px-3 py-1.5 text-xs font-medium text-[#4c535b] hover:border-[#0e5f5b] hover:text-[#0e5f5b] sm:flex"
            >
              <span>View Site</span>
            </a>
            <div className="flex size-8 items-center justify-center rounded-full bg-[#e1eeec] text-xs font-bold text-[#0e5f5b]">
              AD
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="border-b border-[#e6e1d8] bg-white p-4 lg:hidden">
            <Suspense fallback={<div className="text-xs text-[#646b73]">Loading navigation...</div>}>
              <SidebarNav onNavigate={() => setMobileMenuOpen(false)} />
            </Suspense>
            <div className="mt-4 border-t border-[#e6e1d8] pt-3">
              <button
                onClick={handleLogout}
                className="w-full text-left text-xs font-semibold text-red-600"
              >
                Log Out
              </button>
            </div>
          </div>
        )}

        {/* Page Content Container */}
        <main className="flex-1 p-4 sm:p-8">{children}</main>
      </div>
    </div>
  );
}
