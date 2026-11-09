import type { Project } from "@/lib/types";

/**
 * SAMPLE COLLECTION — placeholder projects that demonstrate the portfolio
 * layout (video + documentation, video only, documentation only, multiple
 * videos, a vertical video and a draft).
 *
 * They are NOT Afrin's work. Every page built from this file shows a
 * "Sample project" notice. To remove them all, set SHOW_SAMPLE_PROJECTS to
 * false in content/projects/index.ts, or delete this file's entries.
 *
 * The YouTube links point to Google's public IFrame API demo video
 * (M7lc1UVf-VE) so the player can be tested. Replace them with Afrin's own
 * walkthroughs.
 */
export const sampleProjects: Project[] = [
  {
    slug: "lead-routing-flow",
    title: "Lead routing with a record-triggered Flow",
    summary:
      "Routing inbound leads by region and segment, with a fallback queue and an escalation for leads nobody picks up within a business day.",
    category: "Salesforce Automation",
    tools: ["Salesforce Flow", "Validation rules", "Sandboxes", "Change sets"],
    featured: true,
    status: "published",
    provenance: "independent",
    role: "Design, build, testing and user guide",
    coverImage: {
      src: "/images/samples/lead-routing-cover.svg",
      alt: "Diagram of a lead routing Flow: a new lead passes a region decision and is assigned to one of three queues, with a fallback queue and a timed escalation.",
    },
    overview:
      "Inbound leads were assigned by hand from a shared inbox, so response times depended on who happened to be watching. This sample replaces that step with a record-triggered Flow that assigns each lead to the right regional queue, catches the leads that don't fit any rule, and escalates anything left untouched.",
    videos: [
      {
        title: "Lead routing Flow — full walkthrough",
        youtubeUrl: "https://www.youtube.com/watch?v=M7lc1UVf-VE",
        description:
          "A walk through the Flow canvas: entry conditions, the region decision, queue assignment, the fallback path and the scheduled escalation.",
        posterImage: "/images/samples/lead-routing-poster.svg",
        transcript: "samples/lead-routing-transcript.md",
        showCaptions: true,
      },
    ],
    documentation: "samples/lead-routing-flow.md",
    screenshots: [
      {
        src: "/images/samples/lead-routing-matrix.svg",
        alt: "Routing matrix table mapping country and employee count to a queue name.",
        caption: "The routing matrix agreed with sales leadership before any automation was built.",
      },
      {
        src: "/images/samples/lead-routing-cover.svg",
        alt: "Diagram of the lead routing Flow with its decision and assignment steps.",
        caption: "Simplified view of the Flow. Each branch ends in a queue assignment and a task for the owner.",
      },
    ],
    attachments: [
      { label: "Routing matrix (sample CSV)", url: "/files/samples/routing-matrix-sample.csv", description: "CSV, 1 KB" },
    ],
    externalLinks: [
      { label: "Salesforce Trailhead", url: "https://trailhead.salesforce.com/", description: "Reference material on Flow Builder" },
    ],
  },
  {
    slug: "hubspot-sync-playbook",
    title: "HubSpot and Salesforce sync troubleshooting playbook",
    summary:
      "A repeatable method for tracing sync errors back to their source: field mappings, picklist values, validation rules or record ownership.",
    category: "CRM Integrations",
    tools: ["HubSpot", "Validation rules", "Reports and dashboards"],
    featured: true,
    status: "published",
    provenance: "illustrative",
    role: "Investigation method and documentation",
    coverImage: {
      src: "/images/samples/hubspot-sync-cover.svg",
      alt: "Diagram of HubSpot and Salesforce exchanging contact fields, with one mapping flagged as an error.",
    },
    overview:
      "Sync errors tend to arrive as vague complaints: a contact is missing, a field looks wrong, a lead never reached sales. This playbook turns those reports into a short sequence of checks so the fix lands at the source instead of in a one-off manual edit.",
    documentation: "samples/hubspot-sync-playbook.md",
    screenshots: [
      {
        src: "/images/samples/hubspot-sync-triage.svg",
        alt: "Triage flowchart: check the sync error message, then field mapping, picklist values, validation rules and record ownership.",
        caption: "The triage order used in the playbook, from the cheapest check to the most involved.",
      },
    ],
  },
  {
    slug: "duplicate-cleanup",
    title: "Duplicate management and a safe Data Loader cleanup",
    summary:
      "Two short walkthroughs: configuring matching and duplicate rules, then cleaning existing records in bulk with a backup and a rollback plan.",
    category: "Data Quality",
    tools: ["Data Loader", "Duplicate and matching rules", "Reports and dashboards"],
    featured: true,
    status: "published",
    provenance: "independent",
    coverImage: {
      src: "/images/samples/duplicate-cleanup-cover.svg",
      alt: "Three overlapping contact records merging into a single clean record.",
    },
    overview:
      "Duplicates have two causes that need different fixes: new duplicates arriving every day, and old ones already in the org. Part 1 stops the first; part 2 cleans up the second without risking good data.",
    videos: [
      {
        title: "Part 1 — Matching and duplicate rules",
        youtubeUrl: "https://youtu.be/M7lc1UVf-VE",
        description: "Choosing match keys for contacts and accounts, and deciding when to alert instead of block.",
        documentation: "samples/duplicate-rules-notes.md",
      },
      {
        title: "Part 2 — Bulk cleanup with Data Loader",
        youtubeUrl: "https://www.youtube.com/embed/M7lc1UVf-VE?start=45",
        description: "Exporting a backup, preparing the update file and validating the result after the load.",
        documentation: "samples/data-loader-notes.md",
      },
    ],
    documentation: "samples/duplicate-cleanup-overview.md",
  },
  {
    slug: "pipeline-dashboard",
    title: "Pipeline visibility dashboard for sales leadership",
    summary:
      "A short tour of a dashboard built around three weekly questions: what's new in the pipeline, what's stuck and what's due to close.",
    category: "Reporting and Analytics",
    tools: ["Reports and dashboards", "Tableau"],
    status: "published",
    provenance: "illustrative",
    videos: [
      {
        title: "Pipeline dashboard tour",
        youtubeUrl: "https://m.youtube.com/watch?v=M7lc1UVf-VE&t=1m5s",
        description:
          "Each component answers one question a sales manager asks in the Monday pipeline meeting, using the same report filters so the numbers match across the dashboard.",
      },
    ],
  },
  {
    slug: "agentforce-use-case-scoping",
    title: "Scoping a first Agentforce use case from support tickets",
    summary:
      "A vertical short on picking a first AI agent use case: frequent, low-risk questions answered by data that is already clean and properly permissioned.",
    category: "AI Experiments",
    tools: ["Agentforce", "Service Cloud", "Permission sets", "Claude AI"],
    status: "published",
    provenance: "independent",
    date: "2026-09",
    videos: [
      {
        title: "Choosing a first agent use case",
        youtubeUrl: "https://www.youtube.com/shorts/M7lc1UVf-VE",
        aspectRatio: "9:16",
        description:
          "Ninety seconds on the three filters used to shortlist use cases: volume, risk and data readiness.",
        transcript: "samples/agentforce-short-transcript.md",
        posterImage: "/images/samples/agentforce-poster.svg",
      },
    ],
  },
  {
    slug: "admin-backlog-prioritization",
    title: "Prioritizing a Salesforce admin backlog like a product",
    summary:
      "A product-thinking exercise: scoring admin requests by user impact, effort and risk, then turning the top of the list into a release plan.",
    category: "Product Thinking",
    tools: ["Salesforce", "Claude AI"],
    status: "published",
    provenance: "illustrative",
    coverImage: {
      src: "/images/samples/backlog-cover.svg",
      alt: "Impact and effort matrix with backlog items plotted in four quadrants.",
    },
    documentation: "samples/admin-backlog-prioritization.md",
    screenshots: [
      {
        src: "/images/samples/backlog-cover.svg",
        alt: "Impact and effort matrix with backlog items plotted in four quadrants.",
        caption: "Requests plotted by impact and effort. Quick wins sit in the top-left quadrant.",
      },
    ],
  },
  {
    slug: "discount-approval-process",
    title: "Discount approval process (draft)",
    summary: "Draft entry used to confirm that unpublished projects stay out of listings, search and public routes.",
    category: "Salesforce Automation",
    tools: ["Approval processes"],
    status: "draft",
    provenance: "independent",
    videos: [{ title: "Unfinished recording", youtubeUrl: "paste-link-here" }],
  },
];
