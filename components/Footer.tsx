"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SHOW_SAMPLE_PROJECTS } from "@/content/projects";
import { profile as staticProfile } from "@/content/site";
import { CVDownload } from "./CVDownload";
import { ArrowUpRight, LinkedIn, Mail, MapPin } from "./Icons";

const pageLinks = [
  { href: "/", label: "Home" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/expertise", label: "Expertise" },
  { href: "/experience", label: "Experience" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

interface FooterProps {
  profile?: any;
}

export function Footer({ profile: customProfile }: FooterProps = {}) {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const profile = customProfile ?? staticProfile;
  const footerSettings = profile?.footerSettings;
  const year = new Date().getFullYear();

  const bioSummary =
    footerSettings?.bioSummary ||
    `Salesforce Administrator at ${profile.employer}. Automation, CRM data quality, access management and the connected tools around Sales Cloud and Service Cloud.`;

  const showEmail = footerSettings?.showEmailButton !== false;
  const emailLabel = footerSettings?.emailButtonLabel || profile.email;
  const showCv = footerSettings?.showCvButton !== false;
  const cvLabel = footerSettings?.cvButtonLabel || "Download CV";

  const pagesTitle = footerSettings?.pageLinksTitle || "Pages";
  const links = footerSettings?.pageLinks?.length ? footerSettings.pageLinks : pageLinks;

  const connectTitle = footerSettings?.connectTitle || "Connect";
  const showLocation = footerSettings?.showLocation !== false;
  const locationText = footerSettings?.locationLabel || `${profile.location?.city || "Dhaka"}, ${profile.location?.country || "Bangladesh"}`;

  const socialLinks = footerSettings?.socialLinks?.length
    ? footerSettings.socialLinks.filter((s: any) => s.show !== false)
    : [
        { platform: "email", label: "Email", url: `mailto:${profile.email}`, show: true },
        { platform: "linkedin", label: "LinkedIn", url: profile.linkedin?.url, show: true },
      ];

  const copyright = footerSettings?.copyrightText
    ? footerSettings.copyrightText.replace("{year}", String(year)).replace("{name}", profile.name)
    : `© ${year} ${profile.name}`;

  const showNotice =
    footerSettings?.showBottomNotice !== false &&
    (footerSettings?.bottomNotice || SHOW_SAMPLE_PROJECTS);
  const noticeText =
    footerSettings?.bottomNotice ||
    "Projects marked “Sample” are placeholder content that shows how the portfolio works.";

  return (
    <footer className="mt-auto border-t border-line bg-surface">
      <div className="container-page grid gap-12 py-16 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="text-2xl font-semibold tracking-tight text-ink">{profile.name}</p>
          <p className="mt-3 max-w-sm text-[0.9375rem] leading-relaxed text-body">{bioSummary}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            {showEmail && (
              <a href={`mailto:${profile.email}`} className="btn btn-primary btn-sm">
                <Mail className="text-[1.1em]" /> {emailLabel}
              </a>
            )}
            {showCv && <CVDownload size="sm" cv={profile.cv} label={cvLabel} />}
          </div>
        </div>

        <nav aria-label="Footer" className="lg:col-span-3 lg:col-start-7">
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{pagesTitle}</h2>
          <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1 lg:grid-cols-1">
            {links.map((link: any) => (
              <li key={link.href}>
                <Link href={link.href} className="inline-flex min-h-10 items-center text-[0.9375rem] text-body hover:text-ink">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="lg:col-span-3">
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{connectTitle}</h2>
          <ul className="mt-4 grid gap-1 text-[0.9375rem]">
            {socialLinks.map((item: any, idx: number) => {
              const isMail = item.platform === "email" || item.url?.startsWith("mailto:");
              const isLinkedin = item.platform === "linkedin";
              const isExternal = item.url?.startsWith("http");

              return (
                <li key={idx}>
                  <a
                    href={item.url}
                    target={isExternal ? "_blank" : undefined}
                    rel={isExternal ? "noopener noreferrer" : undefined}
                    className="inline-flex min-h-10 items-center gap-2.5 text-body hover:text-ink"
                  >
                    {isMail ? (
                      <Mail className="text-muted" />
                    ) : isLinkedin ? (
                      <LinkedIn className="text-muted" />
                    ) : (
                      <ArrowUpRight className="text-muted" />
                    )}
                    {item.label}
                    {isExternal && !isMail ? (
                      <>
                        <ArrowUpRight className="text-xs text-faint" />
                        <span className="sr-only">(opens in a new tab)</span>
                      </>
                    ) : null}
                  </a>
                </li>
              );
            })}
            {showLocation && (
              <li className="inline-flex min-h-10 items-center gap-2.5 text-body">
                <MapPin className="text-muted" /> {locationText}
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-2 py-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>{copyright}</p>
          {showNotice ? <p>{noticeText}</p> : null}
        </div>
      </div>
    </footer>
  );
}
