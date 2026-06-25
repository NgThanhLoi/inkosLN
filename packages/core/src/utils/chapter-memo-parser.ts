import YAML from "js-yaml";
import { ChapterMemoSchema, type ChapterMemo } from "../models/input-governance.js";

export class PlannerParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PlannerParseError";
  }
}

// Phase hotfix 4: each required section is a (zh, en) heading pair.
// The English headings come from PLANNER_MEMO_SYSTEM_PROMPT_EN — we accept
// EITHER language at parse time so the same parser works for both.
//
// Phase hotfix 7: minContentChars enforces non-emptiness per section so
// "all 7 headings + blank payload" no longer slips through. The "do not"
// section uses a relaxed threshold because "无 / N/A / none." is legitimate
// for chapters with no extra prohibitions.
//
// Threshold rationale:
// - 20 chars: long enough to catch obvious empty sections (whitespace,
//   "(略)", "TODO") but short enough to accept genuinely sparse memos for
//   breath/transition chapters (Phase 6 sparse-memo principle).
// - 1 char for "## 不要做" / "## Do not" because "无" / "N/A" / "none" /
//   "—" are all legitimate for a chapter with no extra prohibitions; we
//   only need to ensure the section is not whitespace-only.
interface RequiredSection {
  readonly zh: string;
  readonly en: string;
  readonly vi: string;
  /** Fuzzy keywords for Vietnamese headings (models may paraphrase) */
  readonly viFuzzy: ReadonlyArray<string>;
  readonly minContentChars: number;
}

const REQUIRED_SECTIONS: ReadonlyArray<RequiredSection> = [
  { zh: "## 当前任务", en: "## Current task", vi: "## Nhiệm vụ hiện tại", viFuzzy: ["nhiệm vụ", "nhiem vu"], minContentChars: 20 },
  { zh: "## 读者此刻在等什么", en: "## What the reader is waiting for right now", vi: "## Độc giả đang chờ gì lúc này", viFuzzy: ["độc giả", "đoc gia", "đang chờ"], minContentChars: 20 },
  { zh: "## 该兑现的 / 暂不掀的", en: "## To pay off / to keep buried", vi: "##兑现 / Giữ kín", viFuzzy: ["兑现", "giữ kín", "giu kin", "pay off"], minContentChars: 20 },
  { zh: "## 日常/过渡承担什么任务", en: "## What the slow / transitional beats carry", vi: "## Chương chậm/chuyển tiếp gánh gì", viFuzzy: ["chuyển tiếp", "chuyen tiep", "transitional"], minContentChars: 20 },
  { zh: "## 关键抉择过三连问", en: "## Three-question check on the key choice", vi: "## Kiểm tra ba câu cho lựa chọn then chốt", viFuzzy: ["ba câu", "lựa chọn", "lua chon", "three-question"], minContentChars: 20 },
  { zh: "## 章尾必须发生的改变", en: "## Required end-of-chapter change", vi: "## Thay đổi bắt buộc cuối chương", viFuzzy: ["cuối chương", "cuoi chuong", "end-of-chapter", "thay đổi"], minContentChars: 20 },
  { zh: "## 本章 hook 账", en: "## Hook ledger for this chapter", vi: "## Sổ hook chương này", viFuzzy: ["sổ hook", "so hook", "hook ledger", "hook 账"], minContentChars: 20 },
  { zh: "## 不要做", en: "## Do not", vi: "## Không được làm", viFuzzy: ["không được", "khong duoc", "do not"], minContentChars: 1 },
];

/**
 * Extract the content between `heading` and the next `## ...` heading (or
 * end-of-body). Strips whitespace and returns "" if the section payload is
 * absent. The heading itself is NOT included.
 */
function extractSectionContent(body: string, heading: string): string {
  const startIndex = body.indexOf(heading);
  if (startIndex < 0) return "";
  const after = body.slice(startIndex + heading.length);
  // Find the next H2 heading on its own line. The leading newline + ## guards
  // against false matches inside the current section's prose.
  const nextHeadingMatch = after.match(/\n##\s/);
  const sectionRaw = nextHeadingMatch
    ? after.slice(0, nextHeadingMatch.index)
    : after;
  return sectionRaw.replace(/\s+/g, " ").trim();
}

/**
 * Find the actual heading used in the body for a required section.
 * Checks exact matches first (zh, en, vi), then falls back to fuzzy matching
 * by scanning for ## headings that contain any of the viFuzzy keywords.
 */
function findMatchingHeading(
  body: string,
  section: RequiredSection,
): string | undefined {
  if (body.includes(section.zh)) return section.zh;
  if (body.includes(section.en)) return section.en;
  if (body.includes(section.vi)) return section.vi;
  return findFuzzyHeading(body, section.viFuzzy);
}

/**
 * Scan ## headings in the body for any that contain a fuzzy keyword.
 * Returns the full heading string if found, undefined otherwise.
 */
function findFuzzyHeading(
  body: string,
  fuzzyKeywords: ReadonlyArray<string>,
): string | undefined {
  const headingRegex = /(##[^\n]+)/g;
  let match: RegExpExecArray | null;
  while ((match = headingRegex.exec(body)) !== null) {
    const headingLower = match[1].toLowerCase();
    for (const kw of fuzzyKeywords) {
      if (headingLower.includes(kw.toLowerCase())) {
        return match[1];
      }
    }
  }
  return undefined;
}

/**
 * Parse a planner memo produced by the LLM.
 *
 * Format: YAML frontmatter delimited by `---\n...\n---\n` followed by a
 * markdown body containing the seven required section headings.
 *
 * Strict on core fields (chapter integer + matches expected, goal non-empty
 * and ≤ 50 chars, required section headings present). Lenient on aux fields
 * (threadRefs coerced to string[], defaults to []).
 *
 * `isGoldenOpening` is authoritative from the caller — any value the LLM
 * includes in the frontmatter is ignored.
 */
export function parseMemo(
  raw: string,
  expectedChapter: number,
  isGoldenOpening: boolean,
): ChapterMemo {
  const trimmed = raw.trim();
  const match = trimmed.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) {
    throw new PlannerParseError("missing YAML frontmatter delimiters");
  }

  const yamlText = match[1]!;
  const body = match[2]!.trim();

  let fm: unknown;
  try {
    fm = YAML.load(yamlText);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new PlannerParseError(`invalid YAML in frontmatter: ${message}`);
  }
  if (!fm || typeof fm !== "object" || Array.isArray(fm)) {
    throw new PlannerParseError("frontmatter is not an object");
  }
  const f = fm as Record<string, unknown>;

  if (typeof f.chapter !== "number" || !Number.isInteger(f.chapter)) {
    throw new PlannerParseError("chapter must be an integer");
  }
  if (f.chapter !== expectedChapter) {
    throw new PlannerParseError(
      `chapter mismatch: expected ${expectedChapter}, got ${f.chapter}`,
    );
  }

  if (typeof f.goal !== "string" || f.goal.length === 0) {
    throw new PlannerParseError("goal must be a non-empty string");
  }
  if (f.goal.length > 50) {
    throw new PlannerParseError(
      `goal too long: ${f.goal.length} chars (max 50)`,
    );
  }

  const missing = REQUIRED_SECTIONS.filter(
    (section) => {
      if (body.includes(section.zh) || body.includes(section.en) || body.includes(section.vi)) return false;
      // Fuzzy match: scan ## headings for Vietnamese keywords
      return !findFuzzyHeading(body, section.viFuzzy);
    },
  );
  if (missing.length > 0) {
    // Report by zh heading (canonical) so the LLM-feedback loop stays stable.
    throw new PlannerParseError(
      `missing sections: ${missing.map((s) => s.zh).join(", ")}`,
    );
  }

  // Phase hotfix 7: each section's payload must be non-empty (≥ minContentChars).
  // Headings present + blank payload was previously accepted, allowing useless
  // "shell" memos to flow downstream. Threshold differs per section: most need
  // 20 chars (one short sentence) while "## 不要做" / "## Do not" allows 5
  // (e.g. "无", "N/A") since "no extra prohibitions" is a legitimate state.
  const empty = REQUIRED_SECTIONS.filter((section) => {
    const heading = findMatchingHeading(body, section);
    if (!heading) return true; // heading not found at all → empty
    const content = extractSectionContent(body, heading);
    return content.length < section.minContentChars;
  });
  if (empty.length > 0) {
    const detail = empty
      .map((s) => `${s.zh} (need ≥ ${s.minContentChars} chars)`)
      .join(", ");
    throw new PlannerParseError(`empty sections: ${detail}`);
  }

  const threadRefs = Array.isArray(f.threadRefs)
    ? f.threadRefs.filter((value): value is string => typeof value === "string")
    : [];

  return ChapterMemoSchema.parse({
    chapter: f.chapter,
    goal: f.goal,
    isGoldenOpening,
    body,
    threadRefs,
  });
}
