"use client";

import { useEffect, useState } from "react";
import { Activity, Alert, Check, Eye, EyeOff, Lock, Mail, User } from "@/components/Icons";
import { UsersManager } from "@/components/admin/UsersManager";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e5f5b] focus-visible:ring-offset-2";

const inputClass =
  "h-10 w-full rounded-xl border border-[#d4cdc0] bg-white px-3.5 text-sm text-[#191c20] transition-colors duration-200 placeholder:text-[#646b73] hover:border-[#8b9198] focus-visible:border-[#0e5f5b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e5f5b] focus-visible:ring-offset-1";

export default function AdminSettingsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("admin");
  const [loading, setLoading] = useState(true);
  const [savingAccount, setSavingAccount] = useState(false);
  const [accountMsg, setAccountMsg] = useState<{ text: string; type: "success" | "error" } | null>(
    null
  );

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; type: "success" | "error" } | null>(
    null
  );

  // Google Analytics state
  const [googleAnalyticsId, setGoogleAnalyticsId] = useState("");
  const [savingGa, setSavingGa] = useState(false);
  const [gaMsg, setGaMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.admin) {
          setName(data.admin.name || "");
          setEmail(data.admin.email || "");
          setRole(data.admin.role || "admin");
        }
        if (data.googleAnalyticsId !== undefined) {
          setGoogleAnalyticsId(data.googleAnalyticsId || "");
        }
        setLoading(false);
      })
      .catch(() => {
        setAccountMsg({ text: "Failed to load account settings.", type: "error" });
        setLoading(false);
      });
  }, []);

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAccount(true);
    setAccountMsg(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setAccountMsg({ text: "Account details updated successfully.", type: "success" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update account.";
      setAccountMsg({ text: msg, type: "error" });
    } finally {
      setSavingAccount(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ text: "New passwords do not match.", type: "error" });
      return;
    }

    if (newPassword.length < 10) {
      setPasswordMsg({ text: "Password must be at least 10 characters long.", type: "error" });
      return;
    }

    setSavingPassword(true);

    try {
      const res = await fetch("/api/admin/settings/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setPasswordMsg({
        text: "Password updated successfully. Other active sessions have been signed out.",
        type: "success",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to change password.";
      setPasswordMsg({ text: msg, type: "error" });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSaveGoogleAnalytics = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingGa(true);
    setGaMsg(null);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ googleAnalyticsId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setGaMsg({
        text: data.message || "Google Analytics setting updated successfully.",
        type: "success",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update Google Analytics.";
      setGaMsg({ text: msg, type: "error" });
    } finally {
      setSavingGa(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-[#e6e1d8] bg-white p-10 text-center text-sm text-[#4c535b]">
        Loading account settings...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[#e2ddd3] bg-gradient-to-r from-[#faf8f4] to-white px-5 py-3.5 shadow-[0_1px_3px_rgba(25,28,32,0.04)]">
        <div>
          <h2 className="text-base font-bold tracking-tight text-[#191c20]">
            Account &amp; Security Settings
          </h2>
          <p className="text-xs text-[#4c535b]">
            Manage your profile, password policy, and team access on one screen.
          </p>
        </div>
        <span className="rounded-md bg-[#e1eeec] px-2.5 py-1 font-mono text-[11px] font-semibold uppercase text-[#0a4744] ring-1 ring-[#b9d6d2]">
          Role: {role}
        </span>
      </header>

      {/* Top Row: Admin Account + Change Password Side-by-Side */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Account Info Form */}
        <form
          onSubmit={handleUpdateAccount}
          className="flex flex-col justify-between space-y-4 rounded-2xl border border-[#e2ddd3] bg-white p-5 shadow-[0_1px_3px_rgba(25,28,32,0.04)] transition-shadow duration-200 hover:shadow-[0_4px_14px_rgba(25,28,32,0.06)]"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[#e6e1d8] pb-3">
              <User className="size-4 text-[#0e5f5b]" />
              <h3 className="text-xs font-bold uppercase tracking-[0.08em] text-[#0e5f5b]">
                1. Admin Account
              </h3>
            </div>

            {accountMsg ? (
              <div
                role={accountMsg.type === "error" ? "alert" : "status"}
                aria-live="polite"
                className={`flex items-start gap-2 rounded-xl border p-3 text-xs ${
                  accountMsg.type === "success"
                    ? "border-green-200 bg-green-50 text-[#166534]"
                    : "border-red-200 bg-red-50 text-[#991b1b]"
                }`}
              >
                {accountMsg.type === "success" ? (
                  <Check className="mt-0.5 size-4 shrink-0" />
                ) : (
                  <Alert className="mt-0.5 size-4 shrink-0" />
                )}
                <span>{accountMsg.text}</span>
              </div>
            ) : null}

            <div className="grid gap-3.5 sm:grid-cols-2">
              <div>
                <label htmlFor="settings-name" className="block text-xs font-semibold text-[#4c535b]">
                  Display Name
                </label>
                <input
                  id="settings-name"
                  name="name"
                  type="text"
                  required
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`${inputClass} mt-1.5`}
                />
              </div>

              <div>
                <label htmlFor="settings-email" className="block text-xs font-semibold text-[#4c535b]">
                  Login Email
                </label>
                <div className="relative mt-1.5">
                  <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#4c535b]">
                    <Mail className="size-4" />
                  </span>
                  <input
                    id="settings-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`${inputClass} pl-9`}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={savingAccount}
              className={`inline-flex min-h-[38px] cursor-pointer items-center rounded-xl bg-[#0e5f5b] px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#0a4744] disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
            >
              {savingAccount ? "Saving..." : "Save Account Details"}
            </button>
          </div>
        </form>

        {/* Change Password Form */}
        <form
          onSubmit={handleChangePassword}
          className="flex flex-col justify-between space-y-4 rounded-2xl border border-[#e2ddd3] bg-white p-5 shadow-[0_1px_3px_rgba(25,28,32,0.04)] transition-shadow duration-200 hover:shadow-[0_4px_14px_rgba(25,28,32,0.06)]"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#e6e1d8] pb-3">
              <div className="flex items-center gap-2">
                <Lock className="size-4 text-[#0e5f5b]" />
                <h3 className="text-xs font-bold uppercase tracking-[0.08em] text-[#0e5f5b]">
                  2. Change Password
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPasswords((prev) => !prev)}
                aria-pressed={showPasswords}
                className={`inline-flex min-h-[30px] cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-[#4c535b] transition-colors duration-200 hover:bg-[#f3efe8] hover:text-[#191c20] ${focusRing}`}
              >
                {showPasswords ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                <span>{showPasswords ? "Hide" : "Show"}</span>
              </button>
            </div>

            {passwordMsg ? (
              <div
                role={passwordMsg.type === "error" ? "alert" : "status"}
                aria-live="polite"
                className={`flex items-start gap-2 rounded-xl border p-3 text-xs ${
                  passwordMsg.type === "success"
                    ? "border-green-200 bg-green-50 text-[#166534]"
                    : "border-red-200 bg-red-50 text-[#991b1b]"
                }`}
              >
                {passwordMsg.type === "success" ? (
                  <Check className="mt-0.5 size-4 shrink-0" />
                ) : (
                  <Alert className="mt-0.5 size-4 shrink-0" />
                )}
                <span>{passwordMsg.text}</span>
              </div>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label
                  htmlFor="settings-current-password"
                  className="block text-xs font-semibold text-[#4c535b]"
                >
                  Current Password
                </label>
                <input
                  id="settings-current-password"
                  name="currentPassword"
                  type={showPasswords ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Current"
                  className={`${inputClass} mt-1.5`}
                />
              </div>

              <div>
                <label
                  htmlFor="settings-new-password"
                  className="block text-xs font-semibold text-[#4c535b]"
                >
                  New Password
                </label>
                <input
                  id="settings-new-password"
                  name="newPassword"
                  type={showPasswords ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  aria-describedby="password-policy-hint"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 10 chars"
                  className={`${inputClass} mt-1.5`}
                />
              </div>

              <div>
                <label
                  htmlFor="settings-confirm-password"
                  className="block text-xs font-semibold text-[#4c535b]"
                >
                  Confirm Password
                </label>
                <input
                  id="settings-confirm-password"
                  name="confirmPassword"
                  type={showPasswords ? "text" : "password"}
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat"
                  className={`${inputClass} mt-1.5`}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <p id="password-policy-hint" className="text-[11px] text-[#646b73]">
              10+ chars with uppercase, lowercase, digit &amp; symbol.
            </p>
            <button
              type="submit"
              disabled={savingPassword}
              className={`inline-flex min-h-[38px] cursor-pointer items-center rounded-xl bg-[#0e5f5b] px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#0a4744] disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
            >
              {savingPassword ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>

      {/* 3. Google Analytics Integration (GA4) */}
      <form
        onSubmit={handleSaveGoogleAnalytics}
        className="space-y-4 rounded-2xl border border-[#e2ddd3] bg-white p-5 shadow-[0_1px_3px_rgba(25,28,32,0.04)] transition-shadow duration-200 hover:shadow-[0_4px_14px_rgba(25,28,32,0.06)]"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e6e1d8] pb-3">
          <div className="flex items-center gap-2">
            <Activity className="size-4 text-[#0e5f5b]" />
            <h3 className="text-xs font-bold uppercase tracking-[0.08em] text-[#0e5f5b]">
              3. Google Analytics &amp; Tag Manager (GA4 / GTM)
            </h3>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
              googleAnalyticsId.trim()
                ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200"
                : "bg-stone-100 text-stone-600 ring-1 ring-stone-200"
            }`}
          >
            <span
              className={`size-1.5 rounded-full ${
                googleAnalyticsId.trim() ? "bg-emerald-500 animate-pulse" : "bg-stone-400"
              }`}
            />
            {googleAnalyticsId.trim() ? "Active (Tracking Enabled)" : "Disabled / Not Set"}
          </span>
        </div>

        {gaMsg ? (
          <div
            role={gaMsg.type === "error" ? "alert" : "status"}
            aria-live="polite"
            className={`flex items-start gap-2 rounded-xl border p-3 text-xs ${
              gaMsg.type === "success"
                ? "border-green-200 bg-green-50 text-[#166534]"
                : "border-red-200 bg-red-50 text-[#991b1b]"
            }`}
          >
            {gaMsg.type === "success" ? (
              <Check className="mt-0.5 size-4 shrink-0" />
            ) : (
              <Alert className="mt-0.5 size-4 shrink-0" />
            )}
            <span>{gaMsg.text}</span>
          </div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <label
              htmlFor="settings-ga-id"
              className="block text-xs font-semibold text-[#4c535b]"
            >
              Measurement ID or GTM Container ID
            </label>
            <div className="relative mt-1.5">
              <input
                id="settings-ga-id"
                name="googleAnalyticsId"
                type="text"
                placeholder="e.g. G-K7MDDXHF72 or GTM-WFSN9MSW"
                value={googleAnalyticsId}
                onChange={(e) => setGoogleAnalyticsId(e.target.value.toUpperCase().trim())}
                className={`${inputClass} font-mono`}
              />
            </div>
            <p className="mt-1.5 text-[11px] text-[#646b73]">
              Enter your Google Analytics 4 ID (<code className="font-mono text-[#0e5f5b]">G-...</code>) or Google Tag Manager Container ID (<code className="font-mono text-[#0e5f5b]">GTM-...</code>).
              Leave empty and save to disable tracking.
            </p>
          </div>

          <div className="rounded-xl border border-[#ece8df] bg-[#faf8f4] p-3 text-xs text-[#4c535b]">
            <p className="font-semibold text-[#191c20]">Privacy &amp; Auto-Exclusion</p>
            <p className="mt-1 text-[11px] leading-relaxed text-[#646b73]">
              Tracking tags will automatically load across all public visitor pages. All internal <code className="font-mono text-xs">/admin/*</code> dashboard routes are automatically excluded from analytics metrics.
            </p>
          </div>
        </div>

        <div className="flex justify-end border-t border-[#f0ede6] pt-3">
          <button
            type="submit"
            disabled={savingGa}
            className={`inline-flex min-h-[38px] cursor-pointer items-center rounded-xl bg-[#0e5f5b] px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:bg-[#0a4744] disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
          >
            {savingGa ? "Saving..." : "Save Analytics Setting"}
          </button>
        </div>
      </form>

      {/* User & Role Management (Admin only) */}
      {role === "admin" ? <UsersManager currentUserEmail={email} /> : null}
    </div>
  );
}
