import fs from "node:fs";
import path from "node:path";
import GithubSlugger from "github-slugger";
import { toString } from "mdast-util-to-string";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";

export const DOCS_DIR = path.join(process.cwd(), "content", "docs");

export interface DocHeading {
  id: string;
  text: string;
  /** Markdown depth: 2 for "##", 3 for "###". "#" is treated as 2. */
  depth: number;
}

export interface LoadedDoc {
  path: string;
  markdown: string;
  headings: DocHeading[];
  /** Prefix applied to heading IDs so several documents can share a page. */
  idPrefix: string;
}

const IS_PROD = process.env.NODE_ENV === "production";
const docExistsCache = new Map<string, boolean>();
const docContentCache = new Map<string, string>();
const MAX_DOC_CACHE = 100;

export function docExists(relativePath: string): boolean {
  const resolved = path.resolve(DOCS_DIR, relativePath);
  if (!resolved.startsWith(DOCS_DIR + path.sep)) return false;
  if (IS_PROD) {
    const cached = docExistsCache.get(resolved);
    if (cached !== undefined) return cached;
    const exists = fs.existsSync(resolved);
    if (docExistsCache.size > MAX_DOC_CACHE) docExistsCache.clear();
    docExistsCache.set(resolved, exists);
    return exists;
  }
  return fs.existsSync(resolved);
}

export function readDoc(relativePath: string): string {
  const resolved = path.resolve(DOCS_DIR, relativePath);
  if (!resolved.startsWith(DOCS_DIR + path.sep)) {
    throw new Error(`Documentation path escapes content/docs: ${relativePath}`);
  }
  if (IS_PROD) {
    const cached = docContentCache.get(resolved);
    if (cached !== undefined) return cached;
    const content = fs.readFileSync(resolved, "utf8");
    if (docContentCache.size > MAX_DOC_CACHE) docContentCache.clear();
    docContentCache.set(resolved, content);
    return content;
  }
  return fs.readFileSync(resolved, "utf8");
}

interface MdNode {
  type: string;
  depth?: number;
  children?: MdNode[];
}

const mdParser = unified().use(remarkParse).use(remarkGfm);
const headingsCache = new Map<string, DocHeading[]>();

/**
 * Extracts headings with the same slug algorithm as rehype-slug
 * (github-slugger, one slugger per document, every heading counted) so the
 * table of contents always matches the rendered IDs.
 */
export function extractHeadings(markdown: string, idPrefix = ""): DocHeading[] {
  const cacheKey = `${idPrefix}\0${markdown}`;
  const cached = headingsCache.get(cacheKey);
  if (cached) return cached;

  const tree = mdParser.parse(markdown) as MdNode;
  const slugger = new GithubSlugger();
  const headings: DocHeading[] = [];

  const walk = (node: MdNode) => {
    if (node.type === "heading") {
      const text = toString(node, { includeImageAlt: false }).trim();
      const id = idPrefix + slugger.slug(text);
      const depth = Math.max(2, node.depth ?? 2);
      if (depth <= 3) headings.push({ id, text, depth });
      return;
    }
    node.children?.forEach(walk);
  };
  walk(tree);

  if (headingsCache.size > 100) headingsCache.clear();
  headingsCache.set(cacheKey, headings);
  return headings;
}

export function loadDoc(relativePath: string, idPrefix = ""): LoadedDoc {
  const markdown = readDoc(relativePath);
  return { path: relativePath, markdown, headings: extractHeadings(markdown, idPrefix), idPrefix };
}
