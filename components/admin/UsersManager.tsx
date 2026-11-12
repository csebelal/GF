"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Check,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Plus,
  User,
  Users,
} from "@/components/Icons";
import { ADMIN_ROLES, ROLE_META, type AdminRole } from "@/lib/auth/roles";

interface AdminUserRow {
  _id: string;
  email: string;
  name: string;
  role: AdminRole;
  lastLogin: string | null;
  createdAt: string;
}

interface UsersManagerProps {
  currentUserEmail: string;
}

const inputClass =
  "h-10 w-full rounded-xl border border-[#d4cdc0] bg-white px-3.5 text-sm text-[#191c20] transition-colors duration-150 placeholder:text-[#646b73] hover:border-[#8b9198] focus-visible:border-[#0e5f5b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e5f5b] focus-visible:ring-offset-1";

export function UsersManager({ currentUserEmail }: UsersManagerProps) {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // New user form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<AdminRole>("editor");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function loadUsers() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load users.");
      setUsers(data.users || []);
    } catch (err: unknown) {
      setMessage({
        text: err instanceof Error ? err.message : "Failed to load users.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadUsers();
  }, []);

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, role, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create user.");

      setUsers((prev) => [...prev, data.user]);
      setName("");
      setEmail("");
      setRole("editor");
      setPassword("");
      setMessage({
        text: `User ${data.user.email} (${ROLE_META[data.user.role as AdminRole].label}) created.`,
        type: "success",
      });
    } catch (err: unknown) {
      setMessage({
        text: err instanceof Error ? err.message : "Failed to create user.",
        type: "error",
      });
    } finally {
      setCreating(false);
    }
  }

  async function handleRoleChange(userId: string, nextRole: AdminRole) {
    setBusyId(userId);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: nextRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update role.");

      setUsers((prev) => prev.map((u) => (u._id === userId ? data.user : u)));
      setMessage({
        text: `Updated ${data.user.email} role to ${ROLE_META[data.user.role as AdminRole].label}.`,
        type: "success",
      });
    } catch (err: unknown) {
      setMessage({
        text: err instanceof Error ? err.message : "Failed to update role.",
        type: "error",
      });
    } finally {
      setBusyId(null);
    }
  }

  async function handleDeleteUser(user: AdminUserRow) {
    if (!window.confirm(`Remove user ${user.email}? This immediately revokes their access.`)) {
      return;
    }
    setBusyId(user._id);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/users/${user._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete user.");

      setUsers((prev) => prev.filter((u) => u._id !== user._id));
      setMessage({ text: `Removed user ${user.email}.`, type: "success" });
    } catch (err: unknown) {
      setMessage({
        text: err instanceof Error ? err.message : "Failed to delete user.",
        type: "error",
      });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-5">
      {message ? (
        <div
          role="status"
          className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-xs font-medium ${
            message.type === "success"
              ? "border-[#b9d6d2] bg-[#e1eeec] text-[#0a4744]"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          {message.type === "success" ? (
            <Check className="size-4 shrink-0" />
          ) : (
            <Alert className="size-4 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      ) : null}

      <div className="grid gap-5 xl:grid-cols-12">
        {/* Add User Form */}
        <section className="overflow-hidden rounded-2xl border border-[#e2ddd3] bg-white shadow-sm xl:col-span-5">
          <div className="flex items-center gap-2 border-b border-[#e6e1d8] bg-gradient-to-r from-[#faf8f4] to-white px-5 py-3.5">
            <span className="inline-flex size-7 items-center justify-center rounded-lg bg-[#0e5f5b]/10 text-[#0e5f5b]">
              <Plus className="size-4" />
            </span>
            <div>
              <h3 className="text-sm font-semibold text-[#191c20]">Add Team User</h3>
              <p className="text-xs text-[#4c535b]">Assign a role with least-privilege access</p>
            </div>
          </div>

          <form onSubmit={handleCreateUser} className="space-y-4 p-5">
            <div>
              <label htmlFor="new-user-name" className="mb-1.5 block text-xs font-semibold text-[#191c20]">
                Full Name
              </label>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-3 size-4 text-[#646b73]" />
                <input
                  id="new-user-name"
                  type="text"
                  required
                  minLength={2}
                  maxLength={80}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarah Rahman"
                  className={`${inputClass} pl-9`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="new-user-email" className="mb-1.5 block text-xs font-semibold text-[#191c20]">
                Email Address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-3 size-4 text-[#646b73]" />
                <input
                  id="new-user-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sarah@example.com"
                  className={`${inputClass} pl-9`}
                />
              </div>
            </div>

            <div>
              <label htmlFor="new-user-role" className="mb-1.5 block text-xs font-semibold text-[#191c20]">
                Role
              </label>
              <select
                id="new-user-role"
                value={role}
                onChange={(e) => setRole(e.target.value as AdminRole)}
                className={`${inputClass} cursor-pointer`}
              >
                {ADMIN_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_META[r].label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="new-user-password" className="mb-1.5 block text-xs font-semibold text-[#191c20]">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-3 size-4 text-[#646b73]" />
                <input
                  id="new-user-password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={10}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 10 chars, upper, lower, digit & symbol"
                  className={`${inputClass} pl-9 pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2.5 top-2.5 cursor-pointer rounded p-1 text-[#646b73] hover:text-[#191c20]"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={creating}
              className="inline-flex min-h-[40px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#0e5f5b] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0a4744] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Plus className="size-4" />
              <span>{creating ? "Creating User..." : "Create User"}</span>
            </button>
          </form>
        </section>

        {/* Users Table */}
        <section className="overflow-hidden rounded-2xl border border-[#e2ddd3] bg-white shadow-sm xl:col-span-7">
          <div className="flex items-center justify-between border-b border-[#e6e1d8] bg-gradient-to-r from-[#faf8f4] to-white px-5 py-3.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex size-7 items-center justify-center rounded-lg bg-[#0e5f5b]/10 text-[#0e5f5b]">
                <Users className="size-4" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-[#191c20]">Authorized Users</h3>
                <p className="text-xs text-[#4c535b]">
                  Role changes immediately revoke prior JWT sessions
                </p>
              </div>
            </div>
            <span className="rounded-md bg-[#faf8f4] px-2 py-0.5 font-mono text-[11px] font-semibold text-[#4c535b] ring-1 ring-[#e6e1d8]">
              {users.length} total
            </span>
          </div>

          {loading ? (
            <div className="p-6 text-xs text-[#4c535b]">Loading users...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#e6e1d8] bg-[#faf8f4]/60 font-mono text-[10px] uppercase tracking-wider text-[#646b73]">
                  <tr>
                    <th className="px-4 py-2.5 font-semibold">User</th>
                    <th className="px-3 py-2.5 font-semibold">Role</th>
                    <th className="hidden px-3 py-2.5 font-semibold sm:table-cell">Last Login</th>
                    <th className="px-4 py-2.5 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e6e1d8]">
                  {users.map((u) => {
                    const isSelf = u.email.toLowerCase() === currentUserEmail.toLowerCase();
                    const roleInfo = ROLE_META[u.role] || ROLE_META.admin;
                    return (
                      <tr key={u._id} className="transition-colors hover:bg-[#faf8f4]">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-[#191c20]">{u.name}</span>
                            {isSelf ? (
                              <span className="rounded bg-[#e1eeec] px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase text-[#0a4744]">
                                You
                              </span>
                            ) : null}
                          </div>
                          <p className="font-mono text-[11px] text-[#4c535b]">{u.email}</p>
                        </td>
                        <td className="px-3 py-3">
                          <select
                            aria-label={`Role for ${u.email}`}
                            value={u.role}
                            disabled={isSelf || busyId === u._id}
                            onChange={(e) => void handleRoleChange(u._id, e.target.value as AdminRole)}
                            className={`cursor-pointer rounded-lg px-2 py-1 font-mono text-[11px] font-semibold disabled:cursor-not-allowed disabled:opacity-75 ${roleInfo.badgeClass}`}
                          >
                            {ADMIN_ROLES.map((r) => (
                              <option key={r} value={r}>
                                {ROLE_META[r].label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="hidden px-3 py-3 font-mono text-[11px] text-[#4c535b] sm:table-cell">
                          {u.lastLogin
                            ? new Date(u.lastLogin).toLocaleDateString()
                            : "Never"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            disabled={isSelf || busyId === u._id}
                            onClick={() => void handleDeleteUser(u)}
                            className="cursor-pointer rounded-lg border border-red-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
