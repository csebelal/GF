"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert, ArrowLeft, Eye, EyeOff, IconAccess, Lock, Mail } from "@/components/Icons";
import { sanitizeRedirectPath } from "@/lib/security/sanitize";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawFrom = searchParams.get("from");
  const from = sanitizeRedirectPath(rawFrom, "/admin");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
        throw new Error(data.error || "Sign in failed. Please check your credentials.");
      }

      router.push(from);
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const errorId = error ? "login-error" : undefined;

  return (
    <div className="w-full max-w-[440px] motion-safe:animate-rise">
      {/* Top navigation link */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex min-h-[40px] items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-[#4c535b] transition-colors duration-200 hover:text-[#0e5f5b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e5f5b] focus-visible:ring-offset-2 focus-visible:ring-offset-[#faf8f4]"
        >
          <ArrowLeft className="size-4" />
          <span>Back to portfolio</span>
        </Link>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#b9d6d2] bg-[#e1eeec] px-2.5 py-1 text-xs font-semibold text-[#0a4744]">
          <IconAccess className="size-3.5" />
          <span>Admin Console</span>
        </span>
      </div>

      {/* Main Card */}
      <div className="rounded-2xl border border-[#e6e1d8] bg-white p-7 shadow-[0_2px_4px_rgb(25_28_32/0.04),0_22px_44px_-22px_rgb(25_28_32/0.16)] sm:p-9">
        <header className="text-center">
          <div className="mx-auto inline-flex size-12 items-center justify-center rounded-xl bg-[#0e5f5b] text-lg font-bold tracking-tight text-white shadow-sm">
            A
          </div>
          <h1 className="mt-5 text-2xl font-bold tracking-[-0.02em] text-[#191c20]">
            Sign in to Portfolio CMS
          </h1>
          <p className="mt-1.5 text-sm leading-relaxed text-[#4c535b]">
            Enter your administrator credentials to manage projects, profile content, and media.
          </p>
        </header>

        {error ? (
          <div
            id="login-error"
            role="alert"
            aria-live="assertive"
            className="mt-6 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-[#991b1b]"
          >
            <Alert className="mt-0.5 size-4 shrink-0 text-red-700" />
            <span>{error}</span>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-6 space-y-5" noValidate={false}>
          <div>
            <label
              htmlFor="admin-email"
              className="block text-xs font-semibold uppercase tracking-[0.08em] text-[#4c535b]"
            >
              Email Address
            </label>
            <div className="relative mt-2">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#4c535b]">
                <Mail className="size-4" />
              </span>
              <input
                id="admin-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={Boolean(error)}
                aria-describedby={errorId}
                placeholder="admin@portfolio.local"
                className="h-11 w-full rounded-xl border border-[#d4cdc0] bg-white pl-10 pr-3.5 text-sm text-[#191c20] transition-colors duration-200 placeholder:text-[#646b73] hover:border-[#8b9198] focus-visible:border-[#0e5f5b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e5f5b] focus-visible:ring-offset-1"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="block text-xs font-semibold uppercase tracking-[0.08em] text-[#4c535b]"
            >
              Password
            </label>
            <div className="relative mt-2">
              <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[#4c535b]">
                <Lock className="size-4" />
              </span>
              <input
                id="admin-password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={Boolean(error)}
                aria-describedby={errorId}
                placeholder="Enter your password"
                className="h-11 w-full rounded-xl border border-[#d4cdc0] bg-white pl-10 pr-12 text-sm text-[#191c20] transition-colors duration-200 placeholder:text-[#646b73] hover:border-[#8b9198] focus-visible:border-[#0e5f5b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e5f5b] focus-visible:ring-offset-1"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-0 flex min-w-[44px] cursor-pointer items-center justify-center rounded-r-xl text-[#4c535b] transition-colors duration-200 hover:text-[#191c20] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#0e5f5b]"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#0e5f5b] px-4 text-sm font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-[#0a4744] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e5f5b] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <span
                  aria-hidden="true"
                  className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign in to Dashboard</span>
            )}
          </button>
        </form>

        <footer className="mt-7 border-t border-[#e6e1d8] pt-5 text-center">
          <p className="text-xs leading-relaxed text-[#4c535b]">
            Protected by HTTP-only JWT sessions and brute-force rate limiting.
          </p>
        </footer>
      </div>
    </div>
  );
}

function LoginSkeleton() {
  return (
    <div className="w-full max-w-[440px] rounded-2xl border border-[#e6e1d8] bg-white p-9 text-center shadow-sm">
      <div className="mx-auto size-12 rounded-xl bg-[#e1eeec]" />
      <p className="mt-4 text-sm font-medium text-[#4c535b]">Loading sign-in form...</p>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#faf8f4] px-4 py-12">
      <div aria-hidden="true" className="grid-lines pointer-events-none absolute inset-0" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 left-1/2 size-[32rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(225,238,236,0.85)_0%,transparent_70%)]"
      />
      <main className="relative z-10 flex w-full justify-center">
        <Suspense fallback={<LoginSkeleton />}>
          <LoginForm />
        </Suspense>
      </main>
    </div>
  );
}
