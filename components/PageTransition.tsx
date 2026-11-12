"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

let hasCompletedInitialPaint = false;

/**
 * Applies a subtle entrance motion on client-side public route navigations
 * while keeping initial SSR first-paint instant (no opacity:0 LCP delay) and
 * admin screens instant.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [animate] = useState(() => hasCompletedInitialPaint);

  useEffect(() => {
    hasCompletedInitialPaint = true;
  }, []);

  if (pathname?.startsWith("/admin") || !animate) {
    return <>{children}</>;
  }
  return <div className="motion-safe:animate-page-enter">{children}</div>;
}
