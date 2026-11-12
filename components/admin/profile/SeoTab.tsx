"use client";

import {
  AdminCard,
  AdminField,
  adminInputClass,
  adminTextareaClass,
} from "@/components/admin/ui/FormPrimitives";
import type { ProfileTabProps } from "./types";

export function SeoTab({ profile, setProfile }: ProfileTabProps) {
  return (
    <AdminCard className="space-y-4">
      <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-accent">
        Site-wide SEO & Walkthrough
      </h3>

      <AdminField label="Meta Title Suffix">
        {({ id }) => (
          <input
            id={id}
            type="text"
            value={profile.siteMeta?.titleSuffix || ""}
            onChange={(e) =>
              setProfile({
                ...profile,
                siteMeta: { ...profile.siteMeta, titleSuffix: e.target.value },
              })
            }
            className={adminInputClass}
          />
        )}
      </AdminField>

      <AdminField label="Meta Description">
        {({ id }) => (
          <textarea
            id={id}
            rows={3}
            value={profile.siteMeta?.description || ""}
            onChange={(e) =>
              setProfile({
                ...profile,
                siteMeta: { ...profile.siteMeta, description: e.target.value },
              })
            }
            className={adminTextareaClass}
          />
        )}
      </AdminField>

      <AdminField label="Home Page Featured Walkthrough Project Slug">
        {({ id }) => (
          <input
            id={id}
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
            className={adminInputClass}
          />
        )}
      </AdminField>
    </AdminCard>
  );
}
