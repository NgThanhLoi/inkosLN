import { describe, expect, it } from "vitest";
import { buildOpusHardStateCapsule, buildOpusParagraphBudget, isOpusWritingMode } from "../agents/opus-writing-mode.js";

describe("opus writing mode helpers", () => {
  it("detects opus writing mode from client defaults extra", () => {
    expect(isOpusWritingMode({ writingMode: "opus" })).toBe(true);
    expect(isOpusWritingMode({ writingMode: "standard" })).toBe(false);
    expect(isOpusWritingMode({})).toBe(false);
  });

  it("builds a compact hard state capsule with current state and bans", () => {
    const capsule = buildOpusHardStateCapsule({
      language: "vi",
      currentState: "| 当前章节 | 40 |\n| 当前位置 | Astral Express đã rời Jarilo-VI |\n| 主角状态 | March 7th 右手仍废用 |",
      externalContext: "Không vào Cloudford. Kafka hook only.",
      chapterNumber: 41,
    });

    expect(capsule).toContain("HARD STATE CAPSULE");
    expect(capsule).toContain("Astral Express đã rời Jarilo-VI");
    expect(capsule).toContain("Không vào Cloudford");
    expect(capsule).toContain("Không được tự ý đổi state");
    expect(capsule.length).toBeLessThan(2500);
  });

  it("builds a paragraph budget for Vietnamese webnovel chapters", () => {
    const budget = buildOpusParagraphBudget({ language: "vi", targetWords: 1500 });

    expect(budget).toContain("PARAGRAPH BUDGET");
    expect(budget).toContain("18-26 đoạn");
    expect(budget).toContain("2-3 cụm reaction");
    expect(budget).toContain("không dùng ---");
  });
});
