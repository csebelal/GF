"use client";

import { usePathname } from "next/navigation";

/** Renders children only on public (non-/admin) routes. */
export function PublicOnly({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) {
    return null;
  }
  return <>{children}</>;
}
