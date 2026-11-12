import { NextResponse } from "next/server";
import {
  getDbExperience,
  getDbExpertise,
  getDbProfile,
  getPublishedDbProjects,
} from "@/lib/db/repository";
import { resolveSiteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

export async function GET() {
  const [profile, projects, expertise, experience] = await Promise.all([
    getDbProfile(),
    getPublishedDbProjects(),
    getDbExpertise(),
    getDbExperience(),
  ]);

  const siteUrl = await resolveSiteUrl(profile.siteMeta?.url);
  const certs = (experience.certifications || []).map((c: any) => `- ${c.name} (${c.issuer})`).join("\n");
  const areas = (expertise.areas || []).map((a: any) => `- ${a.title}: ${a.summary}`).join("\n");
  const projectLines = projects
    .map((p) => `- [${p.title}](${siteUrl}/portfolio/${p.slug}): ${p.summary}`)
    .join("\n");

  const markdown = `# ${profile.name}

> ${profile.jobTitle} at ${profile.employer} (${profile.location.city}, ${profile.location.country}).
> Portfolio, technical case studies, and CRM operations documentation.

## Key Pages
- [Home](${siteUrl}/)
- [Portfolio](${siteUrl}/portfolio)
- [Expertise](${siteUrl}/expertise)
- [Experience](${siteUrl}/experience)
- [About](${siteUrl}/about)
- [Contact](${siteUrl}/contact)

## Core Expertise
${areas}

## Credentials
${certs || "- Salesforce Certified Administrator"}

## Published Case Studies
${projectLines}

## Contact
- Email: ${profile.email}
- LinkedIn: ${profile.linkedin.url}
`;

  return new NextResponse(markdown, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
