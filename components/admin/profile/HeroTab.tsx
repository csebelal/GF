"use client";

import { useState } from "react";
import { Close } from "@/components/Icons";
import { adminFocusRing } from "@/components/admin/ui/FormPrimitives";
import type { ProfileTabProps } from "./types";

const TECH_SUGGESTIONS = [
  "Sales Cloud",
  "Service Cloud",
  "Flow",
  "Data Loader",
  "HubSpot",
  "Gong",
  "6sense",
  "Tableau",
  "Agentforce",
  "Slack",
  "Jira",
  "OmniStudio",
  "Apex",
];

export function HeroTab({ profile, setProfile }: ProfileTabProps) {
  const [newTechTag, setNewTechTag] = useState("");

  const handleAddTech = () => {
    if (!newTechTag.trim()) return;
    const current = profile.hero?.techStack?.items || [];
    if (!current.includes(newTechTag.trim())) {
      setProfile({
        ...profile,
        hero: {
          ...(profile.hero || {}),
          techStack: {
            ...(profile.hero?.techStack || {}),
            items: [...current, newTechTag.trim()],
          },
        },
      });
    }
    setNewTechTag("");
  };

  return (
    <div className="space-y-6">
      {/* Live Preview Card */}
      <div className="rounded-xl border border-[#d2ddd9] bg-gradient-to-br from-[#f8faf9] to-[#edf4f2] p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-[#dce6e3]">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#0e5f5b]">
            Live Hero Preview
          </span>
          <span className="text-xs text-[#526360]">Direct preview of how it looks on the public homepage</span>
        </div>
        <div className="pt-4 space-y-3">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#dce6e3] bg-white px-3 py-1 text-xs font-medium text-[#191c20] shadow-xs">
            {profile.hero?.badgeDot !== false && (
              <span className="size-2 rounded-full bg-[#0e5f5b] animate-pulse" />
            )}
            {profile.hero?.badgeText ||
              `${profile.jobTitle || "Salesforce Administrator"} at ${profile.employer || "Field Nation"}`}
          </span>
          <h1 className="text-2xl font-bold leading-tight text-[#191c20] sm:text-3xl">
            {profile.hero?.headlineMain || "Salesforce that sales, marketing and support teams"}{" "}
            <span className="text-[#646b73]">{profile.hero?.headlineMuted || "can rely on."}</span>
          </h1>
          <p className="text-xs leading-relaxed text-[#526360] max-w-xl">
            {profile.hero?.description ||
              `I’m ${profile.name || "Afrin Akter Chishti"}. I look after Sales Cloud and Service Cloud at ${profile.employer || "Field Nation"}...`}
          </p>
        </div>
      </div>

      {/* Section 1: Main Headline & Intro */}
      <div className="rounded-xl border border-[#e6e1d8] bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#0e5f5b]">1. Hero Headline & Subtitle</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-[#4c535b]">Headline (Dark Bold Part)</label>
            <input
              type="text"
              value={profile.hero?.headlineMain ?? ""}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  hero: { ...(profile.hero || {}), headlineMain: e.target.value },
                })
              }
              placeholder="Salesforce that sales, marketing and support teams"
              className="mt-1 w-full rounded-lg border border-[#d4cdc0] px-3 py-2 text-sm text-[#191c20]"
            />
            <p className="mt-1 text-[11px] text-[#646b73]">This is the main prominent headline text.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4c535b]">Headline (Muted Accent Part)</label>
            <input
              type="text"
              value={profile.hero?.headlineMuted ?? ""}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  hero: { ...(profile.hero || {}), headlineMuted: e.target.value },
                })
              }
              placeholder="can rely on."
              className="mt-1 w-full rounded-lg border border-[#d4cdc0] px-3 py-2 text-sm text-[#191c20]"
            />
            <p className="mt-1 text-[11px] text-[#646b73]">Rendered in subtle muted gray next to the main headline.</p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#4c535b]">Hero Bio / Subtitle Paragraph</label>
          <textarea
            rows={4}
            value={profile.hero?.description ?? ""}
            onChange={(e) =>
              setProfile({
                ...profile,
                hero: { ...(profile.hero || {}), description: e.target.value },
              })
            }
            placeholder="I’m Afrin Akter Chishti. I look after Sales Cloud and Service Cloud at Field Nation..."
            className="mt-1 w-full rounded-lg border border-[#d4cdc0] px-3 py-2 text-sm text-[#191c20]"
          />
        </div>
      </div>

      {/* Section 2: Status Pill & Top Badge */}
      <div className="rounded-xl border border-[#e6e1d8] bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#0e5f5b]">2. Top Status Badge</h3>
        <div className="grid gap-4 sm:grid-cols-3 items-end">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-[#4c535b]">Badge Text</label>
            <input
              type="text"
              value={profile.hero?.badgeText ?? ""}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  hero: { ...(profile.hero || {}), badgeText: e.target.value },
                })
              }
              placeholder="Salesforce Administrator at Field Nation"
              className="mt-1 w-full rounded-lg border border-[#d4cdc0] px-3 py-2 text-sm text-[#191c20]"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer pt-2 sm:pt-0">
              <input
                type="checkbox"
                checked={profile.hero?.badgeDot !== false}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    hero: { ...(profile.hero || {}), badgeDot: e.target.checked },
                  })
                }
                className="size-4 rounded border-[#d4cdc0] text-[#0e5f5b] focus:ring-[#0e5f5b]"
              />
              <span className="text-xs font-medium text-[#191c20]">Show Green Pulse Dot</span>
            </label>
          </div>
        </div>
      </div>

      {/* Section 3: Action Buttons */}
      <div className="rounded-xl border border-[#e6e1d8] bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#0e5f5b]">3. Call to Action (CTA) Buttons</h3>
        <div className="grid gap-4 sm:grid-cols-3 items-end">
          <div>
            <label className="block text-xs font-semibold text-[#4c535b]">Primary Button Text</label>
            <input
              type="text"
              value={profile.hero?.primaryButtonText ?? ""}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  hero: { ...(profile.hero || {}), primaryButtonText: e.target.value },
                })
              }
              placeholder="Explore portfolio"
              className="mt-1 w-full rounded-lg border border-[#d4cdc0] px-3 py-2 text-sm text-[#191c20]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4c535b]">Primary Button URL</label>
            <input
              type="text"
              value={profile.hero?.primaryButtonUrl ?? ""}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  hero: { ...(profile.hero || {}), primaryButtonUrl: e.target.value },
                })
              }
              placeholder="/portfolio"
              className="mt-1 w-full rounded-lg border border-[#d4cdc0] px-3 py-2 text-sm text-[#191c20]"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer pt-2 sm:pt-0">
              <input
                type="checkbox"
                checked={profile.hero?.showCvButton !== false}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    hero: { ...(profile.hero || {}), showCvButton: e.target.checked },
                  })
                }
                className="size-4 rounded border-[#d4cdc0] text-[#0e5f5b] focus:ring-[#0e5f5b]"
              />
              <span className="text-xs font-medium text-[#191c20]">Show &quot;Download CV&quot; Button</span>
            </label>
          </div>
        </div>
      </div>

      {/* Section 4: Highlights / Micro Badges */}
      <div className="rounded-xl border border-[#e6e1d8] bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#0e5f5b]">
            4. Hero Highlight Bullets (Under Buttons)
          </h3>
          <button
            type="button"
            onClick={() => {
              const current = profile.hero?.highlights || [];
              setProfile({
                ...profile,
                hero: {
                  ...(profile.hero || {}),
                  highlights: [...current, { icon: "check", text: "Working in Salesforce since 2022" }],
                },
              });
            }}
            className="rounded-md bg-[#e1eeec] px-3 py-1.5 text-xs font-semibold text-[#0e5f5b] hover:bg-[#d0e5e2]"
          >
            + Add Bullet
          </button>
        </div>

        <div className="space-y-3">
          {(profile.hero?.highlights || []).map((item: any, idx: number) => (
            <div key={idx} className="flex items-center gap-3 rounded-lg border border-[#e6e1d8] p-3 bg-[#faf9f6]">
              <select
                value={item.icon || "location"}
                onChange={(e) => {
                  const updated = [...(profile.hero?.highlights || [])];
                  updated[idx] = { ...updated[idx], icon: e.target.value };
                  setProfile({
                    ...profile,
                    hero: { ...(profile.hero || {}), highlights: updated },
                  });
                }}
                className="w-40 rounded-md border border-[#d4cdc0] bg-white px-2.5 py-1.5 text-xs text-[#191c20]"
              >
                <option value="location">Location (MapPin)</option>
                <option value="award">Certification (Award)</option>
                <option value="check">Experience (Checkmark)</option>
              </select>

              <input
                type="text"
                value={item.text || ""}
                onChange={(e) => {
                  const updated = [...(profile.hero?.highlights || [])];
                  updated[idx] = { ...updated[idx], text: e.target.value };
                  setProfile({
                    ...profile,
                    hero: { ...(profile.hero || {}), highlights: updated },
                  });
                }}
                placeholder="e.g. Dhaka, Bangladesh"
                className="flex-1 rounded-md border border-[#d4cdc0] bg-white px-3 py-1.5 text-xs text-[#191c20]"
              />

              <button
                type="button"
                onClick={() => {
                  const updated = (profile.hero?.highlights || []).filter((_: any, i: number) => i !== idx);
                  setProfile({
                    ...profile,
                    hero: { ...(profile.hero || {}), highlights: updated },
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

      {/* Section 5: Photo Floating Overlay Badges */}
      <div className="rounded-xl border border-[#e6e1d8] bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#0e5f5b]">
          5. Photo Floating Overlay Badges
        </h3>
        <p className="text-xs text-[#646b73]">These are the modern floating cards rendered over the hero portrait photo.</p>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Languages Card */}
          <div className="rounded-lg border border-[#e6e1d8] p-4 bg-[#faf9f6] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#191c20]">Top-Right Card (Languages)</span>
              <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.hero?.languagesCard?.show !== false}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      hero: {
                        ...(profile.hero || {}),
                        languagesCard: {
                          ...(profile.hero?.languagesCard || {}),
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
              <label className="block text-[11px] font-semibold text-[#4c535b]">Card Label</label>
              <input
                type="text"
                value={profile.hero?.languagesCard?.label ?? "Languages"}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    hero: {
                      ...(profile.hero || {}),
                      languagesCard: {
                        ...(profile.hero?.languagesCard || {}),
                        label: e.target.value,
                      },
                    },
                  })
                }
                className="mt-1 w-full rounded-md border border-[#d4cdc0] bg-white px-2.5 py-1.5 text-xs text-[#191c20]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#4c535b]">Card Content</label>
              <input
                type="text"
                value={profile.hero?.languagesCard?.text ?? "Bangla · English · Hindi"}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    hero: {
                      ...(profile.hero || {}),
                      languagesCard: {
                        ...(profile.hero?.languagesCard || {}),
                        text: e.target.value,
                      },
                    },
                  })
                }
                className="mt-1 w-full rounded-md border border-[#d4cdc0] bg-white px-2.5 py-1.5 text-xs text-[#191c20]"
              />
            </div>
          </div>

          {/* Career Step Card */}
          <div className="rounded-lg border border-[#e6e1d8] p-4 bg-[#faf9f6] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#191c20]">Bottom-Left Card (Career Step)</span>
              <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.hero?.careerStepCard?.show !== false}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      hero: {
                        ...(profile.hero || {}),
                        careerStepCard: {
                          ...(profile.hero?.careerStepCard || {}),
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
              <label className="block text-[11px] font-semibold text-[#4c535b]">Card Label</label>
              <input
                type="text"
                value={profile.hero?.careerStepCard?.label ?? "Career step"}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    hero: {
                      ...(profile.hero || {}),
                      careerStepCard: {
                        ...(profile.hero?.careerStepCard || {}),
                        label: e.target.value,
                      },
                    },
                  })
                }
                className="mt-1 w-full rounded-md border border-[#d4cdc0] bg-white px-2.5 py-1.5 text-xs text-[#191c20]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#4c535b]">Card Content</label>
              <input
                type="text"
                value={profile.hero?.careerStepCard?.text ?? "Promoted to Salesforce Administrator, January 2025"}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    hero: {
                      ...(profile.hero || {}),
                      careerStepCard: {
                        ...(profile.hero?.careerStepCard || {}),
                        text: e.target.value,
                      },
                    },
                  })
                }
                className="mt-1 w-full rounded-md border border-[#d4cdc0] bg-white px-2.5 py-1.5 text-xs text-[#191c20]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 6: Works Across Tech Stack Ticker */}
      <div className="rounded-xl border border-[#e6e1d8] bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#0e5f5b]">
          6. &quot;Works Across&quot; Tech Stack Bar
        </h3>
        <p className="text-xs text-[#646b73]">Manage the technology & platform ticker rendered beneath the hero fold.</p>

        <div>
          <label className="block text-xs font-semibold text-[#4c535b]">Ticker Section Label</label>
          <input
            type="text"
            value={profile.hero?.techStack?.label ?? "Works across"}
            onChange={(e) =>
              setProfile({
                ...profile,
                hero: {
                  ...(profile.hero || {}),
                  techStack: {
                    ...(profile.hero?.techStack || {}),
                    label: e.target.value,
                  },
                },
              })
            }
            placeholder="Works across"
            className="mt-1 w-full max-w-xs rounded-lg border border-[#d4cdc0] px-3 py-2 text-sm text-[#191c20]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#4c535b]">
            Current Technologies ({(profile.hero?.techStack?.items || []).length})
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            {(profile.hero?.techStack?.items || []).map((tool: string, idx: number) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#d4cdc0] bg-[#faf9f6] px-3 py-1 text-xs font-semibold text-[#191c20]"
              >
                <span>{tool}</span>
                <button
                  type="button"
                  onClick={() => {
                    const items = (profile.hero?.techStack?.items || []).filter((_: any, i: number) => i !== idx);
                    setProfile({
                      ...profile,
                      hero: {
                        ...(profile.hero || {}),
                        techStack: {
                          ...(profile.hero?.techStack || {}),
                          items,
                        },
                      },
                    });
                  }}
                  aria-label={`Remove ${tool}`}
                  className={`ml-1 inline-flex cursor-pointer items-center justify-center rounded p-0.5 text-body hover:text-danger ${adminFocusRing}`}
                >
                  <Close className="size-3.5" />
                </button>
              </span>
            ))}
          </div>

          {/* Add New Tool */}
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              value={newTechTag}
              onChange={(e) => setNewTechTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddTech();
                }
              }}
              placeholder="Type a technology (e.g. MuleSoft, Copado, Slack) and press Add"
              className="flex-1 rounded-lg border border-[#d4cdc0] px-3 py-2 text-xs text-[#191c20]"
            />
            <button
              type="button"
              onClick={handleAddTech}
              className="rounded-lg bg-[#0e5f5b] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0a4744]"
            >
              Add Tool
            </button>
          </div>

          {/* Suggested Quick Add Chips */}
          <div className="mt-3">
            <span className="text-[11px] font-medium text-[#646b73]">Quick add suggestions: </span>
            <div className="inline-flex flex-wrap gap-1 mt-1">
              {TECH_SUGGESTIONS.map((suggested) => {
                const alreadyHas = (profile.hero?.techStack?.items || []).includes(suggested);
                if (alreadyHas) return null;
                return (
                  <button
                    key={suggested}
                    type="button"
                    onClick={() => {
                      const current = profile.hero?.techStack?.items || [];
                      setProfile({
                        ...profile,
                        hero: {
                          ...(profile.hero || {}),
                          techStack: {
                            ...(profile.hero?.techStack || {}),
                            items: [...current, suggested],
                          },
                        },
                      });
                    }}
                    className="rounded-full border border-dashed border-[#0e5f5b]/40 bg-[#e1eeec]/50 px-2 py-0.5 text-[10px] font-medium text-[#0e5f5b] hover:bg-[#e1eeec]"
                  >
                    + {suggested}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Section 7: Homepage "How I got here" Introduction & Stats */}
      <div className="rounded-xl border border-[#e6e1d8] bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#0e5f5b]">
          7. Homepage &quot;How I got here&quot; Story & Stats
        </h3>
        <p className="text-xs text-[#646b73]">Manage the career introduction narrative and key metric counters on the homepage.</p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-[#4c535b]">Eyebrow</label>
            <input
              type="text"
              value={profile.homeIntro?.eyebrow ?? "How I got here"}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  homeIntro: { ...(profile.homeIntro || {}), eyebrow: e.target.value },
                })
              }
              className="mt-1 w-full rounded-lg border border-[#d4cdc0] px-3 py-2 text-sm text-[#191c20]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4c535b]">Headline</label>
            <input
              type="text"
              value={profile.homeIntro?.headline ?? "From the support desk to the admin console."}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  homeIntro: { ...(profile.homeIntro || {}), headline: e.target.value },
                })
              }
              className="mt-1 w-full rounded-lg border border-[#d4cdc0] px-3 py-2 text-sm text-[#191c20]"
            />
          </div>
        </div>

        {/* Quick 3 Stats */}
        <div>
          <label className="block text-xs font-semibold text-[#4c535b] mb-2">Metrics / Stats (3 counters)</label>
          <div className="grid gap-3 sm:grid-cols-3">
            {[0, 1, 2].map((idx) => {
              const stat = profile.homeIntro?.stats?.[idx] || { label: "", value: "" };
              return (
                <div key={idx} className="rounded-lg border border-[#e6e1d8] p-3 bg-[#faf9f6] space-y-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-[#646b73]">Label</label>
                    <input
                      type="text"
                      value={stat.label || ""}
                      onChange={(e) => {
                        const stats = [
                          ...(profile.homeIntro?.stats || [
                            { label: "", value: "" },
                            { label: "", value: "" },
                            { label: "", value: "" },
                          ]),
                        ];
                        stats[idx] = { ...stats[idx], label: e.target.value };
                        setProfile({
                          ...profile,
                          homeIntro: { ...(profile.homeIntro || {}), stats },
                        });
                      }}
                      placeholder={idx === 0 ? "Joined Field Nation" : idx === 1 ? "Promoted" : "Languages"}
                      className="mt-0.5 w-full rounded-md border border-[#d4cdc0] bg-white px-2 py-1 text-xs text-[#191c20]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-[#646b73]">Value</label>
                    <input
                      type="text"
                      value={stat.value || ""}
                      onChange={(e) => {
                        const stats = [
                          ...(profile.homeIntro?.stats || [
                            { label: "", value: "" },
                            { label: "", value: "" },
                            { label: "", value: "" },
                          ]),
                        ];
                        stats[idx] = { ...stats[idx], value: e.target.value };
                        setProfile({
                          ...profile,
                          homeIntro: { ...(profile.homeIntro || {}), stats },
                        });
                      }}
                      placeholder={idx === 0 ? "2022" : idx === 1 ? "2025" : "3"}
                      className="mt-0.5 w-full rounded-md border border-[#d4cdc0] bg-white px-2 py-1 text-xs font-bold text-[#191c20]"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Story Paragraphs */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-semibold text-[#4c535b]">Introduction Paragraphs</label>
            <button
              type="button"
              onClick={() => {
                const current = profile.homeIntro?.paragraphs || [];
                setProfile({
                  ...profile,
                  homeIntro: { ...(profile.homeIntro || {}), paragraphs: [...current, ""] },
                });
              }}
              className="rounded-md bg-[#e1eeec] px-2.5 py-1 text-xs font-semibold text-[#0e5f5b] hover:bg-[#d0e5e2]"
            >
              + Add Paragraph
            </button>
          </div>

          <div className="space-y-3">
            {(profile.homeIntro?.paragraphs || []).map((para: string, idx: number) => (
              <div key={idx} className="flex gap-2 items-start">
                <span className="mt-2 text-xs font-bold text-[#646b73]">{idx + 1}.</span>
                <textarea
                  rows={3}
                  value={para}
                  onChange={(e) => {
                    const updated = [...(profile.homeIntro?.paragraphs || [])];
                    updated[idx] = e.target.value;
                    setProfile({
                      ...profile,
                      homeIntro: { ...(profile.homeIntro || {}), paragraphs: updated },
                    });
                  }}
                  className="flex-1 rounded-lg border border-[#d4cdc0] px-3 py-2 text-xs text-[#191c20]"
                />
                <button
                  type="button"
                  onClick={() => {
                    const updated = (profile.homeIntro?.paragraphs || []).filter((_: any, i: number) => i !== idx);
                    setProfile({
                      ...profile,
                      homeIntro: { ...(profile.homeIntro || {}), paragraphs: updated },
                    });
                  }}
                  className="text-xs text-red-600 hover:text-red-800 p-2"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
