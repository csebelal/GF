"use client";

import { useEffect, useState } from "react";

export default function AdminSettingsPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingAccount, setSavingAccount] = useState(false);
  const [accountMsg, setAccountMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.admin) {
          setName(data.admin.name || "");
          setEmail(data.admin.email || "");
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

      setAccountMsg({ text: "Account details updated successfully!", type: "success" });
    } catch (err: any) {
      setAccountMsg({ text: err.message || "Failed to update account.", type: "error" });
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

    if (newPassword.length < 8) {
      setPasswordMsg({ text: "Password must be at least 8 characters.", type: "error" });
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

      setPasswordMsg({ text: "Password changed successfully!", type: "success" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordMsg({ text: err.message || "Failed to change password.", type: "error" });
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-sm text-[#646b73]">Loading settings...</div>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-16">
      <div>
        <h2 className="text-xl font-bold text-[#191c20]">Account & Security Settings</h2>
        <p className="text-xs text-[#646b73]">
          Manage your administrator profile, login email, and password
        </p>
      </div>

      {/* Account Info Form */}
      <form onSubmit={handleUpdateAccount} className="rounded-xl border border-[#e6e1d8] bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#0e5f5b]">1. Admin Account</h3>

        {accountMsg && (
          <div
            className={`rounded-lg p-3 text-xs ${
              accountMsg.type === "success"
                ? "border border-green-200 bg-green-50 text-green-800"
                : "border border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {accountMsg.text}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-[#4c535b]">Display Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#d4cdc0] px-3 py-2 text-sm text-[#191c20] focus:border-[#0e5f5b] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#4c535b]">Login Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#d4cdc0] px-3 py-2 text-sm text-[#191c20] focus:border-[#0e5f5b] focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={savingAccount}
            className="rounded-lg bg-[#0e5f5b] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#0a4744] disabled:opacity-50"
          >
            {savingAccount ? "Saving..." : "Save Account Details"}
          </button>
        </div>
      </form>

      {/* Change Password Form */}
      <form onSubmit={handleChangePassword} className="rounded-xl border border-[#e6e1d8] bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#0e5f5b]">2. Change Password</h3>

        {passwordMsg && (
          <div
            className={`rounded-lg p-3 text-xs ${
              passwordMsg.type === "success"
                ? "border border-green-200 bg-green-50 text-green-800"
                : "border border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {passwordMsg.text}
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-[#4c535b]">Current Password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••••••"
              className="mt-1 w-full rounded-lg border border-[#d4cdc0] px-3 py-2 text-sm text-[#191c20] focus:border-[#0e5f5b] focus:outline-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-[#4c535b]">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="mt-1 w-full rounded-lg border border-[#d4cdc0] px-3 py-2 text-sm text-[#191c20] focus:border-[#0e5f5b] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#4c535b]">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="mt-1 w-full rounded-lg border border-[#d4cdc0] px-3 py-2 text-sm text-[#191c20] focus:border-[#0e5f5b] focus:outline-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={savingPassword}
            className="rounded-lg bg-[#0e5f5b] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#0a4744] disabled:opacity-50"
          >
            {savingPassword ? "Updating Password..." : "Update Password"}
          </button>
        </div>
      </form>
    </div>
  );
}
