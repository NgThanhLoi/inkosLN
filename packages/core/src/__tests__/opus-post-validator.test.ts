import { describe, expect, it } from "vitest";
import { validateOpusPostWrite } from "../agents/opus-post-validator.js";

describe("validateOpusPostWrite", () => {
  it("flags hard Opus drift patterns", () => {
    const issues = validateOpusPostWrite("Đoạn một.\n\n---\n\n*Nội tâm nghiêng.*\n\nVết sẹo trên cổ tay. Máu chảy từ mắt.", "vi");

    expect(issues.filter((issue) => issue.severity === "error").map((issue) => issue.rule)).toEqual(
      expect.arrayContaining(["opus-section-divider", "opus-italic-prose", "opus-permanent-scar", "opus-eye-ear-blood"]),
    );
  });

  it("flags vague reaction anchors and meta/game words", () => {
    const issues = validateOpusPostWrite("Ở một thế giới khác, người chơi nhìn bảng ranking và chờ system phát thưởng.", "vi");

    expect(issues.map((issue) => issue.rule)).toEqual(
      expect.arrayContaining(["opus-vague-reaction-anchor", "opus-meta-game-word"]),
    );
  });

  it("passes clean direct prose", () => {
    const issues = validateOpusPostWrite("Ở lát cắt Honkai Impact 3rd, Kiana im lặng nhìn tuyết tan. March dùng tay trái kéo chăn cho Caelus.", "vi");

    expect(issues).toEqual([]);
  });
});
