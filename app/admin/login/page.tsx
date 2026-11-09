"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { sanitizeRedirectPath } from "@/lib/security/sanitize";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawFrom = searchParams.get("from");
  const from = sanitizeRedirectPath(rawFrom, "/admin");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      router.push(from);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md rounded-2xl border border-[#e6e1d8] bg-white p-8 shadow-sm">
      <div className="text-center">
        <div className="inline-flex size-12 items-center justify-center rounded-xl bg-[#0e5f5b] text-xl font-bold text-white">
          A
        </div>
        <h1 className="mt-4 text-2xl font-bold tracking-tight text-[#191c20]">Portfolio Admin</h1>
        <p className="mt-1 text-sm text-[#646b73]">Sign in to manage projects and website content</p>
      </div>

      {error && (
        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#4c535b]">
            Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@portfolio.local"
            className="mt-1.5 w-full rounded-lg border border-[#d4cdc0] px-3.5 py-2.5 text-sm text-[#191c20] transition placeholder:text-[#8b9198] focus:border-[#0e5f5b] focus:outline-none focus:ring-1 focus:ring-[#0e5f5b]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#4c535b]">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            className="mt-1.5 w-full rounded-lg border border-[#d4cdc0] px-3.5 py-2.5 text-sm text-[#191c20] transition placeholder:text-[#8b9198] focus:border-[#0e5f5b] focus:outline-none focus:ring-1 focus:ring-[#0e5f5b]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-[#0e5f5b] py-2.5 text-sm font-semibold text-white transition hover:bg-[#0a4744] focus:outline-none focus:ring-2 focus:ring-[#0e5f5b] focus:ring-offset-2 disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in to Dashboard"}
        </button>
      </form>

      <div className="mt-6 border-t border-[#e6e1d8] pt-4 text-center">
        <a href="/" className="text-xs font-medium text-[#0e5f5b] hover:underline">
          ← Return to public website
        </a>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Suspense fallback={<div className="p-8 text-center text-sm text-[#646b73]">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
