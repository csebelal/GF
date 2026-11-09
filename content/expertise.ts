/**
 * Expertise areas. Each area explains the business problem, what Afrin does
 * (drawn from her CV) and which tools she uses. Portfolio examples are matched
 * automatically by category or tool, so new projects appear here on their own.
 */

export type ExpertiseIcon =
  | "automation"
  | "data"
  | "integrations"
  | "access"
  | "reporting"
  | "adoption"
  | "release"
  | "ai";

export interface ExpertiseArea {
  id: string;
  title: string;
  shortTitle: string;
  icon: ExpertiseIcon;
  /** The business problem this area addresses. */
  problem: string;
  /** What Afrin does — phrased from CV responsibilities. */
  practices: string[];
  tools: string[];
  /** Portfolio projects shown as examples: any project in these categories or using these tools. */
  match: { categories?: string[]; tools?: string[] };
  /** Show on the home page grid. */
  onHome?: boolean;
}

export const expertiseAreas: ExpertiseArea[] = [
  {
    id: "automation",
    title: "Automation and workflow design",
    shortTitle: "Automation",
    icon: "automation",
    onHome: true,
    problem:
      "Sales and support teams lose time to manual hand-offs, records that arrive half-complete and approvals that live in someone's inbox.",
    practices: [
      "Design record-triggered and screen Flows for assignments and escalations.",
      "Write validation rules that stop incomplete or inconsistent records at the point of entry.",
      "Set up approval processes so requests follow one visible path.",
      "Trace errors caused by overlapping automation and fix them without disrupting users.",
    ],
    tools: ["Salesforce Flow", "Validation rules", "Approval processes"],
    match: { categories: ["Salesforce Automation"], tools: ["Salesforce Flow"] },
  },
  {
    id: "crm-data",
    title: "CRM data quality and governance",
    shortTitle: "CRM data",
    icon: "data",
    onHome: true,
    problem:
      "Reports, automation and AI agents are only as reliable as the records underneath them. Duplicates and loose field standards erode trust quickly.",
    practices: [
      "Plan bulk imports, exports and mass updates with Data Loader, with careful field mapping and post-load validation.",
      "Set de-duplication rules and field standards so new data arrives clean.",
      "Run routine data audits and fix problems at the source rather than in reports.",
    ],
    tools: ["Data Loader", "Duplicate and matching rules", "Field standards"],
    match: { categories: ["Data Quality"], tools: ["Data Loader"] },
  },
  {
    id: "integrations",
    title: "Connected go-to-market systems",
    shortTitle: "Integrations",
    icon: "integrations",
    onHome: true,
    problem:
      "Marketing, sales and customer teams each rely on their own tools. When those tools disagree with Salesforce, people stop trusting the CRM.",
    practices: [
      "Keep HubSpot marketing data and field mappings aligned with Salesforce.",
      "Investigate sync failures and data mismatches, then resolve the root cause at the source.",
      "Bring Gong call and conversation insights alongside CRM activity.",
      "Administer 6sense (certified) for account intelligence, segments and intent signals.",
    ],
    tools: ["HubSpot", "Gong", "6sense"],
    match: { categories: ["CRM Integrations"], tools: ["HubSpot", "Gong", "6sense"] },
  },
  {
    id: "access",
    title: "Security and access management",
    shortTitle: "Access management",
    icon: "access",
    onHome: true,
    problem:
      "People need the access their job requires, and no more. Getting that balance wrong creates either blocked work or unnecessary risk.",
    practices: [
      "Manage licenses, profiles, roles, permission sets, sharing rules and field-level security.",
      "Handle onboarding and offboarding so access starts and ends on time.",
      "Troubleshoot permission set and field-level security issues reported by users.",
    ],
    tools: ["Profiles and roles", "Permission sets", "Sharing rules", "Field-level security"],
    match: { categories: ["Security and Access"], tools: ["Permission sets"] },
  },
  {
    id: "reporting",
    title: "Reporting and analytics",
    shortTitle: "Reporting",
    icon: "reporting",
    onHome: true,
    problem:
      "Leaders need a clear view of pipeline, customer activity and team performance without exporting spreadsheets every week.",
    practices: [
      "Build and maintain Salesforce reports and dashboards, including cross-object reports and filtered views.",
      "Build Tableau views that turn CRM data into shareable dashboards.",
      "Give Sales, Marketing and Customer Success one consistent view of the same numbers.",
    ],
    tools: ["Reports and dashboards", "Tableau"],
    match: { categories: ["Reporting and Analytics"], tools: ["Tableau", "Reports and dashboards"] },
  },
  {
    id: "adoption",
    title: "User adoption and training",
    shortTitle: "User adoption",
    icon: "adoption",
    onHome: true,
    problem:
      "A well-built change still fails if people don't understand why it exists or how it affects their day.",
    practices: [
      "Partner with Sales, Marketing and Customer Success leaders to turn business needs into practical improvements.",
      "Document and communicate every release to the people it affects.",
      "Train users with clear guides and walkthroughs, drawing on earlier QA and training roles.",
      "Keep a log of recurring issues and propose process changes that prevent repeat requests.",
    ],
    tools: ["User guides", "Walkthroughs", "Release notes"],
    match: { categories: ["Product Thinking"] },
  },
  {
    id: "release",
    title: "Release management and org health",
    shortTitle: "Releases",
    icon: "release",
    problem:
      "Untested changes break working processes, and years of unused fields and flows make an org slow to navigate and risky to change.",
    practices: [
      "Build and test in sandboxes, then deploy with change sets.",
      "Validate results and log issues before and after each release.",
      "Review field and automation usage, and retire unused fields, flows and reports.",
      "Configure custom objects, fields, page layouts, Lightning pages and record types from stakeholder requirements.",
    ],
    tools: ["Sandboxes", "Change sets", "VS Code with Salesforce extensions"],
    match: { tools: ["Sandboxes", "Change sets"] },
  },
  {
    id: "ai-workflows",
    title: "AI-assisted workflows",
    shortTitle: "AI workflows",
    icon: "ai",
    problem:
      "AI agents and assistants are only useful when they're grounded in accurate, well-permissioned data and pointed at the right problems.",
    practices: [
      "Work with Agentforce to identify automation use cases and support AI-assisted workflows grounded in CRM data.",
      "Keep data quality and permissions in order so agents work from accurate, secure data.",
      "Use Claude AI to speed up documentation, requirement summaries and data analysis.",
    ],
    tools: ["Agentforce", "Claude AI"],
    match: { categories: ["AI Experiments"], tools: ["Agentforce", "Claude AI"] },
  },
];

/** Steps shown in the "Working approach" section on the home page. */
export const workingApproach = [
  {
    title: "Understand the request",
    body: "Talk to the person who asked and the people who will live with the change. Find the business problem behind the ticket before choosing a feature.",
    detail: "Stakeholder questions, requirement summaries",
  },
  {
    title: "Define the workflow",
    body: "Map the current steps, the hand-offs and the data each step needs. Decide what should be automated, validated or left to judgement.",
    detail: "Process maps, field and picklist decisions",
  },
  {
    title: "Build in a sandbox",
    body: "Configure objects, fields, Flows and permissions in a sandbox, following Salesforce security and governance practices.",
    detail: "Sandboxes, change sets, permission sets",
  },
  {
    title: "Test the edges",
    body: "Test with realistic records and the awkward cases: missing values, bulk updates, overlapping automation and users with limited access.",
    detail: "Test logs, before-and-after validation",
  },
  {
    title: "Help people adopt it",
    body: "Release with clear notes and a short guide or walkthrough, then follow up to catch the questions that only appear after launch.",
    detail: "User guides, walkthroughs, recurring-issue log",
  },
];
