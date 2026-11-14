"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

interface GoogleAnalyticsProps {
  measurementId?: string;
}

/**
 * Validates whether the given string is a standard Google Analytics Measurement ID
 * (e.g. G-XXXXXXXXXX) or Universal Analytics ID (UA-XXXXX-Y).
 */
export function isValidGoogleAnalyticsId(id?: string): boolean {
  if (!id) return false;
  const clean = id.trim().toUpperCase();
  return /^(G-[A-Z0-9]+|UA-\d+-\d+)$/i.test(clean);
}

/**
 * Renders Google Analytics 4 (gtag.js) scripts only on public routes (excluding /admin).
 */
export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  const pathname = usePathname();

  if (!measurementId) return null;

  const cleanId = measurementId.trim().toUpperCase();
  if (!isValidGoogleAnalyticsId(cleanId)) return null;

  // Do not track admin users inside /admin dashboard
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${cleanId}`}
      />
      <Script
        id="google-analytics-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${cleanId}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  );
}
