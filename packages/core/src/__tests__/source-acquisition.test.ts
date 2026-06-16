import { mkdtemp, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { discoverWithBrave } from "../research/brave-discovery.js";
import { classifyResearchUrl } from "../research/source-acquisition.js";
import { importVideoTranscriptResult } from "../research/source-importer.js";

let root: string;

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), "inkos-ris-acq-"));
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

describe("source acquisition", () => {
  it("classifies YouTube and Bilibili URLs", () => {
    expect(classifyResearchUrl("https://www.youtube.com/watch?v=abc")).toEqual({ platform: "youtube", sourceKind: "youtube_video" });
    expect(classifyResearchUrl("https://youtu.be/abc")).toEqual({ platform: "youtube", sourceKind: "youtube_video" });
    expect(classifyResearchUrl("https://www.bilibili.com/video/BV123")).toEqual({ platform: "bilibili", sourceKind: "bilibili_video" });
  });

  it("stores Brave discovery records", async () => {
    const result = await discoverWithBrave(root, "demo-book", {
      query: "Genshin streamer 天幕",
      limit: 2,
      search: async () => [
        { title: "Video A", url: "https://www.youtube.com/watch?v=a", snippet: "A" },
        { title: "Article B", url: "https://example.com/article", snippet: "B" },
      ],
      now: () => "2026-06-04T00:00:00.000Z",
    });

    expect(result.discoveries).toHaveLength(2);
    expect(result.discoveries[0]!.sourceKind).toBe("youtube_video");
    expect(await readFile(result.latestPath, "utf-8")).toContain("Genshin streamer");
  });

  it("imports available transcript result as a source", async () => {
    const imported = await importVideoTranscriptResult(root, "demo-book", {
      status: "available",
      platform: "youtube",
      url: "https://www.youtube.com/watch?v=a",
      title: "Video A",
      channel: "Channel A",
      language: "zh",
      transcriptKind: "official_caption",
      text: "Line one\nLine two",
    }, "brave");

    expect(imported.meta.sourceType).toBe("video_transcript");
    expect(imported.meta.transcriptStatus).toBe("available");
    expect(await readFile(imported.absolutePath, "utf-8")).toContain("Line one");
  });

  it("imports unavailable transcript as metadata-only source", async () => {
    const imported = await importVideoTranscriptResult(root, "demo-book", {
      status: "unavailable",
      platform: "bilibili",
      url: "https://www.bilibili.com/video/BV123",
      title: "Video B",
      reason: "No subtitles found",
      metadataText: "Title: 【星铁剧场】希儿：布洛妮娅，那种东西不要看啊！\nTags: 搞笑, 手书, 杰帕德",
    }, "brave");

    expect(imported.meta.sourceType).toBe("video_metadata");
    expect(imported.meta.transcriptStatus).toBe("unavailable");
    const text = await readFile(imported.absolutePath, "utf-8");
    expect(text).toContain("No subtitles found");
    expect(text).toContain("## Metadata");
    expect(text).toContain("布洛妮娅");
  });
});
