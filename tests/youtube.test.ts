import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildEmbedUrl, buildWatchUrl, parseTimestamp, parseYouTubeUrl } from "@/lib/youtube";

const ID = "M7lc1UVf-VE";

describe("parseYouTubeUrl", () => {
  const acceptUrls = [
    `https://www.youtube.com/watch?v=${ID}`,
    `https://youtube.com/watch?v=${ID}&list=PL123`,
    `https://m.youtube.com/watch?v=${ID}`,
    `https://youtu.be/${ID}`,
    `https://youtu.be/${ID}?si=abc`,
    `https://www.youtube.com/shorts/${ID}`,
    `https://www.youtube.com/embed/${ID}`,
    `https://www.youtube-nocookie.com/embed/${ID}`,
    `https://www.youtube.com/live/${ID}`,
    `  https://www.youtube.com/watch?v=${ID}  `,
  ];

  for (const url of acceptUrls) {
    it(`accepts ${url.trim()}`, () => {
      const result = parseYouTubeUrl(url);
      assert.equal(result.ok, true);
      if (result.ok) assert.equal(result.id, ID);
    });
  }

  it("flags Shorts links", () => {
    const result = parseYouTubeUrl(`https://www.youtube.com/shorts/${ID}`);
    assert.ok(result.ok && result.isShort);
  });

  it("reads start times", () => {
    const a = parseYouTubeUrl(`https://youtu.be/${ID}?t=90`);
    const b = parseYouTubeUrl(`https://www.youtube.com/watch?v=${ID}&t=1m5s`);
    const c = parseYouTubeUrl(`https://www.youtube.com/embed/${ID}?start=45`);
    assert.equal(a.ok && a.start, 90);
    assert.equal(b.ok && b.start, 65);
    assert.equal(c.ok && c.start, 45);
  });

  const rejectCases: [string, string][] = [
    ["", "No YouTube link"],
    ["paste-link-here", "not a valid URL"],
    ["javascript:alert(1)", "https"],
    ["https://vimeo.com/12345", "not a YouTube address"],
    ["https://evil.example/watch?v=M7lc1UVf-VE", "not a YouTube address"],
    ["https://youtube.com.evil.example/watch?v=M7lc1UVf-VE", "not a YouTube address"],
    ["https://www.youtube.com/watch?v=short", "not valid"],
    ["https://www.youtube.com/watch?v=<script>abc", "not valid"],
    ["https://www.youtube.com/channel/UC123", "single YouTube video"],
    ["https://www.youtube.com/", "single YouTube video"],
  ];

  for (const [url, reason] of rejectCases) {
    it(`rejects ${url || "<empty>"}`, () => {
      const result = parseYouTubeUrl(url);
      assert.equal(result.ok, false);
      if (!result.ok) assert.ok(result.reason.includes(reason));
    });
  }

  it("rejects non-string input", () => {
    assert.equal(parseYouTubeUrl(undefined).ok, false);
    assert.equal(parseYouTubeUrl(42).ok, false);
  });
});

describe("URL builders", () => {
  it("embed URL uses youtube-nocookie and never autoplays unless asked", () => {
    const url = new URL(buildEmbedUrl(ID));
    assert.equal(url.hostname, "www.youtube-nocookie.com");
    assert.equal(url.pathname, `/embed/${ID}`);
    assert.equal(url.searchParams.get("autoplay"), null);
  });

  it("embed URL options", () => {
    const url = new URL(buildEmbedUrl(ID, { autoplay: true, start: 30, showCaptions: true }));
    assert.equal(url.searchParams.get("autoplay"), "1");
    assert.equal(url.searchParams.get("start"), "30");
    assert.equal(url.searchParams.get("cc_load_policy"), "1");
  });

  it("refuses to build an embed from an invalid ID", () => {
    assert.throws(() => buildEmbedUrl("bad"));
  });

  it("watch URL", () => {
    assert.equal(buildWatchUrl(ID, 65), `https://www.youtube.com/watch?v=${ID}&t=65s`);
  });

  it("timestamps", () => {
    assert.equal(parseTimestamp("1h2m3s"), 3723);
    assert.equal(parseTimestamp("abc"), undefined);
    assert.equal(parseTimestamp(""), undefined);
  });
});
