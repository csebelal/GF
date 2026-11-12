import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildMarkdownTable,
  extractHeadingOutline,
  getMarkdownStats,
  handleListTab,
  handleSmartEnter,
  insertBlockSnippet,
  toggleInlineWrap,
  toggleLinePrefix,
} from "@/lib/markdown-editor-utils";

describe("markdown-editor-utils", () => {
  it("toggleInlineWrap wraps selection and unwraps when already wrapped", () => {
    const wrapped = toggleInlineWrap("hello world", 6, 11, "**", "**", "bold");
    assert.equal(wrapped.nextValue, "hello **world**");
    assert.equal(wrapped.nextStart, 8);
    assert.equal(wrapped.nextEnd, 13);

    const unwrapped = toggleInlineWrap(wrapped.nextValue, wrapped.nextStart, wrapped.nextEnd, "**", "**", "bold");
    assert.equal(unwrapped.nextValue, "hello world");
    assert.equal(unwrapped.nextStart, 6);
    assert.equal(unwrapped.nextEnd, 11);
  });

  it("toggleLinePrefix snaps to line start, switches heading levels, and toggles off", () => {
    const h2 = toggleLinePrefix("Intro paragraph\nRouting rules", 20, 20, "## ", "Section");
    assert.equal(h2.nextValue, "Intro paragraph\n## Routing rules");

    const h3 = toggleLinePrefix(h2.nextValue, 20, 20, "### ", "Section");
    assert.equal(h3.nextValue, "Intro paragraph\n### Routing rules");

    const plain = toggleLinePrefix(h3.nextValue, 20, 20, "### ", "Section");
    assert.equal(plain.nextValue, "Intro paragraph\nRouting rules");
  });

  it("toggleLinePrefix numbers multi-line selections and removes numbering cleanly", () => {
    const list = toggleLinePrefix("First\nSecond", 0, 12, "1. ", "Item");
    assert.equal(list.nextValue, "1. First\n2. Second");

    const cleared = toggleLinePrefix(list.nextValue, 0, list.nextValue.length, "1. ", "Item");
    assert.equal(cleared.nextValue, "First\nSecond");
  });

  it("handleSmartEnter continues bullet, numbered, and checklist items, and exits on empty item", () => {
    const bullet = handleSmartEnter("- First step", 12, 12);
    assert.equal(bullet?.nextValue, "- First step\n- ");

    const numbered = handleSmartEnter("2. Second step", 14, 14);
    assert.equal(numbered?.nextValue, "2. Second step\n3. ");

    const checklist = handleSmartEnter("- [x] Done check", 16, 16);
    assert.equal(checklist?.nextValue, "- [x] Done check\n- [ ] ");

    const exitList = handleSmartEnter("- First\n- ", 10, 10);
    assert.equal(exitList?.nextValue, "- First\n");
  });

  it("handleListTab indents and outdents lines", () => {
    const indented = handleListTab("- One\n- Two", 0, 11, false);
    assert.equal(indented.nextValue, "  - One\n  - Two");

    const outdented = handleListTab(indented.nextValue, 0, indented.nextValue.length, true);
    assert.equal(outdented.nextValue, "- One\n- Two");
  });

  it("buildMarkdownTable creates valid GFM table syntax", () => {
    const table = buildMarkdownTable(3, 2);
    assert.equal(
      table,
      [
        "| Column 1 | Column 2 | Column 3 |",
        "| --- | --- | --- |",
        "| Cell 1.1 | Cell 1.2 | Cell 1.3 |",
        "| Cell 2.1 | Cell 2.2 | Cell 2.3 |",
      ].join("\n")
    );
  });

  it("insertBlockSnippet isolates inserted blocks with blank lines", () => {
    const inserted = insertBlockSnippet("First line", 10, 10, "---");
    assert.equal(inserted.nextValue, "First line\n\n---");
  });

  it("extractHeadingOutline ignores headings inside fenced code blocks", () => {
    const md = [
      "## Business problem",
      "Some text",
      "```bash",
      "## Not a heading",
      "```",
      "### Sub-section",
    ].join("\n");

    const outline = extractHeadingOutline(md);
    assert.deepEqual(
      outline.map((h) => ({ level: h.level, text: h.text, line: h.line })),
      [
        { level: 2, text: "Business problem", line: 1 },
        { level: 3, text: "Sub-section", line: 6 },
      ]
    );

    const stats = getMarkdownStats(md);
    assert.equal(stats.headingsCount, 2);
    assert.ok(stats.words > 0);
    assert.equal(stats.readingMinutes, 1);
  });
});
