import { describe, expect, it } from "vitest";
import { parseSettlerDeltaOutput } from "../agents/settler-delta-parser.js";

describe("parseSettlerDeltaOutput", () => {
  it("parses a valid runtime-state delta block", () => {
    const result = parseSettlerDeltaOutput([
      "=== POST_SETTLEMENT ===",
      "| 伏笔变动 | mentor-oath 推进 | 同步更新 |",
      "",
      "=== RUNTIME_STATE_DELTA ===",
      "```json",
      JSON.stringify({
        chapter: 12,
        currentStatePatch: {
          currentGoal: "追到河埠旧账的尽头",
          currentConflict: "商会噪音仍在干扰师债主线",
        },
        hookOps: {
          upsert: [
            {
              hookId: "mentor-oath",
              startChapter: 8,
              type: "relationship",
              status: "progressing",
              lastAdvancedChapter: 12,
              expectedPayoff: "揭开师债真相",
              notes: "河埠旧账把师债再往前推了一格",
            },
          ],
          resolve: [],
          defer: [],
        },
        chapterSummary: {
          chapter: 12,
          title: "河埠对账",
          characters: "林月",
          events: "林月核对河埠旧账",
          stateChanges: "师债线索进一步收束",
          hookActivity: "mentor-oath advanced",
          mood: "紧绷",
          chapterType: "主线推进",
        },
        notes: ["保留商会噪音，但不盖过主线"],
      }, null, 2),
      "```",
    ].join("\n"));

    expect(result.postSettlement).toContain("mentor-oath");
    expect(result.runtimeStateDelta.chapter).toBe(12);
    expect(result.runtimeStateDelta.hookOps.upsert[0]?.hookId).toBe("mentor-oath");
    expect(result.runtimeStateDelta.chapterSummary?.title).toBe("河埠对账");
  });

  it("rejects invalid runtime-state delta payloads", () => {
    expect(() =>
      parseSettlerDeltaOutput([
        "=== RUNTIME_STATE_DELTA ===",
        "```json",
        JSON.stringify({
          chapter: 12,
          hookOps: {
            upsert: [
              {
                hookId: "mentor-oath",
                startChapter: 8,
                type: "relationship",
                status: "open",
                lastAdvancedChapter: "chapter twelve",
              },
            ],
            resolve: [],
            defer: [],
          },
        }),
        "```",
      ].join("\n")),
    ).toThrow(/runtime state delta/i);
  });

  it("parses hook resolve and defer operations", () => {
    const result = parseSettlerDeltaOutput([
      "=== RUNTIME_STATE_DELTA ===",
      "```json",
      JSON.stringify({
        chapter: 20,
        hookOps: {
          upsert: [],
          mention: ["mentor-oath"],
          resolve: ["old-seal"],
          defer: ["guild-route"],
        },
        notes: [],
      }),
      "```",
    ].join("\n"));

    expect(result.runtimeStateDelta.hookOps.mention).toEqual(["mentor-oath"]);
    expect(result.runtimeStateDelta.hookOps.resolve).toEqual(["old-seal"]);
    expect(result.runtimeStateDelta.hookOps.defer).toEqual(["guild-route"]);
  });

  it("parses new hook candidates separately from existing hook ops", () => {
    const result = parseSettlerDeltaOutput([
      "=== RUNTIME_STATE_DELTA ===",
      "```json",
      JSON.stringify({
        chapter: 21,
        hookOps: {
          upsert: [],
          mention: ["mentor-oath"],
          resolve: [],
          defer: [],
        },
        newHookCandidates: [
          {
            type: "source-risk",
            expectedPayoff: "Reveal what the anonymous source already knew about the route and address",
            notes: "This chapter opens a fresh unresolved question about source knowledge.",
          },
        ],
        notes: [],
      }),
      "```",
    ].join("\n"));

    expect(result.runtimeStateDelta.hookOps.upsert).toEqual([]);
    expect(result.runtimeStateDelta.newHookCandidates).toEqual([
      expect.objectContaining({
        type: "source-risk",
      }),
    ]);
  });

  it("tolerates explanatory text after the closing code fence", () => {
    const result = parseSettlerDeltaOutput([
      "=== RUNTIME_STATE_DELTA ===",
      "```json",
      JSON.stringify({
        chapter: 9,
        hookOps: { upsert: [], mention: [], resolve: [], defer: [] },
        notes: [],
      }),
      "```",
      "",
      "Trên đây là kết quả kết toán trạng thái cho chương 9.",
    ].join("\n"));

    expect(result.runtimeStateDelta.chapter).toBe(9);
  });

  it("coerces string chapter numbers like 'Ch9' to integers", () => {
    const result = parseSettlerDeltaOutput([
      "=== RUNTIME_STATE_DELTA ===",
      "```json",
      JSON.stringify({
        chapter: 9,
        hookOps: {
          upsert: [
            {
              hookId: "H010",
              startChapter: "7",
              type: "trial-challenge",
              status: "progressing",
              lastAdvancedChapter: "Ch9",
              expectedPayoff: "Reserve match",
              payoffTiming: "near-term",
              notes: "test",
            },
          ],
          mention: [],
          resolve: [],
          defer: [],
        },
        notes: [],
      }),
      "```",
    ].join("\n"));

    expect(result.runtimeStateDelta.hookOps.upsert[0]?.startChapter).toBe(7);
    expect(result.runtimeStateDelta.hookOps.upsert[0]?.lastAdvancedChapter).toBe(9);
  });

  it("normalizes Vietnamese hook status values to English enums", () => {
    const result = parseSettlerDeltaOutput([
      "=== RUNTIME_STATE_DELTA ===",
      "```json",
      JSON.stringify({
        chapter: 9,
        hookOps: {
          upsert: [
            {
              hookId: "H010",
              startChapter: 7,
              type: "trial-challenge",
              status: "Đang hoạt động",
              lastAdvancedChapter: 9,
              notes: "test",
            },
            {
              hookId: "H011",
              startChapter: 8,
              type: "mystery",
              status: "Đã thu hồi",
              lastAdvancedChapter: 9,
              notes: "test",
            },
          ],
          mention: [],
          resolve: [],
          defer: [],
        },
        notes: [],
      }),
      "```",
    ].join("\n"));

    expect(result.runtimeStateDelta.hookOps.upsert[0]?.status).toBe("open");
    expect(result.runtimeStateDelta.hookOps.upsert[1]?.status).toBe("resolved");
  });

  it("normalizes Chinese hook status values to English enums", () => {
    const result = parseSettlerDeltaOutput([
      "=== RUNTIME_STATE_DELTA ===",
      "```json",
      JSON.stringify({
        chapter: 9,
        hookOps: {
          upsert: [
            {
              hookId: "H010",
              startChapter: 7,
              type: "trial-challenge",
              status: "推进中",
              lastAdvancedChapter: 9,
              notes: "test",
            },
          ],
          mention: [],
          resolve: [],
          defer: [],
        },
        notes: [],
      }),
      "```",
    ].join("\n"));

    expect(result.runtimeStateDelta.hookOps.upsert[0]?.status).toBe("progressing");
  });

  it("extracts JSON from malformed code fence without closing backticks", () => {
    const result = parseSettlerDeltaOutput([
      "=== RUNTIME_STATE_DELTA ===",
      "```json",
      JSON.stringify({
        chapter: 9,
        hookOps: { upsert: [], mention: [], resolve: [], defer: [] },
        notes: [],
      }),
      "```",
    ].join("\n"));

    expect(result.runtimeStateDelta.chapter).toBe(9);
  });

  it("normalizes objects in resolve/defer/mention arrays to hookId strings", () => {
    const result = parseSettlerDeltaOutput([
      "=== RUNTIME_STATE_DELTA ===",
      "```json",
      JSON.stringify({
        chapter: 9,
        hookOps: {
          upsert: [],
          mention: [{ hookId: "H001", reason: "mentioned in passing" }],
          resolve: [{ hookId: "H002", reason: "fully resolved" }],
          defer: [{ hookId: "H003", reason: "not yet" }],
        },
        notes: [],
      }),
      "```",
    ].join("\n"));

    expect(result.runtimeStateDelta.hookOps.mention).toEqual(["H001"]);
    expect(result.runtimeStateDelta.hookOps.resolve).toEqual(["H002"]);
    expect(result.runtimeStateDelta.hookOps.defer).toEqual(["H003"]);
  });

  it("repairs unquoted string values in the JSON payload", () => {
    const result = parseSettlerDeltaOutput([
      "=== RUNTIME_STATE_DELTA ===",
      "```json",
      JSON.stringify({
        chapter: 9,
        hookOps: {
          upsert: [
            { hookId: "H001", startChapter: 7, type: "a", status: "open", lastAdvancedChapter: 9, notes: "" },
          ],
          mention: [], resolve: [], defer: [],
        },
        notes: [],
      }).replace('"status": "open"', '"status": open'),
      "```",
    ].join("\n"));

    expect(result.runtimeStateDelta.hookOps.upsert[0]?.status).toBe("open");
  });

  it("repairs single-quoted strings in the JSON payload", () => {
    const result = parseSettlerDeltaOutput([
      "=== RUNTIME_STATE_DELTA ===",
      "```json",
      JSON.stringify({
        chapter: 9,
        hookOps: {
          upsert: [
            { hookId: "H010", startChapter: 7, type: "a", status: "open", lastAdvancedChapter: 9, notes: "" },
          ],
          mention: [], resolve: [], defer: [],
        },
        notes: [],
      })
        .replace('"H010"', "'H010'")
        .replace('"open"', "'open'"),
      "```",
    ].join("\n"));

    expect(result.runtimeStateDelta.hookOps.upsert[0]?.hookId).toBe("H010");
    expect(result.runtimeStateDelta.hookOps.upsert[0]?.status).toBe("open");
  });

  it("repairs unquoted object keys in the JSON payload", () => {
    const result = parseSettlerDeltaOutput([
      "=== RUNTIME_STATE_DELTA ===",
      "```json",
      JSON.stringify({
        chapter: 9,
        hookOps: {
          upsert: [],
          mention: [],
          resolve: [],
          defer: [],
        },
        notes: [],
      }).replace('"chapter"', 'chapter'),
      "```",
    ].join("\n"));

    expect(result.runtimeStateDelta.chapter).toBe(9);
  });

  it("normalizes capitalized 'Chapter' key to 'chapter'", () => {
    const result = parseSettlerDeltaOutput([
      "=== RUNTIME_STATE_DELTA ===",
      "```json",
      JSON.stringify({
        Chapter: 9,
        hookOps: { upsert: [], mention: [], resolve: [], defer: [] },
        notes: [],
      }),
      "```",
    ].join("\n"));

    expect(result.runtimeStateDelta.chapter).toBe(9);
  });

  it("normalizes common LLM-generated English hook statuses", () => {
    const result = parseSettlerDeltaOutput([
      "=== RUNTIME_STATE_DELTA ===",
      "```json",
      JSON.stringify({
        chapter: 10,
        hookOps: {
          upsert: [
            { hookId: "H020", startChapter: 10, type: "a", status: "active", lastAdvancedChapter: 10, notes: "" },
            { hookId: "H021", startChapter: 10, type: "b", status: "new", lastAdvancedChapter: 10, notes: "" },
            { hookId: "H022", startChapter: 10, type: "c", status: "closed", lastAdvancedChapter: 10, notes: "" },
            { hookId: "H023", startChapter: 10, type: "d", status: "advanced", lastAdvancedChapter: 10, notes: "" },
            { hookId: "H024", startChapter: 10, type: "e", status: "pending", lastAdvancedChapter: 10, notes: "" },
          ],
          mention: [], resolve: [], defer: [],
        },
        notes: [],
      }),
      "```",
    ].join("\n"));

    const hooks = result.runtimeStateDelta.hookOps.upsert;
    expect(hooks[0]?.status).toBe("open");       // active → open
    expect(hooks[1]?.status).toBe("open");       // new → open
    expect(hooks[2]?.status).toBe("resolved");   // closed → resolved
    expect(hooks[3]?.status).toBe("progressing");// advanced → progressing
    expect(hooks[4]?.status).toBe("deferred");   // pending → deferred
  });
});
