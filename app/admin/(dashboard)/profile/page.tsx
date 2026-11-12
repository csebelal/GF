"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AboutTab } from "@/components/admin/profile/AboutTab";
import { ContactTab } from "@/components/admin/profile/ContactTab";
import { FooterTab } from "@/components/admin/profile/FooterTab";
import { HeroTab } from "@/components/admin/profile/HeroTab";
import { IdentityTab } from "@/components/admin/profile/IdentityTab";
import { NavTab } from "@/components/admin/profile/NavTab";
import { SeoTab } from "@/components/admin/profile/SeoTab";
import {
  PROFILE_TABS,
  type ProfileMessage,
  type ProfileTabKey,
} from "@/components/admin/profile/types";

const VALID_TABS = new Set<string>(PROFILE_TABS.map((t) => t.key));

export default function AdminProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-[#4c535b]">
          Loading Profile & Site settings...
        </div>
      }
    >
      <ProfileEditor />
    </Suspense>
  );
}

function ProfileEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab");

  const [profile, setProfile] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<ProfileTabKey>(
    tabFromUrl && VALID_TABS.has(tabFromUrl) ? (tabFromUrl as ProfileTabKey) : "hero"
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<ProfileMessage | null>(null);

  useEffect(() => {
    if (tabFromUrl && VALID_TABS.has(tabFromUrl)) {
      setActiveTab(tabFromUrl as ProfileTabKey);
    }
  }, [tabFromUrl]);

  const handleTabChange = (key: ProfileTabKey) => {
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
    return <div className="p-8 text-center text-sm text-[#4c535b]">Loading profile data...</div>;
  }

  if (!profile) {
    return <div className="p-8 text-center text-sm text-[#991b1b]">Profile data not available.</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-6 pb-16">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#191c20]">
            Profile & Content Management
          </h2>
          <p className="text-xs text-[#4c535b]">
            Manage your menu bar, footer, hero fold, bio, story, and SEO metadata
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="cursor-pointer rounded-xl bg-[#0e5f5b] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-[#0a4744] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e5f5b] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving Changes..." : "Save All Changes"}
        </button>
      </div>

      {message && (
        <div
          role={message.type === "error" ? "alert" : "status"}
          aria-live="polite"
          className={`rounded-xl p-3.5 text-xs ${
            message.type === "success"
              ? "border border-green-200 bg-green-50 text-[#166534]"
              : "border border-red-200 bg-red-50 text-[#991b1b]"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Tabs Header */}
      <div
        role="tablist"
        aria-label="Profile sections"
        className="flex flex-wrap gap-2 border-b border-[#e6e1d8] pb-2"
      >
        {PROFILE_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`cursor-pointer rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e5f5b] focus-visible:ring-offset-2 ${
              activeTab === tab.key
                ? "bg-[#0e5f5b] text-white"
                : "text-[#4c535b] hover:bg-[#f3efe8] hover:text-[#191c20]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "hero" && <HeroTab profile={profile} setProfile={setProfile} />}
      {activeTab === "nav" && <NavTab profile={profile} setProfile={setProfile} />}
      {activeTab === "footer" && <FooterTab profile={profile} setProfile={setProfile} />}
      {activeTab === "identity" && (
        <IdentityTab profile={profile} setProfile={setProfile} onMessage={setMessage} />
      )}
      {activeTab === "about" && <AboutTab profile={profile} setProfile={setProfile} />}
      {activeTab === "contact" && <ContactTab profile={profile} setProfile={setProfile} />}
      {activeTab === "seo" && <SeoTab profile={profile} setProfile={setProfile} />}

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={saving}
          className="cursor-pointer rounded-xl bg-[#0e5f5b] px-6 py-3 text-xs font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-[#0a4744] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e5f5b] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving Changes..." : "Save All Changes"}
        </button>
      </div>
    </form>
  );
}
