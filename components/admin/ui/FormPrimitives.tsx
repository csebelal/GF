"use client";

import { useId, type ReactNode } from "react";
import { Alert, Check } from "@/components/Icons";

export const adminFocusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2";

export const adminInputClass =
  "h-10 w-full rounded-xl border border-line-strong bg-surface px-3.5 text-sm text-ink transition-colors duration-200 placeholder:text-muted hover:border-body focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1";

export const adminInputCompactClass =
  "h-9 w-full rounded-lg border border-line-strong bg-surface px-3 text-xs text-ink transition-colors duration-200 placeholder:text-muted hover:border-body focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1";

export const adminTextareaClass =
  "w-full rounded-xl border border-line-strong bg-surface px-3.5 py-2.5 text-sm text-ink transition-colors duration-200 placeholder:text-muted hover:border-body focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-1";

export const adminPrimaryBtnClass = `inline-flex min-h-[40px] cursor-pointer items-center justify-center gap-2 rounded-xl bg-accent px-5 py-2 text-xs font-semibold text-white shadow-sm transition-colors duration-200 hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-50 ${adminFocusRing}`;

export const adminSecondaryBtnClass = `inline-flex min-h-[40px] cursor-pointer items-center justify-center gap-2 rounded-xl border border-line-strong bg-surface px-4 py-2 text-xs font-semibold text-ink transition-colors duration-200 hover:bg-tint disabled:cursor-not-allowed disabled:opacity-50 ${adminFocusRing}`;

export const adminIconBtnClass = `inline-flex min-h-[32px] min-w-[32px] cursor-pointer items-center justify-center rounded-lg text-body transition-colors duration-200 hover:bg-accent-soft hover:text-accent-strong disabled:cursor-not-allowed disabled:opacity-25 ${adminFocusRing}`;

export const adminDangerIconBtnClass = `inline-flex min-h-[32px] min-w-[32px] cursor-pointer items-center justify-center rounded-lg text-danger transition-colors duration-200 hover:bg-danger-soft disabled:cursor-not-allowed disabled:opacity-35 ${adminFocusRing}`;

interface AdminCardProps {
  children: ReactNode;
  className?: string;
}

export function AdminCard({ children, className = "" }: AdminCardProps) {
  return (
    <section className={`rounded-2xl border border-line bg-surface p-6 shadow-sm ${className}`}>
      {children}
    </section>
  );
}

interface AdminAlertProps {
  message: { text: string; type: "success" | "error" } | null;
}

export function AdminAlert({ message }: AdminAlertProps) {
  if (!message) return null;
  const isError = message.type === "error";

  return (
    <div
      role={isError ? "alert" : "status"}
      aria-live="polite"
      className={`flex items-start gap-2.5 rounded-xl border p-3.5 text-sm ${
        isError
          ? "border-danger-line bg-danger-soft text-danger"
          : "border-success-line bg-success-soft text-success"
      }`}
    >
      {isError ? (
        <Alert className="mt-0.5 size-4 shrink-0" />
      ) : (
        <Check className="mt-0.5 size-4 shrink-0" />
      )}
      <span>{message.text}</span>
    </div>
  );
}

interface AdminFieldProps {
  label: string;
  hint?: string;
  action?: ReactNode;
  className?: string;
  children: (props: { id: string; describedBy?: string }) => ReactNode;
}

/**
 * Accessible form field wrapper that automatically associates a unique <label htmlFor>
 * and optional hint aria-describedby with its child input/select/textarea.
 */
export function AdminField({
  label,
  hint,
  action,
  className = "",
  children,
}: AdminFieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;

  return (
    <div className={className}>
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <label htmlFor={id} className="block text-xs font-semibold text-body">
          {label}
        </label>
        {action}
      </div>
      {children({ id, describedBy: hintId })}
      {hint ? (
        <p id={hintId} className="mt-1 text-xs text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
