# Content guide

Every portfolio entry is a typed object in `content/projects/projects.ts`, plus optional Markdown files in `content/docs/`. Layout components never need to change.

After any edit, run `bun run validate` (or `npm run build`). Both list exactly what is wrong and where.

---

## 1. Add a project

1. Open `content/projects/projects.ts`.
2. Copy the commented template into the `projects` array.
3. Fill in the fields below and set `status: "published"` when it's ready.

```ts
{
  slug: "case-escalation-flow",          // URL: /portfolio/case-escalation-flow
  title: "Case escalation Flow for Customer Success",
  summary: "One or two sentences: the problem and what was built.",
  category: "Salesforce Automation",     // categories are generated from projects
  tools: ["Salesforce Flow", "Service Cloud"],
  featured: true,                        // optional: show in featured rows
  status: "published",                   // or "draft" to hide it everywhere
  provenance: "independent",             // "professional" | "independent" | "illustrative"
  role: "Design, build and testing",     // optional
  date: "2026-05",                       // optional, "YYYY" or "YYYY-MM"
  overview: "Optional short overview paragraph. Markdown allowed.",
  coverImage: { src: "/images/projects/case-escalation.png", alt: "Describe the image" },
  videos: [ /* see section 2 */ ],
  documentation: "projects/case-escalation.md",  // optional, see section 3
  screenshots: [
    { src: "/images/projects/escalation-flow.png", alt: "Flow canvas showing…", caption: "Optional caption" },
  ],
  attachments: [{ label: "Test plan (PDF)", url: "/files/projects/escalation-test-plan.pdf", description: "PDF, 120 KB" }],
  externalLinks: [{ label: "Salesforce Help: Flow", url: "https://help.salesforce.com/" }],
}
```

### Rules the validator enforces

- `slug` must be unique and use lowercase letters, numbers and hyphens.
- `title`, `summary` and `category` are required.
- `status` must be `draft` or `published`. `provenance` must be one of the three values.
- A **published** project needs at least one working YouTube video **or** a documentation file.
- Every referenced file (images, Markdown, attachments) must exist.
- URLs must be `https://`, `mailto:` or a path inside `/public`.

### Provenance: keep it honest

| Value | Badge shown | Use for |
| --- | --- | --- |
| `professional` | *(no badge)* + "Professional work" in details | Work done in a job. Remove client names, real data and anything confidential. |
| `independent` | **Independent Demo** | Self-directed exercises, e.g. in a Developer Edition org |
| `illustrative` | **Illustrative** | Concepts and demonstrations, not delivered systems |

Only publish metrics or outcomes you can back up. If you don't have measured results, describe what you *would* measure instead, as the sample docs do.

### Featured projects

- Mark projects with `featured: true`. The first featured project gets the large card on the home and portfolio pages.
- To choose them explicitly, list slugs in `homeSettings.featuredProjectSlugs` in `content/site.ts`.

---

## 2. Paste a YouTube URL

Any of these formats works. Paste the link exactly as YouTube gives it to you:

```
https://www.youtube.com/watch?v=VIDEO_ID
https://youtu.be/VIDEO_ID
https://www.youtube.com/shorts/VIDEO_ID
https://www.youtube.com/embed/VIDEO_ID
```

Timestamps such as `?t=90` or `&t=1m30s` are kept.

```ts
videos: [
  {
    title: "Walkthrough",                       // required
    youtubeUrl: "https://youtu.be/VIDEO_ID",    // required
    description: "One or two sentences shown under the video.",   // optional
    posterImage: "/images/projects/walkthrough-poster.png",       // optional custom thumbnail
    aspectRatio: "9:16",                         // optional, for vertical videos (Shorts default to 9:16)
    documentation: "projects/walkthrough-notes.md",               // optional notes for this video only
    transcript: "projects/walkthrough-transcript.md",             // optional
    showCaptions: true,                          // optional: turn on YouTube captions by default
  },
],
```

- **One video:** it becomes the large player at the top of the project page.
- **Several videos:** each gets its own numbered section with its own description, notes and transcript. Use `coverImage` for the page hero.
- The video must be **public** or **unlisted** on YouTube. Private videos won't play.
- No API key is needed.

---

## 3. Add documentation (optional)

Documentation is optional for every project and every video. When there is none, the documentation area and the table of contents disappear, and the page stays complete.

1. Create a Markdown file, e.g. `content/docs/projects/case-escalation.md`.
2. Reference it as `documentation: "projects/case-escalation.md"` (on the project, on a video, or both).
3. Start sections with `##`. Use `###` for sub-sections. These become the table of contents.

Suggested sections are listed below. Use only the ones that apply, in any order, with your own titles:

> Business problem · Stakeholders · My role and scope · Requirements · Tools and environment · Workflow or architecture · Implementation steps · Key configuration decisions · Testing and edge cases · Results (only with evidence) · Limitations and tradeoffs · Lessons learned · Next improvements

### Supported Markdown

````md
## Section title

Paragraphs, **bold**, *italic*, `inline code`, [links](https://example.com), lists.

| Column | Column |
| --- | --- |
| Tables | scroll on small screens |

```sql
SELECT Id FROM Lead
```

![Alt text describing the image](/images/projects/flow.png "This text becomes the caption")
````

- Code blocks get a language label and a **Copy code** button. Name the language after the opening fence (`sql`, `text`, `json`, `csv` …).
- Images become captioned figures. The quoted title is the caption.
- Raw HTML is ignored for safety. MDX components are not supported.

### Transcripts

A transcript is a plain Markdown or `.txt` file. It appears in a collapsible **Transcript** panel under its video. Timestamps such as `**[01:15]**` work well.

---

## 4. Replace a thumbnail or image

1. Put the image in `public/images/projects/` (PNG, JPG, WebP or SVG). Around 1600×1000 works well for covers.
2. Point `coverImage.src`, `posterImage` or a screenshot `src` at it, e.g. `/images/projects/my-cover.png`.
3. Always write `alt` text that describes what the image shows.

How covers are chosen on cards: `coverImage` first, then the first video's `posterImage`, then YouTube's thumbnail, then a designed placeholder.

### Portrait

The portrait used across the site comes from the CV. To replace it, overwrite these files and keep the names, or update the paths in `content/site.ts`:

- `public/images/profile/afrin-chishti-portrait.webp` and `.jpg` (600×719)
- `public/images/profile/afrin-chishti-portrait-400.webp` (smaller version)
- `public/images/profile/afrin-chishti-avatar.webp` (square, used in the header)

---

## 5. Update the CV

1. Replace `public/cv/Afrin-Akter-Chishti-Salesforce-Administrator-CV.pdf`, keeping the same name. Or change `profile.cv.href` and `downloadName` in `content/site.ts`.
2. Update `profile.cv.sizeLabel` (for example `"PDF, 640 KB"`).
3. If roles, dates or credentials changed, update `content/experience.ts`. The Experience page, the home-page timeline and parts of About read from it.

---

## 6. Remove the sample projects

When real projects are in place:

1. Open `content/projects/index.ts` and set `SHOW_SAMPLE_PROJECTS = false`.
2. Optionally delete `content/projects/sample-projects.ts` (and its import), `content/docs/samples/`, `public/images/samples/` and `public/files/samples/`.
3. Point `homeSettings.featuredWalkthrough` in `content/site.ts` at one of Afrin's projects with a video.

The "Sample" notices in the footer and portfolio header disappear automatically.

---

## 7. Other text

| What | Where |
| --- | --- |
| Name, title, email, LinkedIn, location | `content/site.ts` → `profile` |
| Navigation | `content/site.ts` → `primaryNav` |
| Expertise areas and working approach | `content/expertise.ts` |
| Roles, certifications, education, languages, volunteering | `content/experience.ts` |
| Home, About and Contact copy | `app/page.tsx`, `app/about/page.tsx`, `app/contact/page.tsx` |
