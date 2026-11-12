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

  const removeRole = (empIndex: number, roleIndex: number) => {
    const employers = [...data.employers];
    employers[empIndex].roles.splice(roleIndex, 1);
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

  if (loading) {
    return (
      <AdminCard className="mx-auto max-w-4xl p-12 text-center text-sm text-body">
        Loading experience data...
      </AdminCard>
    );
  }
  if (!data) {
    return (
      <AdminCard className="mx-auto max-w-4xl p-12 text-center text-sm text-danger">
        Experience data unavailable.
      </AdminCard>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-8 pb-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-ink">Experience & Career History</h2>
          <p className="mt-0.5 text-sm text-body">
            Manage employers, roles, promotions, formal certifications, education, and tools.
          </p>
        </div>
        <button type="submit" disabled={saving} className={adminPrimaryBtnClass}>
          {saving ? "Saving Changes..." : "Save Experience"}
        </button>
      </div>

      <AdminAlert message={message} />

      {/* Employers Section */}
      <AdminCard className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-accent">
            1. Employers & Positions ({data.employers?.length || 0})
          </h3>
          <button
            type="button"
            onClick={addEmployer}
            className={`inline-flex min-h-[34px] cursor-pointer items-center gap-1.5 rounded-xl bg-accent-soft px-3 py-1.5 text-xs font-semibold text-accent-strong transition-colors duration-200 hover:bg-accent-line ${adminFocusRing}`}
          >
            <Plus className="size-3.5" />
            <span>Add Employer</span>
          </button>
        </div>

        {(data.employers || []).map((emp: any, empIdx: number) => (
          <div key={empIdx} className="space-y-4 rounded-xl border border-line bg-canvas p-5">
            <div className="flex items-end justify-between gap-4">
              <AdminField label="Company Name" className="flex-1">
                {({ id }) => (
                  <input
                    id={id}
                    type="text"
                    required
                    value={emp.company || ""}
                    onChange={(e) => {
                      const employers = [...data.employers];
                      employers[empIdx].company = e.target.value;
                      setData({ ...data, employers });
                    }}
                    className={`${adminInputClass} font-semibold`}
                  />
                )}
              </AdminField>

              <button
                type="button"
                onClick={() => removeEmployer(empIdx)}
                className={`mb-1 cursor-pointer rounded-lg px-2.5 py-2 text-xs font-semibold text-danger transition-colors duration-200 hover:bg-danger-soft ${adminFocusRing}`}
              >
                Delete Company
              </button>
            </div>

            {/* Promotion label */}
            <div className="grid gap-3 border-t border-line pt-3 sm:grid-cols-2">
              <AdminField label="Promotion Date (Optional)">
                {({ id }) => (
                  <input
                    id={id}
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
                    className={adminInputCompactClass}
                  />
                )}
              </AdminField>

              <AdminField label="Promotion Label">
                {({ id }) => (
                  <input
                    id={id}
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
                    className={adminInputCompactClass}
                  />
                )}
              </AdminField>
            </div>

            {/* Roles inside Company */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink">Roles at {emp.company}</span>
                <button
                  type="button"
                  onClick={() => addRole(empIdx)}
                  className={`inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-accent-strong hover:bg-accent-soft ${adminFocusRing}`}
                >
                  <Plus className="size-3.5" />
                  <span>Add Role</span>
                </button>
              </div>

              {(emp.roles || []).map((role: any, roleIdx: number) => (
                <div
                  key={roleIdx}
                  className="space-y-3 rounded-xl border border-line bg-surface p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
                      Role #{roleIdx + 1}
                    </span>
                    {(emp.roles || []).length > 1 ? (
                      <button
                        type="button"
                        onClick={() => removeRole(empIdx, roleIdx)}
                        className={`cursor-pointer rounded px-2 py-0.5 text-xs font-medium text-danger hover:bg-danger-soft ${adminFocusRing}`}
                      >
                        Remove Role
                      </button>
                    ) : null}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <AdminField label="Role Title">
                      {({ id }) => (
                        <input
                          id={id}
                          type="text"
                          required
                          value={role.title || ""}
                          onChange={(e) => {
                            const employers = [...data.employers];
                            employers[empIdx].roles[roleIdx].title = e.target.value;
                            setData({ ...data, employers });
                          }}
                          className={`${adminInputCompactClass} font-medium`}
                        />
                      )}
                    </AdminField>

                    <AdminField label="Start Date (YYYY-MM)">
                      {({ id }) => (
                        <input
                          id={id}
                          type="text"
                          required
                          value={role.start || ""}
                          onChange={(e) => {
                            const employers = [...data.employers];
                            employers[empIdx].roles[roleIdx].start = e.target.value;
                            setData({ ...data, employers });
                          }}
                          className={adminInputCompactClass}
                        />
                      )}
                    </AdminField>

                    <AdminField label="End Date (or present)">
                      {({ id }) => (
                        <input
                          id={id}
                          type="text"
                          required
                          value={role.end || ""}
                          onChange={(e) => {
                            const employers = [...data.employers];
                            employers[empIdx].roles[roleIdx].end = e.target.value;
                            setData({ ...data, employers });
                          }}
                          className={adminInputCompactClass}
                        />
                      )}
                    </AdminField>
                  </div>

                  {/* Responsibilities */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-body">Responsibilities</span>
                      <button
                        type="button"
                        onClick={() => addResponsibility(empIdx, roleIdx)}
                        className={`inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-accent-strong hover:bg-accent-soft ${adminFocusRing}`}
                      >
                        <Plus className="size-3.5" />
                        <span>Add Bullet Point</span>
                      </button>
                    </div>

                    {(role.responsibilities || []).map((resp: any, respIdx: number) => (
                      <div
                        key={respIdx}
                        className="grid items-start gap-2 rounded-xl border border-line/70 bg-canvas/50 p-2.5 sm:grid-cols-[12rem_minmax(0,1fr)_auto] sm:border-0 sm:bg-transparent sm:p-0"
                      >
                        <input
                          type="text"
                          aria-label={`Responsibility theme ${respIdx + 1}`}
                          value={resp.theme || ""}
                          onChange={(e) => {
                            const employers = [...data.employers];
                            employers[empIdx].roles[roleIdx].responsibilities[respIdx].theme =
                              e.target.value;
                            setData({ ...data, employers });
                          }}
                          placeholder="Theme (optional)"
                          className={adminInputCompactClass}
                        />
                        <textarea
                          rows={2}
                          aria-label={`Responsibility description ${respIdx + 1}`}
                          value={resp.text || ""}
                          onChange={(e) => {
                            const employers = [...data.employers];
                            employers[empIdx].roles[roleIdx].responsibilities[respIdx].text =
                              e.target.value;
                            setData({ ...data, employers });
                          }}
                          placeholder="Describe the responsibility or achievement..."
                          className={`${adminTextareaClass} min-w-0 text-xs`}
                        />
                        <button
                          type="button"
                          onClick={() => removeResponsibility(empIdx, roleIdx, respIdx)}
                          aria-label={`Remove responsibility ${respIdx + 1}`}
                          className={`${adminDangerIconBtnClass} justify-self-end`}
                        >
                          <Close className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </AdminCard>

      {/* Certifications & Courses */}
      <AdminCard className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-accent">
          2. Certifications & Course Completions
        </h3>

        {/* Certifications */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink">Formal Certifications</span>
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
              className={`inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-accent-strong hover:bg-accent-soft ${adminFocusRing}`}
            >
              <Plus className="size-3.5" />
              <span>Add Certification</span>
            </button>
          </div>
          {(data.certifications || []).map((cert: any, idx: number) => (
            <div key={idx} className="grid items-center gap-2.5 sm:grid-cols-[minmax(0,1fr)_12rem_auto]">
              <input
                type="text"
                aria-label={`Certification name ${idx + 1}`}
                value={cert.name || ""}
                onChange={(e) => {
                  const certs = [...data.certifications];
                  certs[idx].name = e.target.value;
                  setData({ ...data, certifications: certs });
                }}
                placeholder="Certification Name"
                className={adminInputCompactClass}
              />
              <input
                type="text"
                aria-label={`Certification issuer ${idx + 1}`}
                value={cert.issuer || ""}
                onChange={(e) => {
                  const certs = [...data.certifications];
                  certs[idx].issuer = e.target.value;
                  setData({ ...data, certifications: certs });
                }}
                placeholder="Issuer"
                className={adminInputCompactClass}
              />
              <button
                type="button"
                onClick={() => {
                  const certs = [...data.certifications];
                  certs.splice(idx, 1);
                  setData({ ...data, certifications: certs });
                }}
                aria-label={`Remove certification ${idx + 1}`}
                className={`${adminDangerIconBtnClass} justify-self-end`}
              >
                <Close className="size-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Course Certificates */}
        <div className="space-y-3 border-t border-line pt-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-ink">Course Certificates</span>
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
              className={`inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-accent-strong hover:bg-accent-soft ${adminFocusRing}`}
            >
              <Plus className="size-3.5" />
              <span>Add Course</span>
            </button>
          </div>
          {(data.courseCertificates || []).map((course: any, idx: number) => (
            <div key={idx} className="grid items-center gap-2.5 sm:grid-cols-[minmax(0,1fr)_12rem_auto]">
              <input
                type="text"
                aria-label={`Course name ${idx + 1}`}
                value={course.name || ""}
                onChange={(e) => {
                  const courses = [...data.courseCertificates];
                  courses[idx].name = e.target.value;
                  setData({ ...data, courseCertificates: courses });
                }}
                placeholder="Course Name"
                className={adminInputCompactClass}
              />
              <input
                type="text"
                aria-label={`Course issuer ${idx + 1}`}
                value={course.issuer || ""}
                onChange={(e) => {
                  const courses = [...data.courseCertificates];
                  courses[idx].issuer = e.target.value;
                  setData({ ...data, courseCertificates: courses });
                }}
                placeholder="Issuer"
                className={adminInputCompactClass}
              />
              <button
                type="button"
                onClick={() => {
                  const courses = [...data.courseCertificates];
                  courses.splice(idx, 1);
                  setData({ ...data, courseCertificates: courses });
                }}
                aria-label={`Remove course ${idx + 1}`}
                className={`${adminDangerIconBtnClass} justify-self-end`}
              >
                <Close className="size-4" />
              </button>
            </div>
          ))}
        </div>
      </AdminCard>

      {/* Education */}
      <AdminCard className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-[0.08em] text-accent">3. Education</h3>
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
            className={`inline-flex cursor-pointer items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-accent-strong hover:bg-accent-soft ${adminFocusRing}`}
          >
            <Plus className="size-3.5" />
            <span>Add Education</span>
          </button>
        </div>
        {(data.education || []).map((edu: any, idx: number) => (
          <div key={idx} className="grid items-center gap-2.5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_6.5rem_auto]">
            <input
              type="text"
              aria-label={`Qualification ${idx + 1}`}
              value={edu.qualification || ""}
              onChange={(e) => {
                const edus = [...data.education];
                edus[idx].qualification = e.target.value;
                setData({ ...data, education: edus });
              }}
              placeholder="Qualification"
              className={adminInputCompactClass}
            />
            <input
              type="text"
              aria-label={`Institution ${idx + 1}`}
              value={edu.institution || ""}
              onChange={(e) => {
                const edus = [...data.education];
                edus[idx].institution = e.target.value;
                setData({ ...data, education: edus });
              }}
              placeholder="Institution"
              className={adminInputCompactClass}
            />
            <input
              type="text"
              aria-label={`Graduation year ${idx + 1}`}
              value={edu.year || ""}
              onChange={(e) => {
                const edus = [...data.education];
                edus[idx].year = e.target.value;
                setData({ ...data, education: edus });
              }}
              placeholder="Year"
              className={adminInputCompactClass}
            />
            <button
              type="button"
              onClick={() => {
                const edus = [...data.education];
                edus.splice(idx, 1);
                setData({ ...data, education: edus });
              }}
              aria-label={`Remove education ${idx + 1}`}
              className={`${adminDangerIconBtnClass} justify-self-end`}
            >
              <Close className="size-4" />
            </button>
          </div>
        ))}
      </AdminCard>

      <div className="flex justify-end">
        <button type="submit" disabled={saving} className={adminPrimaryBtnClass}>
          {saving ? "Saving Changes..." : "Save Experience"}
        </button>
      </div>
    </form>
  );
}
