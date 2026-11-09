import type { Employer } from "@/content/experience";
import { formatDuration, formatMonth, formatRange, monthsBetween } from "@/lib/project-utils";
import { TrendingUp } from "./Icons";

interface ExperienceTimelineProps {
  employers: Employer[];
  /** "full" shows responsibilities; "compact" shows titles and dates only. */
  variant?: "full" | "compact";
}

/** Career timeline. Promotions inside one employer are shown as a connected step. */
export function ExperienceTimeline({ employers, variant = "full" }: ExperienceTimelineProps) {
  if (variant === "compact") return <CompactTimeline employers={employers} />;

  return (
    <ol className="relative grid gap-10">
      {employers.map((employer) => {
        const first = employer.roles[employer.roles.length - 1];
        const last = employer.roles[0];
        const tenure = formatDuration(monthsBetween(first.start, last.end));
        return (
          <li key={employer.company} className="grid gap-6 lg:grid-cols-12" data-reveal>
            <div className="lg:col-span-3">
              <div className="lg:sticky lg:top-28">
                <h3 className="text-xl font-semibold tracking-tight">{employer.company}</h3>
                <p className="mt-1 text-sm text-muted">
                  {formatRange(first.start, last.end)} · {tenure}
                </p>
              </div>
            </div>

            <div className="lg:col-span-9">
              <ol className="relative grid gap-4">
                {employer.roles.map((role, index) => {
                  const isLatest = index === 0 && role.end === "present";
                  const showPromotion = employer.promotion && index === 0 && employer.roles.length > 1;
                  const grouped = groupByTheme(role.responsibilities);
                  return (
                    <li key={role.title} className="relative">
                      <article className={`card overflow-hidden ${isLatest ? "border-accent-line" : ""}`}>
                        <header className="flex flex-col gap-2 border-b border-line px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <h4 className="text-lg font-semibold tracking-tight">{role.title}</h4>
                            <p className="mt-0.5 text-sm text-muted">{employer.company}</p>
                          </div>
                          <p className="flex items-center gap-2 text-sm font-medium text-body">
                            {isLatest ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-accent-strong">
                                <span aria-hidden className="size-1.5 rounded-full bg-accent" /> Current
                              </span>
                            ) : null}
                            <time dateTime={role.start}>{formatMonth(role.start)}</time> –{" "}
                            {role.end === "present" ? "Present" : <time dateTime={role.end}>{formatMonth(role.end)}</time>}
                          </p>
                        </header>
                        <div className="px-6 py-5">
                          {grouped.some((group) => group.theme) ? (
                            <dl className="grid gap-4 sm:grid-cols-[11rem_1fr] sm:gap-x-6">
                              {grouped.map((group) => (
                                <div key={group.theme ?? "general"} className="contents">
                                  <dt className="text-sm font-semibold text-ink sm:pt-px">{group.theme}</dt>
                                  <dd className="-mt-2 sm:mt-0">
                                    <ul className="grid gap-2">
                                      {group.items.map((item) => (
                                        <li key={item} className="text-[0.9375rem] leading-relaxed text-body">
                                          {item}
                                        </li>
                                      ))}
                                    </ul>
                                  </dd>
                                </div>
                              ))}
                            </dl>
                          ) : (
                            <ul className="grid gap-2.5">
                              {role.responsibilities.map((item) => (
                                <li key={item.text} className="flex gap-3 text-[0.9375rem] leading-relaxed text-body">
                                  <span aria-hidden className="mt-[0.6em] size-1.5 shrink-0 rounded-full bg-line-strong" />
                                  {item.text}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </article>

                      {showPromotion ? (
                        <div className="relative flex items-center gap-3 py-4 pl-6">
                          <span aria-hidden className="absolute bottom-0 left-[2.1rem] top-0 w-px bg-accent-line" />
                          <span className="relative z-10 flex size-[1.4rem] items-center justify-center rounded-full bg-accent text-white ring-4 ring-canvas">
                            <TrendingUp className="text-xs" />
                          </span>
                          <p className="rounded-full border border-accent-line bg-accent-soft px-3 py-1 text-sm font-semibold text-accent-strong">
                            {employer.promotion!.label} · {formatMonth(employer.promotion!.date, "long")}
                          </p>
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ol>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function groupByTheme(items: { theme?: string; text: string }[]) {
  const groups: { theme?: string; items: string[] }[] = [];
  for (const item of items) {
    const existing = groups.find((group) => group.theme === item.theme);
    if (existing) existing.items.push(item.text);
    else groups.push({ theme: item.theme, items: [item.text] });
  }
  return groups;
}

function CompactTimeline({ employers }: { employers: Employer[] }) {
  const rows = employers.flatMap((employer) =>
    employer.roles.map((role, index) => ({
      key: `${employer.company}-${role.title}`,
      company: employer.company,
      role,
      promotedFromNext: Boolean(employer.promotion && index === 0 && employer.roles.length > 1),
      continuesEmployer: index > 0,
    })),
  );

  return (
    <div className="relative">
      <span aria-hidden className="absolute bottom-3 left-[0.4375rem] top-3 w-px bg-line-strong" />
      <ol className="relative">
      {rows.map((row) => {
        const current = row.role.end === "present";
        return (
          <li key={row.key} className="relative grid grid-cols-[1.75rem_1fr] gap-x-3 pb-7 last:pb-0">
            <span
              aria-hidden
              className={`relative z-10 mt-1.5 size-[0.9375rem] rounded-full ring-4 ring-white ${
                current ? "bg-accent" : row.continuesEmployer ? "border-2 border-accent bg-white" : "border-2 border-line-strong bg-white"
              }`}
            />
            <div>
              <p className="text-sm font-medium text-muted">
                {formatMonth(row.role.start)} – {formatMonth(row.role.end)}
              </p>
              <p className="mt-0.5 font-semibold text-ink">{row.role.title}</p>
              <p className="text-[0.9375rem] text-body">{row.company}</p>
              {row.promotedFromNext ? (
                <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-2.5 py-1 text-xs font-semibold text-accent-strong">
                  <TrendingUp /> Promoted from Junior Salesforce Administrator
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
      </ol>
    </div>
  );
}
