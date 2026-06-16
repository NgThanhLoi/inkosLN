import { describe, it, expect } from "vitest";
import {
  buildLengthSpec,
  chooseNormalizeMode,
  countChapterLength,
  isOutsideHardRange,
  isOutsideSoftRange,
} from "../utils/length-metrics.js";

describe("length metrics", () => {
  it("counts Chinese chapter length using zh_chars", () => {
    expect(countChapterLength("他抬头看天。", "zh_chars")).toBe(6);
  });

  it("counts English chapter length using en_words", () => {
    expect(countChapterLength("He looked at the sky.", "en_words")).toBe(5);
  });

  it("counts prose only for markdown-shaped Chinese chapters", () => {
    const markdownChapter = [
      "---",
      "title: 第1章 归来",
      "---",
      "",
      "# 第1章 归来",
      "",
      "陈风抬头看天。",
    ].join("\n");

    expect(countChapterLength(markdownChapter, "zh_chars")).toBe("陈风抬头看天。".length);
  });

  it("builds a conservative length spec for Chinese chapters", () => {
    const spec = buildLengthSpec(2200, "zh");

    expect(spec).toEqual({
      target: 2200,
      softMin: 1900,
      softMax: 2500,
      hardMin: 1600,
      hardMax: 2800,
      countingMode: "zh_chars",
      normalizeMode: "none",
    });
  });

  it("counts Vietnamese chapter length using vi_words", () => {
    expect(countChapterLength("Tôi đi học.", "vi_words")).toBe(3);
    expect(countChapterLength("Thử nghiệm không gian", "vi_words")).toBe(4);
  });

  it("builds a conservative length spec for English chapters", () => {
    const spec = buildLengthSpec(2200, "en");

    expect(spec.countingMode).toBe("en_words");
    expect(spec.softMin).toBe(1900);
    expect(spec.softMax).toBe(2500);
    expect(spec.hardMin).toBe(1600);
    expect(spec.hardMax).toBe(2800);
  });

  it("builds a conservative length spec for Vietnamese chapters", () => {
    const spec = buildLengthSpec(2000, "vi");

    expect(spec.countingMode).toBe("vi_words");
    // scaleRangeDelta: Math.floor(2000 * 300 / 2200) = 272
    expect(spec.softMin).toBe(2000 - 272);
    expect(spec.softMax).toBe(2000 + 272);
    expect(spec.hardMin).toBe(2000 - 545);
    expect(spec.hardMax).toBe(2000 + 545);
  });

  it("scales the conservative bands for smaller targets", () => {
    const spec = buildLengthSpec(220, "zh");

    expect(spec.softMin).toBe(190);
    expect(spec.softMax).toBe(250);
    expect(spec.hardMin).toBe(160);
    expect(spec.hardMax).toBe(280);
  });

  it("detects soft and hard range drift", () => {
    const spec = buildLengthSpec(2200, "zh");

    expect(isOutsideSoftRange(1800, spec)).toBe(true);
    expect(isOutsideSoftRange(2200, spec)).toBe(false);
    expect(isOutsideHardRange(1500, spec)).toBe(true);
    expect(isOutsideHardRange(2200, spec)).toBe(false);
  });

  it("chooses normalization direction from the measured length", () => {
    const spec = buildLengthSpec(2200, "zh");

    expect(chooseNormalizeMode(1800, spec)).toBe("expand");
    expect(chooseNormalizeMode(2200, spec)).toBe("none");
    expect(chooseNormalizeMode(2600, spec)).toBe("compress");
  });
});
