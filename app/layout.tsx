import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { SiteEffects } from "@/components/SiteEffects";
import { profile as staticProfile, site } from "@/content/site";
import { getDbProfile } from "@/lib/db/repository";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  adjustFontFallback: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
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
  },
  twitter: { card: "summary_large_image", title: site.titleSuffix, description: site.description },
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

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name,
    jobTitle: profile.jobTitle,
    worksFor: { "@type": "Organization", name: profile.employer },
    address: { "@type": "PostalAddress", addressLocality: profile.location.city, addressCountry: profile.location.country },
    email: `mailto:${profile.email}`,
    sameAs: [profile.linkedin.url],
    url: profile.siteMeta?.url || site.url,
  };

  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: revealScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </head>
      <body className="flex min-h-screen flex-col">
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Header profile={profile} />
        <main id="main" tabIndex={-1} className="flex-1">
          {children}
        </main>
        <Footer profile={profile} />
        <SiteEffects />
      </body>
    </html>
  );
}
