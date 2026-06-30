import { afterEach, describe, expect, it } from "vitest";
import { localizeKnownRuntimeMessage, setLocalizerLang } from "./error-copy";

const Z_H = "zh";
const E_N = "en";
const V_I = "vi";

afterEach(() => {
  setLocalizerLang(Z_H);
});

describe("localizeKnownRuntimeMessage", () => {
  it("localizes the state-degraded continuation blocker in zh (default)", () => {
    expect(localizeKnownRuntimeMessage(
      "Latest chapter 1 is state-degraded. Repair state or rewrite that chapter before continuing.",
    )).toBe("最新第 1 章处于状态降级（state-degraded）。继续写下一章前，请先修复状态，或重写这一章。");
  });

  it("localizes related state repair errors while preserving unknown messages", () => {
    expect(localizeKnownRuntimeMessage("Chapter 3 is not state-degraded.")).toBe(
      "第 3 章不是状态降级（state-degraded），无需按状态修复。",
    );
    expect(localizeKnownRuntimeMessage(
      "Only the latest state-degraded chapter can be repaired safely (latest is 5).",
    )).toBe("只能安全修复最新的状态降级（state-degraded）章节；当前最新章是第 5 章。");
    expect(localizeKnownRuntimeMessage("Bad request")).toBe("Bad request");
  });

  it("localizes common LLM configuration errors", () => {
    const studioMessage = localizeKnownRuntimeMessage(
      "Studio LLM API key not set. Open Studio services and save an API key for the selected service.",
    );
    expect(studioMessage).toContain("Studio 模型 API Key 未设置");
    expect(studioMessage).not.toMatch(/kkaiapi/i);

    const cliMessage = localizeKnownRuntimeMessage(
      "INKOS_LLM_API_KEY not set. Run 'inkos config set-global' or add it to project .env file.",
    );
    expect(cliMessage).toContain("INKOS_LLM_API_KEY 未设置");
    expect(cliMessage).not.toMatch(/kkaiapi/i);
  });

  it("localizes into English when lang is 'en'", () => {
    setLocalizerLang(E_N);
    expect(localizeKnownRuntimeMessage(
      "Latest chapter 1 is state-degraded. Repair state or rewrite that chapter before continuing.",
    )).toBe("Latest chapter 1 is state-degraded. Repair state or rewrite that chapter before continuing.");
    expect(localizeKnownRuntimeMessage("Chapter 3 is not state-degraded."))
      .toBe("Chapter 3 is not state-degraded — no state repair needed.");
  });

  it("localizes into Vietnamese when lang is 'vi'", () => {
    setLocalizerLang(V_I);
    expect(localizeKnownRuntimeMessage(
      "Latest chapter 1 is state-degraded. Repair state or rewrite that chapter before continuing.",
    )).toBe("Chương 1 mới nhất đang ở trạng thái suy giảm (state-degraded). Hãy sửa trạng thái hoặc viết lại chương đó trước khi tiếp tục.");
    expect(localizeKnownRuntimeMessage("Chapter 3 is not state-degraded."))
      .toBe("Chương 3 không ở trạng thái suy giảm (state-degraded), không cần sửa theo trạng thái.");
    expect(localizeKnownRuntimeMessage(
      "INKOS_LLM_API_KEY not set. Run 'inkos config set-global' or add it to project .env file.",
    )).toContain("Chưa đặt INKOS_LLM_API_KEY");
  });
});