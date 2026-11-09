"use client";

import { useEffect, useState } from "react";

export default function AdminExperiencePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetch("/api/admin/experience")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => {
        setMessage({ text: "Failed to load experience data", type: "error" });
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/experience", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      setMessage({ text: "Experience & credentials updated successfully!", type: "success" });
    } catch (err: any) {
      setMessage({ text: err.message || "Failed to update experience", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  // Helper functions for adding items
  const addEmployer = () => {
    setData({
      ...data,
      employers: [
        {
          company: "New Company",
          roles: [
            {
              title: "Salesforce Administrator",
              start: "2025-01",
              end: "present",
              responsibilities: [{ text: "Key responsibility" }],
            },
          ],
        },
        ...(data.employers || []),
      ],
    });
  };

  const removeEmployer = (index: number) => {
    const employers = [...data.employers];
    employers.splice(index, 1);
    setData({ ...data, employers });
  };

  const addRole = (empIndex: number) => {
    const employers = [...data.employers];
    employers[empIndex].roles.push({
      title: "New Role",
      start: "2024-01",
      end: "2024-12",
      responsibilities: [{ text: "Responsibility description" }],
    });
    setData({ ...data, employers });
  };

  const addResponsibility = (empIndex: number, roleIndex: number) => {
    const employers = [...data.employers];
    employers[empIndex].roles[roleIndex].responsibilities.push({
      theme: "General",
      text: "New responsibility detail",
    });
    setData({ ...data, employers });
  };

  const removeResponsibility = (empIndex: number, roleIndex: number, respIndex: number) => {
    const employers = [...data.employers];
    employers[empIndex].roles[roleIndex].responsibilities.splice(respIndex, 1);
    setData({ ...data, employers });
  };

  if (loading) return <div className="p-8 text-center text-sm text-[#646b73]">Loading experience data...</div>;
  if (!data) return <div className="p-8 text-center text-sm text-red-600">Experience data unavailable.</div>;

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-8 pb-16">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#191c20]">Experience & Career History</h2>
          <p className="text-xs text-[#646b73]">
            Manage employers, roles, promotions, formal certifications, education, and tools
          </p>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-[#0e5f5b] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0a4744] disabled:opacity-50"
        >
          {saving ? "Saving Changes..." : "Save Experience"}
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

      {/* Employers Section */}
      <div className="rounded-xl border border-[#e6e1d8] bg-white p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#0e5f5b]">
            1. Employers & Positions ({data.employers?.length || 0})
          </h3>
          <button
            type="button"
            onClick={addEmployer}
            className="rounded bg-[#e1eeec] px-3 py-1 text-xs font-semibold text-[#0e5f5b] hover:bg-[#b9d6d2]"
          >
            + Add Employer
          </button>
        </div>

        {(data.employers || []).map((emp: any, empIdx: number) => (
          <div key={empIdx} className="rounded-xl border border-[#e6e1d8] bg-[#faf8f4] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 mr-4">
                <label className="block text-[11px] font-semibold text-[#4c535b]">Company Name</label>
                <input
                  type="text"
                  required
                  value={emp.company || ""}
                  onChange={(e) => {
                    const employers = [...data.employers];
                    employers[empIdx].company = e.target.value;
                    setData({ ...data, employers });
                  }}
                  className="mt-1 w-full rounded border border-[#d4cdc0] px-3 py-1.5 text-sm font-semibold text-[#191c20]"
                />
              </div>
              <button
                type="button"
                onClick={() => removeEmployer(empIdx)}
                className="mt-4 text-xs text-red-600 hover:underline"
              >
                Delete Company
              </button>
            </div>

            {/* Promotion label */}
            <div className="grid grid-cols-2 gap-3 border-t border-[#e6e1d8] pt-3">
              <div>
                <label className="block text-[11px] font-semibold text-[#4c535b]">Promotion Date (Optional)</label>
                <input
                  type="text"
                  value={emp.promotion?.date || ""}
                  onChange={(e) => {
                    const employers = [...data.employers];
                    employers[empIdx].promotion = {
                      ...(employers[empIdx].promotion || {}),
                      date: e.target.value,
                    };
                    setData({ ...data, employers });
                  }}
                  placeholder="e.g. 2025-01"
                  className="mt-1 w-full rounded border border-[#d4cdc0] px-2.5 py-1 text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-[#4c535b]">Promotion Label</label>
                <input
                  type="text"
                  value={emp.promotion?.label || ""}
                  onChange={(e) => {
                    const employers = [...data.employers];
                    employers[empIdx].promotion = {
                      ...(employers[empIdx].promotion || {}),
                      label: e.target.value,
                    };
                    setData({ ...data, employers });
                  }}
                  placeholder="e.g. Promoted to Salesforce Administrator"
                  className="mt-1 w-full rounded border border-[#d4cdc0] px-2.5 py-1 text-xs"
                />
              </div>
            </div>

            {/* Roles inside Company */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#191c20]">Roles at {emp.company}</span>
                <button
                  type="button"
                  onClick={() => addRole(empIdx)}
                  className="text-xs font-semibold text-[#0e5f5b] hover:underline"
                >
                  + Add Role
                </button>
              </div>

              {(emp.roles || []).map((role: any, roleIdx: number) => (
                <div key={roleIdx} className="rounded-lg border border-[#e6e1d8] bg-white p-4 space-y-3">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="sm:col-span-1">
                      <label className="block text-[11px] font-semibold text-[#4c535b]">Role Title</label>
                      <input
                        type="text"
                        required
                        value={role.title || ""}
                        onChange={(e) => {
                          const employers = [...data.employers];
                          employers[empIdx].roles[roleIdx].title = e.target.value;
                          setData({ ...data, employers });
                        }}
                        className="mt-1 w-full rounded border border-[#d4cdc0] px-2.5 py-1 text-xs font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#4c535b]">Start Date (YYYY-MM)</label>
                      <input
                        type="text"
                        required
                        value={role.start || ""}
                        onChange={(e) => {
                          const employers = [...data.employers];
                          employers[empIdx].roles[roleIdx].start = e.target.value;
                          setData({ ...data, employers });
                        }}
                        className="mt-1 w-full rounded border border-[#d4cdc0] px-2.5 py-1 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#4c535b]">End Date (or present)</label>
                      <input
                        type="text"
                        required
                        value={role.end || ""}
                        onChange={(e) => {
                          const employers = [...data.employers];
                          employers[empIdx].roles[roleIdx].end = e.target.value;
                          setData({ ...data, employers });
                        }}
                        className="mt-1 w-full rounded border border-[#d4cdc0] px-2.5 py-1 text-xs"
                      />
                    </div>
                  </div>

                  {/* Responsibilities */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-[#4c535b]">Responsibilities</span>
                      <button
                        type="button"
                        onClick={() => addResponsibility(empIdx, roleIdx)}
                        className="text-[11px] font-semibold text-[#0e5f5b] hover:underline"
                      >
                        + Add Bullet Point
                      </button>
                    </div>

                    {(role.responsibilities || []).map((resp: any, respIdx: number) => (
                      <div key={respIdx} className="flex gap-2 items-start">
                        <input
                          type="text"
                          value={resp.theme || ""}
                          onChange={(e) => {
                            const employers = [...data.employers];
                            employers[empIdx].roles[roleIdx].responsibilities[respIdx].theme = e.target.value;
                            setData({ ...data, employers });
                          }}
                          placeholder="Theme (optional)"
                          className="w-36 rounded border border-[#d4cdc0] px-2 py-1 text-xs text-[#646b73]"
                        />
                        <textarea
                          rows={2}
                          value={resp.text || ""}
                          onChange={(e) => {
                            const employers = [...data.employers];
                            employers[empIdx].roles[roleIdx].responsibilities[respIdx].text = e.target.value;
                            setData({ ...data, employers });
                          }}
                          placeholder="Describe the responsibility or achievement..."
                          className="flex-1 rounded border border-[#d4cdc0] px-2.5 py-1 text-xs text-[#191c20]"
                        />
                        <button
                          type="button"
                          onClick={() => removeResponsibility(empIdx, roleIdx, respIdx)}
                          className="text-xs text-red-500 hover:text-red-700 px-1 pt-1"
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
        ))}
      </div>

      {/* Certifications & Courses */}
      <div className="rounded-xl border border-[#e6e1d8] bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#0e5f5b]">
          2. Certifications & Course Completions
        </h3>

        {/* Certifications */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#191c20]">Formal Certifications</span>
            <button
              type="button"
              onClick={() => {
                setData({
                  ...data,
                  certifications: [
                    ...(data.certifications || []),
                    { name: "New Certification", issuer: "6sense" },
                  ],
                });
              }}
              className="text-xs text-[#0e5f5b] hover:underline"
            >
              + Add Certification
            </button>
          </div>
          {(data.certifications || []).map((cert: any, idx: number) => (
            <div key={idx} className="flex gap-3 items-center">
              <input
                type="text"
                value={cert.name || ""}
                onChange={(e) => {
                  const certs = [...data.certifications];
                  certs[idx].name = e.target.value;
                  setData({ ...data, certifications: certs });
                }}
                placeholder="Certification Name"
                className="flex-1 rounded border border-[#d4cdc0] px-2.5 py-1 text-xs"
              />
              <input
                type="text"
                value={cert.issuer || ""}
                onChange={(e) => {
                  const certs = [...data.certifications];
                  certs[idx].issuer = e.target.value;
                  setData({ ...data, certifications: certs });
                }}
                placeholder="Issuer"
                className="w-48 rounded border border-[#d4cdc0] px-2.5 py-1 text-xs"
              />
              <button
                type="button"
                onClick={() => {
                  const certs = [...data.certifications];
                  certs.splice(idx, 1);
                  setData({ ...data, certifications: certs });
                }}
                className="text-xs text-red-500"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Course Certificates */}
        <div className="space-y-3 pt-3 border-t border-[#e6e1d8]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#191c20]">Course Certificates</span>
            <button
              type="button"
              onClick={() => {
                setData({
                  ...data,
                  courseCertificates: [
                    ...(data.courseCertificates || []),
                    { name: "New Course", issuer: "Anthropic Academy", kind: "Course certificate" },
                  ],
                });
              }}
              className="text-xs text-[#0e5f5b] hover:underline"
            >
              + Add Course
            </button>
          </div>
          {(data.courseCertificates || []).map((course: any, idx: number) => (
            <div key={idx} className="flex gap-3 items-center">
              <input
                type="text"
                value={course.name || ""}
                onChange={(e) => {
                  const courses = [...data.courseCertificates];
                  courses[idx].name = e.target.value;
                  setData({ ...data, courseCertificates: courses });
                }}
                placeholder="Course Name"
                className="flex-1 rounded border border-[#d4cdc0] px-2.5 py-1 text-xs"
              />
              <input
                type="text"
                value={course.issuer || ""}
                onChange={(e) => {
                  const courses = [...data.courseCertificates];
                  courses[idx].issuer = e.target.value;
                  setData({ ...data, courseCertificates: courses });
                }}
                placeholder="Issuer"
                className="w-48 rounded border border-[#d4cdc0] px-2.5 py-1 text-xs"
              />
              <button
                type="button"
                onClick={() => {
                  const courses = [...data.courseCertificates];
                  courses.splice(idx, 1);
                  setData({ ...data, courseCertificates: courses });
                }}
                className="text-xs text-red-500"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Education */}
      <div className="rounded-xl border border-[#e6e1d8] bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#0e5f5b]">3. Education</h3>
          <button
            type="button"
            onClick={() => {
              setData({
                ...data,
                education: [
                  ...(data.education || []),
                  { qualification: "Degree", institution: "Institution", year: "2024" },
                ],
              });
            }}
            className="text-xs text-[#0e5f5b] hover:underline"
          >
            + Add Education
          </button>
        </div>
        {(data.education || []).map((edu: any, idx: number) => (
          <div key={idx} className="flex gap-3 items-center">
            <input
              type="text"
              value={edu.qualification || ""}
              onChange={(e) => {
                const edus = [...data.education];
                edus[idx].qualification = e.target.value;
                setData({ ...data, education: edus });
              }}
              placeholder="Qualification"
              className="flex-1 rounded border border-[#d4cdc0] px-2.5 py-1 text-xs"
            />
            <input
              type="text"
              value={edu.institution || ""}
              onChange={(e) => {
                const edus = [...data.education];
                edus[idx].institution = e.target.value;
                setData({ ...data, education: edus });
              }}
              placeholder="Institution"
              className="flex-1 rounded border border-[#d4cdc0] px-2.5 py-1 text-xs"
            />
            <input
              type="text"
              value={edu.year || ""}
              onChange={(e) => {
                const edus = [...data.education];
                edus[idx].year = e.target.value;
                setData({ ...data, education: edus });
              }}
              placeholder="Year"
              className="w-24 rounded border border-[#d4cdc0] px-2.5 py-1 text-xs"
            />
            <button
              type="button"
              onClick={() => {
                const edus = [...data.education];
                edus.splice(idx, 1);
                setData({ ...data, education: edus });
              }}
              className="text-xs text-red-500"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-[#0e5f5b] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0a4744] disabled:opacity-50"
        >
          {saving ? "Saving Changes..." : "Save Experience"}
        </button>
      </div>
    </form>
  );
}
