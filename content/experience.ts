/**
 * Career history, credentials and education — transcribed from Afrin's CV.
 * Keep job titles and dates exactly as they appear on the CV.
 */

export interface Role {
  title: string;
  start: string; // "YYYY-MM"
  end: string | "present";
  /** Responsibilities grouped by theme for easier scanning. */
  responsibilities: { theme?: string; text: string }[];
}

export interface Employer {
  company: string;
  roles: Role[];
  /** Shown between roles when the person was promoted inside the company. */
  promotion?: { date: string; label: string };
}

export const employers: Employer[] = [
  {
    company: "Field Nation",
    promotion: { date: "2025-01", label: "Promoted to Salesforce Administrator" },
    roles: [
      {
        title: "Salesforce Administrator",
        start: "2025-01",
        end: "present",
        responsibilities: [
          {
            theme: "Administration and security",
            text: "Own day-to-day administration of Sales Cloud and Service Cloud, including the security model: licenses, profiles, roles, permission sets, sharing rules, field-level security and user onboarding and offboarding.",
          },
          {
            theme: "Automation",
            text: "Design and own automation with Flow, validation rules and approval processes, including assignments and escalations, to remove manual steps and standardize sales and customer workflows.",
          },
          {
            theme: "Configuration",
            text: "Configure custom objects, fields, picklists, page layouts, Lightning pages and record types, turning requirements from stakeholders into scalable solutions and prioritizing the admin backlog.",
          },
          {
            theme: "Release management",
            text: "Own release management: build and test in sandboxes, deploy with change sets, then document and communicate updates to users, following Salesforce security and governance best practices.",
          },
          {
            theme: "Reporting",
            text: "Build and maintain Salesforce reports and dashboards, plus Tableau views, giving Sales, Marketing and Customer Success clear visibility into pipeline, customer activity and team performance.",
          },
          {
            theme: "Data governance",
            text: "Set data governance standards: Data Loader processes, de-duplication rules, field standards and routine data audits that keep records accurate and trusted.",
          },
          {
            theme: "Connected systems",
            text: "Administer the connected go-to-market stack: keep HubSpot marketing data and field mappings aligned with Salesforce and resolve sync issues at the source.",
          },
          {
            theme: "Connected systems",
            text: "Work with Gong so call and conversation insights sit alongside CRM activity, and administer 6sense (certified) for account intelligence, segments and intent signals that guide prioritization.",
          },
          {
            theme: "AI-assisted workflows",
            text: "Work with Agentforce, Salesforce's AI agent platform, to identify automation use cases and support AI-assisted workflows grounded in CRM data, keeping data quality and permissions in order so agents work from accurate, secure data.",
          },
          {
            theme: "Partnership and training",
            text: "Partner with Sales, Marketing and Customer Success leaders to turn business needs into practical Salesforce improvements, and train users with clear guides and walkthroughs.",
          },
          {
            theme: "Org health",
            text: "Keep the org healthy and efficient: review field and automation usage, retire unused fields, flows and reports, and reduce clutter so users find what they need faster.",
          },
          {
            theme: "AI-assisted workflows",
            text: "Use Claude AI to speed up documentation, requirement summaries, data analysis and everyday admin workflows.",
          },
        ],
      },
      {
        title: "Junior Salesforce Administrator",
        start: "2022-04",
        end: "2024-12",
        responsibilities: [
          {
            theme: "Access requests",
            text: "Handled daily user and access requests across Sales and Support teams: onboarding, license and profile assignments, and troubleshooting permission set and field-level security issues.",
          },
          {
            theme: "Automation",
            text: "Built and debugged record-triggered and screen Flows and validation rules, tracing errors caused by overlapping automation and fixing them without disrupting users.",
          },
          {
            theme: "Data operations",
            text: "Carried out large data operations: bulk imports, exports and mass updates with Data Loader, with careful field mapping, de-duplication and post-load validation.",
          },
          {
            theme: "Reporting",
            text: "Created and refined reports and dashboards, including cross-object reports and filtered views, and updated page layouts and record types as requirements changed.",
          },
          {
            theme: "Integrations",
            text: "Investigated sync failures and data mismatches between Salesforce and tools such as HubSpot, Gong and 6sense, escalating and resolving the root cause.",
          },
          {
            theme: "Releases",
            text: "Assisted with sandbox testing and change set deployments, validating results and logging issues before and after each release.",
          },
          {
            theme: "Support and documentation",
            text: "Resolved escalated support tickets, documented fixes and wrote user guides, building the platform knowledge that led to the promotion to Salesforce Administrator.",
          },
          {
            theme: "Process improvement",
            text: "Kept a log of recurring issues and proposed process improvements to the admin team to prevent repeat requests.",
          },
        ],
      },
    ],
  },
  {
    company: "Biztech Solutions",
    roles: [
      {
        title: "Customer Service Manager",
        start: "2021-11",
        end: "2022-03",
        responsibilities: [
          { text: "Supervised day-to-day operations of the customer service department and kept the team focused on service quality." },
          { text: "Developed customer satisfaction goals and coordinated with the team to meet them on a steady basis." },
          { text: "Maintained accurate records of all customer service activities and discussions." },
          { text: "Assessed service statistics and prepared detailed reports on findings for management." },
          { text: "Hired and trained new customer service agents, coaching them on service standards." },
          { text: "Monitored team performance against goals and gave regular feedback and coaching to agents." },
          { text: "Stayed informed on the latest industry techniques and methods and applied them to improve team processes." },
        ],
      },
    ],
  },
  {
    company: "Sheba Platform LTD",
    roles: [
      {
        title: "Quality Assurance and Training Officer",
        start: "2021-03",
        end: "2021-09",
        responsibilities: [
          { text: "Designed, implemented and improved company quality standards." },
          { text: "Determined, negotiated and agreed in-house quality procedures, standards and specifications." },
          { text: "Analyzed data to find areas for growth and formulated strategies to increase productivity." },
          { text: "Managed the recruiting process; trained, motivated, coached and corrected employees to ensure standards were met." },
          { text: "Created reports documenting errors and issues to track progress over time." },
          { text: "Worked closely with the development team to improve existing products and services." },
          { text: "Aligned teams across the company on quality expectations and corrective actions." },
        ],
      },
    ],
  },
  {
    company: "Chaldal.com",
    roles: [
      {
        title: "Sr. Customer Service Executive",
        start: "2020-02",
        end: "2020-11",
        responsibilities: [
          { text: "Maintained financial accounts by processing customer adjustments accurately." },
          { text: "Fulfilled customer requirements to enhance service delivery approaches." },
          { text: "Resolved customer complaints, managed database records and drafted status reports on customer service issues." },
          { text: "Preserved revenue streams through strong communication and negotiation, offering refunds only as a last resort to keep customers satisfied." },
          { text: "Kept records of customer interactions, transactions, comments and complaints." },
          { text: "Followed company policy and escalation procedures to resolve complaints efficiently." },
          { text: "Communicated with customers through various channels." },
        ],
      },
    ],
  },
];

/** Formal certification (exam-based credential). */
export const certifications = [
  { name: "Certified 6sense Administrator", issuer: "6sense" },
];

/** Course completions — shown separately from formal certifications. */
export const courseCertificates = [
  { name: "Claude 101", issuer: "Anthropic Academy", kind: "Course certificate" },
  { name: "Claude Code 101", issuer: "Anthropic Academy", kind: "Course certificate" },
  { name: "Claude Code in Action", issuer: "Anthropic Academy", kind: "Course certificate" },
];

export const awards = [
  {
    name: "Light of the Youth",
    issuer: "Sustainable and Renewable Energy Authority of Bangladesh",
  },
];

export const education = [
  { qualification: "BSS, Political Science", institution: "National University", year: "2023" },
  { qualification: "HSC, Science", institution: "BAF Shaheen College, Jashore", year: "2018" },
  { qualification: "SSC, Science", institution: "MSTP Girls School, Jashore", year: "2016" },
];

export const languages = [
  { name: "Bangla", level: "Fluent" },
  { name: "English", level: "Fluent", note: "IELTS 8.0" },
  { name: "Hindi", level: "Fluent" },
];

export const volunteering: {
  title: string;
  role?: string;
  organization: string;
  start: string;
  end: string;
  description: string;
}[] = [
  {
    title: "5th National Power & Energy Camp",
    role: "Patrol Leader",
    organization: "Ministry of Power, Energy & Mineral Resources; Bangladesh Scouts",
    start: "2016-11",
    end: "2016-12",
    description:
      "Learned about power, energy and mineral resources and alternative ways to generate power, and helped build social awareness around them.",
  },
  {
    title: "Bikiron's Campus Ambassador",
    organization: "SREDA Bangladesh (Sustainable and Renewable Energy Development Authority)",
    start: "2021-09",
    end: "2021-10",
    description:
      "Learned how sustainable and renewable energy is produced and took part in a country-wide awareness campaign.",
  },
  {
    title: "Youth Against Corruption",
    organization: "UNDP & Bangladesh Debate Federation",
    start: "2021-11",
    end: "2021-12",
    description:
      "Took part in a country-wide programme building awareness among young people about corruption and a corruption-free Bangladesh.",
  },
];

/** Tools as described in the CV's "Tools & platforms in practice" section. */
export const toolsInPractice = [
  { name: "Salesforce", use: "Core CRM administration: users, security, objects, Flow automation, reports and dashboards." },
  { name: "HubSpot", use: "Marketing platform data kept aligned with Salesforce records and lead flow." },
  { name: "Gong", use: "Conversation intelligence used to bring call insights alongside CRM activity." },
  { name: "6sense", use: "Account intelligence and intent data. Certified 6sense Administrator." },
  { name: "Tableau", use: "Visual analytics that turn CRM data into clear, shareable dashboards." },
  { name: "Agentforce", use: "Salesforce's AI agent platform: exploring AI-assisted automation for routine tasks and questions, grounded in trusted CRM data." },
  { name: "Claude AI", use: "AI assistant for documentation, analysis and faster admin workflows." },
  { name: "Visual Studio Code", use: "Code editor used with Salesforce extensions for org metadata." },
];
