import {
  RuntimeStateDeltaSchema,
  type RuntimeStateDelta,
} from "../models/runtime-state.js";

export interface SettlerDeltaOutput {
  readonly postSettlement: string;
  readonly runtimeStateDelta: RuntimeStateDelta;
}

function repairMalformedJSON(json: string): string {
  // Some models (e.g. Gemini 3.5 Flash) emit malformed JSON such as:
  //   { chapter: 9, "status": open, "Chapter": injury }
  // We quote bare-word keys and string values while leaving JSON literals
  // (true/false/null), numbers, objects, and arrays untouched.
  const placeholder = `\u0000STR_${Math.random().toString(36).slice(2)}\u0000`;
  const strings: string[] = [];

  // Protect already-quoted strings so we don't accidentally quote inside them.
  let protectedJson = json.replace(/"(?:\\.|[^"\\])*"/g, (match) => {
    strings.push(match);
    return `${placeholder}${strings.length - 1}${placeholder}`;
  });

  // Quote bare-word object keys: `chapter:` → `"chapter":`
  protectedJson = protectedJson.replace(
    /([A-Za-z_][A-Za-z0-9_]*)[ \t]*:/g,
    '"$1":',
  );

  // Convert single-quoted strings to double-quoted: `'H010'` → `"H010"`
  protectedJson = protectedJson.replace(
    /'([^'\\]*(?:\\.[^'\\]*)*)'/g,
    '"$1"',
  );

  // Quote bare-word string values: `: open` → `: "open"`
  protectedJson = protectedJson.replace(
    /:\s*(?!true\b|false\b|null\b)([A-Za-z_][A-Za-z0-9_\s]*[A-Za-z0-9_])(?=\s*[,}\]])/g,
    ': "$1"',
  );

  // Restore protected strings.
  return protectedJson.replace(
    new RegExp(`${placeholder}(-?\\d+)${placeholder}`, "g"),
    (_, index) => strings[Number(index)] ?? _,
  );
}

function sanitizeJSON(str: string): string {
  return repairMalformedJSON(
    str
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
      .replace(/,\s*([}\]])/g, "$1"),
  );
}

/**
 * Normalize common model quirks in the parsed delta object before Zod validation.
 * - Coerce string chapter numbers ("Ch9", "9") to integers
 * - Normalize Vietnamese/Chinese hook status values to English enums
 */
function normalizeDeltaBeforeValidation(obj: Record<string, unknown>): void {
  // Normalize known key aliases produced by some models
  if ("Chapter" in obj && !("chapter" in obj)) {
    obj.chapter = obj.Chapter;
    delete obj.Chapter;
  }

  // Coerce string → number for numeric fields
  const coerceToInt = (val: unknown): number | unknown => {
    if (typeof val === "string") {
      const n = parseInt(val.replace(/[^0-9-]/g, ""), 10);
      if (!isNaN(n)) return n;
    }
    return val;
  };

  // Normalize hook status to English enum values
  const statusMap: Record<string, string> = {
    // Vietnamese
    "mở": "open",
    "đang hoạt động": "open",
    "hoạt động": "open",
    "đang tiến triển": "progressing",
    "tiến triển": "progressing",
    "đang đẩy": "progressing",
    "trì hoãn": "deferred",
    "đã trì hoãn": "deferred",
    "đã thu hồi": "resolved",
    "thu hồi": "resolved",
    "đã giải quyết": "resolved",
    "giải quyết": "resolved",
    // Chinese
    "开放": "open",
    "活跃": "open",
    "推进中": "progressing",
    "推进": "progressing",
    "延后": "deferred",
    "已延后": "deferred",
    "已回收": "resolved",
    "回收": "resolved",
    "已解决": "resolved",
    // Planner prompt statuses (intermediate states → normalize to core enum)
    "near_payoff": "progressing",
    "pressured": "progressing",
    // Common LLM-generated English statuses that don't match the core enum
    "active": "open",
    "new": "open",
    "opened": "open",
    "closed": "resolved",
    "done": "resolved",
    "completed": "resolved",
    "pending": "deferred",
    "paused": "deferred",
    "advanced": "progressing",
    "advancing": "progressing",
    "in_progress": "progressing",
    "in-progress": "progressing",
  };

  const normalizeStatus = (val: unknown): string | unknown => {
    if (typeof val === "string") {
      const lower = val.toLowerCase().trim();
      return statusMap[lower] ?? val;
    }
    return val;
  };

  // Process hookOps.upsert
  const hookOps = obj.hookOps as Record<string, unknown> | undefined;
  if (hookOps && Array.isArray(hookOps.upsert)) {
    for (const hook of hookOps.upsert) {
      if (typeof hook === "object" && hook !== null) {
        const h = hook as Record<string, unknown>;
        h.startChapter = coerceToInt(h.startChapter);
        h.lastAdvancedChapter = coerceToInt(h.lastAdvancedChapter);
        h.status = normalizeStatus(h.status);
        // Normalize payoffTiming too (Vietnamese values)
        if (typeof h.payoffTiming === "string") {
          const timingMap: Record<string, string> = {
            "ngắn hạn": "immediate",
            "ngay lập tức": "immediate",
            "trung hạn": "near-term",
            "gần": "near-term",
            "giữa cung": "mid-arc",
            "dài hạn": "slow-burn",
            "cháy chậm": "slow-burn",
            "kết thúc": "endgame",
            "cuối cùng": "endgame",
            "短期": "near-term",
            "中期": "mid-arc",
            "长期": "slow-burn",
            "终局": "endgame",
          };
          const lower = h.payoffTiming.toLowerCase().trim();
          h.payoffTiming = timingMap[lower] ?? h.payoffTiming;
        }
      }
    }
  }

  // Normalize resolve/defer/mention arrays: models sometimes output objects
  // like {hookId: "H001", reason: "..."} instead of plain strings.
  // Extract the hookId string from any objects found in these arrays.
  if (hookOps) {
    for (const key of ["mention", "resolve", "defer"] as const) {
      const arr = hookOps[key];
      if (Array.isArray(arr)) {
        hookOps[key] = arr.map((item: unknown) => {
          if (typeof item === "string") return item;
          if (typeof item === "object" && item !== null) {
            const obj = item as Record<string, unknown>;
            return obj.hookId ?? obj.id ?? obj.hook_id ?? String(item);
          }
          return String(item);
        });
      }
    }
  }

  // Coerce top-level chapter and chapterSummary.chapter
  obj.chapter = coerceToInt(obj.chapter);
  const chapterSummary = obj.chapterSummary as Record<string, unknown> | undefined;
  if (chapterSummary) {
    chapterSummary.chapter = coerceToInt(chapterSummary.chapter);
  }
}

export function parseSettlerDeltaOutput(content: string): SettlerDeltaOutput {
  const extract = (tag: string): string => {
    const regex = new RegExp(
      `=== ${tag} ===\\s*([\\s\\S]*?)(?==== [A-Z_]+ ===|$)`,
    );
    const match = content.match(regex);
    return match?.[1]?.trim() ?? "";
  };

  const rawDelta = extract("RUNTIME_STATE_DELTA");
  if (!rawDelta) {
    throw new Error("runtime state delta block is missing");
  }

  const jsonPayload = stripCodeFence(rawDelta);
  let parsed: unknown;
  try {
    parsed = JSON.parse(sanitizeJSON(jsonPayload));
  } catch (error) {
    throw new Error(`runtime state delta is not valid JSON: ${String(error)}`);
  }

  // Normalize model quirks before Zod validation
  if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
    normalizeDeltaBeforeValidation(parsed as Record<string, unknown>);
  }

  try {
    return {
      postSettlement: extract("POST_SETTLEMENT"),
      runtimeStateDelta: RuntimeStateDeltaSchema.parse(parsed),
    };
  } catch (error) {
    throw new Error(`runtime state delta failed schema validation: ${String(error)}`);
  }
}

function stripCodeFence(value: string): string {
  const trimmed = value.trim();
  // Try standard code fence (with or without trailing text)
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```/i);
  if (fenced?.[1]) return fenced[1].trim();
  // Fallback: if content starts with ``` but closing fence is malformed,
  // try to extract just the JSON object
  if (/^```(?:json)?\s*\{/i.test(trimmed)) {
    const jsonStart = trimmed.indexOf("{");
    const jsonEnd = trimmed.lastIndexOf("}");
    if (jsonStart >= 0 && jsonEnd > jsonStart) {
      return trimmed.slice(jsonStart, jsonEnd + 1);
    }
  }
  return trimmed;
}
