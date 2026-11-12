import Link from "next/link";
import { ArrowRight } from "./Icons";

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
