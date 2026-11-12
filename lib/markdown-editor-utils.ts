/**
 * Pure, browser-safe helpers for the admin Markdown documentation editor.
 */

export interface TextEditResult {
  nextValue: string;
  nextStart: number;
  nextEnd: number;
}

export interface OutlineHeading {
  level: 2 | 3;
  text: string;
  line: number;
  offset: number;
}

export interface DocTemplate {
  id: string;
  label: string;
  description: string;
  content: string;
}

export const DOC_TEMPLATES: DocTemplate[] = [
  {
    id: "case-study",
    label: "Full Case Study Outline",
    description: "Problem, architecture, config choices, testing & lessons",
    content: [
      "## Business problem",
      "",
      "Describe the team pain point, what was manual or error-prone, and who requested the change.",
      "",
      "## Solution architecture",
      "",
      "Summarize the Flow, object model, or integration pattern chosen and why simpler alternatives were ruled out.",
      "",
      "### Key configuration choices",
      "",
      "- **Trigger / entry criteria**: Explain when the automation runs",
      "- **Guardrails**: Explain null checks, permission sets, or fallback queues",
      "",
      "## Testing & verification",
      "",
      "- [ ] Tested positive path with sample records in Sandbox",
      "- [ ] Verified edge cases (missing fields, inactive owners)",
      "- [ ] Confirmed reporting / audit fields match expectations",
      "",
      "## Limitations and tradeoffs",
      "",
      "- Note any manual maintenance or assumptions stakeholders should know.",
      "",
      "## Lessons learned",
      "",
      "Summarize the main takeaway from gathering requirements, testing, and rollout.",
    ].join("\n"),
  },
  {
    id: "routing-table",
    label: "Decision / Routing Matrix Table",
    description: "Structured 4-column comparison or routing table",
    content: [
      "| Condition / Segment | Criteria | Assigned Queue / Action | Notes |",
      "| --- | --- | --- | --- |",
      "| Enterprise | Employee count >= 500 | Enterprise AE Queue | Notify Slack channel |",
      "| Mid-Market | Employee count 50–499 | Regional SDR Round-Robin | 24h SLA |",
      "| Fallback | Missing country or size | Ops Triage Queue | Logged for review |",
    ].join("\n"),
  },
  {
    id: "testing-checklist",
    label: "Testing & Verification Checklist",
    description: "Sandbox test scenarios and edge-case checks",
    content: [
      "## Testing & verification",
      "",
      "1. **Happy path**: Verify expected owner, status, and notifications update cleanly.",
      "2. **Missing data**: Confirm fallback behavior when optional fields are blank.",
      "3. **Bulk load**: Test with 200 records via Data Loader to verify governor limits.",
      "4. **Permissions**: Validate standard user profile and permission set access.",
    ].join("\n"),
  },
  {
    id: "callout-note",
    label: "Admin Callout / Note",
    description: "Highlighted blockquote tip or tradeoff warning",
    content: [
      "> **Admin note:** Always test record-triggered Flow updates with a non-admin user profile in Sandbox before deploying to production.",
    ].join("\n"),
  },
];

/**
 * Wraps or unwraps the selected text with `prefix` and `suffix`.
 */
export function toggleInlineWrap(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  prefix: string,
  suffix: string = prefix,
  placeholder: string = "text"
): TextEditResult {
  const start = Math.max(0, Math.min(selectionStart, value.length));
  const end = Math.max(start, Math.min(selectionEnd, value.length));
  const selected = value.slice(start, end);

  // Unwrap if the surrounding characters already match prefix/suffix
  if (
    start >= prefix.length &&
    value.slice(start - prefix.length, start) === prefix &&
    value.slice(end, end + suffix.length) === suffix
  ) {
    const nextValue =
      value.slice(0, start - prefix.length) + selected + value.slice(end + suffix.length);
    return {
      nextValue,
      nextStart: start - prefix.length,
      nextEnd: end - prefix.length,
    };
  }

  // Unwrap if the selection itself includes prefix and suffix
  if (
    selected.length >= prefix.length + suffix.length &&
    selected.startsWith(prefix) &&
    selected.endsWith(suffix)
  ) {
    const inner = selected.slice(prefix.length, selected.length - suffix.length);
    const nextValue = value.slice(0, start) + inner + value.slice(end);
    return {
      nextValue,
      nextStart: start,
      nextEnd: start + inner.length,
    };
  }

  const content = selected || placeholder;
  const nextValue = value.slice(0, start) + prefix + content + suffix + value.slice(end);
  return {
    nextValue,
    nextStart: start + prefix.length,
    nextEnd: start + prefix.length + content.length,
  };
}

/**
 * Adds or removes a line-level Markdown prefix (e.g. `## `, `- `, `> `, `1. `)
 * across all lines intersected by the current selection.
 */
export function toggleLinePrefix(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  prefix: string,
  placeholder: string = "Heading"
): TextEditResult {
  const start = Math.max(0, Math.min(selectionStart, value.length));
  const end = Math.max(start, Math.min(selectionEnd, value.length));

  const lineStart = value.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
  const rawLineEnd = value.indexOf("\n", end);
  const lineEnd = rawLineEnd === -1 ? value.length : rawLineEnd;

  const block = value.slice(lineStart, lineEnd);
  const lines = block.split("\n");

  const isNumbered = prefix === "1. ";
  const headingMatch = /^(#{1,6}\s+)/;

  const allHavePrefix = lines.every((line) =>
    isNumbered ? /^\d+\.\s+/.test(line) : line.startsWith(prefix)
  );

  const updatedLines = lines.map((line, index) => {
    if (allHavePrefix) {
      return isNumbered ? line.replace(/^\d+\.\s+/, "") : line.slice(prefix.length);
    }

    // When switching heading levels (e.g. H2 -> H3), replace existing heading prefix cleanly
    if (headingMatch.test(prefix)) {
      const stripped = line.replace(headingMatch, "");
      return `${prefix}${stripped || (lines.length === 1 ? placeholder : "")}`;
    }

    const linePrefix = isNumbered ? `${index + 1}. ` : prefix;
    if (!line.trim() && lines.length === 1) {
      return `${linePrefix}${placeholder}`;
    }
    return `${linePrefix}${line}`;
  });

  const replacement = updatedLines.join("\n");
  const nextValue = value.slice(0, lineStart) + replacement + value.slice(lineEnd);

  // If a placeholder was inserted into an empty single line, select the placeholder text
  if (!allHavePrefix && lines.length === 1 && !lines[0].replace(headingMatch, "").trim()) {
    const appliedPrefix = isNumbered ? "1. " : prefix;
    return {
      nextValue,
      nextStart: lineStart + appliedPrefix.length,
      nextEnd: lineStart + replacement.length,
    };
  }

  return {
    nextValue,
    nextStart: lineStart,
    nextEnd: lineStart + replacement.length,
  };
}

/**
 * Inserts a block snippet cleanly on its own blank-line-separated block.
 */
export function insertBlockSnippet(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  snippet: string
): TextEditResult {
  const start = Math.max(0, Math.min(selectionStart, value.length));
  const end = Math.max(start, Math.min(selectionEnd, value.length));

  const before = value.slice(0, start);
  const after = value.slice(end);

  const leadingBreak = before.length === 0 ? "" : before.endsWith("\n\n") ? "" : before.endsWith("\n") ? "\n" : "\n\n";
  const trailingBreak = after.length === 0 ? "" : after.startsWith("\n\n") ? "" : after.startsWith("\n") ? "\n" : "\n\n";

  const inserted = `${leadingBreak}${snippet}${trailingBreak}`;
  const nextValue = before + inserted + after;
  const cursorStart = before.length + leadingBreak.length;
  const cursorEnd = cursorStart + snippet.length;

  return { nextValue, nextStart: cursorStart, nextEnd: cursorEnd };
}

/**
 * Handles `Enter` inside bullet lists, numbered lists, checklists, or blockquotes.
 * Returns null if normal Enter behavior should proceed.
 */
export function handleSmartEnter(
  value: string,
  selectionStart: number,
  selectionEnd: number
): TextEditResult | null {
  if (selectionStart !== selectionEnd) return null;

  const lineStart = value.lastIndexOf("\n", Math.max(0, selectionStart - 1)) + 1;
  const currentLineBeforeCursor = value.slice(lineStart, selectionStart);
  const nextNewline = value.indexOf("\n", selectionStart);
  const fullCurrentLine = value.slice(lineStart, nextNewline === -1 ? value.length : nextNewline);

  // Match checklist, unordered list, ordered list, or blockquote with optional leading spaces
  const match = currentLineBeforeCursor.match(/^(\s*)((?:-\s\[[ xX]\]|[-*+]|(\d+)\.|>)\s+)(.*)$/);
  if (!match) return null;

  const indent = match[1];
  const fullPrefix = match[2];
  const orderedNum = match[3] ? Number(match[3]) : null;
  const contentBeforeCursor = match[4];

  // If the entire line only contains the prefix (user pressed Enter on empty list item), exit list
  const fullContentAfterPrefix = fullCurrentLine.slice(indent.length + fullPrefix.length);
  if (!contentBeforeCursor.trim() && !fullContentAfterPrefix.trim()) {
    const lineEnd = nextNewline === -1 ? value.length : nextNewline;
    const nextValue = value.slice(0, lineStart) + value.slice(lineEnd);
    return {
      nextValue,
      nextStart: lineStart,
      nextEnd: lineStart,
    };
  }

  let nextPrefix = fullPrefix;
  if (orderedNum !== null) {
    nextPrefix = `${orderedNum + 1}. `;
  } else if (/^-\s\[[xX]\]\s+/.test(fullPrefix)) {
    nextPrefix = "- [ ] ";
  }

  const insertion = `\n${indent}${nextPrefix}`;
  const nextValue = value.slice(0, selectionStart) + insertion + value.slice(selectionEnd);
  const nextCursor = selectionStart + insertion.length;

  return {
    nextValue,
    nextStart: nextCursor,
    nextEnd: nextCursor,
  };
}

/**
 * Indents or outdents selected lines by 2 spaces when pressing Tab / Shift+Tab.
 */
export function handleListTab(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  outdent: boolean
): TextEditResult {
  const start = Math.max(0, Math.min(selectionStart, value.length));
  const end = Math.max(start, Math.min(selectionEnd, value.length));

  const lineStart = value.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
  const rawLineEnd = value.indexOf("\n", end);
  const lineEnd = rawLineEnd === -1 ? value.length : rawLineEnd;

  const block = value.slice(lineStart, lineEnd);
  const lines = block.split("\n");

  let firstLineDelta = 0;
  let totalDelta = 0;

  const updatedLines = lines.map((line, idx) => {
    if (outdent) {
      if (line.startsWith("  ")) {
        if (idx === 0) firstLineDelta = -2;
        totalDelta -= 2;
        return line.slice(2);
      }
      if (line.startsWith("\t") || line.startsWith(" ")) {
        if (idx === 0) firstLineDelta = -1;
        totalDelta -= 1;
        return line.slice(1);
      }
      return line;
    }
    if (idx === 0) firstLineDelta = 2;
    totalDelta += 2;
    return `  ${line}`;
  });

  const nextValue = value.slice(0, lineStart) + updatedLines.join("\n") + value.slice(lineEnd);
  const nextStart = Math.max(lineStart, start + firstLineDelta);
  const nextEnd = Math.max(nextStart, end + totalDelta);

  return { nextValue, nextStart, nextEnd };
}

/**
 * Builds a clean GFM Markdown table of `cols` columns by `rows` data rows.
 */
export function buildMarkdownTable(cols: number, rows: number): string {
  const safeCols = Math.max(1, Math.min(8, Math.floor(cols)));
  const safeRows = Math.max(1, Math.min(12, Math.floor(rows)));

  const headers = Array.from({ length: safeCols }, (_, i) => `Column ${i + 1}`);
  const divider = Array.from({ length: safeCols }, () => "---");
  const headerLine = `| ${headers.join(" | ")} |`;
  const dividerLine = `| ${divider.join(" | ")} |`;

  const bodyLines = Array.from({ length: safeRows }, (_, r) => {
    const cells = Array.from({ length: safeCols }, (_, c) => `Cell ${r + 1}.${c + 1}`);
    return `| ${cells.join(" | ")} |`;
  });

  return [headerLine, dividerLine, ...bodyLines].join("\n");
}

/**
 * Extracts `##` and `###` headings outside fenced code blocks for the live TOC preview.
 */
export function extractHeadingOutline(markdown: string): OutlineHeading[] {
  if (!markdown) return [];
  const lines = markdown.split(/\r?\n/);
  const headings: OutlineHeading[] = [];
  let inFence = false;
  let offset = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*```/.test(line)) {
      inFence = !inFence;
    } else if (!inFence) {
      const match = line.match(/^(#{2,3})\s+(.+?)\s*#*\s*$/);
      if (match) {
        headings.push({
          level: match[1].length as 2 | 3,
          text: match[2].trim(),
          line: i + 1,
          offset,
        });
      }
    }
    offset += line.length + 1;
  }

  return headings;
}

/**
 * Computes word count, estimated reading time, and heading count.
 */
export function getMarkdownStats(markdown: string): {
  words: number;
  readingMinutes: number;
  headingsCount: number;
} {
  const trimmed = markdown.trim();
  const words = trimmed ? trimmed.split(/\s+/).length : 0;
  const readingMinutes = words === 0 ? 0 : Math.max(1, Math.ceil(words / 200));
  const headingsCount = extractHeadingOutline(markdown).length;
  return { words, readingMinutes, headingsCount };
}
