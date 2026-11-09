import Link from "next/link";
import Markdown, { type Components } from "react-markdown";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "./CodeBlock";
import { isSafeUrl } from "@/lib/security/sanitize";

/**
 * Renders author-supplied Markdown safely.
 *
 * - Plain Markdown + GitHub tables, task lists and strikethrough (remark-gfm).
 * - Raw HTML is never rendered and unsafe URL schemes are stripped by
 *   react-markdown's default URL transform, so untrusted authors cannot inject
 *   scripts. MDX is intentionally not executed.
 * - Heading IDs come from rehype-slug and match the table of contents.
 */

interface DocumentationRendererProps {
  markdown: string;
  /** Prefix for heading IDs when several documents share one page. */
  idPrefix?: string;
  /** Shift heading levels down, e.g. 2 renders "##" as <h4>. */
  headingOffset?: number;
  className?: string;
}

interface HastNode {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

function textOf(node: HastNode | undefined): string {
  if (!node) return "";
  if (node.type === "text") return node.value ?? "";
  return (node.children ?? []).map(textOf).join("");
}

function isExternal(href: string) {
  return /^https?:\/\//i.test(href);
}

export function DocumentationRenderer({
  markdown,
  idPrefix = "",
  headingOffset = 0,
  className = "",
}: DocumentationRendererProps) {
  const heading =
    (markdownLevel: number) =>
    ({ id, children }: { id?: string; children?: React.ReactNode }) => {
      const visualLevel = Math.min(4, Math.max(2, markdownLevel));
      const level = Math.min(6, Math.max(2, markdownLevel) + headingOffset);
      const Tag = `h${level}` as "h2";
      return (
        <Tag id={id} className={`md-h${visualLevel}`}>
          {children}
          {id ? (
            <a href={`#${id}`} className="heading-anchor" aria-hidden="true" tabIndex={-1}>
              #
            </a>
          ) : null}
        </Tag>
      );
    };

  const components: Components = {
    h1: heading(1),
    h2: heading(2),
    h3: heading(3),
    h4: heading(4),
    h5: heading(5),
    h6: heading(6),
    a: ({ href = "", children }) => {
      if (href.startsWith("/") && !href.startsWith("//")) return <Link href={href}>{children}</Link>;
      if (isExternal(href)) {
        return (
          <a href={href} target="_blank" rel="noopener noreferrer">
            {children}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        );
      }
      if (href.startsWith("#") || href.toLowerCase().startsWith("mailto:")) {
        return <a href={href}>{children}</a>;
      }
      // Block unsafe schemes (e.g. javascript:, data:, vbscript:)
      return <span>{children}</span>;
    },
    p: ({ node, children }) => {
      const only = (node as HastNode | undefined)?.children;
      if (only?.length === 1 && only[0].type === "element" && only[0].tagName === "img") return <>{children}</>;
      return <p>{children}</p>;
    },
    img: ({ src, alt, title }) => {
      if (
        typeof src !== "string" ||
        !src ||
        (!src.startsWith("/") && !/^https?:\/\//i.test(src) && !src.startsWith("data:image/"))
      ) {
        return null;
      }
      return (
        <figure>
          <a href={src} target="_blank" rel="noopener noreferrer" className="block" aria-label={`Open full-size image: ${alt ?? "image"} (new tab)`}>
            <img src={src} alt={alt ?? ""} loading="lazy" decoding="async" />
          </a>
          {title ? <figcaption>{title}</figcaption> : null}
        </figure>
      );
    },
    table: ({ children }) => (
      <div className="table-wrap" role="region" aria-label="Scrollable table" tabIndex={0}>
        <table>{children}</table>
      </div>
    ),
    pre: ({ node }) => {
      const codeNode = (node as HastNode | undefined)?.children?.find((child) => child.tagName === "code");
      const classes = (codeNode?.properties?.className as string[] | undefined) ?? [];
      const language = classes.find((name) => name.startsWith("language-"))?.replace("language-", "");
      const code = textOf(codeNode).replace(/\n$/, "");
      return <CodeBlock code={code} language={language} />;
    },
  };

  return (
    <div className={`prose-doc ${className}`}>
      <Markdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeSlug, { prefix: idPrefix }]]}
        components={components}
      >
        {markdown}
      </Markdown>
    </div>
  );
}
