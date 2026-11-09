"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function AdminProfilePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#646b73]">Loading Profile & Site settings...</div>}>
      <ProfileEditor />
    </Suspense>
  );
}

function ProfileEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab");
  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"hero" | "nav" | "footer" | "identity" | "about" | "contact" | "seo">(
    tabFromUrl && ["hero", "nav", "footer", "identity", "about", "contact", "seo"].includes(tabFromUrl)
      ? (tabFromUrl as any)
      : "hero"
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPortrait, setUploadingPortrait] = useState(false);
  const [uploadingCv, setUploadingCv] = useState(false);
  const [newTechTag, setNewTechTag] = useState("");
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (tabFromUrl && ["hero", "nav", "footer", "identity", "about", "contact", "seo"].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl as any);
    }
  }, [tabFromUrl]);

  const handleTabChange = (key: any) => {
    setActiveTab(key);
    router.replace(`/admin/profile?tab=${key}`, { scroll: false });
  };

  useEffect(() => {
    fetch("/api/admin/profile")
      .then((res) => res.json())
      .then((data) => {
        setProfile(data);
        setLoading(false);
      })
      .catch(() => {
        setMessage({ text: "Failed to load profile data", type: "error" });
        setLoading(false);
      });
  }, []);

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

  const handlePortraitUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPortrait(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setProfile((prev: any) => ({
        ...prev,
        portrait: {
          ...prev.portrait,
          src: data.url,
          fallback: data.url,
          small: data.url,
          avatar: data.url,
        },
      }));
      setMessage({ text: "Portrait uploaded successfully!", type: "success" });
    } catch (err: any) {
      setMessage({ text: err.message || "Portrait upload failed", type: "error" });
    } finally {
      setUploadingPortrait(false);
    }
  };

  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCv(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const sizeKb = Math.round(data.size / 1024);
      setProfile((prev: any) => ({
        ...prev,
        cv: {
          ...prev.cv,
          href: data.url,
          downloadName: file.name,
          sizeLabel: `PDF, ${sizeKb} KB`,
        },
      }));
      setMessage({ text: "CV PDF uploaded successfully!", type: "success" });
    } catch (err: any) {
      setMessage({ text: err.message || "CV upload failed", type: "error" });
    } finally {
      setUploadingCv(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage({ text: "Profile and settings updated successfully!", type: "success" });
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to update profile", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-sm text-[#646b73]">Loading profile data...</div>;
  }

  if (!profile) {
    return <div className="p-8 text-center text-sm text-red-600">Profile data not available.</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-6 pb-16">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#191c20]">Profile & Content Management</h2>
          <p className="text-xs text-[#646b73]">Manage your menu bar, footer, hero fold, bio, story, and SEO metadata</p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-[#0e5f5b] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#0a4744] disabled:opacity-50"
        >
          {saving ? "Saving Changes..." : "Save All Changes"}
        </button>
      </div>

      {message && (
        <div
          className={`rounded-lg p-3 text-xs ${
            message.type === "success"
              ? "border border-green-200 bg-green-50 text-green-800"
              : "border border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Tabs Header */}
      <div className="flex flex-wrap gap-2 border-b border-[#e6e1d8] pb-1">
        {[
          { key: "hero", label: "Hero & Home Fold" },
          { key: "nav", label: "Menu & Header" },
          { key: "footer", label: "Footer Settings" },
          { key: "identity", label: "Identity & CV" },
          { key: "about", label: "About Story & Principles" },
          { key: "contact", label: "Contact Page & Cards" },
          { key: "seo", label: "SEO & Settings" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => handleTabChange(tab.key as any)}
            className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition ${
              activeTab === tab.key
                ? "bg-[#0e5f5b] text-white"
                : "text-[#4c535b] hover:bg-[#f3efe8]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 0: Hero & Home Fold */}
      {activeTab === "hero" && (
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
                {profile.hero?.badgeText || `${profile.jobTitle || "Salesforce Administrator"} at ${profile.employer || "Field Nation"}`}
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
                      className="text-[#646b73] hover:text-red-600 font-bold ml-1"
                    >
                      ×
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
                  {["Sales Cloud", "Service Cloud", "Flow", "Data Loader", "HubSpot", "Gong", "6sense", "Tableau", "Agentforce", "Slack", "Jira", "OmniStudio", "Apex"].map((suggested) => {
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
      )}

      {/* Tab: Menu Bar & Header */}
      {activeTab === "nav" && (
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
                    {/* Move Up */}
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
                      className="rounded p-1 text-xs text-[#646b73] hover:bg-[#e6e1d8] disabled:opacity-30"
                      title="Move Up"
                    >
                      ▲
                    </button>
                    {/* Move Down */}
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
                      className="rounded p-1 text-xs text-[#646b73] hover:bg-[#e6e1d8] disabled:opacity-30"
                      title="Move Down"
                    >
                      ▼
                    </button>
                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => {
                        const updated = (profile.headerSettings?.navItems || []).filter((_: any, i: number) => i !== idx);
                        setProfile({
                          ...profile,
                          headerSettings: { ...(profile.headerSettings || {}), navItems: updated },
                        });
                      }}
                      className="text-xs text-red-600 hover:text-red-800 px-2"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Presets */}
            <div className="pt-2">
              <span className="text-[11px] font-medium text-[#646b73]">Quick add standard page: </span>
              <div className="inline-flex flex-wrap gap-1 mt-1">
                {[
                  { label: "Home", href: "/" },
                  { label: "Portfolio", href: "/portfolio" },
                  { label: "Expertise", href: "/expertise" },
                  { label: "Experience", href: "/experience" },
                  { label: "About", href: "/about" },
                  { label: "Contact", href: "/contact" },
                ].map((preset) => {
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
      )}

      {/* Tab: Footer Settings */}
      {activeTab === "footer" && (
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
                    className="text-xs text-red-600 hover:text-red-800 px-1"
                  >
                    ×
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
      )}

      {/* Tab 1: Identity & CV */}
      {activeTab === "identity" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-[#e6e1d8] bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#0e5f5b]">1. Basic Identity</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold text-[#4c535b]">Full Name</label>
                <input
                  type="text"
                  required
                  value={profile.name || ""}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-[#d4cdc0] px-3 py-2 text-sm text-[#191c20]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4c535b]">Short Name (Greeting)</label>
                <input
                  type="text"
                  required
                  value={profile.shortName || ""}
                  onChange={(e) => setProfile({ ...profile, shortName: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-[#d4cdc0] px-3 py-2 text-sm text-[#191c20]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4c535b]">Current Job Title</label>
                <input
                  type="text"
                  required
                  value={profile.jobTitle || ""}
                  onChange={(e) => setProfile({ ...profile, jobTitle: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-[#d4cdc0] px-3 py-2 text-sm text-[#191c20]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4c535b]">Employer</label>
                <input
                  type="text"
                  required
                  value={profile.employer || ""}
                  onChange={(e) => setProfile({ ...profile, employer: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-[#d4cdc0] px-3 py-2 text-sm text-[#191c20]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4c535b]">City</label>
                <input
                  type="text"
                  value={profile.location?.city || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, location: { ...profile.location, city: e.target.value } })
                  }
                  className="mt-1 w-full rounded-lg border border-[#d4cdc0] px-3 py-2 text-sm text-[#191c20]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4c535b]">Country</label>
                <input
                  type="text"
                  value={profile.location?.country || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, location: { ...profile.location, country: e.target.value } })
                  }
                  className="mt-1 w-full rounded-lg border border-[#d4cdc0] px-3 py-2 text-sm text-[#191c20]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4c535b]">Contact Email</label>
                <input
                  type="email"
                  required
                  value={profile.email || ""}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-[#d4cdc0] px-3 py-2 text-sm text-[#191c20]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4c535b]">LinkedIn URL</label>
                <input
                  type="url"
                  value={profile.linkedin?.url || ""}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      linkedin: { ...profile.linkedin, url: e.target.value, label: e.target.value.replace(/^https?:\/\//, "") },
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-[#d4cdc0] px-3 py-2 text-sm text-[#191c20]"
                />
              </div>
            </div>
          </div>

          {/* Media & CV */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-[#e6e1d8] bg-white p-6 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#0e5f5b]">Profile Portrait</h3>
              <div className="mt-4 flex items-center gap-4">
                {profile.portrait?.src && (
                  <img
                    src={profile.portrait.src}
                    alt="Portrait Preview"
                    className="size-20 rounded-xl object-cover border border-[#e6e1d8]"
                  />
                )}
                <div className="flex-1 space-y-2">
                  <label className="block text-xs font-medium text-[#4c535b]">Upload New Portrait</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePortraitUpload}
                    disabled={uploadingPortrait}
                    className="w-full text-xs text-[#646b73] file:mr-3 file:rounded-md file:border-0 file:bg-[#0e5f5b] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-[#0a4744]"
                  />
                  {uploadingPortrait && <p className="text-[11px] text-[#0e5f5b]">Uploading image...</p>}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-[#e6e1d8] bg-white p-6 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#0e5f5b]">CV Document</h3>
              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-xs text-[#4c535b]">
                  <span>Current: <strong>{profile.cv?.downloadName || "CV Document"}</strong></span>
                  <span className="text-muted">{profile.cv?.sizeLabel}</span>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#4c535b]">Upload New CV PDF</label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleCvUpload}
                    disabled={uploadingCv}
                    className="mt-1 w-full text-xs text-[#646b73] file:mr-3 file:rounded-md file:border-0 file:bg-[#0e5f5b] file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-[#0a4744]"
                  />
                  {uploadingCv && <p className="text-[11px] text-[#0e5f5b]">Uploading CV...</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: About Page Story & Principles */}
      {activeTab === "about" && (
        <div className="space-y-6">
          <div className="rounded-xl border border-[#e6e1d8] bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#0e5f5b]">About Intro Header</h3>
            <div>
              <label className="block text-xs font-semibold text-[#4c535b]">Intro Headline</label>
              <input
                type="text"
                value={profile.aboutStory?.introHeadline || ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    aboutStory: { ...profile.aboutStory, introHeadline: e.target.value },
                  })
                }
                className="mt-1 w-full rounded-lg border border-[#d4cdc0] px-3 py-2 text-sm text-[#191c20]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#4c535b]">Intro Paragraph</label>
              <textarea
                rows={3}
                value={profile.aboutStory?.introParagraph || ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    aboutStory: { ...profile.aboutStory, introParagraph: e.target.value },
                  })
                }
                className="mt-1 w-full rounded-lg border border-[#d4cdc0] px-3 py-2 text-sm text-[#191c20]"
              />
            </div>
          </div>

          {/* Dynamic Story Chapters */}
          <div className="rounded-xl border border-[#e6e1d8] bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#0e5f5b]">
                Story Chapters ({profile.aboutStory?.chapters?.length || 0})
              </h3>
              <button
                type="button"
                onClick={() => {
                  const chapters = [...(profile.aboutStory?.chapters || [])];
                  chapters.push({
                    id: `chapter-${Date.now()}`,
                    label: "New Chapter",
                    title: "Chapter Title",
                    body: ["Paragraph 1 of your story..."],
                  });
                  setProfile({
                    ...profile,
                    aboutStory: { ...profile.aboutStory, chapters },
                  });
                }}
                className="rounded-md bg-[#e1eeec] px-3 py-1.5 text-xs font-semibold text-[#0e5f5b] hover:bg-[#d0e5e2]"
              >
                + Add Chapter
              </button>
            </div>

            <div className="space-y-6">
              {(profile.aboutStory?.chapters || []).map((chapter: any, cIdx: number) => (
                <div key={chapter.id || cIdx} className="rounded-lg border border-[#e6e1d8] p-4 bg-[#faf9f6] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#191c20]">Chapter #{cIdx + 1}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const chapters = [...profile.aboutStory.chapters];
                        chapters.splice(cIdx, 1);
                        setProfile({
                          ...profile,
                          aboutStory: { ...profile.aboutStory, chapters },
                        });
                      }}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      Remove Chapter
                    </button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#4c535b]">Timeline Label</label>
                      <input
                        type="text"
                        value={chapter.label || ""}
                        onChange={(e) => {
                          const chapters = [...profile.aboutStory.chapters];
                          chapters[cIdx].label = e.target.value;
                          setProfile({
                            ...profile,
                            aboutStory: { ...profile.aboutStory, chapters },
                          });
                        }}
                        placeholder="e.g. Where I started"
                        className="mt-1 w-full rounded-md border border-[#d4cdc0] bg-white px-2.5 py-1.5 text-xs text-[#191c20]"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#4c535b]">Chapter Title</label>
                      <input
                        type="text"
                        value={chapter.title || ""}
                        onChange={(e) => {
                          const chapters = [...profile.aboutStory.chapters];
                          chapters[cIdx].title = e.target.value;
                          setProfile({
                            ...profile,
                            aboutStory: { ...profile.aboutStory, chapters },
                          });
                        }}
                        className="mt-1 w-full rounded-md border border-[#d4cdc0] bg-white px-2.5 py-1.5 text-xs text-[#191c20]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-semibold text-[#4c535b]">Paragraphs</label>
                      <button
                        type="button"
                        onClick={() => {
                          const chapters = [...profile.aboutStory.chapters];
                          chapters[cIdx].body = [...(chapters[cIdx].body || []), ""];
                          setProfile({
                            ...profile,
                            aboutStory: { ...profile.aboutStory, chapters },
                          });
                        }}
                        className="text-[11px] text-[#0e5f5b] hover:underline"
                      >
                        + Add Paragraph
                      </button>
                    </div>

                    {(chapter.body || []).map((p: string, pIdx: number) => (
                      <div key={pIdx} className="flex gap-2 items-start">
                        <textarea
                          rows={2}
                          value={p}
                          onChange={(e) => {
                            const chapters = [...profile.aboutStory.chapters];
                            chapters[cIdx].body[pIdx] = e.target.value;
                            setProfile({
                              ...profile,
                              aboutStory: { ...profile.aboutStory, chapters },
                            });
                          }}
                          className="flex-1 rounded-md border border-[#d4cdc0] bg-white px-2.5 py-1.5 text-xs text-[#191c20]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const chapters = [...profile.aboutStory.chapters];
                            chapters[cIdx].body.splice(pIdx, 1);
                            setProfile({
                              ...profile,
                              aboutStory: { ...profile.aboutStory, chapters },
                            });
                          }}
                          className="text-xs text-red-500 hover:text-red-700 p-1"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Operating Principles */}
          <div className="rounded-xl border border-[#e6e1d8] bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#0e5f5b]">Operating Principles</h3>
              <button
                type="button"
                onClick={() => {
                  const principles = [...(profile.aboutStory?.principles || [])];
                  principles.push({ title: "New Principle", body: "Description of the principle..." });
                  setProfile({
                    ...profile,
                    aboutStory: { ...profile.aboutStory, principles },
                  });
                }}
                className="rounded-md bg-[#e1eeec] px-3 py-1.5 text-xs font-semibold text-[#0e5f5b] hover:bg-[#d0e5e2]"
              >
                + Add Principle
              </button>
            </div>

            <div className="space-y-4">
              {(profile.aboutStory?.principles || []).map((principle: any, pIdx: number) => (
                <div key={pIdx} className="rounded-lg border border-[#e6e1d8] p-3 bg-[#faf9f6] space-y-2">
                  <div className="flex items-center justify-between">
                    <input
                      type="text"
                      value={principle.title}
                      onChange={(e) => {
                        const principles = [...profile.aboutStory.principles];
                        principles[pIdx].title = e.target.value;
                        setProfile({
                          ...profile,
                          aboutStory: { ...profile.aboutStory, principles },
                        });
                      }}
                      placeholder="Principle Title"
                      className="w-2/3 rounded-md border border-[#d4cdc0] bg-white px-2 py-1 text-xs font-semibold"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const principles = [...profile.aboutStory.principles];
                        principles.splice(pIdx, 1);
                        setProfile({
                          ...profile,
                          aboutStory: { ...profile.aboutStory, principles },
                        });
                      }}
                      className="text-xs text-red-500"
                    >
                      Remove
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={principle.body}
                    onChange={(e) => {
                      const principles = [...profile.aboutStory.principles];
                      principles[pIdx].body = e.target.value;
                      setProfile({
                        ...profile,
                        aboutStory: { ...profile.aboutStory, principles },
                      });
                    }}
                    placeholder="Principle description..."
                    className="w-full rounded-md border border-[#d4cdc0] bg-white px-2.5 py-1.5 text-xs text-[#191c20]"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Contact Page & Cards */}
      {activeTab === "contact" && (
        <div className="space-y-6">
          {/* Live Preview of Contact Page */}
          <div className="rounded-xl border border-[#d2ddd9] bg-gradient-to-br from-[#f8faf9] to-[#edf4f2] p-5 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-[#dce6e3]">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0e5f5b]">
                Live Contact Page Preview
              </span>
              <span className="text-[11px] text-[#646b73]">
                Rendered across /contact
              </span>
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
                        {profile.contactSettings?.locationCard?.customText || `${profile.location?.city || "Dhaka"}, ${profile.location?.country || "Bangladesh"}`}
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
                    {profile.contactSettings?.bottomBanner?.text || "The portfolio and experience pages show how I work..."}
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
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      contactSettings: { ...(profile.contactSettings || {}), eyebrow: e.target.value },
                    })
                  }
                  placeholder="e.g. Contact or Get in Touch"
                  className="mt-1 w-full rounded-lg border border-[#d4cdc0] px-3 py-2 text-sm text-[#191c20]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4c535b]">Checklist Section Heading</label>
                <input
                  type="text"
                  value={profile.contactSettings?.helpfulHeading ?? "Helpful to include"}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      contactSettings: { ...(profile.contactSettings || {}), helpfulHeading: e.target.value },
                    })
                  }
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
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    contactSettings: { ...(profile.contactSettings || {}), headline: e.target.value },
                  })
                }
                placeholder="Let’s talk about your Salesforce team."
                className="mt-1 w-full rounded-lg border border-[#d4cdc0] px-3 py-2 text-sm text-[#191c20]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4c535b]">Intro Paragraph</label>
              <textarea
                rows={3}
                value={profile.contactSettings?.intro || ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    contactSettings: { ...(profile.contactSettings || {}), intro: e.target.value },
                  })
                }
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
                    setProfile({
                      ...profile,
                      contactSettings: { ...(profile.contactSettings || {}), helpful },
                    });
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
                        setProfile({
                          ...profile,
                          contactSettings: { ...(profile.contactSettings || {}), helpful },
                        });
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
                          setProfile({
                            ...profile,
                            contactSettings: { ...(profile.contactSettings || {}), helpful },
                          });
                        }}
                        className="rounded p-1 text-xs text-[#646b73] hover:bg-white disabled:opacity-30"
                        title="Move Up"
                      >
                        ▲
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
                          setProfile({
                            ...profile,
                            contactSettings: { ...(profile.contactSettings || {}), helpful },
                          });
                        }}
                        className="rounded p-1 text-xs text-[#646b73] hover:bg-white disabled:opacity-30"
                        title="Move Down"
                      >
                        ▼
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const helpful = [...(profile.contactSettings?.helpful || [])];
                          helpful.splice(idx, 1);
                          setProfile({
                            ...profile,
                            contactSettings: { ...(profile.contactSettings || {}), helpful },
                          });
                        }}
                        className="rounded p-1 text-xs text-red-600 hover:bg-red-50"
                        title="Delete"
                      >
                        ✕
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
                    setProfile({
                      ...profile,
                      contactSettings: {
                        ...(profile.contactSettings || {}),
                        emailCard: {
                          ...(profile.contactSettings?.emailCard || {}),
                          badge: e.target.value,
                        },
                      },
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
                    setProfile({
                      ...profile,
                      contactSettings: {
                        ...(profile.contactSettings || {}),
                        emailCard: {
                          ...(profile.contactSettings?.emailCard || {}),
                          customEmail: e.target.value,
                        },
                      },
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
                        setProfile({
                          ...profile,
                          contactSettings: {
                            ...(profile.contactSettings || {}),
                            emailCard: {
                              ...(profile.contactSettings?.emailCard || {}),
                              showWriteButton: e.target.checked,
                            },
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
                    setProfile({
                      ...profile,
                      contactSettings: {
                        ...(profile.contactSettings || {}),
                        emailCard: {
                          ...(profile.contactSettings?.emailCard || {}),
                          writeButtonText: e.target.value,
                        },
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
                        setProfile({
                          ...profile,
                          contactSettings: {
                            ...(profile.contactSettings || {}),
                            emailCard: {
                              ...(profile.contactSettings?.emailCard || {}),
                              showCopyButton: e.target.checked,
                            },
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
                    setProfile({
                      ...profile,
                      contactSettings: {
                        ...(profile.contactSettings || {}),
                        emailCard: {
                          ...(profile.contactSettings?.emailCard || {}),
                          copyButtonText: e.target.value,
                        },
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
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#0e5f5b]">
                3. LinkedIn Action Card
              </h3>
              <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                <input
                  type="checkbox"
                  checked={profile.contactSettings?.linkedinCard?.show !== false}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      contactSettings: {
                        ...(profile.contactSettings || {}),
                        linkedinCard: {
                          ...(profile.contactSettings?.linkedinCard || {}),
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

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold text-[#4c535b]">Card Label</label>
                <input
                  type="text"
                  value={profile.contactSettings?.linkedinCard?.label ?? "LinkedIn"}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      contactSettings: {
                        ...(profile.contactSettings || {}),
                        linkedinCard: {
                          ...(profile.contactSettings?.linkedinCard || {}),
                          label: e.target.value,
                        },
                      },
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
                    setProfile({
                      ...profile,
                      contactSettings: {
                        ...(profile.contactSettings || {}),
                        linkedinCard: {
                          ...(profile.contactSettings?.linkedinCard || {}),
                          displayText: e.target.value,
                        },
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
                        setProfile({
                          ...profile,
                          contactSettings: {
                            ...(profile.contactSettings || {}),
                            linkedinCard: {
                              ...(profile.contactSettings?.linkedinCard || {}),
                              displayText: preset,
                            },
                          },
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
                    setProfile({
                      ...profile,
                      contactSettings: {
                        ...(profile.contactSettings || {}),
                        linkedinCard: {
                          ...(profile.contactSettings?.linkedinCard || {}),
                          customUrl: e.target.value,
                        },
                      },
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
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#0e5f5b]">
                  4. Location Card
                </h3>
                <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.contactSettings?.locationCard?.show !== false}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        contactSettings: {
                          ...(profile.contactSettings || {}),
                          locationCard: {
                            ...(profile.contactSettings?.locationCard || {}),
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
                <label className="block text-xs font-semibold text-[#4c535b]">Card Label</label>
                <input
                  type="text"
                  value={profile.contactSettings?.locationCard?.label ?? "Location"}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      contactSettings: {
                        ...(profile.contactSettings || {}),
                        locationCard: {
                          ...(profile.contactSettings?.locationCard || {}),
                          label: e.target.value,
                        },
                      },
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
                    setProfile({
                      ...profile,
                      contactSettings: {
                        ...(profile.contactSettings || {}),
                        locationCard: {
                          ...(profile.contactSettings?.locationCard || {}),
                          customText: e.target.value,
                        },
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
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#0e5f5b]">
                  5. CV Card
                </h3>
                <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.contactSettings?.cvCard?.show !== false}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        contactSettings: {
                          ...(profile.contactSettings || {}),
                          cvCard: {
                            ...(profile.contactSettings?.cvCard || {}),
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
                <label className="block text-xs font-semibold text-[#4c535b]">Card Label</label>
                <input
                  type="text"
                  value={profile.contactSettings?.cvCard?.label ?? "CV"}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      contactSettings: {
                        ...(profile.contactSettings || {}),
                        cvCard: {
                          ...(profile.contactSettings?.cvCard || {}),
                          label: e.target.value,
                        },
                      },
                    })
                  }
                  className="mt-1 w-full rounded-lg border border-[#d4cdc0] px-3 py-2 text-sm text-[#191c20]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4c535b]">
                  Card Subtext <span className="font-normal text-[#646b73]">(Leave blank for no subtext; no PDF/size needed)</span>
                </label>
                <input
                  type="text"
                  value={profile.contactSettings?.cvCard?.subtext ?? "Curriculum Vitae"}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      contactSettings: {
                        ...(profile.contactSettings || {}),
                        cvCard: {
                          ...(profile.contactSettings?.cvCard || {}),
                          subtext: e.target.value,
                        },
                      },
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
                    setProfile({
                      ...profile,
                      contactSettings: {
                        ...(profile.contactSettings || {}),
                        cvCard: {
                          ...(profile.contactSettings?.cvCard || {}),
                          buttonLabel: e.target.value,
                        },
                      },
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
                    setProfile({
                      ...profile,
                      contactSettings: {
                        ...(profile.contactSettings || {}),
                        bottomBanner: {
                          ...(profile.contactSettings?.bottomBanner || {}),
                          show: e.target.checked,
                        },
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
                    setProfile({
                      ...profile,
                      contactSettings: {
                        ...(profile.contactSettings || {}),
                        bottomBanner: {
                          ...(profile.contactSettings?.bottomBanner || {}),
                          boldPrefix: e.target.value,
                        },
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
                  value={profile.contactSettings?.bottomBanner?.text ?? "The portfolio and experience pages show how I work and what I’ve done."}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      contactSettings: {
                        ...(profile.contactSettings || {}),
                        bottomBanner: {
                          ...(profile.contactSettings?.bottomBanner || {}),
                          text: e.target.value,
                        },
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
                        setProfile({
                          ...profile,
                          contactSettings: {
                            ...(profile.contactSettings || {}),
                            bottomBanner: {
                              ...(profile.contactSettings?.bottomBanner || {}),
                              primaryButton: {
                                ...(profile.contactSettings?.bottomBanner?.primaryButton || {}),
                                show: e.target.checked,
                              },
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
                        setProfile({
                          ...profile,
                          contactSettings: {
                            ...(profile.contactSettings || {}),
                            bottomBanner: {
                              ...(profile.contactSettings?.bottomBanner || {}),
                              primaryButton: {
                                ...(profile.contactSettings?.bottomBanner?.primaryButton || {}),
                                label: e.target.value,
                              },
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
                        setProfile({
                          ...profile,
                          contactSettings: {
                            ...(profile.contactSettings || {}),
                            bottomBanner: {
                              ...(profile.contactSettings?.bottomBanner || {}),
                              primaryButton: {
                                ...(profile.contactSettings?.bottomBanner?.primaryButton || {}),
                                url: e.target.value,
                              },
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
                        setProfile({
                          ...profile,
                          contactSettings: {
                            ...(profile.contactSettings || {}),
                            bottomBanner: {
                              ...(profile.contactSettings?.bottomBanner || {}),
                              secondaryButton: {
                                ...(profile.contactSettings?.bottomBanner?.secondaryButton || {}),
                                show: e.target.checked,
                              },
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
                        setProfile({
                          ...profile,
                          contactSettings: {
                            ...(profile.contactSettings || {}),
                            bottomBanner: {
                              ...(profile.contactSettings?.bottomBanner || {}),
                              secondaryButton: {
                                ...(profile.contactSettings?.bottomBanner?.secondaryButton || {}),
                                label: e.target.value,
                              },
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
                        setProfile({
                          ...profile,
                          contactSettings: {
                            ...(profile.contactSettings || {}),
                            bottomBanner: {
                              ...(profile.contactSettings?.bottomBanner || {}),
                              secondaryButton: {
                                ...(profile.contactSettings?.bottomBanner?.secondaryButton || {}),
                                url: e.target.value,
                              },
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
      )}

      {/* Tab 4: SEO & Settings */}
      {activeTab === "seo" && (
        <div className="rounded-xl border border-[#e6e1d8] bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#0e5f5b]">Site-wide SEO & Walkthrough</h3>
          <div>
            <label className="block text-xs font-semibold text-[#4c535b]">Meta Title Suffix</label>
            <input
              type="text"
              value={profile.siteMeta?.titleSuffix || ""}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  siteMeta: { ...profile.siteMeta, titleSuffix: e.target.value },
                })
              }
              className="mt-1 w-full rounded-lg border border-[#d4cdc0] px-3 py-2 text-sm text-[#191c20]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4c535b]">Meta Description</label>
            <textarea
              rows={3}
              value={profile.siteMeta?.description || ""}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  siteMeta: { ...profile.siteMeta, description: e.target.value },
                })
              }
              className="mt-1 w-full rounded-lg border border-[#d4cdc0] px-3 py-2 text-sm text-[#191c20]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4c535b]">
              Home Page Featured Walkthrough Project Slug
            </label>
            <input
              type="text"
              value={profile.homeSettings?.featuredWalkthrough?.slug || ""}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  homeSettings: {
                    ...profile.homeSettings,
                    featuredWalkthrough: {
                      ...profile.homeSettings?.featuredWalkthrough,
                      slug: e.target.value,
                    },
                  },
                })
              }
              placeholder="e.g. lead-routing-flow"
              className="mt-1 w-full rounded-lg border border-[#d4cdc0] px-3 py-2 text-sm text-[#191c20]"
            />
          </div>
        </div>
      )}

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-[#0e5f5b] px-6 py-3 text-xs font-semibold text-white shadow-sm transition hover:bg-[#0a4744] disabled:opacity-50"
        >
          {saving ? "Saving Changes..." : "Save All Changes"}
        </button>
      </div>
    </form>
  );
}
