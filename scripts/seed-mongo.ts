import fs from "node:fs";
import path from "node:path";
import { config } from "dotenv";
config({ path: ".env.local" });

import { connectDB } from "../lib/db/connection";
import { AdminModel } from "../lib/db/models/Admin";
import { SiteProfileModel } from "../lib/db/models/SiteProfile";
import { ProjectModel } from "../lib/db/models/Project";
import { ExperienceModel } from "../lib/db/models/Experience";
import { ExpertiseModel } from "../lib/db/models/Expertise";
import { hashPassword } from "../lib/auth/session";

import { profile, site, homeSettings } from "../content/site";
import { sampleProjects } from "../content/projects/sample-projects";
import { projects as realProjects } from "../content/projects/projects";
import {
  employers,
  certifications,
  courseCertificates,
  awards,
  education,
  volunteering,
  languages,
  toolsInPractice,
} from "../content/experience";
import { expertiseAreas, workingApproach } from "../content/expertise";

const DOCS_DIR = path.join(process.cwd(), "content", "docs");

function readDocSafe(relPath: string | undefined): string | undefined {
  if (!relPath) return undefined;
  const full = path.join(DOCS_DIR, relPath);
  if (fs.existsSync(full)) {
    return fs.readFileSync(full, "utf8");
  }
  return undefined;
}

const defaultPrinciples = [
  {
    title: "Ask who the change is for",
    body: "A request usually arrives as a solution — “add a field”, “make it required”. I ask who will use it, when and why, because the answer often changes what should be built.",
  },
  {
    title: "Write it down",
    body: "Every release gets a short note for the people it affects, and recurring fixes go into a guide. Documentation is what lets a change outlast the conversation that started it.",
  },
  {
    title: "Train in the user’s language",
    body: "Guides and walkthroughs describe the task a person is trying to finish, not the Salesforce feature behind it. That habit comes straight from my years in support and training.",
  },
  {
    title: "Fix the cause, not the ticket",
    body: "A sync error or a confusing layout that comes back twice is a process problem. I keep a log of recurring issues so they can be solved at the source.",
  },
];

const defaultChapters = [
  {
    id: "beginnings",
    label: "Where I started",
    title: "Learning what a system feels like from the other side",
    body: [
      "I started my career on the frontline: handling customer accounts at Chaldal.com, moving into QA and training at Sheba Platform, and leading customer service at Biztech Solutions.",
      "Those years taught me that behind every data entry error or missing picklist value is a person trying to finish their workday. That user empathy became my foundation when I moved into Salesforce administration.",
    ],
  },
  {
    id: "salesforce",
    label: "Moving into Salesforce",
    title: "From handling requests to owning the platform",
    body: [
      "I joined Field Nation in April 2022 as a Junior Salesforce Administrator. Day to day, that meant user and access requests, debugging record-triggered and screen Flows, careful Data Loader work, and tracking down sync failures between Salesforce, HubSpot, Gong and 6sense. I documented fixes, wrote user guides and kept a log of recurring problems.",
      "That work led to a promotion to Salesforce Administrator in January 2025. I now own day-to-day administration of Sales Cloud and Service Cloud: the security model, automation, configuration, release management, reporting and data governance, along with the connected go-to-market stack. I also work with Agentforce on AI-assisted workflows grounded in CRM data.",
    ],
  },
  {
    id: "people",
    label: "How I work with people",
    title: "Most Salesforce work is a conversation first",
    body: [
      "I partner with Sales, Marketing and Customer Success leaders to turn business needs into practical improvements. The technical part is often the smaller part. Understanding how a team actually works, what slows them down and what they would rather not change takes more time — and saves more of it later.",
      "Training is part of every change. I write guides and walkthroughs, communicate releases to the people they affect, and follow up after launch. My background in QA and team training makes that feel like a core part of the job rather than an extra step.",
    ],
  },
  {
    id: "next",
    label: "What I’m exploring next",
    title: "Product management, built on an AI foundation",
    body: [
      "Admin work already involves a lot of product thinking: gathering requirements, prioritizing a backlog, deciding what not to build and rolling changes out to real users. I’m exploring a move toward product management, and I’m developing the skills for it deliberately rather than claiming them early.",
      "Alongside my admin role, I’ve completed Anthropic Academy courses (Claude 101, Claude Code 101 and Claude Code in Action) and use Claude AI for documentation, requirement summaries and analysis. Product-thinking exercises in my portfolio are labelled as independent or illustrative work, so it’s always clear what is practice and what is production.",
    ],
  },
];

const defaultHelpful = [
  "The role or project, and the team it supports",
  "Which Salesforce clouds and connected tools are involved",
  "Your timeline and preferred way to talk",
];

async function runSeed() {
  console.log("Connecting to MongoDB...");
  await connectDB();
  console.log("Connected successfully.");

  // 1. Seed Admin
  const adminEmail = (process.env.DEFAULT_ADMIN_EMAIL || "admin@portfolio.local").toLowerCase();
  const adminPass = process.env.DEFAULT_ADMIN_PASSWORD || "AdminPassword123!";
  const existingAdmin = await AdminModel.findOne({ email: adminEmail });
  if (!existingAdmin) {
    const passwordHash = await hashPassword(adminPass);
    await AdminModel.create({
      email: adminEmail,
      passwordHash,
      name: "Afrin Admin",
      role: "admin",
      tokenVersion: 0,
    });
    console.log(`✓ Admin user created: ${adminEmail}`);
  } else {
    console.log(`ℹ Admin user already exists: ${adminEmail}`);
  }

  // 2. Seed / Update SiteProfile
  const profileDoc = await SiteProfileModel.findOne({});
  const profilePayload = {
    name: profile.name,
    shortName: profile.shortName,
    jobTitle: profile.jobTitle,
    employer: profile.employer,
    location: {
      city: profile.location.city,
      country: profile.location.country,
    },
    email: profile.email,
    linkedin: {
      url: profile.linkedin.url,
      label: profile.linkedin.label,
    },
    portrait: {
      src: profile.portrait.src,
      fallback: profile.portrait.fallback,
      small: profile.portrait.small,
      avatar: profile.portrait.avatar,
      width: profile.portrait.width,
      height: profile.portrait.height,
      alt: profile.portrait.alt,
    },
    cv: {
      href: profile.cv.href,
      downloadName: profile.cv.downloadName,
      sizeLabel: profile.cv.sizeLabel,
    },
    siteMeta: {
      titleSuffix: site.titleSuffix,
      description: site.description,
      url: site.url,
    },
    homeSettings: {
      featuredProjectSlugs: homeSettings.featuredProjectSlugs as unknown as string[],
      featuredWalkthrough: homeSettings.featuredWalkthrough,
    },
    hero: {
      badgeDot: true,
      badgeText: "Salesforce Administrator at Field Nation",
      headlineMain: "Salesforce that sales, marketing and support teams",
      headlineMuted: "can rely on.",
      description:
        "I’m Afrin Akter Chishti. I look after Sales Cloud and Service Cloud at Field Nation — the automation, access rules, data standards and connected tools like HubSpot, Gong and 6sense that go-to-market teams work from.",
      primaryButtonText: "Explore portfolio",
      primaryButtonUrl: "/portfolio",
      showCvButton: true,
      highlights: [
        { icon: "location", text: "Dhaka, Bangladesh" },
        { icon: "award", text: "Certified 6sense Administrator" },
        { icon: "check", text: "Working in Salesforce since 2022" },
      ],
      languagesCard: {
        show: true,
        label: "Languages",
        text: "Bangla · English · Hindi",
      },
      careerStepCard: {
        show: true,
        label: "Career step",
        text: "Promoted to Salesforce Administrator, January 2025",
      },
      techStack: {
        label: "Works across",
        items: [
          "Sales Cloud",
          "Service Cloud",
          "Flow",
          "Data Loader",
          "HubSpot",
          "Gong",
          "6sense",
          "Tableau",
          "Agentforce",
        ],
      },
    },
    homeIntro: {
      eyebrow: "How I got here",
      headline: "From the support desk to the admin console.",
      stats: [
        { label: "Joined Field Nation", value: "2022" },
        { label: "Promoted", value: "2025" },
        { label: "Languages", value: "3" },
      ],
      paragraphs: [
        "My career started on the customer side of the system. At Chaldal.com I resolved complaints, processed account adjustments and kept customer records accurate. At Sheba Platform I designed quality standards and trained the people who applied them. At Biztech Solutions I managed a customer service team — hiring, coaching and reporting on service performance to management.",
        "In April 2022 I joined Field Nation as a Junior Salesforce Administrator. The work felt like a natural next step: access requests, Flow debugging, bulk data operations and sync issues between Salesforce and the tools around it. In January 2025 I was promoted to Salesforce Administrator, and I now own the org’s day-to-day administration, automation and release process.",
        "That background still shapes how I build. I start from the person who will use the screen, document every change for the people it affects, and keep a log of recurring questions so they can be fixed at the source.",
      ],
    },
    aboutStory: {
      introHeadline:
        "I came to Salesforce from the support desk, and I still build for the person filing the ticket.",
      introParagraph:
        "I’m a Salesforce Administrator at Field Nation, based in Dhaka, Bangladesh. Before Salesforce I worked in customer service, quality assurance and team training — experience that still shapes how I gather requirements, test changes and help people adopt them.",
      chapters: defaultChapters,
      principles: defaultPrinciples,
    },
    contactSettings: {
      eyebrow: "Contact",
      headline: "Let’s talk about your Salesforce team.",
      intro:
        "I’m glad to hear from recruiters and hiring managers about Salesforce administration and CRM operations roles, and from anyone interested in product work where CRM data and AI meet.",
      helpfulHeading: "Helpful to include",
      helpful: defaultHelpful,
      emailCard: {
        badge: "Email",
        customEmail: "",
        writeButtonText: "Write an email",
        showWriteButton: true,
        copyButtonText: "Copy address",
        showCopyButton: true,
      },
      linkedinCard: {
        show: true,
        label: "LinkedIn",
        displayText: "Connect on LinkedIn",
        customText: "",
        customUrl: "",
      },
      locationCard: {
        show: true,
        label: "Location",
        customText: "",
      },
      cvCard: {
        show: true,
        label: "CV",
        subtext: "Curriculum Vitae",
        customSizeLabel: "",
        buttonLabel: "Download CV",
      },
      bottomBanner: {
        show: true,
        boldPrefix: "Not sure yet?",
        text: "The portfolio and experience pages show how I work and what I’ve done.",
        primaryButton: {
          show: true,
          label: "Portfolio",
          url: "/portfolio",
        },
        secondaryButton: {
          show: true,
          label: "Experience",
          url: "/experience",
        },
      },
    },
    headerSettings: {
      showAvatar: true,
      brandTitle: "",
      brandSubtitle: "",
      navItems: [
        { label: "Home", href: "/" },
        { label: "Portfolio", href: "/portfolio" },
        { label: "Expertise", href: "/expertise" },
        { label: "About", href: "/about" },
        { label: "Contact", href: "/contact" },
      ],
      highlightLink: {
        show: true,
        label: "Experience",
        href: "/experience",
      },
      showCvButton: true,
      cvButtonLabel: "Download CV",
      mobileEmailButtonLabel: "Email Afrin",
    },
    footerSettings: {
      bioSummary:
        "Salesforce Administrator at Field Nation. Automation, CRM data quality, access management and the connected tools around Sales Cloud and Service Cloud.",
      showEmailButton: true,
      emailButtonLabel: "",
      showCvButton: true,
      cvButtonLabel: "Download CV",
      pageLinksTitle: "Pages",
      pageLinks: [
        { label: "Home", href: "/" },
        { label: "Portfolio", href: "/portfolio" },
        { label: "Expertise", href: "/expertise" },
        { label: "Experience", href: "/experience" },
        { label: "About", href: "/about" },
        { label: "Contact", href: "/contact" },
      ],
      connectTitle: "Connect",
      showLocation: true,
      locationLabel: "",
      socialLinks: [
        { platform: "email", label: "Email", url: "mailto:chishtiafrin@gmail.com", show: true },
        {
          platform: "linkedin",
          label: "LinkedIn",
          url: "https://www.linkedin.com/in/afrin-chishti-2661961b8",
          show: true,
        },
      ],
      copyrightText: "© {year} {name}",
      showBottomNotice: true,
      bottomNotice: "Projects marked “Sample” are placeholder content that shows how the portfolio works.",
    },
  };

  if (!profileDoc) {
    await SiteProfileModel.create(profilePayload);
    console.log("✓ SiteProfile seeded with full bio & story chapters.");
  } else {
    await SiteProfileModel.findByIdAndUpdate(profileDoc._id, {
      $set: {
        contactSettings: profilePayload.contactSettings,
      },
    });
    console.log("✓ SiteProfile updated with full contact settings (cards, checklist, banner).");
  }

  // 3. Seed Projects
  const allInitialProjects = [...realProjects, ...sampleProjects];
  const currentProjectCount = await ProjectModel.countDocuments();
  if (currentProjectCount === 0) {
    for (let i = 0; i < allInitialProjects.length; i++) {
      const p = allInitialProjects[i];
      const docContent = readDocSafe(p.documentation);
      const videosWithDocs = (p.videos || []).map((v) => ({
        ...v,
        documentationContent: readDocSafe(v.documentation),
        transcriptContent: readDocSafe(v.transcript),
      }));

      await ProjectModel.create({
        slug: p.slug,
        title: p.title,
        summary: p.summary,
        category: p.category,
        tools: p.tools,
        featured: Boolean(p.featured),
        status: p.status,
        provenance: p.provenance,
        role: p.role,
        date: p.date,
        coverImage: p.coverImage,
        overview: p.overview,
        videos: videosWithDocs,
        documentation: p.documentation,
        documentationContent: docContent,
        screenshots: p.screenshots || [],
        attachments: p.attachments || [],
        externalLinks: p.externalLinks || [],
        sortOrder: i,
      });
    }
    console.log(`✓ Seeded ${allInitialProjects.length} projects.`);
  } else {
    console.log(`ℹ Projects collection already has ${currentProjectCount} items, skipping.`);
  }

  // 4. Seed Experience
  const expCount = await ExperienceModel.countDocuments();
  if (expCount === 0) {
    await ExperienceModel.create({
      employers,
      certifications,
      courseCertificates,
      awards,
      education,
      volunteering,
      languages,
      toolsInPractice,
    });
    console.log("✓ Experience data seeded.");
  } else {
    console.log("ℹ Experience data already exists, skipping.");
  }

  // 5. Seed Expertise
  const expertiseCount = await ExpertiseModel.countDocuments();
  if (expertiseCount === 0) {
    await ExpertiseModel.create({
      areas: expertiseAreas,
      workingApproach,
    });
    console.log("✓ Expertise data seeded.");
  } else {
    console.log("ℹ Expertise data already exists, skipping.");
  }

  // Create public/uploads if it doesn't exist
  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log("✓ Created public/uploads directory.");
  }

  console.log("\n=================================");
  console.log("CMS Database seed & migration completed!");
  console.log(`Admin Login Email: ${adminEmail}`);
  console.log("Admin Login Password: [Configured via DEFAULT_ADMIN_PASSWORD in .env.local]");
  console.log("=================================\n");
  process.exit(0);
}

runSeed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
