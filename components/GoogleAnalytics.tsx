"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { isValidGoogleAnalyticsId } from "@/lib/analytics/validators";

export { isValidGoogleAnalyticsId };

interface GoogleAnalyticsProps {
  measurementId?: string;
}

/**
 * Renders Google Analytics (GA4) or Google Tag Manager (GTM) scripts
 * only on public visitor routes (excluding /admin/*).
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

  // Google Tag Manager (GTM-XXXXXXX)
  if (cleanId.startsWith("GTM-")) {
    return (
      <>
        <Script
          id="gtm-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${cleanId}');
            `,
          }}
        />
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${cleanId}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
      </>
    );
  }

  // Google Analytics 4 (G-XXXXXXXXXX) or Universal Analytics (UA-XXXXX-Y)
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
