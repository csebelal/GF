import Link from "next/link";
import { CopyEmailButton } from "@/components/CopyEmailButton";
import { CVDownload } from "@/components/CVDownload";
import { ArrowRight, ArrowUpRight, Check, FileText, LinkedIn, Mail, MapPin } from "@/components/Icons";
import { pageMetadata } from "@/lib/metadata";
import { getDbProfile } from "@/lib/db/repository";

export const metadata = pageMetadata({
  title: "Contact",
  description:
    "Contact Afrin Akter Chishti, Salesforce Administrator in Dhaka, Bangladesh, by email or LinkedIn, or download her CV.",
  path: "/contact",
});

const defaultHelpful = [
  "The role or project, and the team it supports",
  "Which Salesforce clouds and connected tools are involved",
  "Your timeline and preferred way to talk",
];

export default async function ContactPage() {
  const profile = await getDbProfile();
  const contact = profile.contactSettings;

  const eyebrow = contact?.eyebrow || "Contact";
  const headline = contact?.headline || "Let’s talk about your Salesforce team.";
  const intro =
    contact?.intro ||
    "I’m glad to hear from recruiters and hiring managers about Salesforce administration and CRM operations roles, and from anyone interested in product work where CRM data and AI meet.";
  const helpfulHeading = contact?.helpfulHeading || "Helpful to include";
  const helpful = contact?.helpful?.length ? contact.helpful : defaultHelpful;

  const emailCard = contact?.emailCard;
  const emailBadge = emailCard?.badge || "Email";
  const displayEmail = emailCard?.customEmail || profile.email;
  const showWriteEmail = emailCard?.showWriteButton !== false;
  const writeEmailLabel = emailCard?.writeButtonText || "Write an email";
  const showCopyEmail = emailCard?.showCopyButton !== false;
  const copyEmailLabel = emailCard?.copyButtonText || "Copy address";

  const linkedinCard = contact?.linkedinCard;
  const showLinkedin = linkedinCard?.show !== false;
  const linkedinTitle = linkedinCard?.label || "LinkedIn";
  const linkedinUrl = linkedinCard?.customUrl || profile.linkedin.url;
  const linkedinLabel = linkedinCard?.displayText || linkedinCard?.customText || "Connect on LinkedIn";

  const locationCard = contact?.locationCard;
  const showLocation = locationCard?.show !== false;
  const locationTitle = locationCard?.label || "Location";
  const locationText = locationCard?.customText || `${profile.location.city}, ${profile.location.country}`;

  const cvCard = contact?.cvCard;
  const showCv = cvCard?.show !== false;
  const cvTitle = cvCard?.label || "CV";
  const cvSubtext = cvCard?.subtext !== undefined ? cvCard.subtext : "Curriculum Vitae";
  const cvButtonLabel = cvCard?.buttonLabel || "Download CV";

  const bottomBanner = contact?.bottomBanner;
  const showBottomBanner = bottomBanner?.show !== false;
  const bannerBoldPrefix = bottomBanner?.boldPrefix || "Not sure yet?";
  const bannerText =
    bottomBanner?.text || "The portfolio and experience pages show how I work and what I’ve done.";
  const primaryBtn = bottomBanner?.primaryButton;
  const showPrimaryBtn = primaryBtn?.show !== false;
  const primaryBtnLabel = primaryBtn?.label || "Portfolio";
  const primaryBtnUrl = primaryBtn?.url || "/portfolio";
  const secondaryBtn = bottomBanner?.secondaryButton;
  const showSecondaryBtn = secondaryBtn?.show !== false;
  const secondaryBtnLabel = secondaryBtn?.label || "Experience";
  const secondaryBtnUrl = secondaryBtn?.url || "/experience";

  return (
    <>
      <section className="relative overflow-hidden">
        <div aria-hidden className="grid-lines absolute inset-0" />
        <div aria-hidden className="absolute -left-40 top-20 size-[32rem] rounded-full bg-accent-soft/60 blur-3xl" />
        <div className="container-page relative grid gap-14 pb-24 pt-14 sm:pt-20 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-6">
            <p className="eyebrow animate-rise">{eyebrow}</p>
            <h1 className="mt-6 animate-rise text-[clamp(2.5rem,5.4vw,4.1rem)] font-semibold leading-[1.04] tracking-[-0.035em] [animation-delay:60ms]">
              {headline}
            </h1>
            <p className="mt-7 max-w-xl animate-rise text-lg leading-relaxed text-body sm:text-xl sm:leading-relaxed [animation-delay:120ms]">
              {intro}
            </p>

            <div className="mt-10 animate-rise [animation-delay:180ms]">
              <h2 className="text-sm font-semibold text-ink">{helpfulHeading}</h2>
              <ul className="mt-4 grid gap-3">
                {helpful.map((item, idx) => (
                  <li key={idx} className="flex gap-3 text-[0.9375rem] text-body">
                    <Check className="mt-0.5 shrink-0 text-accent" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid content-start gap-4 lg:col-span-6">
            <div className="card relative overflow-hidden p-7 sm:p-8 animate-rise [animation-delay:120ms]">
              <div className="flex items-start gap-4">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-ink text-xl text-white">
                  <Mail />
                </span>
                <div className="min-w-0">
                  <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{emailBadge}</h2>
                  <p className="mt-1 break-all text-xl font-semibold tracking-tight text-ink sm:text-2xl">{displayEmail}</p>
                </div>
              </div>
              {(showWriteEmail || showCopyEmail) && (
                <div className="mt-6 flex flex-wrap gap-3">
                  {showWriteEmail && (
                    <a href={`mailto:${displayEmail}`} className="btn btn-primary btn-sm">
                      <Mail /> {writeEmailLabel}
                    </a>
                  )}
                  {showCopyEmail && <CopyEmailButton email={displayEmail} label={copyEmailLabel} />}
                </div>
              )}
            </div>

            {showLinkedin && (
              <a
                href={linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="card group flex items-center gap-4 p-6 transition-shadow hover:shadow-lift animate-rise [animation-delay:180ms]"
              >
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-xl text-accent">
                  <LinkedIn />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-muted">{linkedinTitle}</span>
                  <span className="mt-0.5 block truncate font-semibold text-ink">{linkedinLabel}</span>
                </span>
                <ArrowUpRight className="shrink-0 text-lg text-muted transition-colors group-hover:text-accent" />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              {showLocation && (
                <div className="card flex items-center gap-4 p-6 animate-rise [animation-delay:240ms]">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-tint text-xl text-ink">
                    <MapPin />
                  </span>
                  <div>
                    <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{locationTitle}</h2>
                    <p className="mt-0.5 font-semibold text-ink">{locationText}</p>
                  </div>
                </div>
              )}
              {showCv && (
                <div className="card flex flex-col gap-4 p-6 animate-rise [animation-delay:300ms]">
                  <div className="flex items-center gap-4">
                    <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-tint text-xl text-ink">
                      <FileText />
                    </span>
                    <div>
                      <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{cvTitle}</h2>
                      {cvSubtext ? <p className="mt-0.5 font-semibold text-ink">{cvSubtext}</p> : null}
                    </div>
                  </div>
                  <CVDownload size="sm" label={cvButtonLabel} cv={profile.cv} />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {showBottomBanner && (
        <section className="border-t border-line bg-tint py-16">
          <div className="container-page flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-xl text-[1.0625rem] leading-relaxed text-body">
              {bannerBoldPrefix && <span className="font-semibold text-ink">{bannerBoldPrefix} </span>}
              {bannerText}
            </p>
            {(showPrimaryBtn || showSecondaryBtn) && (
              <div className="flex flex-wrap gap-3">
                {showPrimaryBtn && (
                  <Link href={primaryBtnUrl} className="btn btn-primary">
                    {primaryBtnLabel} <ArrowRight />
                  </Link>
                )}
                {showSecondaryBtn && (
                  <Link href={secondaryBtnUrl} className="btn btn-secondary">
                    {secondaryBtnLabel}
                  </Link>
                )}
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
}
