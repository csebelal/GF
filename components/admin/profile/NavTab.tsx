"use client";

import { ChevronDown, ChevronUp, Close } from "@/components/Icons";
import {
  adminDangerIconBtnClass,
  adminIconBtnClass,
} from "@/components/admin/ui/FormPrimitives";
import type { ProfileTabProps } from "./types";

const NAV_PRESETS = [
  { label: "Home", href: "/" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Expertise", href: "/expertise" },
  { label: "Experience", href: "/experience" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function NavTab({ profile, setProfile }: ProfileTabProps) {
  return (
    <div className="space-y-6">
      {/* Header Preview */}
      <div className="rounded-xl border border-[#d2ddd9] bg-gradient-to-br from-[#f8faf9] to-[#edf4f2] p-4 shadow-sm">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#0e5f5b]">
          Header Live Preview
        </span>
        <div className="mt-3 flex items-center justify-between rounded-xl border border-[#e6e1d8] bg-white/95 px-4 py-2.5 shadow-sm">
          <div className="flex items-center gap-3">
            {profile.headerSettings?.showAvatar !== false && (
              <img
                src={profile.portrait?.avatar || profile.portrait?.src}
                alt=""
                className="size-8 rounded-full object-cover ring-1 ring-[#e6e1d8]"
              />
            )}
            <div>
              <span className="block text-xs font-bold text-[#191c20]">
                {profile.headerSettings?.brandTitle || profile.name || "Afrin Akter Chishti"}
              </span>
              <span className="block text-[10px] text-[#646b73]">
                {profile.headerSettings?.brandSubtitle !== undefined && profile.headerSettings?.brandSubtitle !== ""
                  ? profile.headerSettings.brandSubtitle
                  : profile.jobTitle || "Salesforce Administrator"}
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            {(profile.headerSettings?.navItems || []).map((item: any, i: number) => (
              <span key={i} className="rounded px-2 py-1 text-xs font-medium text-[#4c535b] bg-[#faf9f6]">
                {item.label}
              </span>
            ))}
            {profile.headerSettings?.highlightLink?.show !== false && profile.headerSettings?.highlightLink?.label && (
              <span className="text-xs font-semibold text-[#0e5f5b]">
                {profile.headerSettings.highlightLink.label}
              </span>
            )}
            {profile.headerSettings?.showCvButton !== false && (
              <span className="rounded-md bg-[#0e5f5b] px-2.5 py-1 text-xs font-semibold text-white">
                {profile.headerSettings?.cvButtonLabel || "Download CV"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Section 1: Header Brand Identity */}
      <div className="rounded-xl border border-[#e6e1d8] bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#0e5f5b]">1. Header Brand & Logo</h3>
        <div className="grid gap-4 sm:grid-cols-3 items-end">
          <div>
            <label className="block text-xs font-semibold text-[#4c535b]">Brand Name in Header</label>
            <input
              type="text"
              value={profile.headerSettings?.brandTitle ?? ""}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  headerSettings: { ...(profile.headerSettings || {}), brandTitle: e.target.value },
                })
              }
              placeholder={profile.name || "Afrin Akter Chishti"}
              className="mt-1 w-full rounded-lg border border-[#d4cdc0] px-3 py-2 text-sm text-[#191c20]"
            />
            <p className="mt-1 text-[11px] text-[#646b73]">Leave empty to use your full profile name.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4c535b]">Job Title / Tagline in Header</label>
            <input
              type="text"
              value={profile.headerSettings?.brandSubtitle ?? ""}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  headerSettings: { ...(profile.headerSettings || {}), brandSubtitle: e.target.value },
                })
              }
              placeholder={profile.jobTitle || "Salesforce Administrator"}
              className="mt-1 w-full rounded-lg border border-[#d4cdc0] px-3 py-2 text-sm text-[#191c20]"
            />
            <p className="mt-1 text-[11px] text-[#646b73]">Sub-label under the name (desktop only).</p>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer pt-2 sm:pt-0">
              <input
                type="checkbox"
                checked={profile.headerSettings?.showAvatar !== false}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    headerSettings: { ...(profile.headerSettings || {}), showAvatar: e.target.checked },
                  })
                }
                className="size-4 rounded border-[#d4cdc0] text-[#0e5f5b] focus:ring-[#0e5f5b]"
              />
              <span className="text-xs font-medium text-[#191c20]">Show Avatar Icon in Header</span>
            </label>
          </div>
        </div>
      </div>

      {/* Section 2: Navigation Links */}
      <div className="rounded-xl border border-[#e6e1d8] bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#0e5f5b]">2. Menu Navigation Links</h3>
            <p className="text-xs text-[#646b73]">Add, edit, or reorder the links shown in the top navigation bar.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              const current = profile.headerSettings?.navItems || [];
              setProfile({
                ...profile,
                headerSettings: {
                  ...(profile.headerSettings || {}),
                  navItems: [...current, { label: "New Link", href: "/new-page" }],
                },
              });
            }}
            className="rounded-md bg-[#e1eeec] px-3 py-1.5 text-xs font-semibold text-[#0e5f5b] hover:bg-[#d0e5e2]"
          >
            + Add Link
          </button>
        </div>

        <div className="space-y-3">
          {(profile.headerSettings?.navItems || []).map((item: any, idx: number) => (
            <div key={idx} className="flex items-center gap-3 rounded-lg border border-[#e6e1d8] p-3 bg-[#faf9f6]">
              <div className="w-1/3">
                <label className="block text-[10px] font-semibold text-[#646b73]">Link Label</label>
                <input
                  type="text"
                  value={item.label || ""}
                  onChange={(e) => {
                    const updated = [...(profile.headerSettings?.navItems || [])];
                    updated[idx] = { ...updated[idx], label: e.target.value };
                    setProfile({
                      ...profile,
                      headerSettings: { ...(profile.headerSettings || {}), navItems: updated },
                    });
                  }}
                  placeholder="e.g. Portfolio"
                  className="mt-0.5 w-full rounded-md border border-[#d4cdc0] bg-white px-2.5 py-1.5 text-xs text-[#191c20]"
                />
              </div>

              <div className="flex-1">
                <label className="block text-[10px] font-semibold text-[#646b73]">Destination URL (href)</label>
                <input
                  type="text"
                  value={item.href || ""}
                  onChange={(e) => {
                    const updated = [...(profile.headerSettings?.navItems || [])];
                    updated[idx] = { ...updated[idx], href: e.target.value };
                    setProfile({
                      ...profile,
                      headerSettings: { ...(profile.headerSettings || {}), navItems: updated },
                    });
                  }}
                  placeholder="e.g. /portfolio"
                  className="mt-0.5 w-full rounded-md border border-[#d4cdc0] bg-white px-2.5 py-1.5 text-xs text-[#191c20]"
                />
              </div>

              <div className="flex items-center gap-1 pt-3.5">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={() => {
                    const updated = [...(profile.headerSettings?.navItems || [])];
                    const temp = updated[idx];
                    updated[idx] = updated[idx - 1];
                    updated[idx - 1] = temp;
                    setProfile({
                      ...profile,
                      headerSettings: { ...(profile.headerSettings || {}), navItems: updated },
                    });
                  }}
                  className={adminIconBtnClass}
                  aria-label={`Move ${item.label || `link ${idx + 1}`} up`}
                >
                  <ChevronUp className="size-4" />
                </button>
                <button
                  type="button"
                  disabled={idx === (profile.headerSettings?.navItems || []).length - 1}
                  onClick={() => {
                    const updated = [...(profile.headerSettings?.navItems || [])];
                    const temp = updated[idx];
                    updated[idx] = updated[idx + 1];
                    updated[idx + 1] = temp;
                    setProfile({
                      ...profile,
                      headerSettings: { ...(profile.headerSettings || {}), navItems: updated },
                    });
                  }}
                  className={adminIconBtnClass}
                  aria-label={`Move ${item.label || `link ${idx + 1}`} down`}
                >
                  <ChevronDown className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const updated = (profile.headerSettings?.navItems || []).filter((_: any, i: number) => i !== idx);
                    setProfile({
                      ...profile,
                      headerSettings: { ...(profile.headerSettings || {}), navItems: updated },
                    });
                  }}
                  className={adminDangerIconBtnClass}
                  aria-label={`Delete ${item.label || `link ${idx + 1}`}`}
                >
                  <Close className="size-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Presets */}
        <div className="pt-2">
          <span className="text-[11px] font-medium text-[#646b73]">Quick add standard page: </span>
          <div className="inline-flex flex-wrap gap-1 mt-1">
            {NAV_PRESETS.map((preset) => {
              const exists = (profile.headerSettings?.navItems || []).some((item: any) => item.href === preset.href);
              if (exists) return null;
              return (
                <button
                  key={preset.href}
                  type="button"
                  onClick={() => {
                    const current = profile.headerSettings?.navItems || [];
                    setProfile({
                      ...profile,
                      headerSettings: {
                        ...(profile.headerSettings || {}),
                        navItems: [...current, preset],
                      },
                    });
                  }}
                  className="rounded-full border border-dashed border-[#0e5f5b]/40 bg-[#e1eeec]/50 px-2 py-0.5 text-[10px] font-medium text-[#0e5f5b] hover:bg-[#e1eeec]"
                >
                  + {preset.label} ({preset.href})
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Section 3: Header Action Buttons & Highlight */}
      <div className="rounded-xl border border-[#e6e1d8] bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#0e5f5b]">3. Header Action Buttons & Extras</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Highlight Link */}
          <div className="rounded-lg border border-[#e6e1d8] p-4 bg-[#faf9f6] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#191c20]">Special Highlight Link</span>
              <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.headerSettings?.highlightLink?.show !== false}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      headerSettings: {
                        ...(profile.headerSettings || {}),
                        highlightLink: {
                          ...(profile.headerSettings?.highlightLink || {}),
                          show: e.target.checked,
                        },
                      },
                    })
                  }
                  className="size-3.5 rounded border-[#d4cdc0] text-[#0e5f5b]"
                />
                <span>Visible</span>
              </label>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#4c535b]">Label</label>
              <input
                type="text"
                value={profile.headerSettings?.highlightLink?.label ?? "Experience"}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    headerSettings: {
                      ...(profile.headerSettings || {}),
                      highlightLink: {
                        ...(profile.headerSettings?.highlightLink || {}),
                        label: e.target.value,
                      },
                    },
                  })
                }
                className="mt-1 w-full rounded-md border border-[#d4cdc0] bg-white px-2.5 py-1.5 text-xs text-[#191c20]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#4c535b]">Destination URL</label>
              <input
                type="text"
                value={profile.headerSettings?.highlightLink?.href ?? "/experience"}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    headerSettings: {
                      ...(profile.headerSettings || {}),
                      highlightLink: {
                        ...(profile.headerSettings?.highlightLink || {}),
                        href: e.target.value,
                      },
                    },
                  })
                }
                className="mt-1 w-full rounded-md border border-[#d4cdc0] bg-white px-2.5 py-1.5 text-xs text-[#191c20]"
              />
            </div>
          </div>

          {/* CV Button & Mobile Button */}
          <div className="rounded-lg border border-[#e6e1d8] p-4 bg-[#faf9f6] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#191c20]">Header CV Button</span>
              <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.headerSettings?.showCvButton !== false}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      headerSettings: {
                        ...(profile.headerSettings || {}),
                        showCvButton: e.target.checked,
                      },
                    })
                  }
                  className="size-3.5 rounded border-[#d4cdc0] text-[#0e5f5b]"
                />
                <span>Visible</span>
              </label>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#4c535b]">CV Button Label</label>
              <input
                type="text"
                value={profile.headerSettings?.cvButtonLabel ?? "Download CV"}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    headerSettings: {
                      ...(profile.headerSettings || {}),
                      cvButtonLabel: e.target.value,
                    },
                  })
                }
                className="mt-1 w-full rounded-md border border-[#d4cdc0] bg-white px-2.5 py-1.5 text-xs text-[#191c20]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#4c535b]">Mobile Menu Email Button Label</label>
              <input
                type="text"
                value={profile.headerSettings?.mobileEmailButtonLabel ?? ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    headerSettings: {
                      ...(profile.headerSettings || {}),
                      mobileEmailButtonLabel: e.target.value,
                    },
                  })
                }
                placeholder={`Email ${profile.shortName || profile.name || "Afrin"}`}
                className="mt-1 w-full rounded-md border border-[#d4cdc0] bg-white px-2.5 py-1.5 text-xs text-[#191c20]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
