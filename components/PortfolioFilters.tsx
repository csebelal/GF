"use client";

import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { contentTypeLabels } from "@/lib/project-utils";
import type { ProjectCardData } from "@/lib/projects";
import type { ContentType } from "@/lib/types";
import { Close, Search } from "./Icons";
import { ProjectCard } from "./ProjectCard";

interface PortfolioFiltersProps {
  projects: ProjectCardData[];
  categories: string[];
}

interface FilterState {
  query: string;
  category: string;
  type: ContentType | "";
}

const EMPTY: FilterState = { query: "", category: "", type: "" };
const TYPE_ORDER: ContentType[] = ["video+documentation", "video", "documentation"];

function readStateFromUrl(categories: string[]): FilterState {
  const params = new URLSearchParams(window.location.search);
  const category = params.get("category") ?? "";
  const type = (params.get("type") ?? "") as ContentType | "";
  return {
    query: params.get("q") ?? "",
    category: categories.includes(category) ? category : "",
    type: TYPE_ORDER.includes(type as ContentType) ? type : "",
  };
}

function matchesQuery(project: ProjectCardData, query: string) {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;
  const haystack = [project.title, project.summary, project.category, ...project.tools].join(" ").toLowerCase();
  return terms.every((term) => haystack.includes(term));
}

/**
 * Search and filter UI for the portfolio library. Filters are mirrored in the
 * URL (?q=&category=&type=) so results can be shared and survive back/forward.
 */
export function PortfolioFilters({ projects, categories }: PortfolioFiltersProps) {
  const [state, setState] = useState<FilterState>(EMPTY);
  const searchId = useId();
  const statusId = useId();

  // Hydrate from the URL after mount (keeps the static HTML complete) and on back/forward.
  useEffect(() => {
    const sync = () => setState(readStateFromUrl(categories));
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, [categories]);

  const update = useCallback((patch: Partial<FilterState>) => {
    setState((previous) => {
      const next = { ...previous, ...patch };
      const params = new URLSearchParams();
      if (next.query) params.set("q", next.query);
      if (next.category) params.set("category", next.category);
      if (next.type) params.set("type", next.type);
      const search = params.toString();
      const url = `${window.location.pathname}${search ? `?${search}` : ""}`;
      window.history.replaceState(window.history.state, "", url);
      return next;
    });
  }, []);

  const types = useMemo(
    () => TYPE_ORDER.filter((type) => projects.some((project) => project.contentType === type)),
    [projects],
  );

  const results = useMemo(
    () =>
      projects.filter(
        (project) =>
          matchesQuery(project, state.query) &&
          (!state.category || project.category === state.category) &&
          (!state.type || project.contentType === state.type),
      ),
    [projects, state],
  );

  const isFiltered = Boolean(state.query || state.category || state.type);
  const featured = !isFiltered ? results.filter((project) => project.featured) : [];
  const rest = !isFiltered ? results.filter((project) => !project.featured) : results;

  const countFor = (patch: Partial<FilterState>) =>
    projects.filter((project) => {
      const s = { ...state, ...patch };
      return (
        matchesQuery(project, s.query) &&
        (!s.category || project.category === s.category) &&
        (!s.type || project.contentType === s.type)
      );
    }).length;

  return (
    <div>
      <div className="card p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative lg:w-[22rem] lg:shrink-0">
            <label htmlFor={searchId} className="sr-only">
              Search projects by title, summary or tool
            </label>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-lg text-muted" />
            <input
              id={searchId}
              type="search"
              value={state.query}
              onChange={(event) => update({ query: event.target.value })}
              placeholder="Search by title, summary or tool"
              aria-describedby={statusId}
              autoComplete="off"
              className="h-12 w-full rounded-[var(--radius-control)] border border-line-strong bg-canvas pl-10 pr-11 text-[0.9375rem] text-ink placeholder:text-muted focus:border-accent focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/20 [&::-webkit-search-cancel-button]:hidden"
            />
            {state.query ? (
              <button
                type="button"
                onClick={() => update({ query: "" })}
                className="absolute right-1.5 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-muted hover:bg-tint hover:text-ink"
                aria-label="Clear search"
              >
                <Close />
              </button>
            ) : null}
          </div>

          <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:justify-end">
            <FilterGroup label="Content type">
              <FilterButton active={!state.type} onClick={() => update({ type: "" })}>
                Any format
              </FilterButton>
              {types.map((type) => (
                <FilterButton
                  key={type}
                  active={state.type === type}
                  onClick={() => update({ type: state.type === type ? "" : type })}
                  count={countFor({ type })}
                >
                  {contentTypeLabels[type]}
                </FilterButton>
              ))}
            </FilterGroup>
          </div>
        </div>

        <div className="mt-4 border-t border-line pt-4">
          <FilterGroup label="Category">
            <FilterButton active={!state.category} onClick={() => update({ category: "" })}>
              All categories
            </FilterButton>
            {categories.map((category) => (
              <FilterButton
                key={category}
                active={state.category === category}
                onClick={() => update({ category: state.category === category ? "" : category })}
                count={countFor({ category })}
              >
                {category}
              </FilterButton>
            ))}
          </FilterGroup>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <p id={statusId} role="status" aria-live="polite" className="text-[0.9375rem] text-body">
          <span className="font-semibold text-ink">{results.length}</span> of {projects.length}{" "}
          {projects.length === 1 ? "project" : "projects"}
          {isFiltered ? " match your filters" : ""}
        </p>
        {isFiltered ? (
          <button type="button" onClick={() => update(EMPTY)} className="link-arrow min-h-10 text-sm">
            Reset filters
          </button>
        ) : null}
      </div>

      {results.length === 0 ? (
        <div className="mt-6 flex flex-col items-center rounded-[var(--radius-card)] border border-dashed border-line-strong bg-surface px-6 py-16 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-tint text-xl text-muted">
            <Search />
          </span>
          <h2 className="mt-5 text-lg font-semibold">No projects match those filters</h2>
          <p className="mt-2 max-w-md text-[0.9375rem] leading-relaxed text-body">
            Try a broader search term, such as a tool name like “Flow” or “HubSpot”, or clear the filters to see
            every project.
          </p>
          <button type="button" onClick={() => update(EMPTY)} className="btn btn-primary mt-6">
            Show all projects
          </button>
        </div>
      ) : (
        <>
          {featured.length > 0 ? (
            <section aria-labelledby="featured-heading" className="mt-6">
              <h2 id="featured-heading" className="sr-only">
                Featured projects
              </h2>
              <div className="grid gap-6">
                <ProjectCard project={featured[0]} variant="feature" priority />
                {featured.length > 1 ? (
                  <div className="grid gap-6 md:grid-cols-2">
                    {featured.slice(1).map((project) => (
                      <ProjectCard key={project.slug} project={project} />
                    ))}
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}

          {rest.length > 0 ? (
            <section aria-labelledby="all-heading" className={featured.length ? "mt-16" : "mt-6"}>
              {featured.length ? (
                <div className="mb-6 flex items-center gap-4">
                  <h2 id="all-heading" className="text-lg font-semibold">
                    More projects
                  </h2>
                  <span aria-hidden className="h-px flex-1 bg-line" />
                </div>
              ) : (
                <h2 id="all-heading" className="sr-only">
                  Projects
                </h2>
              )}
              <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((project) => (
                  <li key={project.slug}>
                    <ProjectCard project={project} />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-2">
      <span aria-hidden className="mr-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
        {label}
      </span>
      {children}
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean;
  onClick: () => void;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex min-h-10 items-center gap-2 rounded-full border px-3.5 text-sm font-medium transition-colors ${
        active
          ? "border-ink bg-ink text-white"
          : "border-line bg-surface text-body hover:border-line-strong hover:text-ink"
      }`}
    >
      {children}
      {count !== undefined ? (
        <span className={`text-xs tabular-nums ${active ? "text-white/75" : "text-muted"}`}>{count}</span>
      ) : null}
    </button>
  );
}
