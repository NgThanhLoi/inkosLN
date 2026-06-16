import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it, vi } from "vitest";
import { createBraveSearchFunction } from "../research/brave-api.js";
import { parseTranscriptCommandArgs, parseTranscriptCommandOutput } from "../research/external-transcript-provider.js";
import { createExternalTranscriptProvider, ExternalTranscriptProvider } from "../research/external-transcript-provider.js";

describe("source providers", () => {
  it("maps Brave API web results to SearchResult", async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({
      web: {
        results: [
          { title: "Video A", url: "https://www.youtube.com/watch?v=a", description: "Desc A" },
        ],
      },
    }), { status: 200 }));

    const search = createBraveSearchFunction({ apiKey: "key", fetchImpl });
    await expect(search("Honkai", 5)).resolves.toEqual([
      { title: "Video A", url: "https://www.youtube.com/watch?v=a", snippet: "Desc A" },
    ]);
  });

  it("throws clear error when Brave API key is missing", async () => {
    const search = createBraveSearchFunction({ apiKey: "", fetchImpl: vi.fn() });
    await expect(search("Honkai", 5)).rejects.toThrow(/BRAVE_API_KEY/);
  });

  it("parses transcript command JSON output", () => {
    const parsed = parseTranscriptCommandOutput("https://youtu.be/a", JSON.stringify({
      status: "available",
      platform: "youtube",
      title: "Video A",
      channel: "Channel A",
      language: "zh",
      transcriptKind: "official_caption",
      text: "Line one\nLine two",
    }));
    expect(parsed.status).toBe("available");
    if (parsed.status === "available") {
      expect(parsed.text).toContain("Line one");
    }
  });

  it("returns unavailable when transcript command is not set", async () => {
    const provider = new ExternalTranscriptProvider({ command: "", args: [] });
    const result = await provider.fetch("https://youtu.be/a");
    expect(result.status).toBe("unavailable");
    expect((result as { reason?: string }).reason).toContain("INKOS_TRANSCRIPT_COMMAND");
  });

  it("parses quoted transcript command args", () => {
    expect(parseTranscriptCommandArgs('"scripts/transcript-provider.mjs" --flag "中文 参数"')).toEqual([
      "scripts/transcript-provider.mjs",
      "--flag",
      "中文 参数",
    ]);
  });

  it("passes env transcript args before the URL", async () => {
    const previousArgs = process.env.INKOS_TRANSCRIPT_ARGS;
    const dir = await mkdtemp(join(tmpdir(), "inkos-transcript-provider-"));
    const scriptPath = join(dir, "fixture-provider.mjs");
    await writeFile(scriptPath, [
      "const url = process.argv.at(-1);",
      "console.log(JSON.stringify({",
      "  status: 'available',",
      "  platform: 'bilibili',",
      "  title: 'Args OK',",
      "  language: 'zh-CN',",
      "  transcriptKind: 'official_caption',",
      "  text: process.argv.slice(2).join('|'),",
      "}));",
    ].join("\n"));

    try {
      process.env.INKOS_TRANSCRIPT_ARGS = `"${scriptPath}" --marker "中文 参数"`;
      const provider = new ExternalTranscriptProvider({ command: process.execPath });
      const result = await provider.fetch("https://www.bilibili.com/video/BV123/");
      expect(result.status).toBe("available");
      if (result.status === "available") {
        expect(result.text).toContain("--marker|中文 参数|https://www.bilibili.com/video/BV123/");
      }
    } finally {
      if (previousArgs === undefined) {
        delete process.env.INKOS_TRANSCRIPT_ARGS;
      } else {
        process.env.INKOS_TRANSCRIPT_ARGS = previousArgs;
      }
    }
  });

  it("cleans Chinese VTT subtitle text", async () => {
    const providerModule = await import(pathToFileURL(resolve("../../scripts/transcript-provider.mjs")).href) as {
      cleanVttTranscript: (input: string) => string;
    };
    const fixture = await readFile(resolve("../../scripts/__fixtures__/bilibili.zh.vtt"), "utf-8");
    expect(providerModule.cleanVttTranscript(fixture)).toBe("布洛妮娅，那种东西不要看啊！\n希儿，先确认它是不是天幕剪辑。");
  });

  it("parses ASR command args and output", async () => {
    const providerModule = await import(pathToFileURL(resolve("../../scripts/transcript-provider.mjs")).href) as {
      parseCommandArgs: (input: string) => string[];
      parseAsrOutput: (input: string, fallbackLanguage: string) => { text: string; language: string };
    };
    expect(providerModule.parseCommandArgs('scripts/asr.py --language "zh CN"')).toEqual([
      "scripts/asr.py",
      "--language",
      "zh CN",
    ]);
    expect(providerModule.parseAsrOutput(JSON.stringify({ text: "希儿看见了布洛妮娅。", language: "zh-CN" }), "zh")).toEqual({
      text: "希儿看见了布洛妮娅。",
      language: "zh-CN",
    });
    expect(providerModule.parseAsrOutput("  杰帕德举起盾牌。  ", "zh")).toEqual({
      text: "杰帕德举起盾牌。",
      language: "zh",
    });
  });

  it("appends metadata below ASR transcript", async () => {
    const providerModule = await import(pathToFileURL(resolve("../../scripts/transcript-provider.mjs")).href) as {
      buildTranscriptWithMetadata: (transcript: string, metadata: Record<string, unknown>) => string;
    };
    const text = providerModule.buildTranscriptWithMetadata("希儿看见了布洛妮娅。", {
      title: "【星铁剧场】希儿：布洛妮娅，那种东西不要看啊！",
      uploader: "兰矛RS",
      tags: ["希儿", "布洛妮娅", "搞笑"],
    });
    expect(text).toContain("希儿看见了布洛妮娅。");
    expect(text).toContain("## Video Metadata");
    expect(text).toContain("Tags: 希儿, 布洛妮娅, 搞笑");
  });
});
