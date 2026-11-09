import type { SVGProps } from "react";

/** Small inline line-icon set (24×24, 1.6 stroke). Decorative by default. */

type IconProps = SVGProps<SVGSVGElement> & { title?: string };

function Base({ title, children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="1em"
      height="1em"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
      focusable="false"
      {...props}
    >
      {title ? <title>{title}</title> : null}
      {children}
    </svg>
  );
}

export const ArrowRight = (p: IconProps) => (
  <Base {...p}><path d="M5 12h14M13 6l6 6-6 6" /></Base>
);
export const ArrowLeft = (p: IconProps) => (
  <Base {...p}><path d="M19 12H5M11 6l-6 6 6 6" /></Base>
);
export const ArrowUpRight = (p: IconProps) => (
  <Base {...p}><path d="M7 17 17 7M8 7h9v9" /></Base>
);
export const Download = (p: IconProps) => (
  <Base {...p}><path d="M12 4v11M7 10l5 5 5-5M5 20h14" /></Base>
);
export const Mail = (p: IconProps) => (
  <Base {...p}><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="m4 7 8 6 8-6" /></Base>
);
export const LinkedIn = (p: IconProps) => (
  <Base {...p}><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7" /></Base>
);
export const MapPin = (p: IconProps) => (
  <Base {...p}><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z" /><circle cx="12" cy="9.5" r="2.5" /></Base>
);
export const Play = (p: IconProps) => (
  <Base {...p} fill="currentColor" stroke="none"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" /></Base>
);
export const Menu = (p: IconProps) => (
  <Base {...p}><path d="M4 7h16M4 12h16M4 17h16" /></Base>
);
export const Close = (p: IconProps) => (
  <Base {...p}><path d="M6 6l12 12M18 6 6 18" /></Base>
);
export const Search = (p: IconProps) => (
  <Base {...p}><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></Base>
);
export const Check = (p: IconProps) => (
  <Base {...p}><path d="m5 12.5 4.5 4.5L19 7.5" /></Base>
);
export const Copy = (p: IconProps) => (
  <Base {...p}><rect x="8" y="8" width="12" height="12" rx="2.5" /><path d="M16 8V6.5A2.5 2.5 0 0 0 13.5 4h-7A2.5 2.5 0 0 0 4 6.5v7A2.5 2.5 0 0 0 6.5 16H8" /></Base>
);
export const FileText = (p: IconProps) => (
  <Base {...p}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8Z" /><path d="M14 3v5h5M9 13h6M9 17h6" /></Base>
);
export const LinkIcon = (p: IconProps) => (
  <Base {...p}><path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1" /><path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1" /></Base>
);
export const Award = (p: IconProps) => (
  <Base {...p}><circle cx="12" cy="9" r="5.5" /><path d="m8.5 13.5-1.5 7 5-2.5 5 2.5-1.5-7" /></Base>
);
export const Book = (p: IconProps) => (
  <Base {...p}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5Z" /><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5" /></Base>
);
export const Video = (p: IconProps) => (
  <Base {...p}><rect x="3" y="6" width="13" height="12" rx="2.5" /><path d="m16 10.5 5-3v9l-5-3" /></Base>
);
export const Globe = (p: IconProps) => (
  <Base {...p}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></Base>
);
export const Alert = (p: IconProps) => (
  <Base {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5.5M12 16.5v.01" /></Base>
);
export const Info = (p: IconProps) => (
  <Base {...p}><circle cx="12" cy="12" r="9" /><path d="M12 11v5.5M12 7.5v.01" /></Base>
);
export const TrendingUp = (p: IconProps) => (
  <Base {...p}><path d="m3 17 6-6 4 4 8-8M15 7h6v6" /></Base>
);
export const Caption = (p: IconProps) => (
  <Base {...p}><rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="M10 10.5a2 2 0 1 0 0 3M16 10.5a2 2 0 1 0 0 3" /></Base>
);

/* Expertise icons --------------------------------------------------------- */
export const IconAutomation = (p: IconProps) => (
  <Base {...p}><rect x="3" y="3.5" width="7" height="5" rx="1.5" /><rect x="14" y="15.5" width="7" height="5" rx="1.5" /><path d="M6.5 8.5v4a2 2 0 0 0 2 2h9v1" /><path d="m15.5 12.5 2 2-2 2" /></Base>
);
export const IconData = (p: IconProps) => (
  <Base {...p}><ellipse cx="12" cy="5.5" rx="7" ry="2.5" /><path d="M5 5.5v6c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-6" /><path d="M5 11.5v6c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-6" /></Base>
);
export const IconIntegrations = (p: IconProps) => (
  <Base {...p}><circle cx="5.5" cy="12" r="2.5" /><circle cx="18.5" cy="5.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /><path d="m7.8 10.9 8.4-4.2M7.8 13.1l8.4 4.2" /></Base>
);
export const IconAccess = (p: IconProps) => (
  <Base {...p}><path d="M12 3 5 6v5.5c0 4.4 3 8 7 9.5 4-1.5 7-5.1 7-9.5V6Z" /><path d="m9 12 2 2 4-4" /></Base>
);
export const IconReporting = (p: IconProps) => (
  <Base {...p}><path d="M4 20V4M4 20h16" /><rect x="7.5" y="12" width="3" height="5" rx="0.8" /><rect x="12.5" y="8" width="3" height="9" rx="0.8" /><rect x="17.5" y="5" width="3" height="12" rx="0.8" /></Base>
);
export const IconAdoption = (p: IconProps) => (
  <Base {...p}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0" /><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.3a6.5 6.5 0 0 1 3.5 5.7" /></Base>
);
export const IconRelease = (p: IconProps) => (
  <Base {...p}><path d="M12 3 4 7.5v9L12 21l8-4.5v-9Z" /><path d="m4 7.5 8 4.5 8-4.5M12 12v9" /></Base>
);
export const IconAI = (p: IconProps) => (
  <Base {...p}><path d="M10 4.5 11.6 9l4.4 1.6-4.4 1.6L10 16.7l-1.6-4.5L4 10.6 8.4 9Z" /><path d="M17.5 14.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8Z" /></Base>
);

export const expertiseIcons = {
  automation: IconAutomation,
  data: IconData,
  integrations: IconIntegrations,
  access: IconAccess,
  reporting: IconReporting,
  adoption: IconAdoption,
  release: IconRelease,
  ai: IconAI,
} as const;
