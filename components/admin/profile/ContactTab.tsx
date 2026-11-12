"use client";

import { ChevronDown, ChevronUp, Close } from "@/components/Icons";
import {
  adminDangerIconBtnClass,
  adminIconBtnClass,
} from "@/components/admin/ui/FormPrimitives";
import type { ProfileTabProps } from "./types";

export function ContactTab({ profile, setProfile }: ProfileTabProps) {
  const updateContact = (patch: Record<string, unknown>) => {
    setProfile({
      ...profile,
      contactSettings: {
        ...(profile.contactSettings || {}),
        ...patch,
      },
    });
  };

  return (
    <div className="space-y-6">
      {/* Live Preview of Contact Page */}
      <div className="rounded-xl border border-[#d2ddd9] bg-gradient-to-br from-[#f8faf9] to-[#edf4f2] p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-[#dce6e3]">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#0e5f5b]">
            Live Contact Page Preview
          </span>
          <span className="text-[11px] text-[#646b73]">Rendered across /contact</span>
        </div>

        <div className="mt-4 grid gap-5 lg:grid-cols-12 text-[#191c20]">
          {/* Left Column Preview */}
          <div className="lg:col-span-6 space-y-3">
            <span className="inline-block rounded-full border border-[#dce6e3] bg-white px-2.5 py-0.5 text-[10px] font-semibold text-[#0e5f5b]">
              {profile.contactSettings?.eyebrow || "Contact"}
            </span>
            <h4 className="text-lg font-bold leading-tight">
              {profile.contactSettings?.headline || "Let’s talk about your Salesforce team."}
            </h4>
            <p className="text-xs text-[#4c535b] line-clamp-2">
              {profile.contactSettings?.intro || "I’m glad to hear from recruiters and hiring managers..."}
            </p>
            <div className="pt-2">
              <span className="text-[11px] font-bold text-[#191c20]">
                {profile.contactSettings?.helpfulHeading || "Helpful to include"}:
              </span>
              <ul className="mt-1 space-y-1">
                {(profile.contactSettings?.helpful || []).slice(0, 3).map((item: string, i: number) => (
                  <li key={i} className="text-[11px] text-[#4c535b] flex items-center gap-1.5">
                    <span className="text-[#0e5f5b]">✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column Preview (Cards) */}
          <div className="lg:col-span-6 space-y-2">
            {/* Email Card Preview */}
            <div className="rounded-lg border border-[#dce6e3] bg-white p-3 shadow-xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#646b73]">
                {profile.contactSettings?.emailCard?.badge || "Email"}
              </div>
              <div className="text-xs font-semibold text-[#191c20] truncate">
                {profile.contactSettings?.emailCard?.customEmail || profile.email}
              </div>
              <div className="mt-2 flex gap-1.5">
                {profile.contactSettings?.emailCard?.showWriteButton !== false && (
                  <span className="rounded bg-[#0e5f5b] px-2 py-0.5 text-[10px] font-medium text-white">
                    {profile.contactSettings?.emailCard?.writeButtonText || "Write an email"}
                  </span>
                )}
                {profile.contactSettings?.emailCard?.showCopyButton !== false && (
                  <span className="rounded border border-[#dce6e3] bg-[#f8faf9] px-2 py-0.5 text-[10px] font-medium text-[#4c535b]">
                    {profile.contactSettings?.emailCard?.copyButtonText || "Copy address"}
                  </span>
                )}
              </div>
            </div>

            {/* LinkedIn Card Preview */}
            {profile.contactSettings?.linkedinCard?.show !== false && (
              <div className="rounded-lg border border-[#dce6e3] bg-white px-3 py-2 flex items-center justify-between">
                <div>
                  <div className="text-[9px] font-bold uppercase text-[#646b73]">
                    {profile.contactSettings?.linkedinCard?.label || "LinkedIn"}
                  </div>
                  <div className="text-xs font-semibold text-[#191c20]">
                    {profile.contactSettings?.linkedinCard?.displayText || "Connect on LinkedIn"}
                  </div>
                </div>
                <span className="text-xs text-[#0e5f5b]">↗</span>
              </div>
            )}

            {/* Location & CV Row Preview */}
            <div className="grid grid-cols-2 gap-2">
              {profile.contactSettings?.locationCard?.show !== false && (
                <div className="rounded-lg border border-[#dce6e3] bg-white px-3 py-2">
                  <div className="text-[9px] font-bold uppercase text-[#646b73]">
                    {profile.contactSettings?.locationCard?.label || "Location"}
                  </div>
                  <div className="text-xs font-semibold text-[#191c20] truncate">
                    {profile.contactSettings?.locationCard?.customText ||
                      `${profile.location?.city || "Dhaka"}, ${profile.location?.country || "Bangladesh"}`}
                  </div>
                </div>
              )}

              {profile.contactSettings?.cvCard?.show !== false && (
                <div className="rounded-lg border border-[#dce6e3] bg-white px-3 py-2">
                  <div className="text-[9px] font-bold uppercase text-[#646b73]">
                    {profile.contactSettings?.cvCard?.label || "CV"}
                  </div>
                  <div className="text-xs font-semibold text-[#191c20] truncate">
                    {profile.contactSettings?.cvCard?.subtext ?? "Curriculum Vitae"}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Banner Preview */}
        {profile.contactSettings?.bottomBanner?.show !== false && (
          <div className="mt-4 rounded-lg border border-[#dce6e3] bg-[#f3efe8] px-3.5 py-2.5 flex items-center justify-between text-xs">
            <div>
              <span className="font-bold text-[#191c20]">
                {profile.contactSettings?.bottomBanner?.boldPrefix || "Not sure yet?"}{" "}
              </span>
              <span className="text-[#4c535b]">
                {profile.contactSettings?.bottomBanner?.text ||
                  "The portfolio and experience pages show how I work..."}
              </span>
            </div>
            <div className="flex gap-1.5 shrink-0 ml-3">
              {profile.contactSettings?.bottomBanner?.primaryButton?.show !== false && (
                <span className="rounded bg-[#191c20] px-2 py-0.5 text-[10px] font-medium text-white">
                  {profile.contactSettings?.bottomBanner?.primaryButton?.label || "Portfolio"} →
                </span>
              )}
              {profile.contactSettings?.bottomBanner?.secondaryButton?.show !== false && (
                <span className="rounded border border-[#d4cdc0] bg-white px-2 py-0.5 text-[10px] font-medium text-[#191c20]">
                  {profile.contactSettings?.bottomBanner?.secondaryButton?.label || "Experience"}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Section 1: Main Copy & Header (Left Column) */}
      <div className="rounded-xl border border-[#e6e1d8] bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#0e5f5b]">
          1. Main Header & Checklist Narrative (Left Column)
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-[#4c535b]">Small Eyebrow Pill</label>
            <input
              type="text"
              value={profile.contactSettings?.eyebrow ?? "Contact"}
              onChange={(e) => updateContact({ eyebrow: e.target.value })}
              placeholder="e.g. Contact or Get in Touch"
              className="mt-1 w-full rounded-lg border border-[#d4cdc0] px-3 py-2 text-sm text-[#191c20]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4c535b]">Checklist Section Heading</label>
            <input
              type="text"
              value={profile.contactSettings?.helpfulHeading ?? "Helpful to include"}
              onChange={(e) => updateContact({ helpfulHeading: e.target.value })}
              placeholder="e.g. Helpful to include"
              className="mt-1 w-full rounded-lg border border-[#d4cdc0] px-3 py-2 text-sm text-[#191c20]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#4c535b]">Main Contact Headline</label>
          <input
            type="text"
            value={profile.contactSettings?.headline || ""}
            onChange={(e) => updateContact({ headline: e.target.value })}
            placeholder="Let’s talk about your Salesforce team."
            className="mt-1 w-full rounded-lg border border-[#d4cdc0] px-3 py-2 text-sm text-[#191c20]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#4c535b]">Intro Paragraph</label>
          <textarea
            rows={3}
            value={profile.contactSettings?.intro || ""}
            onChange={(e) => updateContact({ intro: e.target.value })}
            className="mt-1 w-full rounded-lg border border-[#d4cdc0] px-3 py-2 text-sm text-[#191c20]"
          />
        </div>

        {/* Checklist items */}
        <div className="space-y-2 pt-2 border-t border-[#e6e1d8]">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#191c20]">Checklist Bullets</span>
              <span className="ml-2 text-[11px] text-[#646b73]">
                ({(profile.contactSettings?.helpful || []).length} items)
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                const helpful = [...(profile.contactSettings?.helpful || [])];
                helpful.push("New helpful tip or requirement");
                updateContact({ helpful });
              }}
              className="rounded bg-[#0e5f5b] px-2.5 py-1 text-xs font-semibold text-white hover:bg-[#0a4744]"
            >
              + Add Item
            </button>
          </div>

          <div className="space-y-2">
            {(profile.contactSettings?.helpful || []).map((tip: string, idx: number) => (
              <div key={idx} className="flex gap-2 items-center bg-[#faf9f6] p-2 rounded-lg border border-[#e6e1d8]">
                <span className="text-xs font-bold text-[#0e5f5b] w-5 text-center">✓</span>
                <input
                  type="text"
                  value={tip}
                  onChange={(e) => {
                    const helpful = [...(profile.contactSettings?.helpful || [])];
                    helpful[idx] = e.target.value;
                    updateContact({ helpful });
                  }}
                  className="flex-1 rounded border border-[#d4cdc0] bg-white px-2.5 py-1 text-xs text-[#191c20]"
                />
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => {
                      if (idx === 0) return;
                      const helpful = [...(profile.contactSettings?.helpful || [])];
                      const temp = helpful[idx - 1];
                      helpful[idx - 1] = helpful[idx];
                      helpful[idx] = temp;
                      updateContact({ helpful });
                    }}
                    className={adminIconBtnClass}
                    aria-label={`Move checklist item ${idx + 1} up`}
                  >
                    <ChevronUp className="size-4" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === (profile.contactSettings?.helpful || []).length - 1}
                    onClick={() => {
                      const helpful = [...(profile.contactSettings?.helpful || [])];
                      if (idx >= helpful.length - 1) return;
                      const temp = helpful[idx + 1];
                      helpful[idx + 1] = helpful[idx];
                      helpful[idx] = temp;
                      updateContact({ helpful });
                    }}
                    className={adminIconBtnClass}
                    aria-label={`Move checklist item ${idx + 1} down`}
                  >
                    <ChevronDown className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const helpful = [...(profile.contactSettings?.helpful || [])];
                      helpful.splice(idx, 1);
                      updateContact({ helpful });
                    }}
                    className={adminDangerIconBtnClass}
                    aria-label={`Delete checklist item ${idx + 1}`}
                  >
                    <Close className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 2: Email Action Card Settings */}
      <div className="rounded-xl border border-[#e6e1d8] bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#0e5f5b]">
          2. Email Action Card (Top Right)
        </h3>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-[#4c535b]">Badge / Category Label</label>
            <input
              type="text"
              value={profile.contactSettings?.emailCard?.badge ?? "Email"}
              onChange={(e) =>
                updateContact({
                  emailCard: { ...(profile.contactSettings?.emailCard || {}), badge: e.target.value },
                })
              }
              placeholder="e.g. Email"
              className="mt-1 w-full rounded-lg border border-[#d4cdc0] px-3 py-2 text-sm text-[#191c20]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4c535b]">
              Custom Email Override <span className="font-normal text-[#646b73]">(Leave blank to use {profile.email})</span>
            </label>
            <input
              type="email"
              value={profile.contactSettings?.emailCard?.customEmail || ""}
              onChange={(e) =>
                updateContact({
                  emailCard: { ...(profile.contactSettings?.emailCard || {}), customEmail: e.target.value },
                })
              }
              placeholder={profile.email}
              className="mt-1 w-full rounded-lg border border-[#d4cdc0] px-3 py-2 text-sm text-[#191c20]"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-[#e6e1d8]">
          {/* Write Email Button */}
          <div className="rounded-lg border border-[#e6e1d8] p-3 bg-[#faf9f6] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#191c20]">&quot;Write an email&quot; Button</span>
              <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.contactSettings?.emailCard?.showWriteButton !== false}
                  onChange={(e) =>
                    updateContact({
                      emailCard: {
                        ...(profile.contactSettings?.emailCard || {}),
                        showWriteButton: e.target.checked,
                      },
                    })
                  }
                  className="size-3.5 rounded border-[#d4cdc0] text-[#0e5f5b]"
                />
                <span>Show</span>
              </label>
            </div>
            <input
              type="text"
              value={profile.contactSettings?.emailCard?.writeButtonText ?? "Write an email"}
              onChange={(e) =>
                updateContact({
                  emailCard: {
                    ...(profile.contactSettings?.emailCard || {}),
                    writeButtonText: e.target.value,
                  },
                })
              }
              className="w-full rounded border border-[#d4cdc0] bg-white px-2.5 py-1.5 text-xs text-[#191c20]"
            />
          </div>

          {/* Copy Email Button */}
          <div className="rounded-lg border border-[#e6e1d8] p-3 bg-[#faf9f6] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#191c20]">&quot;Copy address&quot; Button</span>
              <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.contactSettings?.emailCard?.showCopyButton !== false}
                  onChange={(e) =>
                    updateContact({
                      emailCard: {
                        ...(profile.contactSettings?.emailCard || {}),
                        showCopyButton: e.target.checked,
                      },
                    })
                  }
                  className="size-3.5 rounded border-[#d4cdc0] text-[#0e5f5b]"
                />
                <span>Show</span>
              </label>
            </div>
            <input
              type="text"
              value={profile.contactSettings?.emailCard?.copyButtonText ?? "Copy address"}
              onChange={(e) =>
                updateContact({
                  emailCard: {
                    ...(profile.contactSettings?.emailCard || {}),
                    copyButtonText: e.target.value,
                  },
                })
              }
              className="w-full rounded border border-[#d4cdc0] bg-white px-2.5 py-1.5 text-xs text-[#191c20]"
            />
          </div>
        </div>
      </div>

      {/* Section 3: LinkedIn Action Card Settings */}
      <div className="rounded-xl border border-[#e6e1d8] bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#0e5f5b]">3. LinkedIn Action Card</h3>
          <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={profile.contactSettings?.linkedinCard?.show !== false}
              onChange={(e) =>
                updateContact({
                  linkedinCard: { ...(profile.contactSettings?.linkedinCard || {}), show: e.target.checked },
                })
              }
              className="size-3.5 rounded border-[#d4cdc0] text-[#0e5f5b]"
            />
            <span>Visible</span>
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold text-[#4c535b]">Card Label</label>
            <input
              type="text"
              value={profile.contactSettings?.linkedinCard?.label ?? "LinkedIn"}
              onChange={(e) =>
                updateContact({
                  linkedinCard: { ...(profile.contactSettings?.linkedinCard || {}), label: e.target.value },
                })
              }
              className="mt-1 w-full rounded-lg border border-[#d4cdc0] px-3 py-2 text-sm text-[#191c20]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[#4c535b]">
                Display Text <span className="font-normal text-[#646b73]">(Card action/name)</span>
              </label>
            </div>
            <input
              type="text"
              value={profile.contactSettings?.linkedinCard?.displayText ?? "Connect on LinkedIn"}
              onChange={(e) =>
                updateContact({
                  linkedinCard: {
                    ...(profile.contactSettings?.linkedinCard || {}),
                    displayText: e.target.value,
                  },
                })
              }
              placeholder="e.g. Connect on LinkedIn"
              className="mt-1 w-full rounded-lg border border-[#d4cdc0] px-3 py-2 text-sm text-[#191c20]"
            />
            <div className="mt-1 flex flex-wrap gap-1 text-[10px]">
              <span className="text-[#646b73]">Presets:</span>
              {["Connect on LinkedIn", "View LinkedIn Profile", profile.name || "Afrin Akter Chishti"].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() =>
                    updateContact({
                      linkedinCard: { ...(profile.contactSettings?.linkedinCard || {}), displayText: preset },
                    })
                  }
                  className="rounded bg-[#f3efe8] px-1.5 py-0.5 text-[#0e5f5b] hover:bg-[#e1eeec]"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4c535b]">
              LinkedIn Link URL <span className="font-normal text-[#646b73]">(Destination)</span>
            </label>
            <input
              type="url"
              value={profile.contactSettings?.linkedinCard?.customUrl || ""}
              onChange={(e) =>
                updateContact({
                  linkedinCard: { ...(profile.contactSettings?.linkedinCard || {}), customUrl: e.target.value },
                })
              }
              placeholder={profile.linkedin?.url || "https://linkedin.com/..."}
              className="mt-1 w-full rounded-lg border border-[#d4cdc0] px-3 py-2 text-sm text-[#191c20]"
            />
          </div>
        </div>
      </div>

      {/* Section 4: Location & CV Download Cards */}
      <div className="grid gap-6 sm:grid-cols-2">
        {/* Location Card */}
        <div className="rounded-xl border border-[#e6e1d8] bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#0e5f5b]">4. Location Card</h3>
            <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={profile.contactSettings?.locationCard?.show !== false}
                onChange={(e) =>
                  updateContact({
                    locationCard: { ...(profile.contactSettings?.locationCard || {}), show: e.target.checked },
                  })
                }
                className="size-3.5 rounded border-[#d4cdc0] text-[#0e5f5b]"
              />
              <span>Visible</span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4c535b]">Card Label</label>
            <input
              type="text"
              value={profile.contactSettings?.locationCard?.label ?? "Location"}
              onChange={(e) =>
                updateContact({
                  locationCard: { ...(profile.contactSettings?.locationCard || {}), label: e.target.value },
                })
              }
              className="mt-1 w-full rounded-lg border border-[#d4cdc0] px-3 py-2 text-sm text-[#191c20]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4c535b]">
              Custom Location Text <span className="font-normal text-[#646b73]">(Override city/country)</span>
            </label>
            <input
              type="text"
              value={profile.contactSettings?.locationCard?.customText || ""}
              onChange={(e) =>
                updateContact({
                  locationCard: {
                    ...(profile.contactSettings?.locationCard || {}),
                    customText: e.target.value,
                  },
                })
              }
              placeholder={`${profile.location?.city || "Dhaka"}, ${profile.location?.country || "Bangladesh"}`}
              className="mt-1 w-full rounded-lg border border-[#d4cdc0] px-3 py-2 text-sm text-[#191c20]"
            />
          </div>
        </div>

        {/* CV Download Card */}
        <div className="rounded-xl border border-[#e6e1d8] bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#0e5f5b]">5. CV Card</h3>
            <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={profile.contactSettings?.cvCard?.show !== false}
                onChange={(e) =>
                  updateContact({
                    cvCard: { ...(profile.contactSettings?.cvCard || {}), show: e.target.checked },
                  })
                }
                className="size-3.5 rounded border-[#d4cdc0] text-[#0e5f5b]"
              />
              <span>Visible</span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4c535b]">Card Label</label>
            <input
              type="text"
              value={profile.contactSettings?.cvCard?.label ?? "CV"}
              onChange={(e) =>
                updateContact({
                  cvCard: { ...(profile.contactSettings?.cvCard || {}), label: e.target.value },
                })
              }
              className="mt-1 w-full rounded-lg border border-[#d4cdc0] px-3 py-2 text-sm text-[#191c20]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4c535b]">
              Card Subtext{" "}
              <span className="font-normal text-[#646b73]">(Leave blank for no subtext; no PDF/size needed)</span>
            </label>
            <input
              type="text"
              value={profile.contactSettings?.cvCard?.subtext ?? "Curriculum Vitae"}
              onChange={(e) =>
                updateContact({
                  cvCard: { ...(profile.contactSettings?.cvCard || {}), subtext: e.target.value },
                })
              }
              placeholder="e.g. Curriculum Vitae or Official Resume"
              className="mt-1 w-full rounded-lg border border-[#d4cdc0] px-3 py-2 text-sm text-[#191c20]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4c535b]">Button Label</label>
            <input
              type="text"
              value={profile.contactSettings?.cvCard?.buttonLabel ?? "Download CV"}
              onChange={(e) =>
                updateContact({
                  cvCard: { ...(profile.contactSettings?.cvCard || {}), buttonLabel: e.target.value },
                })
              }
              className="mt-1 w-full rounded-lg border border-[#d4cdc0] px-3 py-2 text-sm text-[#191c20]"
            />
          </div>
        </div>
      </div>

      {/* Section 5: Bottom "Not sure yet?" Callout Banner */}
      <div className="rounded-xl border border-[#e6e1d8] bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#0e5f5b]">
            6. Bottom &quot;Not sure yet?&quot; Callout Banner
          </h3>
          <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={profile.contactSettings?.bottomBanner?.show !== false}
              onChange={(e) =>
                updateContact({
                  bottomBanner: {
                    ...(profile.contactSettings?.bottomBanner || {}),
                    show: e.target.checked,
                  },
                })
              }
              className="size-3.5 rounded border-[#d4cdc0] text-[#0e5f5b]"
            />
            <span>Banner Visible</span>
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-[#4c535b]">Bold Title Prefix</label>
            <input
              type="text"
              value={profile.contactSettings?.bottomBanner?.boldPrefix ?? "Not sure yet?"}
              onChange={(e) =>
                updateContact({
                  bottomBanner: {
                    ...(profile.contactSettings?.bottomBanner || {}),
                    boldPrefix: e.target.value,
                  },
                })
              }
              className="mt-1 w-full rounded-lg border border-[#d4cdc0] px-3 py-2 text-sm text-[#191c20]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4c535b]">Narrative Text</label>
            <input
              type="text"
              value={
                profile.contactSettings?.bottomBanner?.text ??
                "The portfolio and experience pages show how I work and what I’ve done."
              }
              onChange={(e) =>
                updateContact({
                  bottomBanner: {
                    ...(profile.contactSettings?.bottomBanner || {}),
                    text: e.target.value,
                  },
                })
              }
              className="mt-1 w-full rounded-lg border border-[#d4cdc0] px-3 py-2 text-sm text-[#191c20]"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-[#e6e1d8]">
          {/* Primary Banner Button */}
          <div className="rounded-lg border border-[#e6e1d8] p-3 bg-[#faf9f6] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#191c20]">Primary Button</span>
              <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.contactSettings?.bottomBanner?.primaryButton?.show !== false}
                  onChange={(e) =>
                    updateContact({
                      bottomBanner: {
                        ...(profile.contactSettings?.bottomBanner || {}),
                        primaryButton: {
                          ...(profile.contactSettings?.bottomBanner?.primaryButton || {}),
                          show: e.target.checked,
                        },
                      },
                    })
                  }
                  className="size-3.5 rounded border-[#d4cdc0] text-[#0e5f5b]"
                />
                <span>Show</span>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-[#646b73]">Label</label>
                <input
                  type="text"
                  value={profile.contactSettings?.bottomBanner?.primaryButton?.label ?? "Portfolio"}
                  onChange={(e) =>
                    updateContact({
                      bottomBanner: {
                        ...(profile.contactSettings?.bottomBanner || {}),
                        primaryButton: {
                          ...(profile.contactSettings?.bottomBanner?.primaryButton || {}),
                          label: e.target.value,
                        },
                      },
                    })
                  }
                  className="mt-1 w-full rounded border border-[#d4cdc0] bg-white px-2 py-1 text-xs text-[#191c20]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-[#646b73]">Link URL</label>
                <input
                  type="text"
                  value={profile.contactSettings?.bottomBanner?.primaryButton?.url ?? "/portfolio"}
                  onChange={(e) =>
                    updateContact({
                      bottomBanner: {
                        ...(profile.contactSettings?.bottomBanner || {}),
                        primaryButton: {
                          ...(profile.contactSettings?.bottomBanner?.primaryButton || {}),
                          url: e.target.value,
                        },
                      },
                    })
                  }
                  className="mt-1 w-full rounded border border-[#d4cdc0] bg-white px-2 py-1 text-xs text-[#191c20]"
                />
              </div>
            </div>
          </div>

          {/* Secondary Banner Button */}
          <div className="rounded-lg border border-[#e6e1d8] p-3 bg-[#faf9f6] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#191c20]">Secondary Button</span>
              <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.contactSettings?.bottomBanner?.secondaryButton?.show !== false}
                  onChange={(e) =>
                    updateContact({
                      bottomBanner: {
                        ...(profile.contactSettings?.bottomBanner || {}),
                        secondaryButton: {
                          ...(profile.contactSettings?.bottomBanner?.secondaryButton || {}),
                          show: e.target.checked,
                        },
                      },
                    })
                  }
                  className="size-3.5 rounded border-[#d4cdc0] text-[#0e5f5b]"
                />
                <span>Show</span>
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-semibold text-[#646b73]">Label</label>
                <input
                  type="text"
                  value={profile.contactSettings?.bottomBanner?.secondaryButton?.label ?? "Experience"}
                  onChange={(e) =>
                    updateContact({
                      bottomBanner: {
                        ...(profile.contactSettings?.bottomBanner || {}),
                        secondaryButton: {
                          ...(profile.contactSettings?.bottomBanner?.secondaryButton || {}),
                          label: e.target.value,
                        },
                      },
                    })
                  }
                  className="mt-1 w-full rounded border border-[#d4cdc0] bg-white px-2 py-1 text-xs text-[#191c20]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-[#646b73]">Link URL</label>
                <input
                  type="text"
                  value={profile.contactSettings?.bottomBanner?.secondaryButton?.url ?? "/experience"}
                  onChange={(e) =>
                    updateContact({
                      bottomBanner: {
                        ...(profile.contactSettings?.bottomBanner || {}),
                        secondaryButton: {
                          ...(profile.contactSettings?.bottomBanner?.secondaryButton || {}),
                          url: e.target.value,
                        },
                      },
                    })
                  }
                  className="mt-1 w-full rounded border border-[#d4cdc0] bg-white px-2 py-1 text-xs text-[#191c20]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
