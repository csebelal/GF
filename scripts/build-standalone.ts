/**
 * Builds a single, self-contained HTML preview of the whole site:
 *   dist/afrin-portfolio-preview.html
 *
 * It opens by double-click with no server or Node install (YouTube playback and
 * remote thumbnails still need an internet connection).
 *
 * Usage (after a production build):
 *   bun run build && bun run build:standalone
 *
 * How it works: every prerendered page in .next/server/app becomes an inert
 * <template>. Internal links are rewritten to hash routes (#/portfolio), assets
 * are stored once as base64 and turned into blob URLs at runtime, the compiled
 * CSS and the Inter font are inlined, and scripts/standalone-runtime.js
 * provides the interactions without React.
 */
import fs from "node:fs";
import path from "node:path";
import { getPublishedProjects } from "@/lib/projects";
import { site } from "@/content/site";

const root = process.cwd();
const appDir = path.join(root, ".next", "server", "app");
const publicDir = path.join(root, "public");
const outDir = path.join(root, "dist");
const outFile = path.join(outDir, "afrin-portfolio-preview.html");

if (!fs.existsSync(path.join(appDir, "index.html"))) {
  console.error("No production build found. Run `bun run build` first.");
  process.exit(1);
}

// ------------------------------------------------------------------ routes
const published = getPublishedProjects();
const routeFiles: [string, string][] = [
  ["/", "index.html"],
  ["/portfolio", "portfolio.html"],
  ["/expertise", "expertise.html"],
  ["/experience", "experience.html"],
  ["/about", "about.html"],
  ["/contact", "contact.html"],
  ...published.map((p): [string, string] => [`/portfolio/${p.slug}`, `portfolio/${p.slug}.html`]),
  ["404", "_not-found.html"],
];

const MIME: Record<string, string> = {
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".pdf": "application/pdf",
  ".csv": "text/csv",
  ".txt": "text/plain",
  ".woff2": "font/woff2",
};

const assets = new Map<string, { type: string; data: string }>();
function registerAsset(publicPath: string): boolean {
  const clean = decodeURIComponent(publicPath.split(/[?#]/)[0]);
  if (assets.has(clean)) return true;
  const file = path.join(publicDir, clean);
  if (!file.startsWith(publicDir) || !fs.existsSync(file)) {
    console.warn(`  ⚠ asset not found: ${publicPath}`);
    return false;
  }
  const type = MIME[path.extname(file).toLowerCase()] ?? "application/octet-stream";
  assets.set(clean, { type, data: fs.readFileSync(file).toString("base64") });
  return true;
}

const ASSET_PREFIX = /^\/(images|cv|files)\//;

function transformBody(html: string): string {
  let body = html.slice(html.indexOf("<body"));
  body = body.slice(body.indexOf(">") + 1, body.lastIndexOf("</body>"));
  body = body
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<div hidden="">\s*<!--\$-->\s*<!--\/\$-->\s*<\/div>/g, "")
    .replace(/<!--\/?\$?-->|<!-- -->/g, "")
    .replace(/<link\b[^>]*>/gi, "");

  // Asset references → asset:/path (resolved to blob URLs at runtime).
  body = body.replace(/\b(src|href)="(\/[^"]*)"/gi, (match, attr: string, url: string) => {
    if (ASSET_PREFIX.test(url)) return registerAsset(url) ? `${attr}="asset:${url}"` : match;
    if (attr.toLowerCase() === "href" && !url.startsWith("/_next/")) {
      const [p, frag] = url.split("#");
      return `href="#${p}${frag ? `@${frag}` : ""}"`;
    }
    return match;
  });
  body = body.replace(/\bsrcset="([^"]+)"/gi, (_m, value: string) => {
    const next = value.replace(/(\/(?:images|cv|files)\/[^\s,]+)/g, (url) => (registerAsset(url) ? `asset:${url}` : url));
    return `srcset="${next}"`;
  });
  return body;
}

function titleOf(html: string): string {
  const match = /<title>([^<]*)<\/title>/.exec(html);
  return match ? match[1] : site.titleSuffix;
}

const templates: string[] = [];
let htmlClass = "";
for (const [route, file] of routeFiles) {
  const full = path.join(appDir, file);
  if (!fs.existsSync(full)) {
    console.warn(`  ⚠ missing prerendered page for ${route}: ${file}`);
    continue;
  }
  const html = fs.readFileSync(full, "utf8");
  if (!htmlClass) htmlClass = /<html[^>]*class="([^"]*)"/.exec(html)?.[1] ?? "";
  templates.push(
    `<template data-route="${route}" data-title="${titleOf(html).replace(/"/g, "&quot;")}">${transformBody(html)}</template>`,
  );
}

// ------------------------------------------------------------------ CSS + font
const indexHtml = fs.readFileSync(path.join(appDir, "index.html"), "utf8");
const cssHrefs = [...indexHtml.matchAll(/<link rel="stylesheet" href="([^"]+\.css)"/g)].map((m) => m[1]);
let css = cssHrefs
  .map((href) => fs.readFileSync(path.join(root, ".next", href.replace(/^\/_next\//, "")), "utf8"))
  .join("\n");

// Keep only the Latin Inter subset (the site's copy is English) and inline it.
css = css.replace(/@font-face\{[^}]*\}/g, (face) => {
  if (!/font-family:Inter[;}]/.test(face) && !/font-family:Inter;/.test(face)) return face; // fallback faces
  if (!/unicode-range:U\+\?\?,/.test(face)) return "";
  return face.replace(/url\(([^)]+\.woff2)\)/, (_m, rel: string) => {
    const file = path.join(root, ".next", "static", "media", path.basename(rel));
    return `url(data:font/woff2;base64,${fs.readFileSync(file).toString("base64")})`;
  });
});

const extraCss = `
[hidden]{display:none!important}
.standalone-lightbox{position:fixed;inset:0;z-index:100;display:none;align-items:center;justify-content:center;flex-direction:column;gap:1rem;padding:1.5rem;background:rgb(25 28 32/.82)}
.standalone-lightbox.open{display:flex}
.standalone-lightbox img{max-width:min(1200px,100%);max-height:85vh;border-radius:12px;background:#fff}
.standalone-lightbox button{align-self:flex-end}
`;

// ------------------------------------------------------------------ data
const projectData = published.map((p) => ({
  slug: p.slug,
  title: p.title,
  summary: p.summary,
  category: p.category,
  tools: p.tools,
  contentType: p.contentType,
}));

const runtime = fs.readFileSync(path.join(root, "scripts", "standalone-runtime.js"), "utf8");
const icon = fs.readFileSync(path.join(root, "app", "icon.svg"), "utf8").trim();
const description = /<meta name="description" content="([^"]*)"/.exec(indexHtml)?.[1] ?? site.description;
const json = (value: unknown) => JSON.stringify(value).replace(/</g, "\\u003c");

const document = `<!DOCTYPE html>
<html lang="en" class="${htmlClass}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#faf8f4">
<meta name="color-scheme" content="light">
<meta name="description" content="${description}">
<title>${site.titleSuffix}</title>
<link rel="icon" href="data:image/svg+xml;base64,${Buffer.from(icon).toString("base64")}">
<!-- Offline preview generated from the Next.js production build by scripts/build-standalone.ts. -->
<style>${css}${extraCss}</style>
</head>
<body class="flex min-h-screen flex-col">
<div id="app" style="display:contents"></div>
${templates.join("\n")}
<script type="application/json" id="asset-data">${json(Object.fromEntries(assets))}</script>
<script type="application/json" id="project-data">${json(projectData)}</script>
<script>${runtime}</script>
</body>
</html>
`;

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, document);
const kb = (fs.statSync(outFile).size / 1024).toFixed(0);
console.log(`Wrote ${path.relative(root, outFile)} (${kb} KB): ${templates.length} pages, ${assets.size} assets.`);
