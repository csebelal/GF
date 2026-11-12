"use client";

import { Close } from "@/components/Icons";
import { adminDangerIconBtnClass } from "@/components/admin/ui/FormPrimitives";
import type { ProfileTabProps } from "./types";

export function FooterTab({ profile, setProfile }: ProfileTabProps) {
  return (
    <div className="space-y-6">
      {/* Section 1: Footer Bio & Identity */}
      <div className="rounded-xl border border-[#e6e1d8] bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#0e5f5b]">1. Footer Brand Narrative & CTAs</h3>
        <div>
          <label className="block text-xs font-semibold text-[#4c535b]">Short Bio / Description in Footer</label>
          <textarea
            rows={3}
            value={profile.footerSettings?.bioSummary ?? ""}
            onChange={(e) =>
              setProfile({
                ...profile,
                footerSettings: { ...(profile.footerSettings || {}), bioSummary: e.target.value },
              })
            }
            placeholder="Salesforce Administrator at Field Nation. Automation, CRM data quality..."
            className="mt-1 w-full rounded-lg border border-[#d4cdc0] px-3 py-2 text-sm text-[#191c20]"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 pt-2">
          <div className="rounded-lg border border-[#e6e1d8] p-3 bg-[#faf9f6] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#191c20]">Email Action Button</span>
              <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.footerSettings?.showEmailButton !== false}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      footerSettings: {
                        ...(profile.footerSettings || {}),
                        showEmailButton: e.target.checked,
                      },
                    })
                  }
                  className="size-3.5 rounded border-[#d4cdc0] text-[#0e5f5b]"
                />
                <span>Visible</span>
              </label>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[#4c535b]">Custom Label</label>
              <input
                type="text"
                value={profile.footerSettings?.emailButtonLabel ?? ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    footerSettings: {
                      ...(profile.footerSettings || {}),
                      emailButtonLabel: e.target.value,
                    },
                  })
                }
                placeholder={profile.email || "chishtiafrin@gmail.com"}
                className="mt-1 w-full rounded-md border border-[#d4cdc0] bg-white px-2.5 py-1.5 text-xs text-[#191c20]"
              />
              <p className="mt-1 text-[10px] text-[#646b73]">Leave empty to display your email address.</p>
            </div>
          </div>

          <div className="rounded-lg border border-[#e6e1d8] p-3 bg-[#faf9f6] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#191c20]">CV Download Button</span>
              <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.footerSettings?.showCvButton !== false}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      footerSettings: {
                        ...(profile.footerSettings || {}),
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
              <label className="block text-[11px] font-semibold text-[#4c535b]">Custom Label</label>
              <input
                type="text"
                value={profile.footerSettings?.cvButtonLabel ?? "Download CV"}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    footerSettings: {
                      ...(profile.footerSettings || {}),
                      cvButtonLabel: e.target.value,
                    },
                  })
                }
                className="mt-1 w-full rounded-md border border-[#d4cdc0] bg-white px-2.5 py-1.5 text-xs text-[#191c20]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Footer Page Links */}
      <div className="rounded-xl border border-[#e6e1d8] bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#0e5f5b]">2. Footer Page Links Column</h3>
            <p className="text-xs text-[#646b73]">Manage the links shown in the middle column of the footer.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              const current = profile.footerSettings?.pageLinks || [];
              setProfile({
                ...profile,
                footerSettings: {
                  ...(profile.footerSettings || {}),
                  pageLinks: [...current, { label: "New Page", href: "/new-page" }],
                },
              });
            }}
            className="rounded-md bg-[#e1eeec] px-3 py-1.5 text-xs font-semibold text-[#0e5f5b] hover:bg-[#d0e5e2]"
          >
            + Add Link
          </button>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#4c535b]">Column Heading</label>
          <input
            type="text"
            value={profile.footerSettings?.pageLinksTitle ?? "Pages"}
            onChange={(e) =>
              setProfile({
                ...profile,
                footerSettings: { ...(profile.footerSettings || {}), pageLinksTitle: e.target.value },
              })
            }
            className="mt-1 w-full max-w-xs rounded-lg border border-[#d4cdc0] px-3 py-2 text-sm text-[#191c20]"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {(profile.footerSettings?.pageLinks || []).map((link: any, idx: number) => (
            <div key={idx} className="flex items-center gap-2 rounded-lg border border-[#e6e1d8] p-2.5 bg-[#faf9f6]">
              <input
                type="text"
                value={link.label || ""}
                onChange={(e) => {
                  const updated = [...(profile.footerSettings?.pageLinks || [])];
                  updated[idx] = { ...updated[idx], label: e.target.value };
                  setProfile({
                    ...profile,
                    footerSettings: { ...(profile.footerSettings || {}), pageLinks: updated },
                  });
                }}
                placeholder="Label (e.g. Home)"
                className="w-1/2 rounded-md border border-[#d4cdc0] bg-white px-2 py-1 text-xs text-[#191c20]"
              />
              <input
                type="text"
                value={link.href || ""}
                onChange={(e) => {
                  const updated = [...(profile.footerSettings?.pageLinks || [])];
                  updated[idx] = { ...updated[idx], href: e.target.value };
                  setProfile({
                    ...profile,
                    footerSettings: { ...(profile.footerSettings || {}), pageLinks: updated },
                  });
                }}
                placeholder="URL (e.g. /)"
                className="flex-1 rounded-md border border-[#d4cdc0] bg-white px-2 py-1 text-xs text-[#191c20]"
              />
              <button
                type="button"
                onClick={() => {
                  const updated = (profile.footerSettings?.pageLinks || []).filter((_: any, i: number) => i !== idx);
                  setProfile({
                    ...profile,
                    footerSettings: { ...(profile.footerSettings || {}), pageLinks: updated },
                  });
                }}
                aria-label={`Remove page link ${link.label || idx + 1}`}
                className={adminDangerIconBtnClass}
              >
                <Close className="size-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Connect & Social Links */}
      <div className="rounded-xl border border-[#e6e1d8] bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#0e5f5b]">3. Footer Connect & Social Links</h3>
            <p className="text-xs text-[#646b73]">Manage social and contact channels shown in the third column.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              const current = profile.footerSettings?.socialLinks || [];
              setProfile({
                ...profile,
                footerSettings: {
                  ...(profile.footerSettings || {}),
                  socialLinks: [
                    ...current,
                    { platform: "custom", label: "New Channel", url: "https://", show: true },
                  ],
                },
              });
            }}
            className="rounded-md bg-[#e1eeec] px-3 py-1.5 text-xs font-semibold text-[#0e5f5b] hover:bg-[#d0e5e2]"
          >
            + Add Social Link
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-[#4c535b]">Column Heading</label>
            <input
              type="text"
              value={profile.footerSettings?.connectTitle ?? "Connect"}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  footerSettings: { ...(profile.footerSettings || {}), connectTitle: e.target.value },
                })
              }
              className="mt-1 w-full rounded-lg border border-[#d4cdc0] px-3 py-2 text-sm text-[#191c20]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4c535b]">Location Display in Connect Column</label>
            <div className="mt-1 flex items-center gap-3">
              <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.footerSettings?.showLocation !== false}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      footerSettings: { ...(profile.footerSettings || {}), showLocation: e.target.checked },
                    })
                  }
                  className="size-3.5 rounded border-[#d4cdc0] text-[#0e5f5b]"
                />
                <span>Show Location</span>
              </label>
              <input
                type="text"
                value={profile.footerSettings?.locationLabel ?? ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    footerSettings: { ...(profile.footerSettings || {}), locationLabel: e.target.value },
                  })
                }
                placeholder={`${profile.location?.city || "Dhaka"}, ${profile.location?.country || "Bangladesh"}`}
                className="flex-1 rounded-md border border-[#d4cdc0] bg-white px-2 py-1 text-xs text-[#191c20]"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          {(profile.footerSettings?.socialLinks || []).map((item: any, idx: number) => (
            <div key={idx} className="flex items-center gap-3 rounded-lg border border-[#e6e1d8] p-3 bg-[#faf9f6]">
              <select
                value={item.platform || "custom"}
                onChange={(e) => {
                  const updated = [...(profile.footerSettings?.socialLinks || [])];
                  updated[idx] = { ...updated[idx], platform: e.target.value };
                  setProfile({
                    ...profile,
                    footerSettings: { ...(profile.footerSettings || {}), socialLinks: updated },
                  });
                }}
                className="w-32 rounded-md border border-[#d4cdc0] bg-white px-2 py-1.5 text-xs text-[#191c20]"
              >
                <option value="email">Email</option>
                <option value="linkedin">LinkedIn</option>
                <option value="github">GitHub</option>
                <option value="trailhead">Trailhead</option>
                <option value="twitter">Twitter / X</option>
                <option value="custom">Custom Link</option>
              </select>

              <input
                type="text"
                value={item.label || ""}
                onChange={(e) => {
                  const updated = [...(profile.footerSettings?.socialLinks || [])];
                  updated[idx] = { ...updated[idx], label: e.target.value };
                  setProfile({
                    ...profile,
                    footerSettings: { ...(profile.footerSettings || {}), socialLinks: updated },
                  });
                }}
                placeholder="Label (e.g. LinkedIn)"
                className="w-1/4 rounded-md border border-[#d4cdc0] bg-white px-2.5 py-1.5 text-xs text-[#191c20]"
              />

              <input
                type="text"
                value={item.url || ""}
                onChange={(e) => {
                  const updated = [...(profile.footerSettings?.socialLinks || [])];
                  updated[idx] = { ...updated[idx], url: e.target.value };
                  setProfile({
                    ...profile,
                    footerSettings: { ...(profile.footerSettings || {}), socialLinks: updated },
                  });
                }}
                placeholder="URL (e.g. https://...)"
                className="flex-1 rounded-md border border-[#d4cdc0] bg-white px-2.5 py-1.5 text-xs text-[#191c20]"
              />

              <label className="flex items-center gap-1 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={item.show !== false}
                  onChange={(e) => {
                    const updated = [...(profile.footerSettings?.socialLinks || [])];
                    updated[idx] = { ...updated[idx], show: e.target.checked };
                    setProfile({
                      ...profile,
                      footerSettings: { ...(profile.footerSettings || {}), socialLinks: updated },
                    });
                  }}
                  className="size-3.5 rounded border-[#d4cdc0] text-[#0e5f5b]"
                />
                <span>Show</span>
              </label>

              <button
                type="button"
                onClick={() => {
                  const updated = (profile.footerSettings?.socialLinks || []).filter((_: any, i: number) => i !== idx);
                  setProfile({
                    ...profile,
                    footerSettings: { ...(profile.footerSettings || {}), socialLinks: updated },
                  });
                }}
                className="text-xs text-red-600 hover:text-red-800 px-2"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Section 4: Copyright & Bottom Notice */}
      <div className="rounded-xl border border-[#e6e1d8] bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#0e5f5b]">4. Footer Bottom Bar & Copyright</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-[#4c535b]">Copyright Text</label>
            <input
              type="text"
              value={profile.footerSettings?.copyrightText ?? "© {year} {name}"}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  footerSettings: { ...(profile.footerSettings || {}), copyrightText: e.target.value },
                })
              }
              placeholder="© {year} {name}"
              className="mt-1 w-full rounded-lg border border-[#d4cdc0] px-3 py-2 text-sm text-[#191c20]"
            />
            <p className="mt-1 text-[11px] text-[#646b73]">Use {"{year}"} for current year and {"{name}"} for your name.</p>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-[#4c535b]">Bottom Disclaimer Notice</label>
              <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.footerSettings?.showBottomNotice !== false}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      footerSettings: { ...(profile.footerSettings || {}), showBottomNotice: e.target.checked },
                    })
                  }
                  className="size-3.5 rounded border-[#d4cdc0] text-[#0e5f5b]"
                />
                <span>Visible</span>
              </label>
            </div>
            <input
              type="text"
              value={
                profile.footerSettings?.bottomNotice ??
                "Projects marked “Sample” are placeholder content that shows how the portfolio works."
              }
              onChange={(e) =>
                setProfile({
                  ...profile,
                  footerSettings: { ...(profile.footerSettings || {}), bottomNotice: e.target.value },
                })
              }
              placeholder="Notice text..."
              className="mt-1 w-full rounded-lg border border-[#d4cdc0] px-3 py-2 text-sm text-[#191c20]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
