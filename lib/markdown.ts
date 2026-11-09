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

export function docExists(relativePath: string): boolean {
  const resolved = path.resolve(DOCS_DIR, relativePath);
  return resolved.startsWith(DOCS_DIR + path.sep) && fs.existsSync(resolved);
}

export function readDoc(relativePath: string): string {
  const resolved = path.resolve(DOCS_DIR, relativePath);
  if (!resolved.startsWith(DOCS_DIR + path.sep)) {
    throw new Error(`Documentation path escapes content/docs: ${relativePath}`);
  }
  return fs.readFileSync(resolved, "utf8");
}

interface MdNode {
  type: string;
  depth?: number;
  children?: MdNode[];
}

/**
 * Extracts headings with the same slug algorithm as rehype-slug
 * (github-slugger, one slugger per document, every heading counted) so the
 * table of contents always matches the rendered IDs.
 */
export function extractHeadings(markdown: string, idPrefix = ""): DocHeading[] {
  const tree = unified().use(remarkParse).use(remarkGfm).parse(markdown) as MdNode;
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
  return headings;
}

export function loadDoc(relativePath: string, idPrefix = ""): LoadedDoc {
  const markdown = readDoc(relativePath);
  return { path: relativePath, markdown, headings: extractHeadings(markdown, idPrefix), idPrefix };
}
