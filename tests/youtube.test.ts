import { describe, expect, test } from "bun:test";
import { buildEmbedUrl, buildWatchUrl, parseTimestamp, parseYouTubeUrl } from "@/lib/youtube";

const ID = "M7lc1UVf-VE";

describe("parseYouTubeUrl", () => {
  test.each([
    [`https://www.youtube.com/watch?v=${ID}`],
    [`https://youtube.com/watch?v=${ID}&list=PL123`],
    [`https://m.youtube.com/watch?v=${ID}`],
    [`https://youtu.be/${ID}`],
    [`https://youtu.be/${ID}?si=abc`],
    [`https://www.youtube.com/shorts/${ID}`],
    [`https://www.youtube.com/embed/${ID}`],
    [`https://www.youtube-nocookie.com/embed/${ID}`],
    [`https://www.youtube.com/live/${ID}`],
    [`  https://www.youtube.com/watch?v=${ID}  `],
  ])("accepts %s", (url) => {
    const result = parseYouTubeUrl(url);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.id).toBe(ID);
  });

  test("flags Shorts links", () => {
    const result = parseYouTubeUrl(`https://www.youtube.com/shorts/${ID}`);
    expect(result.ok && result.isShort).toBe(true);
  });

  test("reads start times", () => {
    const a = parseYouTubeUrl(`https://youtu.be/${ID}?t=90`);
    const b = parseYouTubeUrl(`https://www.youtube.com/watch?v=${ID}&t=1m5s`);
    const c = parseYouTubeUrl(`https://www.youtube.com/embed/${ID}?start=45`);
    expect(a.ok && a.start).toBe(90);
    expect(b.ok && b.start).toBe(65);
    expect(c.ok && c.start).toBe(45);
  });

  test.each([
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
  ])("rejects %s", (url, reason) => {
    const result = parseYouTubeUrl(url);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toContain(reason);
  });

  test("rejects non-string input", () => {
    expect(parseYouTubeUrl(undefined).ok).toBe(false);
    expect(parseYouTubeUrl(42).ok).toBe(false);
  });
});

describe("URL builders", () => {
  test("embed URL uses youtube-nocookie and never autoplays unless asked", () => {
    const url = new URL(buildEmbedUrl(ID));
    expect(url.hostname).toBe("www.youtube-nocookie.com");
    expect(url.pathname).toBe(`/embed/${ID}`);
    expect(url.searchParams.get("autoplay")).toBeNull();
  });

  test("embed URL options", () => {
    const url = new URL(buildEmbedUrl(ID, { autoplay: true, start: 30, showCaptions: true }));
    expect(url.searchParams.get("autoplay")).toBe("1");
    expect(url.searchParams.get("start")).toBe("30");
    expect(url.searchParams.get("cc_load_policy")).toBe("1");
  });

  test("refuses to build an embed from an invalid ID", () => {
    expect(() => buildEmbedUrl("bad")).toThrow();
  });

  test("watch URL", () => {
    expect(buildWatchUrl(ID, 65)).toBe(`https://www.youtube.com/watch?v=${ID}&t=65s`);
  });

  test("timestamps", () => {
    expect(parseTimestamp("1h2m3s")).toBe(3723);
    expect(parseTimestamp("abc")).toBeUndefined();
    expect(parseTimestamp("")).toBeUndefined();
  });
});
