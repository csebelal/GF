# Design System Master File

> **Source of Truth:** Token values below match `app/globals.css` (`@theme`) and govern both the Public Portfolio Website and Admin CMS.

**Project:** Afrin Akter Chishti — Portfolio & Admin CMS  
**Stack:** Next.js 16 (App Router), Tailwind CSS v4, `next/font/google` (`Inter`)  

---

## 1. Color Palette & Design Tokens

### Surfaces & Neutrals
| Role | Hex | CSS Variable | Usage |
|---|---|---|---|
| Canvas | `#faf8f4` | `--color-canvas` | Page background |
| Surface | `#ffffff` | `--color-surface` | Cards, forms, modals, header |
| Tint | `#f3efe8` | `--color-tint` | Alternate section bands, secondary chips |
| Mist | `#edf4f2` | `--color-mist` | Featured walkthrough / subtle teal tint |

### Typography & Contrast (WCAG 2.1 AA+)
| Role | Hex | CSS Variable | Contrast on `#ffffff` / `#faf8f4` |
|---|---|---|---|
| Ink | `#191c20` | `--color-ink` | ~16.8:1 (Headings, primary labels) |
| Ink Soft | `#2c3137` | `--color-ink-soft` | ~12.8:1 (Subheadings, strong body) |
| Body | `#4c535b` | `--color-body` | ~7.6:1 (Body copy, form labels) |
| Muted | `#646b73` | `--color-muted` | ~5.1:1 (Metadata, eyebrow labels, hints) |
| Faint | `#8b9198` | `--color-faint` | Decorative borders/markers only (never body text) |

### Brand Accent & Semantic Feedback
| Role | Hex | CSS Variable | Usage |
|---|---|---|---|
| Accent | `#0e5f5b` | `--color-accent` | Primary actions, links, active borders |
| Accent Strong | `#0a4744` | `--color-accent-strong` | Hover state, high-contrast badge text |
| Accent Soft | `#e1eeec` | `--color-accent-soft` | Active pills, icon badges, subtle glows |
| Accent Line | `#b9d6d2` | `--color-accent-line` | Highlight borders |
| Amber | `#82540a` | `--color-amber` | Draft / sample warning text |
| Amber Soft | `#fbf1df` | `--color-amber-soft` | Draft / sample badge background |
| Success | `#166534` | `--color-success` | Success alert text |
| Success Soft | `#f0fdf4` | `--color-success-soft` | Success alert background |
| Danger | `#991b1b` | `--color-danger` | Error / destructive action text |
| Danger Soft | `#fef2f2` | `--color-danger-soft` | Error alert background |

---

## 2. Typography & Scale
* **Primary Font:** `Inter` via `next/font/google` (`--font-inter` mapped to `--font-sans`).
* **Monospace Font:** System UI monospace stack (`--font-mono`) for code blocks & Markdown editors.
* **Fluid Display Headings:** `clamp(2.5rem, 4.7vw, 4.15rem)` with `-0.04em` tracking and `text-wrap: balance`.
* **Tabular Numerals:** `tabular-nums` on KPI metrics, dates, counts, and step numbers.

---

## 3. Interaction & Accessibility Rules
1. **No Emojis as UI Icons:** Use crisp `24×24` (`1.6` stroke) inline SVG icons from `components/Icons.tsx`.
2. **Focus Indicators:** Visible `:focus-visible` `2px` `--color-accent` ring (`focus-visible:ring-2`). Never suppress focus outlines without replacement.
3. **Stable Hover States:** Use color, border, and shadow transitions (`150ms–300ms`) rather than layout-shifting scale transforms on cards.
4. **Reduced Motion:** Wrap entrance/hover animations in `motion-safe:` and respect `@media (prefers-reduced-motion: reduce)`.
5. **Touch Targets & Labels:** Minimum `40px–44px` interactive height on buttons/links, `cursor-pointer` on all interactive controls, and explicit `<label htmlFor>` / `aria-label` associations on all inputs.
