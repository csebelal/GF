import Link from "next/link";
import { ArrowRight, Info } from "./Icons";

/** Shared page-level building blocks. */

export function SectionHeader({
  eyebrow,
  title,
  intro,
  id,
  action,
  align = "split",
}: {
  eyebrow: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  id?: string;
  action?: { href: string; label: string };
  align?: "split" | "stack";
}) {
  if (align === "stack") {
    return (
      <div className="max-w-3xl">
        <p className="eyebrow">{eyebrow}</p>
        <h2 id={id} className="mt-5 text-[clamp(1.875rem,3.6vw,2.75rem)] font-semibold leading-[1.1] tracking-[-0.03em]">
          {title}
        </h2>
        {intro ? <div className="mt-5 text-lg leading-relaxed text-body">{intro}</div> : null}
        {action ? (
          <Link href={action.href} className="link-arrow mt-6">
            {action.label} <ArrowRight />
          </Link>
        ) : null}
      </div>
    );
  }
  return (
    <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
      <div className="lg:col-span-7">
        <p className="eyebrow">{eyebrow}</p>
        <h2 id={id} className="mt-5 text-[clamp(1.875rem,3.6vw,2.75rem)] font-semibold leading-[1.1] tracking-[-0.03em]">
          {title}
        </h2>
      </div>
      <div className="lg:col-span-5 lg:pb-1">
        {intro ? <div className="text-[1.0625rem] leading-relaxed text-body">{intro}</div> : null}
        {action ? (
          <Link href={action.href} className="link-arrow mt-4">
            {action.label} <ArrowRight />
          </Link>
        ) : null}
      </div>
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-line">
      <div aria-hidden className="grid-lines absolute inset-0" />
      <div className="container-page relative pb-16 pt-14 sm:pb-20 sm:pt-20">
        <p className="eyebrow animate-rise">{eyebrow}</p>
        <h1 className="mt-6 max-w-4xl animate-rise text-[clamp(2.5rem,5.6vw,4.25rem)] font-semibold leading-[1.03] tracking-[-0.035em] [animation-delay:60ms]">
          {title}
        </h1>
        {intro ? (
          <div className="mt-6 max-w-2xl animate-rise text-lg leading-relaxed text-body sm:text-xl sm:leading-relaxed [animation-delay:120ms]">
            {intro}
          </div>
        ) : null}
        {children ? <div className="mt-8 animate-rise [animation-delay:180ms]">{children}</div> : null}
      </div>
    </section>
  );
}

export function SampleNotice({ compact = false }: { compact?: boolean }) {
  return (
    <div
      role="note"
      className={`flex gap-3 rounded-xl border border-amber-line bg-amber-soft text-amber ${compact ? "px-4 py-3 text-sm" : "px-5 py-4 text-[0.9375rem]"}`}
    >
      <Info className="mt-0.5 shrink-0 text-lg" />
      <p className="leading-relaxed">
        <strong className="font-semibold">Sample project.</strong> This entry is placeholder content that shows how
        a portfolio project is presented. It does not describe work Afrin has completed and will be replaced with
        her own projects.
      </p>
    </div>
  );
}

export function SampleCollectionNote() {
  return (
    <p className="inline-flex items-center gap-2 rounded-full border border-amber-line bg-amber-soft px-3 py-1.5 text-sm font-medium text-amber">
      <Info className="shrink-0" /> Sample collection — placeholder projects that demonstrate the layout
    </p>
  );
}
