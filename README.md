# Afrin Akter Chishti — Portfolio

A multipage portfolio for Afrin Akter Chishti, Salesforce Administrator. It is built with Next.js 16 (App Router), TypeScript, Tailwind CSS 4 and a sanitized Markdown pipeline. Every route is statically generated.

- **Content guide:** [CONTENT_GUIDE.md](CONTENT_GUIDE.md) covers adding a project, pasting a YouTube link, adding documentation and replacing images or the CV.
- **Before launch:** [REPLACE_BEFORE_LAUNCH.md](REPLACE_BEFORE_LAUNCH.md) lists the sample content and the decisions still open.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Long-form home page: hero, featured projects, introduction, expertise, featured walkthrough, working approach, experience preview, contact |
| `/about` | Afrin's story, collaboration habits, product-management direction, volunteering |
| `/experience` | Employers, exact titles and dates, the Field Nation promotion, certifications vs. courses, education, languages |
| `/expertise` | Eight areas, each with the business problem, practices, tools and matching portfolio projects |
| `/portfolio` | Searchable, filterable project library. Filters are kept in the URL (`?q=&category=&type=`) |
| `/portfolio/[slug]` | Project page: video and/or documentation, table of contents, screenshots, files, previous/next, related projects |
| `/contact` | Email, LinkedIn, location, CV |
| `/sitemap.xml`, `/robots.txt` | Generated from the published projects |
| `/dev/embed-states` | **Development only.** QA page for the video player's edge cases. Returns 404 in production |

## Requirements

- Node.js 20.9 or newer (or Bun 1.2+)
- npm, pnpm or Bun

## Setup

```bash
npm install
```

```bash
npm run dev
```

Open http://localhost:3000.

> This project was built and tested with Bun (`bun install`, `bun run dev`), and a `bun.lock` is included. npm and pnpm work the same way using `package.json`.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server with hot reload. Content warnings are printed to the terminal. |
| `npm run build` | Production build. **Fails if the portfolio content is invalid**: duplicate slugs, missing files, broken YouTube links on published projects, and so on. |
| `npm start` | Serves the production build. |
| `npm run typecheck` | TypeScript check. |
| `bun run validate` | Checks the content and lists errors and warnings, without building. |
| `bun run test` | Unit tests for the YouTube parser, the validator and the content collection (Bun's built-in test runner). |
| `bun run build:standalone` | After `build`: writes `dist/afrin-portfolio-preview.html`, a single offline file of the whole site (see below). |

## Offline single-file preview

`dist/afrin-portfolio-preview.html` is one self-contained file that opens by double-click, with no server or Node install. It holds every published page, the CSS, the Inter font, the images, the CV and the attachments. Navigation uses hash links (for example `#/portfolio/lead-routing-flow`), and small dependency-free scripts (`scripts/standalone-runtime.js`) handle the mobile menu, filters, click-to-load videos, the table of contents, reading progress and copy buttons.

- Use it to review the site or share it as an attachment. **Deploy the Next.js app, not this file.**
- YouTube playback and the remote video thumbnails need an internet connection. Everything else works offline.
- Rebuild it after content changes: `bun run build && bun run build:standalone`.

## Configuration

Set the public URL so canonical links, social cards and the sitemap point at the real domain:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

Without it, these URLs fall back to `http://localhost:3000`.

## Deployment

**Vercel (simplest):** import the repository, keep the default Next.js settings, add `NEXT_PUBLIC_SITE_URL` as an environment variable, and deploy.

**Any Node host:** run `npm run build`, then `npm start` (it listens on port 3000 by default; use `-p` to change it).

**Static hosting (optional, not yet tested):** every page is pre-rendered, so the site should also work as plain HTML. Add `output: "export"` to `next.config.ts` and run `npm run build`, and the site is written to `out/`. Check the 404 page and the social-card images after exporting, because static hosts handle those differently.

## Project structure

```
app/                     Routes, metadata, sitemap, robots, social images
components/              Reusable UI: Header, Footer, ProjectCard, PortfolioFilters, YouTubeEmbed,
                         ProjectMetadata, DocumentationRenderer, TableOfContents, ExperienceTimeline,
                         CVDownload, ReadingProgress, CodeBlock, Badges, Section
content/
  site.ts                Profile, contact details, navigation, home-page settings
  experience.ts          Roles, credentials, education, languages, volunteering (from the CV)
  expertise.ts           Expertise areas and the working-approach steps
  projects/projects.ts   Afrin's real projects (empty, with a template)
  projects/sample-projects.ts   Sample collection (placeholders)
  projects/index.ts      Combines the two; SHOW_SAMPLE_PROJECTS switch
  docs/                  Markdown documentation and transcripts
lib/                     Types, YouTube parsing, validation, project loading, Markdown helpers
public/                  CV PDF, portrait, sample diagrams, downloadable files
tests/                   Bun unit tests
```

## How key features work

- **YouTube:** authors paste any normal link: `watch?v=`, `youtu.be/`, `/shorts/` or `/embed/`. `lib/youtube.ts` checks the hostname and the 11-character ID, then builds a `youtube-nocookie.com` embed itself. The player shows a poster first and only loads YouTube when someone presses play. It falls back from a custom poster to YouTube's thumbnail, then to a generated poster. Invalid links show a clear message instead of a broken frame. No API key is needed.
- **Markdown safety:** documentation is rendered with `react-markdown` and `remark-gfm`. Raw HTML is ignored and unsafe URL schemes are removed. MDX is deliberately not executed, so content from other authors can't run code.
- **Drafts:** projects with `status: "draft"` are left out of listings, search, the sitemap and static routes. Their URLs return 404.
- **Accessibility:** includes a skip link, visible focus styles, and focus that moves to the new page's heading after navigation. The mobile menu has a focus trap and closes with Escape. Filter results are announced, code and table regions can be scrolled with the keyboard, and animation is skipped for visitors who prefer reduced motion.
- **Motion:** sections fade in as they scroll into view. Content stays visible if JavaScript fails: the reveal class removes itself after 2.5 seconds if the script never starts.

## Dependencies

Runtime: `next`, `react`, `react-dom`, `react-markdown`, `remark-gfm`, `rehype-slug`, plus the small `unified`, `remark-parse`, `mdast-util-to-string` and `github-slugger` used to build the table of contents. There is no CMS, analytics or UI kit.

## Adding an editing dashboard later

The current setup needs no CMS: content lives in typed files and Markdown in the repository. A browser-based editor would need real authentication and durable storage (for example a Git-based CMS or a database). It should keep using the sanitized Markdown renderer.
