import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";
import { PublicOnly } from "@/components/PublicOnly";
import { SiteEffects } from "@/components/SiteEffects";
import { profile as staticProfile, site } from "@/content/site";
import { getDbProfile } from "@/lib/db/repository";
import { serializeJsonLd } from "@/lib/seo/schema";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  adjustFontFallback: true,
});

const canonicalBaseUrl =
  process.env.NEXT_PUBLIC_SITE_URL && !/localhost|127\.0\.0\.1/i.test(process.env.NEXT_PUBLIC_SITE_URL)
    ? process.env.NEXT_PUBLIC_SITE_URL
    : "https://afrinchishti.site";

export const metadata: Metadata = {
  metadataBase: new URL(canonicalBaseUrl),
  title: { default: site.titleSuffix, template: `%s · ${site.name}` },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: staticProfile.name, url: staticProfile.linkedin.url }],
  creator: staticProfile.name,
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: site.locale,
    title: site.titleSuffix,
    description: site.description,
    url: "/",
    images: [{ url: "/opengraph-image" }],
  },
  twitter: {
    card: "summary_large_image",
    title: site.titleSuffix,
    description: site.description,
    images: ["/opengraph-image"],
  },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#faf8f4",
  colorScheme: "light",
};

/**
 * Enables scroll reveals only when motion is allowed. If the client script
 * never starts (blocked or failed), the class is removed so nothing stays hidden.
 */
const revealScript = `(function(){try{var d=document.documentElement;if(window.matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window))return;d.classList.add('reveal-on');setTimeout(function(){if(!window.__revealReady)d.classList.remove('reveal-on')},2500)}catch(e){}})();`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const profile = await getDbProfile();
  const configuredSiteUrl = profile.siteMeta?.url;
  const resolvedBaseUrl =
    configuredSiteUrl && !/localhost|127\.0\.0\.1/i.test(configuredSiteUrl)
      ? configuredSiteUrl.replace(/\/+$/, "")
      : canonicalBaseUrl;

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: profile.jobTitle,
    description: profile.siteMeta?.description || site.description,
    image: profile.portrait?.src
      ? `${resolvedBaseUrl}${profile.portrait.src}`
      : `${resolvedBaseUrl}/opengraph-image`,
    worksFor: { "@type": "Organization", name: profile.employer },
    address: { "@type": "PostalAddress", addressLocality: profile.location.city, addressCountry: profile.location.country },
    email: `mailto:${profile.email}`,
    sameAs: [profile.linkedin.url],
    url: resolvedBaseUrl,
    knowsAbout: [
      "Salesforce Administration",
      "Sales Cloud",
      "Service Cloud",
      "Salesforce Flow",
      "CRM Data Quality",
      "HubSpot Integration",
      "SOQL",
      "Data Loader",
      "Agentforce",
    ],
    hasCredential: {
      "@type": "EducationalOccupationalCredential",
      credentialCategory: "certification",
      name: "Salesforce Certified Administrator",
    },
  };

  const headerProfile = {
    name: profile.name,
    shortName: profile.shortName,
    jobTitle: profile.jobTitle,
    email: profile.email,
    portrait: profile.portrait,
    cv: profile.cv,
    headerSettings: profile.headerSettings,
  };

  const footerProfile = {
    name: profile.name,
    employer: profile.employer,
    location: profile.location,
    email: profile.email,
    linkedin: profile.linkedin,
    cv: profile.cv,
    footerSettings: profile.footerSettings,
  };

  return (
    <html lang="en" className={inter.variable} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <link rel="dns-prefetch" href="https://i.ytimg.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
      </head>
      <body className="flex min-h-screen flex-col" suppressHydrationWarning>
        <GoogleAnalytics measurementId={profile.siteMeta?.googleAnalyticsId} />
        <Script id="reveal-init" strategy="beforeInteractive">
          {revealScript}
        </Script>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Header profile={headerProfile} />
        <main id="main" tabIndex={-1} className="flex-1">
          {children}
        </main>
        <PublicOnly>
          <Footer profile={footerProfile} />
        </PublicOnly>
        <SiteEffects />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(personJsonLd) }}
        />
      </body>
    </html>
  );
}
