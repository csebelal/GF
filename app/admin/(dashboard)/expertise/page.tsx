"use client";

import { useEffect, useState } from "react";
import { Close, Plus } from "@/components/Icons";
import {
  AdminAlert,
  AdminCard,
  AdminField,
  adminDangerIconBtnClass,
  adminFocusRing,
  adminInputClass,
  adminInputCompactClass,
  adminPrimaryBtnClass,
  adminTextareaClass,
} from "@/components/admin/ui/FormPrimitives";

export default function AdminExpertisePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetch("/api/admin/expertise")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => {
        setMessage({ text: "Failed to load expertise data", type: "error" });
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/expertise", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      setMessage({ text: "Expertise & working approach updated successfully!", type: "success" });
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to update expertise", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const addPractice = (areaIdx: number) => {
    const areas = [...data.areas];
    areas[areaIdx].practices.push("New administrative practice or procedure");
    setData({ ...data, areas });
  };

  const removePractice = (areaIdx: number, pIdx: number) => {
    const areas = [...data.areas];
    areas[areaIdx].practices.splice(pIdx, 1);
    setData({ ...data, areas });
  };

  if (loading) {
    return (
      <AdminCard className="mx-auto max-w-4xl p-12 text-center text-sm text-body">
        Loading expertise data...
      </AdminCard>
    );
  }
  if (!data) {
    return (
      <AdminCard className="mx-auto max-w-4xl p-12 text-center text-sm text-danger">
        Expertise data unavailable.
      </AdminCard>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-8 pb-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-ink">
            Expertise Domains & Working Approach
          </h2>
          <p className="mt-0.5 text-sm text-body">
            Manage functional Salesforce domains, business problems, practices, tools, and the 5-step approach.
          </p>
        </div>
        <button type="submit" disabled={saving} className={adminPrimaryBtnClass}>
          {saving ? "Saving Changes..." : "Save Expertise"}
        </button>
      </div>

      <AdminAlert message={message} />

      {/* Expertise Domains */}
      <AdminCard className="space-y-6">
        <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-accent">
          1. Core Expertise Domains ({data.areas?.length || 0})
        </h3>

        {(data.areas || []).map((area: any, areaIdx: number) => (
          <div
            key={area.id || areaIdx}
            className="space-y-4 rounded-xl border border-line bg-canvas p-5"
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <AdminField label="Domain Title" className="sm:col-span-2">
                {({ id }) => (
                  <input
                    id={id}
                    type="text"
                    required
                    value={area.title || ""}
                    onChange={(e) => {
                      const areas = [...data.areas];
                      areas[areaIdx].title = e.target.value;
                      setData({ ...data, areas });
                    }}
                    className={`${adminInputClass} font-semibold`}
                  />
                )}
              </AdminField>

              <AdminField label="Short Title (Pill)">
                {({ id }) => (
                  <input
                    id={id}
                    type="text"
                    required
                    value={area.shortTitle || ""}
                    onChange={(e) => {
                      const areas = [...data.areas];
                      areas[areaIdx].shortTitle = e.target.value;
                      setData({ ...data, areas });
                    }}
                    className={adminInputClass}
                  />
                )}
              </AdminField>
            </div>

            <AdminField label="Business Problem It Solves">
              {({ id }) => (
                <textarea
                  id={id}
                  rows={2}
                  value={area.problem || ""}
                  onChange={(e) => {
                    const areas = [...data.areas];
                    areas[areaIdx].problem = e.target.value;
                    setData({ ...data, areas });
                  }}
                  className={`${adminTextareaClass} text-xs`}
                />
              )}
            </AdminField>

            <AdminField label="Tools (comma-separated)">
              {({ id }) => (
                <input
                  id={id}
                  type="text"
                  value={(area.tools || []).join(", ")}
                  onChange={(e) => {
                    const areas = [...data.areas];
                    areas[areaIdx].tools = e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean);
                    setData({ ...data, areas });
                  }}
                  className={adminInputCompactClass}
                />
              )}
            </AdminField>

            <div className="space-y-2.5 border-t border-line pt-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-body">Practices (Bullet points)</span>
                <button
                  type="button"
                  onClick={() => addPractice(areaIdx)}
                  className={`inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-accent-strong hover:bg-accent-soft ${adminFocusRing}`}
                >
                  <Plus className="size-3.5" />
                  <span>Add Practice</span>
                </button>
              </div>

              {(area.practices || []).map((practice: string, pIdx: number) => (
                <div key={pIdx} className="flex items-center gap-2">
                  <input
                    type="text"
                    aria-label={`${area.title || `Domain ${areaIdx + 1}`} practice ${pIdx + 1}`}
                    value={practice}
                    onChange={(e) => {
                      const areas = [...data.areas];
                      areas[areaIdx].practices[pIdx] = e.target.value;
                      setData({ ...data, areas });
                    }}
                    className={adminInputCompactClass}
                  />
                  <button
                    type="button"
                    onClick={() => removePractice(areaIdx, pIdx)}
                    aria-label={`Remove practice ${pIdx + 1}`}
                    className={adminDangerIconBtnClass}
                  >
                    <Close className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </AdminCard>

      {/* Working Approach Steps */}
      <AdminCard className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-accent">
          2. Working Approach Steps (Home Page Section)
        </h3>

        {(data.workingApproach || []).map((step: any, idx: number) => (
          <div key={idx} className="space-y-3 rounded-xl border border-line bg-canvas p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-accent-strong">Step {idx + 1}</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <AdminField label="Step Title">
                {({ id }) => (
                  <input
                    id={id}
                    type="text"
                    value={step.title || ""}
                    onChange={(e) => {
                      const steps = [...data.workingApproach];
                      steps[idx].title = e.target.value;
                      setData({ ...data, workingApproach: steps });
                    }}
                    className={`${adminInputCompactClass} font-medium`}
                  />
                )}
              </AdminField>

              <AdminField label="Key Artifact / Detail">
                {({ id }) => (
                  <input
                    id={id}
                    type="text"
                    value={step.detail || ""}
                    onChange={(e) => {
                      const steps = [...data.workingApproach];
                      steps[idx].detail = e.target.value;
                      setData({ ...data, workingApproach: steps });
                    }}
                    className={`${adminInputCompactClass} text-body`}
                  />
                )}
              </AdminField>

              <AdminField label="Description" className="sm:col-span-2">
                {({ id }) => (
                  <textarea
                    id={id}
                    rows={2}
                    value={step.body || ""}
                    onChange={(e) => {
                      const steps = [...data.workingApproach];
                      steps[idx].body = e.target.value;
                      setData({ ...data, workingApproach: steps });
                    }}
                    className={`${adminTextareaClass} text-xs`}
                  />
                )}
              </AdminField>
            </div>
          </div>
        ))}
      </AdminCard>

      <div className="flex justify-end">
        <button type="submit" disabled={saving} className={adminPrimaryBtnClass}>
          {saving ? "Saving Changes..." : "Save Expertise"}
        </button>
      </div>
    </form>
  );
}
