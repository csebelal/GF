import mongoose, { Schema, type Model } from "mongoose";

export interface IAboutChapter {
  id: string;
  label: string;
  title: string;
  body: string[];
}

export interface IAboutPrinciple {
  title: string;
  body: string;
}

export interface IHeroHighlight {
  icon: "location" | "award" | "check";
  text: string;
}

export interface IHeroSettings {
  badgeDot: boolean;
  badgeText: string;
  headlineMain: string;
  headlineMuted: string;
  description: string;
  primaryButtonText: string;
  primaryButtonUrl: string;
  showCvButton: boolean;
  highlights: IHeroHighlight[];
  languagesCard: {
    show: boolean;
    label: string;
    text: string;
  };
  careerStepCard: {
    show: boolean;
    label: string;
    text: string;
  };
  techStack: {
    label: string;
    items: string[];
  };
}

export interface IHomeIntroStat {
  label: string;
  value: string;
}

export interface IHomeIntroSettings {
  eyebrow: string;
  headline: string;
  stats: IHomeIntroStat[];
  paragraphs: string[];
}

export interface INavItem {
  label: string;
  href: string;
}

export interface IHeaderSettings {
  showAvatar?: boolean;
  brandTitle?: string;
  brandSubtitle?: string;
  navItems: INavItem[];
  highlightLink?: {
    show: boolean;
    label: string;
    href: string;
  };
  showCvButton?: boolean;
  cvButtonLabel?: string;
  mobileEmailButtonLabel?: string;
}

export interface IFooterLink {
  label: string;
  href: string;
}

export interface IFooterSocialLink {
  platform: string;
  label: string;
  url: string;
  show: boolean;
}

export interface IFooterSettings {
  bioSummary: string;
  showEmailButton: boolean;
  emailButtonLabel?: string;
  showCvButton: boolean;
  cvButtonLabel: string;
  pageLinksTitle: string;
  pageLinks: IFooterLink[];
  connectTitle: string;
  showLocation: boolean;
  locationLabel?: string;
  socialLinks: IFooterSocialLink[];
  copyrightText: string;
  showBottomNotice: boolean;
  bottomNotice: string;
}

export interface IContactCardEmail {
  badge: string;
  customEmail?: string;
  writeButtonText: string;
  showWriteButton: boolean;
  copyButtonText: string;
  showCopyButton: boolean;
}

export interface IContactCardLinkedIn {
  show: boolean;
  label: string;
  displayText?: string;
  customText?: string;
  customUrl?: string;
}

export interface IContactCardLocation {
  show: boolean;
  label: string;
  customText?: string;
}

export interface IContactCardCV {
  show: boolean;
  label: string;
  subtext?: string;
  customSizeLabel?: string;
  buttonLabel: string;
}

export interface IContactBottomBanner {
  show: boolean;
  boldPrefix: string;
  text: string;
  primaryButton: {
    show: boolean;
    label: string;
    url: string;
  };
  secondaryButton: {
    show: boolean;
    label: string;
    url: string;
  };
}

export interface IContactSettings {
  eyebrow?: string;
  headline?: string;
  intro?: string;
  helpfulHeading?: string;
  helpful: string[];
  emailCard?: IContactCardEmail;
  linkedinCard?: IContactCardLinkedIn;
  locationCard?: IContactCardLocation;
  cvCard?: IContactCardCV;
  bottomBanner?: IContactBottomBanner;
}

export interface ISiteProfile {
  name: string;
  shortName: string;
  jobTitle: string;
  employer: string;
  location: {
    city: string;
    country: string;
  };
  email: string;
  linkedin: {
    url: string;
    label: string;
  };
  portrait: {
    src: string;
    fallback: string;
    small: string;
    avatar: string;
    width: number;
    height: number;
    alt: string;
  };
  cv: {
    href: string;
    downloadName: string;
    sizeLabel: string;
  };
  siteMeta: {
    titleSuffix: string;
    description: string;
    url: string;
    googleAnalyticsId?: string;
  };
  homeSettings: {
    featuredProjectSlugs: string[];
    featuredWalkthrough: {
      slug: string;
      videoIndex: number;
    };
  };
  hero?: IHeroSettings;
  homeIntro?: IHomeIntroSettings;
  headerSettings?: IHeaderSettings;
  footerSettings?: IFooterSettings;
  aboutStory: {
    introHeadline?: string;
    introParagraph?: string;
    chapters: IAboutChapter[];
    principles: IAboutPrinciple[];
  };
  contactSettings: IContactSettings;
}

const SiteProfileSchema = new Schema<ISiteProfile>(
  {
    name: { type: String, required: true },
    shortName: { type: String, required: true },
    jobTitle: { type: String, required: true },
    employer: { type: String, required: true },
    location: {
      city: { type: String, required: true },
      country: { type: String, required: true },
    },
    email: { type: String, required: true },
    linkedin: {
      url: { type: String, required: true },
      label: { type: String, required: true },
    },
    portrait: {
      src: { type: String, required: true },
      fallback: { type: String, default: "" },
      small: { type: String, default: "" },
      avatar: { type: String, default: "" },
      width: { type: Number, default: 600 },
      height: { type: Number, default: 719 },
      alt: { type: String, default: "" },
    },
    cv: {
      href: { type: String, required: true },
      downloadName: { type: String, required: true },
      sizeLabel: { type: String, default: "PDF" },
    },
    siteMeta: {
      titleSuffix: { type: String, default: "Afrin Akter Chishti — Salesforce Administrator" },
      description: { type: String, default: "" },
      url: { type: String, default: "" },
      googleAnalyticsId: { type: String, default: "" },
    },
    homeSettings: {
      featuredProjectSlugs: { type: [String], default: [] },
      featuredWalkthrough: {
        slug: { type: String, default: "lead-routing-flow" },
        videoIndex: { type: Number, default: 0 },
      },
    },
    hero: {
      badgeDot: { type: Boolean, default: true },
      badgeText: { type: String, default: "Salesforce Administrator at Field Nation" },
      headlineMain: { type: String, default: "Salesforce that sales, marketing and support teams" },
      headlineMuted: { type: String, default: "can rely on." },
      description: {
        type: String,
        default:
          "I’m Afrin Akter Chishti. I look after Sales Cloud and Service Cloud at Field Nation — the automation, access rules, data standards and connected tools like HubSpot, Gong and 6sense that go-to-market teams work from.",
      },
      primaryButtonText: { type: String, default: "Explore portfolio" },
      primaryButtonUrl: { type: String, default: "/portfolio" },
      showCvButton: { type: Boolean, default: true },
      highlights: [
        {
          _id: false,
          icon: { type: String, default: "location" },
          text: { type: String, default: "" },
        },
      ],
      languagesCard: {
        show: { type: Boolean, default: true },
        label: { type: String, default: "Languages" },
        text: { type: String, default: "Bangla · English · Hindi" },
      },
      careerStepCard: {
        show: { type: Boolean, default: true },
        label: { type: String, default: "Career step" },
        text: { type: String, default: "Promoted to Salesforce Administrator, January 2025" },
      },
      techStack: {
        label: { type: String, default: "Works across" },
        items: {
          type: [String],
          default: [
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
    },
    homeIntro: {
      eyebrow: { type: String, default: "How I got here" },
      headline: { type: String, default: "From the support desk to the admin console." },
      stats: [
        {
          _id: false,
          label: { type: String, default: "" },
          value: { type: String, default: "" },
        },
      ],
      paragraphs: {
        type: [String],
        default: [
          "My career started on the customer side of the system. At Chaldal.com I resolved complaints, processed account adjustments and kept customer records accurate. At Sheba Platform I designed quality standards and trained the people who applied them. At Biztech Solutions I managed a customer service team — hiring, coaching and reporting on service performance to management.",
          "In April 2022 I joined Field Nation as a Junior Salesforce Administrator. The work felt like a natural next step: access requests, Flow debugging, bulk data operations and sync issues between Salesforce and the tools around it. In January 2025 I was promoted to Salesforce Administrator, and I now own the org’s day-to-day administration, automation and release process.",
          "That background still shapes how I build. I start from the person who will use the screen, document every change for the people it affects, and keep a log of recurring questions so they can be fixed at the source.",
        ],
      },
    },
    aboutStory: {
      introHeadline: {
        type: String,
        default:
          "I came to Salesforce from the support desk, and I still build for the person filing the ticket.",
      },
      introParagraph: {
        type: String,
        default:
          "I’m a Salesforce Administrator at Field Nation, based in Dhaka, Bangladesh. Before Salesforce I worked in customer service, quality assurance and team training — experience that still shapes how I gather requirements, test changes and help people adopt them.",
      },
      chapters: [
        {
          _id: false,
          id: String,
          label: String,
          title: String,
          body: [String],
        },
      ],
      principles: [
        {
          _id: false,
          title: String,
          body: String,
        },
      ],
    },
    contactSettings: {
      eyebrow: { type: String, default: "Contact" },
      headline: {
        type: String,
        default: "Let’s talk about your Salesforce team.",
      },
      intro: {
        type: String,
        default:
          "I’m glad to hear from recruiters and hiring managers about Salesforce administration and CRM operations roles, and from anyone interested in product work where CRM data and AI meet.",
      },
      helpfulHeading: { type: String, default: "Helpful to include" },
      helpful: {
        type: [String],
        default: [
          "The role or project, and the team it supports",
          "Which Salesforce clouds and connected tools are involved",
          "Your timeline and preferred way to talk",
        ],
      },
      emailCard: {
        badge: { type: String, default: "Email" },
        customEmail: { type: String, default: "" },
        writeButtonText: { type: String, default: "Write an email" },
        showWriteButton: { type: Boolean, default: true },
        copyButtonText: { type: String, default: "Copy address" },
        showCopyButton: { type: Boolean, default: true },
      },
      linkedinCard: {
        show: { type: Boolean, default: true },
        label: { type: String, default: "LinkedIn" },
        displayText: { type: String, default: "Connect on LinkedIn" },
        customText: { type: String, default: "" },
        customUrl: { type: String, default: "" },
      },
      locationCard: {
        show: { type: Boolean, default: true },
        label: { type: String, default: "Location" },
        customText: { type: String, default: "" },
      },
      cvCard: {
        show: { type: Boolean, default: true },
        label: { type: String, default: "CV" },
        subtext: { type: String, default: "Curriculum Vitae" },
        customSizeLabel: { type: String, default: "" },
        buttonLabel: { type: String, default: "Download CV" },
      },
      bottomBanner: {
        show: { type: Boolean, default: true },
        boldPrefix: { type: String, default: "Not sure yet?" },
        text: {
          type: String,
          default: "The portfolio and experience pages show how I work and what I’ve done.",
        },
        primaryButton: {
          show: { type: Boolean, default: true },
          label: { type: String, default: "Portfolio" },
          url: { type: String, default: "/portfolio" },
        },
        secondaryButton: {
          show: { type: Boolean, default: true },
          label: { type: String, default: "Experience" },
          url: { type: String, default: "/experience" },
        },
      },
    },
    headerSettings: {
      showAvatar: { type: Boolean, default: true },
      brandTitle: { type: String, default: "" },
      brandSubtitle: { type: String, default: "" },
      navItems: [
        {
          _id: false,
          label: { type: String, required: true },
          href: { type: String, required: true },
        },
      ],
      highlightLink: {
        show: { type: Boolean, default: true },
        label: { type: String, default: "Experience" },
        href: { type: String, default: "/experience" },
      },
      showCvButton: { type: Boolean, default: true },
      cvButtonLabel: { type: String, default: "Download CV" },
      mobileEmailButtonLabel: { type: String, default: "" },
    },
    footerSettings: {
      bioSummary: {
        type: String,
        default:
          "Salesforce Administrator at Field Nation. Automation, CRM data quality, access management and the connected tools around Sales Cloud and Service Cloud.",
      },
      showEmailButton: { type: Boolean, default: true },
      emailButtonLabel: { type: String, default: "" },
      showCvButton: { type: Boolean, default: true },
      cvButtonLabel: { type: String, default: "Download CV" },
      pageLinksTitle: { type: String, default: "Pages" },
      pageLinks: [
        {
          _id: false,
          label: { type: String, required: true },
          href: { type: String, required: true },
        },
      ],
      connectTitle: { type: String, default: "Connect" },
      showLocation: { type: Boolean, default: true },
      locationLabel: { type: String, default: "" },
      socialLinks: [
        {
          _id: false,
          platform: { type: String, default: "email" },
          label: { type: String, default: "" },
          url: { type: String, default: "" },
          show: { type: Boolean, default: true },
        },
      ],
      copyrightText: { type: String, default: "© {year} {name}" },
      showBottomNotice: { type: Boolean, default: true },
      bottomNotice: {
        type: String,
        default: "Projects marked “Sample” are placeholder content that shows how the portfolio works.",
      },
    },
  },
  { timestamps: true }
);

export const SiteProfileModel: Model<ISiteProfile> =
  mongoose.models.SiteProfile || mongoose.model<ISiteProfile>("SiteProfile", SiteProfileSchema);
