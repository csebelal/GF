"use client";

import { useEffect, useState } from "react";

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

  if (loading) return <div className="p-8 text-center text-sm text-[#646b73]">Loading expertise data...</div>;
  if (!data) return <div className="p-8 text-center text-sm text-red-600">Expertise data unavailable.</div>;

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-8 pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#191c20]">Expertise Domains & Working Approach</h2>
          <p className="text-xs text-[#646b73]">
            Manage functional Salesforce domains, business problems, practices, tools, and the 5-step approach
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-[#0e5f5b] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0a4744] disabled:opacity-50"
        >
          {saving ? "Saving Changes..." : "Save Expertise"}
        </button>
      </div>

      {message && (
        <div
          className={`rounded-lg p-3 text-sm ${
            message.type === "success"
              ? "border border-green-200 bg-green-50 text-green-800"
              : "border border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Expertise Domains */}
      <div className="rounded-xl border border-[#e6e1d8] bg-white p-6 shadow-sm space-y-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#0e5f5b]">
          1. Core Expertise Domains ({data.areas?.length || 0})
        </h3>

        {(data.areas || []).map((area: any, areaIdx: number) => (
          <div key={area.id || areaIdx} className="rounded-xl border border-[#e6e1d8] bg-[#faf8f4] p-5 space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-[#4c535b]">Domain Title</label>
                <input
                  type="text"
                  required
                  value={area.title || ""}
                  onChange={(e) => {
                    const areas = [...data.areas];
                    areas[areaIdx].title = e.target.value;
                    setData({ ...data, areas });
                  }}
                  className="mt-1 w-full rounded border border-[#d4cdc0] px-3 py-1.5 text-sm font-semibold text-[#191c20]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#4c535b]">Short Title (Pill)</label>
                <input
                  type="text"
                  required
                  value={area.shortTitle || ""}
                  onChange={(e) => {
                    const areas = [...data.areas];
                    areas[areaIdx].shortTitle = e.target.value;
                    setData({ ...data, areas });
                  }}
                  className="mt-1 w-full rounded border border-[#d4cdc0] px-3 py-1.5 text-xs text-[#191c20]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#4c535b]">Business Problem It Solves</label>
              <textarea
                rows={2}
                value={area.problem || ""}
                onChange={(e) => {
                  const areas = [...data.areas];
                  areas[areaIdx].problem = e.target.value;
                  setData({ ...data, areas });
                }}
                className="mt-1 w-full rounded border border-[#d4cdc0] px-3 py-1.5 text-xs text-[#191c20]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#4c535b]">Tools (comma-separated)</label>
              <input
                type="text"
                value={(area.tools || []).join(", ")}
                onChange={(e) => {
                  const areas = [...data.areas];
                  areas[areaIdx].tools = e.target.value.split(",").map((t) => t.trim()).filter(Boolean);
                  setData({ ...data, areas });
                }}
                className="mt-1 w-full rounded border border-[#d4cdc0] px-3 py-1.5 text-xs text-[#191c20]"
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-[#e6e1d8]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-[#4c535b]">Practices (Bullet points)</span>
                <button
                  type="button"
                  onClick={() => addPractice(areaIdx)}
                  className="text-[11px] font-semibold text-[#0e5f5b] hover:underline"
                >
                  + Add Practice
                </button>
              </div>

              {(area.practices || []).map((practice: string, pIdx: number) => (
                <div key={pIdx} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={practice}
                    onChange={(e) => {
                      const areas = [...data.areas];
                      areas[areaIdx].practices[pIdx] = e.target.value;
                      setData({ ...data, areas });
                    }}
                    className="flex-1 rounded border border-[#d4cdc0] px-2.5 py-1 text-xs text-[#191c20]"
                  />
                  <button
                    type="button"
                    onClick={() => removePractice(areaIdx, pIdx)}
                    className="text-xs text-red-500"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Working Approach Steps */}
      <div className="rounded-xl border border-[#e6e1d8] bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#0e5f5b]">
          2. Working Approach Steps (Home Page Section)
        </h3>

        {(data.workingApproach || []).map((step: any, idx: number) => (
          <div key={idx} className="rounded-lg border border-[#e6e1d8] bg-[#faf8f4] p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0e5f5b]">Step {idx + 1}</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-[11px] font-semibold text-[#4c535b]">Step Title</label>
                <input
                  type="text"
                  value={step.title || ""}
                  onChange={(e) => {
                    const steps = [...data.workingApproach];
                    steps[idx].title = e.target.value;
                    setData({ ...data, workingApproach: steps });
                  }}
                  className="mt-1 w-full rounded border border-[#d4cdc0] px-2.5 py-1 text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#4c535b]">Key Artifact / Detail</label>
                <input
                  type="text"
                  value={step.detail || ""}
                  onChange={(e) => {
                    const steps = [...data.workingApproach];
                    steps[idx].detail = e.target.value;
                    setData({ ...data, workingApproach: steps });
                  }}
                  className="mt-1 w-full rounded border border-[#d4cdc0] px-2.5 py-1 text-xs text-[#646b73]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-[#4c535b]">Description</label>
                <textarea
                  rows={2}
                  value={step.body || ""}
                  onChange={(e) => {
                    const steps = [...data.workingApproach];
                    steps[idx].body = e.target.value;
                    setData({ ...data, workingApproach: steps });
                  }}
                  className="mt-1 w-full rounded border border-[#d4cdc0] px-2.5 py-1 text-xs"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-[#0e5f5b] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0a4744] disabled:opacity-50"
        >
          {saving ? "Saving Changes..." : "Save Expertise"}
        </button>
      </div>
    </form>
  );
}
