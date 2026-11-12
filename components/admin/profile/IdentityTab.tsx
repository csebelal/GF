"use client";

import { useState } from "react";
import { FileText, ImageIcon } from "@/components/Icons";
import {
  AdminCard,
  AdminField,
  adminInputClass,
} from "@/components/admin/ui/FormPrimitives";
import type { ProfileMessage, ProfileTabProps } from "./types";

interface IdentityTabProps extends ProfileTabProps {
  onMessage: (message: ProfileMessage | null) => void;
}

export function IdentityTab({ profile, setProfile, onMessage }: IdentityTabProps) {
  const [uploadingPortrait, setUploadingPortrait] = useState(false);
  const [uploadingCv, setUploadingCv] = useState(false);

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
      onMessage({ text: "Portrait uploaded successfully!", type: "success" });
    } catch (err: any) {
      onMessage({ text: err.message || "Portrait upload failed", type: "error" });
    } finally {
      setUploadingPortrait(false);
      e.target.value = "";
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
      onMessage({ text: "CV PDF uploaded successfully!", type: "success" });
    } catch (err: any) {
      onMessage({ text: err.message || "CV upload failed", type: "error" });
    } finally {
      setUploadingCv(false);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <AdminCard className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-accent">
          1. Basic Identity
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminField label="Full Name">
            {({ id }) => (
              <input
                id={id}
                type="text"
                required
                value={profile.name || ""}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className={adminInputClass}
              />
            )}
          </AdminField>

          <AdminField label="Short Name (Greeting)">
            {({ id }) => (
              <input
                id={id}
                type="text"
                required
                value={profile.shortName || ""}
                onChange={(e) => setProfile({ ...profile, shortName: e.target.value })}
                className={adminInputClass}
              />
            )}
          </AdminField>

          <AdminField label="Current Job Title">
            {({ id }) => (
              <input
                id={id}
                type="text"
                required
                value={profile.jobTitle || ""}
                onChange={(e) => setProfile({ ...profile, jobTitle: e.target.value })}
                className={adminInputClass}
              />
            )}
          </AdminField>

          <AdminField label="Employer">
            {({ id }) => (
              <input
                id={id}
                type="text"
                required
                value={profile.employer || ""}
                onChange={(e) => setProfile({ ...profile, employer: e.target.value })}
                className={adminInputClass}
              />
            )}
          </AdminField>

          <AdminField label="City">
            {({ id }) => (
              <input
                id={id}
                type="text"
                value={profile.location?.city || ""}
                onChange={(e) =>
                  setProfile({ ...profile, location: { ...profile.location, city: e.target.value } })
                }
                className={adminInputClass}
              />
            )}
          </AdminField>

          <AdminField label="Country">
            {({ id }) => (
              <input
                id={id}
                type="text"
                value={profile.location?.country || ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    location: { ...profile.location, country: e.target.value },
                  })
                }
                className={adminInputClass}
              />
            )}
          </AdminField>

          <AdminField label="Contact Email">
            {({ id }) => (
              <input
                id={id}
                type="email"
                required
                value={profile.email || ""}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className={adminInputClass}
              />
            )}
          </AdminField>

          <AdminField label="LinkedIn URL">
            {({ id }) => (
              <input
                id={id}
                type="url"
                value={profile.linkedin?.url || ""}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    linkedin: {
                      ...profile.linkedin,
                      url: e.target.value,
                      label: e.target.value.replace(/^https?:\/\//, ""),
                    },
                  })
                }
                className={adminInputClass}
              />
            )}
          </AdminField>
        </div>
      </AdminCard>

      {/* Media & CV */}
      <div className="grid gap-6 sm:grid-cols-2">
        <AdminCard>
          <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-accent">
            Profile Portrait
          </h3>
          <div className="mt-4 flex items-center gap-4">
            {profile.portrait?.src ? (
              <img
                src={profile.portrait.src}
                alt="Portrait Preview"
                className="size-20 rounded-xl border border-line object-cover"
              />
            ) : null}
            <div className="flex-1 space-y-2">
              <label
                className={`inline-flex min-h-[38px] cursor-pointer items-center gap-2 rounded-xl bg-accent px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-accent-strong focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2 ${
                  uploadingPortrait ? "pointer-events-none opacity-60" : ""
                }`}
              >
                <ImageIcon className="size-4" />
                <span>{uploadingPortrait ? "Uploading..." : "Upload Portrait"}</span>
                <input
                  type="file"
                  accept=".png,.jpg,.jpeg,.webp,image/png,image/jpeg,image/webp"
                  onChange={handlePortraitUpload}
                  disabled={uploadingPortrait}
                  className="sr-only"
                />
              </label>
              <p className="text-xs text-muted">PNG, JPG, or WebP (max 5 MB)</p>
            </div>
          </div>
        </AdminCard>

        <AdminCard>
          <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-accent">CV Document</h3>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-body">
              <span>
                Current: <strong className="text-ink">{profile.cv?.downloadName || "CV Document"}</strong>
              </span>
              <span className="text-muted">{profile.cv?.sizeLabel}</span>
            </div>
            <div>
              <label
                className={`inline-flex min-h-[38px] cursor-pointer items-center gap-2 rounded-xl bg-accent px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-accent-strong focus-within:ring-2 focus-within:ring-accent focus-within:ring-offset-2 ${
                  uploadingCv ? "pointer-events-none opacity-60" : ""
                }`}
              >
                <FileText className="size-4" />
                <span>{uploadingCv ? "Uploading CV..." : "Upload New CV PDF"}</span>
                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleCvUpload}
                  disabled={uploadingCv}
                  className="sr-only"
                />
              </label>
            </div>
          </div>
        </AdminCard>
      </div>
    </div>
  );
}
