import { describe, expect, it } from "vitest";
import {
  ResearchDiscoverySchema,
  ResearchFactCardSchema,
  ResearchSourceMetaSchema,
  TranscriptResultSchema,
} from "../models/research.js";

describe("research schemas", () => {
  it("accepts a canon fact card", () => {
    const parsed = ResearchFactCardSchema.parse({
      id: "fact_himeko_final_lesson_001",
      type: "canon_event",
      confidence: "canon",
      statement: "Himeko sacrifices herself during Final Lesson.",
      sourceId: "source_0001",
      sourceRef: "Honkai Impact 3rd Chapter 9",
      entities: ["Himeko", "Kiana"],
      tags: ["final_lesson", "sacrifice"],
      allowedUse: "Can be used as canon video material.",
      forbiddenUse: "Do not claim Himeko survives unless AU/speculative mode is active.",
      timeline: { arc: "Final Lesson", order: 90 },
    });
    expect(parsed.confidence).toBe("canon");
  });

  it("rejects a fact card without a source", () => {
    expect(() => ResearchFactCardSchema.parse({
      id: "fact_bad",
      type: "canon_event",
      confidence: "canon",
      statement: "Unsupported fact.",
      entities: [],
      tags: [],
    })).toThrow();
  });

  it("accepts a YouTube discovery record", () => {
    const parsed = ResearchDiscoverySchema.parse({
      id: "discovery_0001",
      query: "Honkai Final Lesson 天幕 盘点",
      title: "Final Lesson - Honkai Impact 3rd",
      url: "https://www.youtube.com/watch?v=abc123",
      platform: "youtube",
      sourceKind: "youtube_video",
      snippet: "official animation",
      rank: 1,
      selected: true,
      discoveredAt: "2026-06-04T00:00:00.000Z",
    });
    expect(parsed.sourceKind).toBe("youtube_video");
  });

  it("accepts video transcript metadata", () => {
    const parsed = ResearchSourceMetaSchema.parse({
      id: "source_0007",
      title: "Final Lesson - Honkai Impact 3rd",
      path: "sources/source_0007.video-transcript.md",
      sourceType: "video_transcript",
      platform: "youtube",
      url: "https://www.youtube.com/watch?v=abc123",
      channel: "Honkai Impact 3rd",
      language: "zh",
      transcriptKind: "official_caption",
      transcriptStatus: "available",
      discoveredBy: "brave",
      confidence: "source_only",
      createdAt: "2026-06-04T00:00:00.000Z",
    });
    expect(parsed.transcriptStatus).toBe("available");
  });

  it("accepts unavailable transcript result without text", () => {
    const parsed = TranscriptResultSchema.parse({
      status: "unavailable",
      platform: "bilibili",
      url: "https://www.bilibili.com/video/BV123",
      reason: "No subtitles found",
    });
    expect(parsed.status).toBe("unavailable");
  });
});
