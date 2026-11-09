# Replace before launch

## Sample content (placeholders)

All of the following are clearly labelled on the site as samples, but they should be replaced with Afrin's own work.

| Item | Location | Notes |
| --- | --- | --- |
| 6 published sample projects + 1 draft | `content/projects/sample-projects.ts` | Lead routing Flow, HubSpot sync playbook, duplicate cleanup (2 videos), pipeline dashboard, Agentforce use-case short, admin backlog prioritization; draft: discount approval. They exist to show every page variant. Turn them off with `SHOW_SAMPLE_PROJECTS = false`. |
| Sample documentation and transcripts | `content/docs/samples/` | Written in a neutral, instructional voice. They do not describe work Afrin has done. |
| Sample YouTube links | `sample-projects.ts` | All point to Google's public IFrame API demo video (`M7lc1UVf-VE`) so the player can be tested. |
| Illustrative diagrams and posters | `public/images/samples/*.svg` | Labelled "Illustrative diagram" / "Sample video poster". |
| Sample CSV attachment | `public/files/samples/routing-matrix-sample.csv` | |
| Featured walkthrough | `content/site.ts` → `homeSettings.featuredWalkthrough` | Currently points to the `lead-routing-flow` sample. |

## Missing assets to supply

- **Real project walkthroughs** (YouTube links) and **screenshots**. Remove client names, personal data and confidential configuration before publishing.
- **Project write-ups** in `content/docs/projects/`. Include only results that can be backed up.
- **Production domain.** Set `NEXT_PUBLIC_SITE_URL` so canonical URLs, social cards and the sitemap are correct.

## Decisions for Afrin

1. **The bundled CV PDF shows personal details publicly.** The supplied CV includes a phone number, a full home address, date of birth and marital status. The website itself shows only city and country, but anyone who downloads the PDF will see everything. Consider uploading a web version without those details (same filename, or update `content/site.ts`).
2. **Product-management wording.** The About page and home page describe product management with an AI foundation as an interest she is *exploring*, based on the brief. Afrin should confirm the wording.
3. **"Open to" phrasing.** The contact sections invite conversations about Salesforce administration and CRM operations roles. Adjust if she isn't actively looking.
4. **Volunteering descriptions** (About and Experience) are condensed from the CV. Check them for accuracy.

## Verified from the CV

These were transcribed directly from the CV and need no replacement: name, job titles and dates for all five roles, the January 2025 promotion, responsibilities, Certified 6sense Administrator (formal certification), the three Anthropic Academy course certificates (listed separately as course completions), the Light of the Youth award, education, languages (including IELTS 8.0), tools in practice, email, LinkedIn, and city/country.
