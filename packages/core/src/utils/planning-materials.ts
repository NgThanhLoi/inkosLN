import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import type { StoredHook, StoredSummary } from "../state/memory-db.js";
import {
  parseChapterSummariesMarkdown,
  retrieveMemorySelection,
  type MemorySelection,
} from "./memory-retrieval.js";
import {
  readStoryFrame,
  readVolumeMap,
  readCurrentStateWithFallback,
} from "./outline-paths.js";

export interface PlanningSeedMaterials {
  readonly storyDir: string;
  readonly authorIntent: string;
  readonly currentFocus: string;
  readonly storyBible: string;
  readonly volumeOutline: string;
  readonly bookRulesRaw: string;
  readonly currentState: string;
  readonly chapterSummariesRaw: string;
  readonly brief: string;
  readonly outlineNode?: string;
  readonly recentSummaries: ReadonlyArray<StoredSummary>;
  readonly previousEndingHook?: string;
  readonly previousEndingExcerpt?: string;
}

export interface PlanningMaterials extends PlanningSeedMaterials {
  readonly activeHooks: ReadonlyArray<StoredHook>;
  readonly memorySelection: MemorySelection;
  readonly plannerInputs: ReadonlyArray<string>;
}

async function readFileOrDefault(path: string): Promise<string> {
  try {
    return await readFile(path, "utf-8");
  } catch {
    return "(文件尚未创建)";
  }
}

async function readBriefFile(path: string): Promise<string> {
  try {
    return await readFile(path, "utf-8");
  } catch {
    return "";
  }
}

/**
 * Scan the story/outline/ directory for chapter-brief files and extract
 * the section that matches the given chapter number.
 *
 * Search order:
 *   1. story/brief.md           — whole-file brief (legacy, no per-chapter section)
 *   2. story/outline/*brief*.md — per-chapter briefs (e.g. chapter_briefs_001_010.md)
 *
 * Heading patterns recognised (case-insensitive, optional leading `#`/`##`):
 *   - "# Chương 4 — Title"   /  "## Chương 004"
 *   - "# Chapter 4: Title"    /  "## Chapter 4"
 *   - "# 第 4 章"             /  "## 第004章"
 *
 * Returns the content between the matching heading and the next heading
 * of the same or higher level. Returns "" when nothing matches.
 */
export async function findAndExtractChapterBrief(
  bookDir: string,
  chapterNumber: number,
): Promise<string> {
  const storyDir = join(bookDir, "story");

  // 1. Legacy whole-file brief
  const legacyBrief = await readBriefFile(join(storyDir, "brief.md"));
  if (legacyBrief.trim()) return legacyBrief;

  // 2. Scan outline/ for per-chapter brief files
  const outlineDir = join(storyDir, "outline");
  let entries: string[];
  try {
    entries = await readdir(outlineDir);
  } catch {
    return "";
  }

  const briefFiles = entries
    .filter((f) => f.endsWith(".md") && /brief/i.test(f))
    .sort(); // deterministic order

  for (const fileName of briefFiles) {
    const content = await readBriefFile(join(outlineDir, fileName));
    if (!content.trim()) continue;

    const extracted = extractChapterSection(content, chapterNumber);
    if (extracted) return extracted;
  }

  return "";
}

/**
 * Extract the section for a specific chapter number from a multi-chapter
 * brief document. Supports Vietnamese, English and Chinese headings.
 *
 * Exported for unit testing.
 */
export function extractChapterSection(
  content: string,
  chapterNumber: number,
): string | undefined {
  const lines = content.split("\n");
  const padded = String(chapterNumber).padStart(3, "0");
  const num = String(chapterNumber);

  // Build regex patterns for chapter headings (case-insensitive)
  // Matches: "# Chương 4", "## Chương 004", "# Chapter 4:", "# 第 4 章", etc.
  const chapterPatterns = [
    // Vietnamese: Chương N, Chương NNN
    new RegExp(`^(#{1,3})\\s+ch[uơư]+ng\\s+0*${num}\\b`, "i"),
    // English: Chapter N
    new RegExp(`^(#{1,3})\\s+chapter\\s+0*${num}\\b`, "i"),
    // Chinese: 第 N 章 or 第N章
    new RegExp(`^(#{1,3})\\s+第\\s*0*${num}\\s*章`, "i"),
    // Padded match for files using zero-padded numbers in headings
    new RegExp(`^(#{1,3})\\s+ch[uơư]+ng\\s+${padded}\\b`, "i"),
  ];

  let startLine = -1;
  let startLevel = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!.trim();
    for (const pattern of chapterPatterns) {
      const match = line.match(pattern);
      if (match) {
        startLine = i;
        startLevel = match[1]!.length;
        break;
      }
    }
    if (startLine >= 0) break;
  }

  if (startLine < 0) return undefined;

  // Collect content until the next heading of same or higher level
  const sectionLines: string[] = [];
  for (let i = startLine + 1; i < lines.length; i++) {
    const headingMatch = lines[i]!.match(/^(#{1,6})\s/);
    if (headingMatch && headingMatch[1]!.length <= startLevel) break;
    sectionLines.push(lines[i]!);
  }

  const section = sectionLines.join("\n").trim();
  return section.length > 0 ? section : undefined;
}

async function readPreviousEndingExcerpt(
  bookDir: string,
  chapterNumber: number,
): Promise<string | undefined> {
  const previousChapter = chapterNumber - 1;
  if (previousChapter < 1) {
    return undefined;
  }

  const chaptersDir = join(bookDir, "chapters");
  const padded = String(previousChapter).padStart(4, "0");
  try {
    const files = await readdir(chaptersDir);
    const match = files.find((file) => file.startsWith(padded) && file.endsWith(".md"));
    if (!match) {
      return undefined;
    }
    const markdown = await readFile(join(chaptersDir, match), "utf-8");
    const body = markdown
      .split("\n")
      .slice(1)
      .join("\n")
      .trim();
    if (!body) {
      return undefined;
    }
    return body.slice(-320).trim();
  } catch {
    return undefined;
  }
}

export async function loadPlanningSeedMaterials(params: {
  readonly bookDir: string;
  readonly chapterNumber: number;
}): Promise<PlanningSeedMaterials> {
  const storyDir = join(params.bookDir, "story");
  const sourcePaths = {
    authorIntent: join(storyDir, "author_intent.md"),
    currentFocus: join(storyDir, "current_focus.md"),
    chapterSummaries: join(storyDir, "chapter_summaries.md"),
    bookRules: join(storyDir, "book_rules.md"),
    currentState: join(storyDir, "current_state.md"),
  } as const;

  // Phase 5: prefer the new prose outline files (outline/story_frame.md +
  // outline/volume_map.md). Fall back to the legacy files transparently.
  const placeholder = "(文件尚未创建)";

  const [
    authorIntent,
    currentFocus,
    storyBible,
    volumeOutline,
    chapterSummariesRaw,
    bookRulesRaw,
    currentState,
    previousEndingExcerpt,
    brief,
  ] = await Promise.all([
    readFileOrDefault(sourcePaths.authorIntent),
    readFileOrDefault(sourcePaths.currentFocus),
    readStoryFrame(params.bookDir, placeholder),
    readVolumeMap(params.bookDir, placeholder),
    readFileOrDefault(sourcePaths.chapterSummaries),
    readFileOrDefault(sourcePaths.bookRules),
    // Phase 5 consolidation: derive initial state from roles + pending_hooks
    // seed rows when current_state.md is still just the architect's placeholder.
    readCurrentStateWithFallback(params.bookDir, placeholder),
    readPreviousEndingExcerpt(params.bookDir, params.chapterNumber),
    // Auto-discover per-chapter brief from story/brief.md or story/outline/*brief*.md.
    // Extracts only the section for the current chapter number so the planner
    // receives focused, chapter-specific creative direction.
    findAndExtractChapterBrief(params.bookDir, params.chapterNumber),
  ]);

  const chapterSummaries = parseChapterSummariesMarkdown(chapterSummariesRaw)
    .filter((summary) => summary.chapter < params.chapterNumber)
    .sort((left, right) => right.chapter - left.chapter);

  return {
    storyDir,
    authorIntent,
    currentFocus,
    storyBible,
    volumeOutline,
    bookRulesRaw,
    currentState,
    chapterSummariesRaw,
    brief,
    recentSummaries: chapterSummaries.slice(0, 4).sort((left, right) => left.chapter - right.chapter),
    previousEndingHook: chapterSummaries[0]?.hookActivity || undefined,
    previousEndingExcerpt,
  };
}

export async function gatherPlanningMaterials(params: {
  readonly bookDir: string;
  readonly chapterNumber: number;
  readonly goal: string;
  readonly outlineNode?: string;
  readonly mustKeep?: ReadonlyArray<string>;
  readonly seed?: PlanningSeedMaterials;
}): Promise<PlanningMaterials> {
  const seed = params.seed ?? await loadPlanningSeedMaterials({
    bookDir: params.bookDir,
    chapterNumber: params.chapterNumber,
  });

  const memorySelection = await retrieveMemorySelection({
    bookDir: params.bookDir,
    chapterNumber: params.chapterNumber,
    goal: params.goal,
    outlineNode: params.outlineNode,
    mustKeep: params.mustKeep,
  });

  return {
    ...seed,
    outlineNode: params.outlineNode,
    activeHooks: memorySelection.activeHooks,
    memorySelection,
    plannerInputs: [
      join(seed.storyDir, "author_intent.md"),
      join(seed.storyDir, "current_focus.md"),
      join(seed.storyDir, "outline", "story_frame.md"),
      join(seed.storyDir, "outline", "volume_map.md"),
      join(seed.storyDir, "chapter_summaries.md"),
      join(seed.storyDir, "book_rules.md"),
      join(seed.storyDir, "current_state.md"),
      join(seed.storyDir, "pending_hooks.md"),
      ...(memorySelection.dbPath ? [memorySelection.dbPath] : []),
    ],
  };
}
