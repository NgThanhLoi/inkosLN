# RIS Lite MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build RIS Lite MVP for source-grounded canon/fact retrieval, including Brave discovery and YouTube/Bilibili transcript import as optional source acquisition for Thiên Mạc/Fanfic workflows.

**Architecture:** Keep RIS core offline-first. Source acquisition creates `research/sources/*` and metadata, extraction turns sources into fact cards, retrieval renders a compact Research Context, and pipeline hooks inject that context into planner/writer/auditor. Brave/transcript providers are best-effort and never run automatically during `write next`.

**Tech Stack:** TypeScript, Node `fs/promises`, Zod, Vitest, Commander, existing InkOS core/CLI packages. No vector DB, no embeddings, no OCR/audio transcription in MVP.

---

## Source Specs

Read these before implementation:

- `docs/research-info-system-roadmap.md`, especially sections `3.1` through `3.21`.
- `packages/core/genres/heavenscreen.md` for Thiên Mạc-specific card/reaction requirements.
- Existing command pattern: `packages/cli/src/commands/genre.ts`.
- Existing program registration: `packages/cli/src/program.ts`.
- Existing core exports: `packages/core/src/index.ts`.
- Existing agent base: `packages/core/src/agents/base.ts`.

## File Structure

Create these core files:

- `packages/core/src/models/research.ts`: all Zod schemas and exported types for RIS.
- `packages/core/src/research/research-paths.ts`: safe path helpers for `books/<bookId>/research`.
- `packages/core/src/research/research-store.ts`: folder creation, source metadata, source import, JSONL fact card read/write.
- `packages/core/src/research/source-acquisition.ts`: provider interfaces and source classification helpers.
- `packages/core/src/research/brave-discovery.ts`: Brave discovery wrapper using injectable search function.
- `packages/core/src/research/brave-api.ts`: real Brave Web Search API client using `BRAVE_API_KEY`.
- `packages/core/src/research/video-transcript.ts`: best-effort transcript provider interfaces and default unavailable provider.
- `packages/core/src/research/external-transcript-provider.ts`: real optional transcript tool wrapper using `yt-dlp` or `INKOS_TRANSCRIPT_COMMAND`.
- `packages/core/src/research/source-importer.ts`: converts discovery/transcript/manual URL into source files and metadata.
- `packages/core/src/research/research-retrieval.ts`: keyword/entity/tag scoring and context renderer.
- `packages/core/src/agents/researcher.ts`: LLM extractor from source text to JSONL-compatible fact cards.

Create these CLI files:

- `packages/cli/src/commands/research.ts`: `inkos research` command with `init`, `import`, `discover`, `fetch-transcripts`, `import-video`, `extract`, `query`, `pack`, `check`.

Modify these existing files:

- `packages/core/src/index.ts`: export RIS models/helpers/agent.
- `packages/cli/src/program.ts`: register `researchCommand`.
- `packages/core/src/pipeline/runner.ts`: retrieve research context before planner/writer/auditor.
- `packages/core/src/agents/planner.ts`: add optional `researchContext` input and prompt section.
- `packages/core/src/agents/writer.ts`: add optional `researchContext` input and prompt section.
- `packages/core/src/agents/continuity.ts`: include research context and unsupported-claim audit instruction.
- `packages/core/src/models/project.ts`: allow `researcher` model override if override schema is currently restrictive.
- `packages/cli/src/commands/config.ts`: include `researcher`, `planner`, `state-validator`, `foundation-reviewer`, and short-fiction keys if CLI whitelist is still restrictive.

Create tests:

- `packages/core/src/__tests__/research-models.test.ts`
- `packages/core/src/__tests__/research-store.test.ts`
- `packages/core/src/__tests__/source-acquisition.test.ts`
- `packages/core/src/__tests__/research-retrieval.test.ts`
- `packages/core/src/__tests__/researcher.test.ts`
- `packages/core/src/__tests__/pipeline-research-context.test.ts`
- `packages/cli/src/__tests__/research-command.test.ts`

---

### Task 1: Research Schemas

**Files:**
- Create: `packages/core/src/models/research.ts`
- Test: `packages/core/src/__tests__/research-models.test.ts`
- Modify: `packages/core/src/index.ts`

- [ ] **Step 1: Write failing schema tests**

Create `packages/core/src/__tests__/research-models.test.ts`:

```ts
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
```

- [ ] **Step 2: Run the schema tests to verify they fail**

Run: `pnpm --filter @actalk/inkos-core test -- research-models.test.ts`

Expected: FAIL because `../models/research.js` does not exist.

- [ ] **Step 3: Implement research schemas**

Create `packages/core/src/models/research.ts`:

```ts
import { z } from "zod";

export const ResearchConfidenceSchema = z.enum([
  "canon",
  "official",
  "fanon",
  "commentary",
  "speculative",
  "unknown",
]);
export type ResearchConfidence = z.infer<typeof ResearchConfidenceSchema>;

export const ResearchFactTypeSchema = z.enum([
  "canon_event",
  "character_trait",
  "power_rule",
  "relationship",
  "location",
  "item",
  "timeline",
  "real_world_fact",
  "commentary",
  "behind_the_scenes",
  "video_candidate",
  "video_segment",
  "secret",
  "reaction_matrix",
  "spoiler_budget",
  "spoiler_budget_hint",
]);
export type ResearchFactType = z.infer<typeof ResearchFactTypeSchema>;

export const ResearchTimelineSchema = z.object({
  arc: z.string().min(1).optional(),
  order: z.number().finite().optional(),
});
export type ResearchTimeline = z.infer<typeof ResearchTimelineSchema>;

export const ResearchFactCardSchema = z.object({
  id: z.string().min(1),
  type: ResearchFactTypeSchema,
  confidence: ResearchConfidenceSchema,
  statement: z.string().min(1),
  sourceId: z.string().min(1),
  sourceRef: z.string().min(1),
  entities: z.array(z.string().min(1)),
  tags: z.array(z.string().min(1)),
  allowedUse: z.string().min(1).optional(),
  forbiddenUse: z.string().min(1).optional(),
  notes: z.string().min(1).optional(),
  timeline: ResearchTimelineSchema.optional(),
});
export type ResearchFactCard = z.infer<typeof ResearchFactCardSchema>;

export const ResearchSourceTypeSchema = z.enum([
  "manual_note",
  "web_page",
  "video_transcript",
  "video_metadata",
  "canon_doc",
]);
export type ResearchSourceType = z.infer<typeof ResearchSourceTypeSchema>;

export const ResearchPlatformSchema = z.enum([
  "manual",
  "youtube",
  "bilibili",
  "official",
  "wiki",
  "article",
  "forum",
  "unknown",
]);
export type ResearchPlatform = z.infer<typeof ResearchPlatformSchema>;

export const TranscriptStatusSchema = z.enum(["available", "unavailable", "failed"]);
export type TranscriptStatus = z.infer<typeof TranscriptStatusSchema>;

export const TranscriptKindSchema = z.enum([
  "official_caption",
  "auto_caption",
  "manual_transcript",
  "metadata_only",
]);
export type TranscriptKind = z.infer<typeof TranscriptKindSchema>;

export const SourceConfidenceSchema = z.enum([
  "source_only",
  "trusted",
  "unverified",
]);
export type SourceConfidence = z.infer<typeof SourceConfidenceSchema>;

export const ResearchSourceMetaSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  path: z.string().min(1),
  sourceType: ResearchSourceTypeSchema,
  platform: ResearchPlatformSchema.default("manual"),
  url: z.string().url().optional(),
  channel: z.string().min(1).optional(),
  language: z.string().min(1).optional(),
  transcriptKind: TranscriptKindSchema.optional(),
  transcriptStatus: TranscriptStatusSchema.optional(),
  discoveredBy: z.enum(["brave", "manual", "import"]).optional(),
  confidence: SourceConfidenceSchema.default("source_only"),
  createdAt: z.string().datetime(),
});
export type ResearchSourceMeta = z.infer<typeof ResearchSourceMetaSchema>;

export const ResearchSourceMetaListSchema = z.array(ResearchSourceMetaSchema);
export type ResearchSourceMetaList = z.infer<typeof ResearchSourceMetaListSchema>;

export const ResearchSourceKindSchema = z.enum([
  "youtube_video",
  "bilibili_video",
  "wiki_or_official_page",
  "article",
  "forum_or_commentary",
  "unknown",
]);
export type ResearchSourceKind = z.infer<typeof ResearchSourceKindSchema>;

export const ResearchDiscoverySchema = z.object({
  id: z.string().min(1),
  query: z.string().min(1),
  title: z.string().min(1),
  url: z.string().url(),
  platform: ResearchPlatformSchema,
  sourceKind: ResearchSourceKindSchema,
  snippet: z.string().default(""),
  rank: z.number().int().positive(),
  selected: z.boolean().default(true),
  discoveredAt: z.string().datetime(),
});
export type ResearchDiscovery = z.infer<typeof ResearchDiscoverySchema>;

export const ResearchDiscoveryListSchema = z.array(ResearchDiscoverySchema);
export type ResearchDiscoveryList = z.infer<typeof ResearchDiscoveryListSchema>;

export const TranscriptResultSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("available"),
    platform: ResearchPlatformSchema,
    url: z.string().url(),
    title: z.string().min(1).optional(),
    channel: z.string().min(1).optional(),
    language: z.string().min(1).optional(),
    transcriptKind: TranscriptKindSchema,
    text: z.string().min(1),
  }),
  z.object({
    status: z.literal("unavailable"),
    platform: ResearchPlatformSchema,
    url: z.string().url(),
    title: z.string().min(1).optional(),
    channel: z.string().min(1).optional(),
    reason: z.string().min(1),
  }),
  z.object({
    status: z.literal("failed"),
    platform: ResearchPlatformSchema,
    url: z.string().url(),
    reason: z.string().min(1),
    retryable: z.boolean().default(true),
  }),
]);
export type TranscriptResult = z.infer<typeof TranscriptResultSchema>;

export const ResearchQueryResultSchema = z.object({
  card: ResearchFactCardSchema,
  score: z.number(),
  reasons: z.array(z.string()),
});
export type ResearchQueryResult = z.infer<typeof ResearchQueryResultSchema>;
```

- [ ] **Step 4: Export research schemas**

Modify `packages/core/src/index.ts` near the other model exports:

```ts
export {
  ResearchConfidenceSchema,
  ResearchDiscoveryListSchema,
  ResearchDiscoverySchema,
  ResearchFactCardSchema,
  ResearchFactTypeSchema,
  ResearchPlatformSchema,
  ResearchQueryResultSchema,
  ResearchSourceKindSchema,
  ResearchSourceMetaListSchema,
  ResearchSourceMetaSchema,
  ResearchSourceTypeSchema,
  SourceConfidenceSchema,
  TranscriptKindSchema,
  TranscriptResultSchema,
  TranscriptStatusSchema,
  type ResearchConfidence,
  type ResearchDiscovery,
  type ResearchDiscoveryList,
  type ResearchFactCard,
  type ResearchFactType,
  type ResearchPlatform,
  type ResearchQueryResult,
  type ResearchSourceKind,
  type ResearchSourceMeta,
  type ResearchSourceMetaList,
  type ResearchSourceType,
  type SourceConfidence,
  type TranscriptKind,
  type TranscriptResult,
  type TranscriptStatus,
} from "./models/research.js";
```

- [ ] **Step 5: Run tests**

Run: `pnpm --filter @actalk/inkos-core test -- research-models.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

Run only if the user explicitly asked for commits:

```bash
git add packages/core/src/models/research.ts packages/core/src/__tests__/research-models.test.ts packages/core/src/index.ts
git commit -m "feat(core): add RIS schemas"
```

---

### Task 2: Research Paths and Store

**Files:**
- Create: `packages/core/src/research/research-paths.ts`
- Create: `packages/core/src/research/research-store.ts`
- Test: `packages/core/src/__tests__/research-store.test.ts`
- Modify: `packages/core/src/index.ts`

- [ ] **Step 1: Write failing store tests**

Create `packages/core/src/__tests__/research-store.test.ts`:

```ts
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  appendResearchFactCards,
  ensureResearchWorkspace,
  importResearchSourceFile,
  listResearchSources,
  readResearchFactCards,
} from "../research/research-store.js";

let root: string;

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), "inkos-ris-"));
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

describe("research store", () => {
  it("creates the research workspace", async () => {
    const paths = await ensureResearchWorkspace(root, "demo-book");
    expect(paths.researchDir.endsWith(join("books", "demo-book", "research"))).toBe(true);
    expect(await readFile(paths.readmePath, "utf-8")).toContain("Research workspace");
  });

  it("imports a source file and writes metadata", async () => {
    const sourcePath = join(root, "note.md");
    await writeFile(sourcePath, "# Canon Note\nKiana knows Himeko.", "utf-8");

    const result = await importResearchSourceFile(root, "demo-book", sourcePath, {
      title: "Canon Note",
      sourceType: "manual_note",
      platform: "manual",
    });

    expect(result.meta.id).toBe("source_0001");
    expect(result.meta.path).toBe("sources/source_0001.md");
    expect(await readFile(result.absolutePath, "utf-8")).toContain("Kiana knows Himeko");

    const sources = await listResearchSources(root, "demo-book");
    expect(sources).toHaveLength(1);
    expect(sources[0]!.title).toBe("Canon Note");
  });

  it("appends and reads fact cards as JSONL", async () => {
    await ensureResearchWorkspace(root, "demo-book");
    await appendResearchFactCards(root, "demo-book", [{
      id: "fact_001",
      type: "canon_event",
      confidence: "canon",
      statement: "Himeko protects Kiana.",
      sourceId: "source_0001",
      sourceRef: "Canon Note",
      entities: ["Himeko", "Kiana"],
      tags: ["protection"],
    }]);

    const cards = await readResearchFactCards(root, "demo-book");
    expect(cards).toHaveLength(1);
    expect(cards[0]!.id).toBe("fact_001");
  });
});
```

- [ ] **Step 2: Run store tests to verify they fail**

Run: `pnpm --filter @actalk/inkos-core test -- research-store.test.ts`

Expected: FAIL because `research-store.js` does not exist.

- [ ] **Step 3: Implement research path helpers**

Create `packages/core/src/research/research-paths.ts`:

```ts
import { join } from "node:path";
import { assertSafeBookId } from "../utils/book-id.js";
import { safeChildPath } from "../utils/path-safety.js";

export interface ResearchPaths {
  readonly bookDir: string;
  readonly researchDir: string;
  readonly sourcesDir: string;
  readonly cardsDir: string;
  readonly packsDir: string;
  readonly discoveriesDir: string;
  readonly readmePath: string;
  readonly sourcesMetaPath: string;
  readonly factCardsPath: string;
  readonly revealedPath: string;
  readonly usedVideosPath: string;
  readonly relationshipChangesPath: string;
}

export function resolveResearchPaths(projectRoot: string, bookId: string): ResearchPaths {
  assertSafeBookId(bookId);
  const bookDir = safeChildPath(projectRoot, join("books", bookId));
  const researchDir = safeChildPath(bookDir, "research");
  return {
    bookDir,
    researchDir,
    sourcesDir: safeChildPath(researchDir, "sources"),
    cardsDir: safeChildPath(researchDir, "cards"),
    packsDir: safeChildPath(researchDir, "packs"),
    discoveriesDir: safeChildPath(researchDir, "discoveries"),
    readmePath: safeChildPath(researchDir, "README.md"),
    sourcesMetaPath: safeChildPath(researchDir, "sources.json"),
    factCardsPath: safeChildPath(researchDir, "fact_cards.jsonl"),
    revealedPath: safeChildPath(researchDir, "revealed.md"),
    usedVideosPath: safeChildPath(researchDir, "used_videos.md"),
    relationshipChangesPath: safeChildPath(researchDir, "relationship_changes.md"),
  };
}
```

- [ ] **Step 4: Implement research store**

Create `packages/core/src/research/research-store.ts`:

```ts
import { mkdir, readFile, writeFile, copyFile, appendFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import {
  ResearchFactCardSchema,
  ResearchSourceMetaListSchema,
  type ResearchFactCard,
  type ResearchSourceMeta,
  type ResearchSourceType,
  type ResearchPlatform,
} from "../models/research.js";
import { resolveResearchPaths } from "./research-paths.js";

export interface ImportResearchSourceOptions {
  readonly title: string;
  readonly sourceType: ResearchSourceType;
  readonly platform?: ResearchPlatform;
  readonly url?: string;
  readonly channel?: string;
  readonly language?: string;
  readonly transcriptKind?: ResearchSourceMeta["transcriptKind"];
  readonly transcriptStatus?: ResearchSourceMeta["transcriptStatus"];
  readonly discoveredBy?: ResearchSourceMeta["discoveredBy"];
}

export interface ImportedResearchSource {
  readonly meta: ResearchSourceMeta;
  readonly absolutePath: string;
}

const RESEARCH_README = `# Research workspace\n\nStore canon/fact/source material for RIS Lite.\n`;

async function readJsonFile<T>(path: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await readFile(path, "utf-8")) as T;
  } catch {
    return fallback;
  }
}

async function writeJsonFile(path: string, value: unknown): Promise<void> {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, "utf-8");
}

async function ensureTextFile(path: string, initialContent: string): Promise<void> {
  try {
    await readFile(path, "utf-8");
  } catch {
    await writeFile(path, initialContent, "utf-8");
  }
}

function nextSourceId(sources: readonly ResearchSourceMeta[]): string {
  const max = sources.reduce((acc, source) => {
    const match = /^source_(\d+)$/.exec(source.id);
    return match ? Math.max(acc, Number(match[1])) : acc;
  }, 0);
  return `source_${String(max + 1).padStart(4, "0")}`;
}

export async function ensureResearchWorkspace(projectRoot: string, bookId: string) {
  const paths = resolveResearchPaths(projectRoot, bookId);
  await mkdir(paths.sourcesDir, { recursive: true });
  await mkdir(paths.cardsDir, { recursive: true });
  await mkdir(paths.packsDir, { recursive: true });
  await mkdir(paths.discoveriesDir, { recursive: true });
  await ensureTextFile(paths.readmePath, RESEARCH_README);
  await ensureTextFile(paths.factCardsPath, "");
  await ensureTextFile(paths.revealedPath, "# Revealed Secrets\n");
  await ensureTextFile(paths.usedVideosPath, "# Used Videos\n");
  await ensureTextFile(paths.relationshipChangesPath, "# Relationship Changes\n");
  const existingSources = await readJsonFile<unknown>(paths.sourcesMetaPath, []);
  const parsed = ResearchSourceMetaListSchema.safeParse(existingSources);
  if (!parsed.success) {
    await writeJsonFile(paths.sourcesMetaPath, []);
  }
  return paths;
}

export async function listResearchSources(projectRoot: string, bookId: string): Promise<ResearchSourceMeta[]> {
  const paths = await ensureResearchWorkspace(projectRoot, bookId);
  const raw = await readJsonFile<unknown>(paths.sourcesMetaPath, []);
  return ResearchSourceMetaListSchema.parse(raw);
}

export async function saveResearchSources(projectRoot: string, bookId: string, sources: readonly ResearchSourceMeta[]): Promise<void> {
  const paths = await ensureResearchWorkspace(projectRoot, bookId);
  await writeJsonFile(paths.sourcesMetaPath, ResearchSourceMetaListSchema.parse(sources));
}

export async function importResearchSourceFile(
  projectRoot: string,
  bookId: string,
  fromPath: string,
  options: ImportResearchSourceOptions,
): Promise<ImportedResearchSource> {
  const paths = await ensureResearchWorkspace(projectRoot, bookId);
  const sources = await listResearchSources(projectRoot, bookId);
  const id = nextSourceId(sources);
  const extension = extname(fromPath) || ".md";
  const targetName = `${id}${extension}`;
  const targetPath = join(paths.sourcesDir, targetName);
  await copyFile(fromPath, targetPath);

  const meta: ResearchSourceMeta = {
    id,
    title: options.title || basename(fromPath),
    path: `sources/${targetName}`,
    sourceType: options.sourceType,
    platform: options.platform ?? "manual",
    url: options.url,
    channel: options.channel,
    language: options.language,
    transcriptKind: options.transcriptKind,
    transcriptStatus: options.transcriptStatus,
    discoveredBy: options.discoveredBy,
    confidence: "source_only",
    createdAt: new Date().toISOString(),
  };
  await saveResearchSources(projectRoot, bookId, [...sources, meta]);
  return { meta, absolutePath: targetPath };
}

export async function writeResearchSourceText(
  projectRoot: string,
  bookId: string,
  fileSuffix: string,
  text: string,
  options: ImportResearchSourceOptions,
): Promise<ImportedResearchSource> {
  const paths = await ensureResearchWorkspace(projectRoot, bookId);
  const sources = await listResearchSources(projectRoot, bookId);
  const id = nextSourceId(sources);
  const safeSuffix = fileSuffix.replace(/[^a-z0-9._-]/gi, "-") || "source.md";
  const targetName = `${id}.${safeSuffix}`;
  const targetPath = join(paths.sourcesDir, targetName);
  await writeFile(targetPath, text.endsWith("\n") ? text : `${text}\n`, "utf-8");
  const meta: ResearchSourceMeta = {
    id,
    title: options.title,
    path: `sources/${targetName}`,
    sourceType: options.sourceType,
    platform: options.platform ?? "manual",
    url: options.url,
    channel: options.channel,
    language: options.language,
    transcriptKind: options.transcriptKind,
    transcriptStatus: options.transcriptStatus,
    discoveredBy: options.discoveredBy,
    confidence: "source_only",
    createdAt: new Date().toISOString(),
  };
  await saveResearchSources(projectRoot, bookId, [...sources, meta]);
  return { meta, absolutePath: targetPath };
}

export async function appendResearchFactCards(projectRoot: string, bookId: string, cards: readonly ResearchFactCard[]): Promise<void> {
  const paths = await ensureResearchWorkspace(projectRoot, bookId);
  const lines = cards.map((card) => JSON.stringify(ResearchFactCardSchema.parse(card))).join("\n");
  if (lines.length > 0) {
    await appendFile(paths.factCardsPath, `${lines}\n`, "utf-8");
  }
}

export async function readResearchFactCards(projectRoot: string, bookId: string): Promise<ResearchFactCard[]> {
  const paths = await ensureResearchWorkspace(projectRoot, bookId);
  const raw = await readFile(paths.factCardsPath, "utf-8");
  return raw.split(/\r?\n/).filter(Boolean).map((line) => ResearchFactCardSchema.parse(JSON.parse(line)));
}
```

- [ ] **Step 5: Export store helpers**

Modify `packages/core/src/index.ts`:

```ts
export { resolveResearchPaths, type ResearchPaths } from "./research/research-paths.js";
export {
  appendResearchFactCards,
  ensureResearchWorkspace,
  importResearchSourceFile,
  listResearchSources,
  readResearchFactCards,
  saveResearchSources,
  writeResearchSourceText,
  type ImportResearchSourceOptions,
  type ImportedResearchSource,
} from "./research/research-store.js";
```

- [ ] **Step 6: Run store tests**

Run: `pnpm --filter @actalk/inkos-core test -- research-store.test.ts`

Expected: PASS.

---

### Task 3: Source Acquisition Interfaces, Brave Discovery, and Transcript Import

**Files:**
- Create: `packages/core/src/research/source-acquisition.ts`
- Create: `packages/core/src/research/brave-discovery.ts`
- Create: `packages/core/src/research/video-transcript.ts`
- Create: `packages/core/src/research/source-importer.ts`
- Test: `packages/core/src/__tests__/source-acquisition.test.ts`
- Modify: `packages/core/src/index.ts`

- [ ] **Step 1: Write failing source acquisition tests**

Create `packages/core/src/__tests__/source-acquisition.test.ts`:

```ts
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { discoverWithBrave } from "../research/brave-discovery.js";
import { classifyResearchUrl } from "../research/source-acquisition.js";
import { importVideoTranscriptResult } from "../research/source-importer.js";

let root: string;

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), "inkos-ris-acq-"));
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

describe("source acquisition", () => {
  it("classifies YouTube and Bilibili URLs", () => {
    expect(classifyResearchUrl("https://www.youtube.com/watch?v=abc")).toEqual({ platform: "youtube", sourceKind: "youtube_video" });
    expect(classifyResearchUrl("https://youtu.be/abc")).toEqual({ platform: "youtube", sourceKind: "youtube_video" });
    expect(classifyResearchUrl("https://www.bilibili.com/video/BV123")).toEqual({ platform: "bilibili", sourceKind: "bilibili_video" });
  });

  it("stores Brave discovery records", async () => {
    const result = await discoverWithBrave(root, "demo-book", {
      query: "Genshin streamer 天幕",
      limit: 2,
      search: async () => [
        { title: "Video A", url: "https://www.youtube.com/watch?v=a", snippet: "A" },
        { title: "Article B", url: "https://example.com/article", snippet: "B" },
      ],
      now: () => "2026-06-04T00:00:00.000Z",
    });

    expect(result.discoveries).toHaveLength(2);
    expect(result.discoveries[0]!.sourceKind).toBe("youtube_video");
    expect(await readFile(result.latestPath, "utf-8")).toContain("Genshin streamer");
  });

  it("imports available transcript result as a source", async () => {
    const imported = await importVideoTranscriptResult(root, "demo-book", {
      status: "available",
      platform: "youtube",
      url: "https://www.youtube.com/watch?v=a",
      title: "Video A",
      channel: "Channel A",
      language: "zh",
      transcriptKind: "official_caption",
      text: "Line one\nLine two",
    }, "brave");

    expect(imported.meta.sourceType).toBe("video_transcript");
    expect(imported.meta.transcriptStatus).toBe("available");
    expect(await readFile(imported.absolutePath, "utf-8")).toContain("Line one");
  });

  it("imports unavailable transcript as metadata-only source", async () => {
    const imported = await importVideoTranscriptResult(root, "demo-book", {
      status: "unavailable",
      platform: "bilibili",
      url: "https://www.bilibili.com/video/BV123",
      title: "Video B",
      reason: "No subtitles found",
    }, "brave");

    expect(imported.meta.sourceType).toBe("video_metadata");
    expect(imported.meta.transcriptStatus).toBe("unavailable");
    expect(await readFile(imported.absolutePath, "utf-8")).toContain("No subtitles found");
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `pnpm --filter @actalk/inkos-core test -- source-acquisition.test.ts`

Expected: FAIL because source acquisition files do not exist.

- [ ] **Step 3: Implement source acquisition types and classifier**

Create `packages/core/src/research/source-acquisition.ts`:

```ts
import type {
  ResearchDiscovery,
  ResearchPlatform,
  ResearchSourceKind,
  TranscriptResult,
} from "../models/research.js";

export interface SearchResult {
  readonly title: string;
  readonly url: string;
  readonly snippet: string;
}

export type BraveSearchFunction = (query: string, limit: number) => Promise<readonly SearchResult[]>;

export interface BraveDiscoveryOptions {
  readonly query: string;
  readonly limit: number;
  readonly search: BraveSearchFunction;
  readonly now?: () => string;
}

export interface TranscriptProvider {
  fetch(url: string): Promise<TranscriptResult>;
}

export interface ClassifiedResearchUrl {
  readonly platform: ResearchPlatform;
  readonly sourceKind: ResearchSourceKind;
}

export function classifyResearchUrl(url: string): ClassifiedResearchUrl {
  const lower = url.toLowerCase();
  if (lower.includes("youtube.com/watch") || lower.includes("youtu.be/")) {
    return { platform: "youtube", sourceKind: "youtube_video" };
  }
  if (lower.includes("bilibili.com/video/")) {
    return { platform: "bilibili", sourceKind: "bilibili_video" };
  }
  if (lower.includes("wiki") || lower.includes("fandom.com") || lower.includes("hoyolab.com")) {
    return { platform: "wiki", sourceKind: "wiki_or_official_page" };
  }
  if (lower.includes("forum") || lower.includes("reddit.com") || lower.includes("nga.cn")) {
    return { platform: "forum", sourceKind: "forum_or_commentary" };
  }
  return { platform: "article", sourceKind: "article" };
}

export function createDiscoveryRecords(
  query: string,
  results: readonly SearchResult[],
  now: string,
): ResearchDiscovery[] {
  return results.map((result, index) => {
    const classified = classifyResearchUrl(result.url);
    return {
      id: `discovery_${String(index + 1).padStart(4, "0")}`,
      query,
      title: result.title,
      url: result.url,
      platform: classified.platform,
      sourceKind: classified.sourceKind,
      snippet: result.snippet,
      rank: index + 1,
      selected: true,
      discoveredAt: now,
    };
  });
}
```

- [ ] **Step 4: Implement Brave discovery storage**

Create `packages/core/src/research/brave-discovery.ts`:

```ts
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { ResearchDiscoveryListSchema, type ResearchDiscovery } from "../models/research.js";
import { resolveResearchPaths } from "./research-paths.js";
import { createDiscoveryRecords, type BraveDiscoveryOptions } from "./source-acquisition.js";

export interface BraveDiscoveryResult {
  readonly discoveries: readonly ResearchDiscovery[];
  readonly latestPath: string;
  readonly timestampedPath: string;
}

export async function discoverWithBrave(
  projectRoot: string,
  bookId: string,
  options: BraveDiscoveryOptions,
): Promise<BraveDiscoveryResult> {
  const paths = resolveResearchPaths(projectRoot, bookId);
  await mkdir(paths.discoveriesDir, { recursive: true });
  const now = options.now?.() ?? new Date().toISOString();
  const results = await options.search(options.query, options.limit);
  const discoveries = ResearchDiscoveryListSchema.parse(createDiscoveryRecords(options.query, results, now));
  const safeStamp = now.replace(/[:.]/g, "-");
  const timestampedPath = join(paths.discoveriesDir, `${safeStamp}.json`);
  const latestPath = join(paths.discoveriesDir, "latest.json");
  const payload = `${JSON.stringify(discoveries, null, 2)}\n`;
  await writeFile(timestampedPath, payload, "utf-8");
  await writeFile(latestPath, payload, "utf-8");
  return { discoveries, latestPath, timestampedPath };
}
```

- [ ] **Step 5: Implement deterministic unavailable transcript provider**

Create `packages/core/src/research/video-transcript.ts`:

```ts
import type { TranscriptResult } from "../models/research.js";
import { classifyResearchUrl, type TranscriptProvider } from "./source-acquisition.js";

export class UnavailableTranscriptProvider implements TranscriptProvider {
  async fetch(url: string): Promise<TranscriptResult> {
    const classified = classifyResearchUrl(url);
    return {
      status: "unavailable",
      platform: classified.platform,
      url,
      reason: "No transcript provider configured for this runtime",
    };
  }
}

export function createUnavailableTranscriptProvider(): TranscriptProvider {
  return new UnavailableTranscriptProvider();
}
```

This MVP provider makes tests and CLI deterministic. Real providers are added in Task 4 without changing store/retrieval code.

- [ ] **Step 6: Implement source importer from transcript results**

Create `packages/core/src/research/source-importer.ts`:

```ts
import type { TranscriptResult, ResearchSourceMeta } from "../models/research.js";
import { writeResearchSourceText, type ImportedResearchSource } from "./research-store.js";

function markdownForTranscript(result: TranscriptResult): string {
  if (result.status === "available") {
    return [
      `# ${result.title ?? result.url}`,
      "",
      `Source URL: ${result.url}`,
      `Platform: ${result.platform}`,
      `Transcript kind: ${result.transcriptKind}`,
      result.channel ? `Channel: ${result.channel}` : undefined,
      result.language ? `Language: ${result.language}` : undefined,
      "",
      "## Transcript",
      "",
      result.text,
    ].filter(Boolean).join("\n");
  }
  return [
    `# ${result.title ?? result.url}`,
    "",
    `Source URL: ${result.url}`,
    `Platform: ${result.platform}`,
    `Transcript status: ${result.status}`,
    `Reason: ${result.reason}`,
    "",
    "No transcript text is available. Treat this source as metadata only.",
  ].join("\n");
}

export async function importVideoTranscriptResult(
  projectRoot: string,
  bookId: string,
  result: TranscriptResult,
  discoveredBy: ResearchSourceMeta["discoveredBy"] = "manual",
): Promise<ImportedResearchSource> {
  const title = result.status === "failed" ? result.url : (result.title ?? result.url);
  return writeResearchSourceText(projectRoot, bookId, "video-transcript.md", markdownForTranscript(result), {
    title,
    sourceType: result.status === "available" ? "video_transcript" : "video_metadata",
    platform: result.platform,
    url: result.url,
    channel: result.status === "available" || result.status === "unavailable" ? result.channel : undefined,
    language: result.status === "available" ? result.language : undefined,
    transcriptKind: result.status === "available" ? result.transcriptKind : "metadata_only",
    transcriptStatus: result.status,
    discoveredBy,
  });
}
```

- [ ] **Step 7: Export source acquisition helpers**

Modify `packages/core/src/index.ts`:

```ts
export { discoverWithBrave, type BraveDiscoveryResult } from "./research/brave-discovery.js";
export {
  classifyResearchUrl,
  createDiscoveryRecords,
  type BraveDiscoveryOptions,
  type BraveSearchFunction,
  type ClassifiedResearchUrl,
  type SearchResult,
  type TranscriptProvider,
} from "./research/source-acquisition.js";
export { importVideoTranscriptResult } from "./research/source-importer.js";
export { createUnavailableTranscriptProvider, UnavailableTranscriptProvider } from "./research/video-transcript.js";
```

- [ ] **Step 8: Run source acquisition tests**

Run: `pnpm --filter @actalk/inkos-core test -- source-acquisition.test.ts`

Expected: PASS.

---

### Task 4: Real Brave API and External Transcript Tool Providers

**Files:**
- Create: `packages/core/src/research/brave-api.ts`
- Create: `packages/core/src/research/external-transcript-provider.ts`
- Test: `packages/core/src/__tests__/source-providers.test.ts`
- Modify: `packages/core/src/index.ts`
- Modify later in Task 7: `packages/cli/src/commands/research.ts`

- [ ] **Step 1: Write failing provider tests**

Create `packages/core/src/__tests__/source-providers.test.ts`:

```ts
import { describe, expect, it, vi } from "vitest";
import { createBraveSearchFunction } from "../research/brave-api.js";
import { parseTranscriptCommandOutput } from "../research/external-transcript-provider.js";

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
});
```

- [ ] **Step 2: Run provider tests to verify failure**

Run: `pnpm --filter @actalk/inkos-core test -- source-providers.test.ts`

Expected: FAIL because provider files do not exist.

- [ ] **Step 3: Implement Brave API provider**

Create `packages/core/src/research/brave-api.ts`:

```ts
import type { BraveSearchFunction, SearchResult } from "./source-acquisition.js";

export interface BraveApiOptions {
  readonly apiKey?: string;
  readonly fetchImpl?: typeof fetch;
  readonly endpoint?: string;
}

interface BraveWebResult {
  readonly title?: string;
  readonly url?: string;
  readonly description?: string;
}

interface BraveWebResponse {
  readonly web?: {
    readonly results?: readonly BraveWebResult[];
  };
}

export function createBraveSearchFunction(options: BraveApiOptions = {}): BraveSearchFunction {
  const apiKey = options.apiKey ?? process.env.BRAVE_API_KEY ?? "";
  const fetchImpl = options.fetchImpl ?? fetch;
  const endpoint = options.endpoint ?? "https://api.search.brave.com/res/v1/web/search";
  return async (query: string, limit: number): Promise<readonly SearchResult[]> => {
    if (!apiKey) {
      throw new Error("BRAVE_API_KEY is required for research discovery");
    }
    const url = new URL(endpoint);
    url.searchParams.set("q", query);
    url.searchParams.set("count", String(Math.max(1, Math.min(limit, 20))));
    url.searchParams.set("safesearch", "moderate");
    const response = await fetchImpl(url, {
      headers: {
        Accept: "application/json",
        "X-Subscription-Token": apiKey,
      },
    });
    if (!response.ok) {
      throw new Error(`Brave search failed: HTTP ${response.status}`);
    }
    const data = await response.json() as BraveWebResponse;
    return (data.web?.results ?? [])
      .filter((item): item is Required<Pick<BraveWebResult, "title" | "url">> & BraveWebResult => Boolean(item.title && item.url))
      .map((item) => ({
        title: item.title,
        url: item.url,
        snippet: item.description ?? "",
      }));
  };
}
```

- [ ] **Step 4: Implement external transcript provider**

Create `packages/core/src/research/external-transcript-provider.ts`:

```ts
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { TranscriptResultSchema, type TranscriptResult } from "../models/research.js";
import { classifyResearchUrl, type TranscriptProvider } from "./source-acquisition.js";

const execFileAsync = promisify(execFile);

export interface ExternalTranscriptProviderOptions {
  readonly command?: string;
  readonly args?: readonly string[];
  readonly timeoutMs?: number;
}

export function parseTranscriptCommandOutput(url: string, stdout: string): TranscriptResult {
  const raw = JSON.parse(stdout) as unknown;
  const parsed = TranscriptResultSchema.parse({
    ...(typeof raw === "object" && raw !== null ? raw : {}),
    url,
  });
  return parsed;
}

export class ExternalTranscriptProvider implements TranscriptProvider {
  private readonly command: string;
  private readonly args: readonly string[];
  private readonly timeoutMs: number;

  constructor(options: ExternalTranscriptProviderOptions = {}) {
    this.command = options.command ?? process.env.INKOS_TRANSCRIPT_COMMAND ?? "";
    this.args = options.args ?? [];
    this.timeoutMs = options.timeoutMs ?? 60_000;
  }

  async fetch(url: string): Promise<TranscriptResult> {
    const classified = classifyResearchUrl(url);
    if (!this.command) {
      return {
        status: "unavailable",
        platform: classified.platform,
        url,
        reason: "INKOS_TRANSCRIPT_COMMAND is not configured",
      };
    }
    try {
      const { stdout } = await execFileAsync(this.command, [...this.args, url], {
        timeout: this.timeoutMs,
        windowsHide: true,
        maxBuffer: 20 * 1024 * 1024,
      });
      return parseTranscriptCommandOutput(url, stdout);
    } catch (error) {
      return {
        status: "failed",
        platform: classified.platform,
        url,
        reason: String(error),
        retryable: true,
      };
    }
  }
}

export function createExternalTranscriptProvider(options: ExternalTranscriptProviderOptions = {}): TranscriptProvider {
  return new ExternalTranscriptProvider(options);
}
```

Expected transcript command contract:

```text
INKOS_TRANSCRIPT_COMMAND <url>
```

The command must print JSON matching `TranscriptResultSchema` without the `url` field; InkOS injects `url`. This allows wrappers around `yt-dlp`, YouTube transcript APIs, Bilibili subtitle scripts, or a local custom tool.

Example wrapper output:

```json
{
  "status": "available",
  "platform": "youtube",
  "title": "Final Lesson",
  "channel": "Honkai Impact 3rd",
  "language": "zh",
  "transcriptKind": "official_caption",
  "text": "..."
}
```

- [ ] **Step 5: Export real providers**

Modify `packages/core/src/index.ts`:

```ts
export { createBraveSearchFunction, type BraveApiOptions } from "./research/brave-api.js";
export {
  createExternalTranscriptProvider,
  ExternalTranscriptProvider,
  parseTranscriptCommandOutput,
  type ExternalTranscriptProviderOptions,
} from "./research/external-transcript-provider.js";
```

- [ ] **Step 6: Run provider tests**

Run: `pnpm --filter @actalk/inkos-core test -- source-providers.test.ts`

Expected: PASS.

---

### Task 5: Research Retrieval and Context Rendering

**Files:**
- Create: `packages/core/src/research/research-retrieval.ts`
- Test: `packages/core/src/__tests__/research-retrieval.test.ts`
- Modify: `packages/core/src/index.ts`

- [ ] **Step 1: Write failing retrieval tests**

Create `packages/core/src/__tests__/research-retrieval.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { renderResearchContext, retrieveResearchCards } from "../research/research-retrieval.js";
import type { ResearchFactCard } from "../models/research.js";

const cards: ResearchFactCard[] = [
  {
    id: "fact_himeko_001",
    type: "canon_event",
    confidence: "canon",
    statement: "Himeko protects Kiana during Final Lesson.",
    sourceId: "source_0001",
    sourceRef: "Chapter 9 notes",
    entities: ["Himeko", "Kiana"],
    tags: ["final_lesson", "sacrifice"],
    forbiddenUse: "Do not claim Himeko survives as canon.",
  },
  {
    id: "fact_random_001",
    type: "commentary",
    confidence: "unknown",
    statement: "A fan says a rescue ending could happen.",
    sourceId: "source_0002",
    sourceRef: "Fan comment",
    entities: ["Himeko"],
    tags: ["fan_theory"],
  },
];

describe("research retrieval", () => {
  it("ranks entity and tag matches above weak commentary", () => {
    const results = retrieveResearchCards(cards, {
      query: "Kiana Himeko final lesson sacrifice",
      maxCards: 2,
    });
    expect(results[0]!.card.id).toBe("fact_himeko_001");
    expect(results[0]!.score).toBeGreaterThan(results[1]!.score);
  });

  it("renders forbidden use in context", () => {
    const context = renderResearchContext(retrieveResearchCards(cards, {
      query: "Kiana Himeko",
      maxCards: 1,
    }));
    expect(context).toContain("## Research Context / Canon Facts");
    expect(context).toContain("Do not claim Himeko survives as canon.");
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `pnpm --filter @actalk/inkos-core test -- research-retrieval.test.ts`

Expected: FAIL because retrieval file does not exist.

- [ ] **Step 3: Implement retrieval**

Create `packages/core/src/research/research-retrieval.ts`:

```ts
import type { ResearchFactCard, ResearchQueryResult } from "../models/research.js";

export interface ResearchQueryInput {
  readonly query: string;
  readonly maxCards?: number;
  readonly recentFactIds?: readonly string[];
}

function tokenize(value: string): string[] {
  return Array.from(new Set(value.toLowerCase().match(/[\p{L}\p{N}_-]+/gu) ?? []));
}

function scoreCard(card: ResearchFactCard, queryTokens: readonly string[], recentFactIds: readonly string[]): ResearchQueryResult {
  let score = 0;
  const reasons: string[] = [];
  const query = new Set(queryTokens);

  for (const entity of card.entities) {
    const entityTokens = tokenize(entity);
    if (entityTokens.some((token) => query.has(token))) {
      score += 5;
      reasons.push(`entity:${entity}`);
    }
  }
  for (const tag of card.tags) {
    if (query.has(tag.toLowerCase())) {
      score += 3;
      reasons.push(`tag:${tag}`);
    }
  }
  for (const token of tokenize(card.statement)) {
    if (query.has(token)) {
      score += 2;
    }
  }
  if (card.timeline?.arc && tokenize(card.timeline.arc).some((token) => query.has(token))) {
    score += 2;
    reasons.push(`arc:${card.timeline.arc}`);
  }
  if (card.confidence === "canon" || card.confidence === "official") {
    score += 1;
    reasons.push(`confidence:${card.confidence}`);
  }
  if (card.confidence === "unknown") {
    score -= 3;
    reasons.push("confidence:unknown");
  }
  if (recentFactIds.includes(card.id)) {
    score -= 2;
    reasons.push("recently-used");
  }
  return { card, score, reasons };
}

export function retrieveResearchCards(cards: readonly ResearchFactCard[], input: ResearchQueryInput): ResearchQueryResult[] {
  const queryTokens = tokenize(input.query);
  const recentFactIds = input.recentFactIds ?? [];
  return cards
    .map((card) => scoreCard(card, queryTokens, recentFactIds))
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score || a.card.id.localeCompare(b.card.id))
    .slice(0, input.maxCards ?? 10);
}

export function renderResearchContext(results: readonly ResearchQueryResult[]): string {
  if (results.length === 0) {
    return "";
  }
  const lines = [
    "## Research Context / Canon Facts",
    "",
    "Use these facts as source-grounded constraints. Do not invent canon beyond them.",
    "",
    "### Fact Cards",
  ];
  results.forEach((result, index) => {
    const card = result.card;
    lines.push(
      `${index + 1}. [${card.type}/${card.confidence}] ${card.statement}`,
      `   Source: ${card.sourceId} / ${card.sourceRef}`,
      `   Entities: ${card.entities.join(", ") || "none"}`,
    );
    if (card.allowedUse) lines.push(`   Allowed: ${card.allowedUse}`);
    if (card.forbiddenUse) lines.push(`   Forbidden: ${card.forbiddenUse}`);
    if (card.notes) lines.push(`   Notes: ${card.notes}`);
    lines.push("");
  });
  lines.push(
    "### Canon Safety Rules",
    "- If a detail is not in these facts, write it as uncertain/speculative, not canon.",
    "- Do not fabricate exact quotes unless the source provides exact quotes.",
    "- Mark fan-made/commentary/speculative material explicitly.",
  );
  return lines.join("\n");
}
```

- [ ] **Step 4: Export retrieval helpers**

Modify `packages/core/src/index.ts`:

```ts
export {
  renderResearchContext,
  retrieveResearchCards,
  type ResearchQueryInput,
} from "./research/research-retrieval.js";
```

- [ ] **Step 5: Run retrieval tests**

Run: `pnpm --filter @actalk/inkos-core test -- research-retrieval.test.ts`

Expected: PASS.

---

### Task 6: Researcher Agent Extracts Fact Cards

**Files:**
- Create: `packages/core/src/agents/researcher.ts`
- Test: `packages/core/src/__tests__/researcher.test.ts`
- Modify: `packages/core/src/index.ts`

- [ ] **Step 1: Write failing researcher parser tests**

Create `packages/core/src/__tests__/researcher.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { parseResearcherFactCards } from "../agents/researcher.js";

describe("researcher agent", () => {
  it("parses JSONL fact cards from fenced output", () => {
    const cards = parseResearcherFactCards(`Here are cards:\n\n\`\`\`jsonl
{"id":"fact_001","type":"canon_event","confidence":"canon","statement":"Kiana sees Himeko.","sourceId":"source_0001","sourceRef":"note","entities":["Kiana","Himeko"],"tags":["meeting"]}
\`\`\``);
    expect(cards).toHaveLength(1);
    expect(cards[0]!.id).toBe("fact_001");
  });

  it("rejects malformed fact card output", () => {
    expect(() => parseResearcherFactCards("{bad json}")).toThrow(/No valid research fact cards/);
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `pnpm --filter @actalk/inkos-core test -- researcher.test.ts`

Expected: FAIL because `researcher.js` does not exist.

- [ ] **Step 3: Implement researcher agent and parser**

Create `packages/core/src/agents/researcher.ts`:

```ts
import { BaseAgent, type AgentContext } from "./base.js";
import { ResearchFactCardSchema, type ResearchFactCard } from "../models/research.js";

export interface ExtractResearchInput {
  readonly sourceId: string;
  readonly sourceRef: string;
  readonly sourceText: string;
  readonly genre?: string;
}

export interface ExtractResearchOutput {
  readonly cards: ResearchFactCard[];
}

const SYSTEM_PROMPT = `You are a research extraction agent for a novel writing system.
Extract only facts supported by the provided source text.
Do not infer hidden canon. If uncertain, mark confidence as unknown or speculative.
Output JSONL-compatible fact cards. Never invent source references.`;

function stripFence(text: string): string {
  const match = /```(?:jsonl|json)?\s*([\s\S]*?)```/i.exec(text);
  return match?.[1]?.trim() ?? text.trim();
}

export function parseResearcherFactCards(text: string): ResearchFactCard[] {
  const body = stripFence(text);
  const cards: ResearchFactCard[] = [];
  for (const line of body.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || !trimmed.startsWith("{")) continue;
    try {
      cards.push(ResearchFactCardSchema.parse(JSON.parse(trimmed)));
    } catch {
      continue;
    }
  }
  if (cards.length === 0) {
    throw new Error("No valid research fact cards found in researcher output");
  }
  return cards;
}

export class ResearcherAgent extends BaseAgent {
  constructor(ctx: AgentContext) {
    super(ctx);
  }

  get name(): string {
    return "researcher";
  }

  async extract(input: ExtractResearchInput): Promise<ExtractResearchOutput> {
    const userMessage = [
      `Source ID: ${input.sourceId}`,
      `Source Ref: ${input.sourceRef}`,
      `Genre: ${input.genre ?? "unknown"}`,
      "",
      "Extract supported facts as JSONL. Each line must contain:",
      "id,type,confidence,statement,sourceId,sourceRef,entities,tags,allowedUse,forbiddenUse,notes,timeline",
      "",
      "For heavenscreen/video material, distinguish canon_event, video_candidate, video_segment, commentary, speculative, and fanon.",
      "Transcript text proves what the video says, not automatically what canon proves.",
      "",
      "## Source Text",
      input.sourceText,
    ].join("\n");
    const response = await this.chat([
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ], { temperature: 0.2, maxTokens: 6000 });
    return { cards: parseResearcherFactCards(response.text) };
  }
}
```

- [ ] **Step 4: Export researcher**

Modify `packages/core/src/index.ts`:

```ts
export {
  ResearcherAgent,
  parseResearcherFactCards,
  type ExtractResearchInput,
  type ExtractResearchOutput,
} from "./agents/researcher.js";
```

- [ ] **Step 5: Run researcher tests**

Run: `pnpm --filter @actalk/inkos-core test -- researcher.test.ts`

Expected: PASS.

---

### Task 7: CLI Research Command

**Files:**
- Create: `packages/cli/src/commands/research.ts`
- Test: `packages/cli/src/__tests__/research-command.test.ts`
- Modify: `packages/cli/src/program.ts`

- [ ] **Step 1: Write CLI command tests**

Create `packages/cli/src/__tests__/research-command.test.ts`:

```ts
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createProgram } from "../program.js";

let root: string;
let output: string[];
let errorOutput: string[];

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), "inkos-cli-ris-"));
  await writeFile(join(root, "inkos.json"), JSON.stringify({ title: "Demo", booksDir: "books" }), "utf-8");
  output = [];
  errorOutput = [];
  vi.spyOn(process, "cwd").mockReturnValue(root);
  vi.spyOn(console, "log").mockImplementation((message?: unknown) => output.push(String(message ?? "")));
  vi.spyOn(console, "error").mockImplementation((message?: unknown) => errorOutput.push(String(message ?? "")));
});

afterEach(async () => {
  vi.restoreAllMocks();
  await rm(root, { recursive: true, force: true });
});

async function run(args: string[]) {
  const program = createProgram();
  await program.parseAsync(["node", "inkos", ...args]);
}

describe("research command", () => {
  it("creates research workspace", async () => {
    await run(["research", "init", "demo-book"]);
    expect(output.join("\n")).toContain("Created research workspace");
    expect(await readFile(join(root, "books", "demo-book", "research", "README.md"), "utf-8")).toContain("Research workspace");
  });

  it("imports a source file", async () => {
    const source = join(root, "note.md");
    await writeFile(source, "Kiana knows Himeko.", "utf-8");
    await run(["research", "import", "demo-book", "--from", source, "--title", "Canon Note"]);
    expect(output.join("\n")).toContain("Imported sources/source_0001.md");
  });

  it("fetches transcript metadata from latest discovery", async () => {
    await mkdir(join(root, "books", "demo-book", "research", "discoveries"), { recursive: true });
    await writeFile(join(root, "books", "demo-book", "research", "discoveries", "latest.json"), JSON.stringify([{
      id: "discovery_0001",
      query: "demo",
      title: "Video A",
      url: "https://www.youtube.com/watch?v=a",
      platform: "youtube",
      sourceKind: "youtube_video",
      snippet: "A",
      rank: 1,
      selected: true,
      discoveredAt: "2026-06-04T00:00:00.000Z",
    }]), "utf-8");

    await run(["research", "fetch-transcripts", "demo-book", "--from-discovery", "latest"]);
    expect(output.join("\n")).toContain("Fetched 1 video transcript source");
  });

  it("checks research inventory", async () => {
    const source = join(root, "note.md");
    await writeFile(source, "Kiana knows Himeko.", "utf-8");
    await run(["research", "import", "demo-book", "--from", source, "--title", "Canon Note"]);
    output = [];
    await run(["research", "check", "demo-book"]);
    expect(output.join("\n")).toContain("Sources: 1");
  });

  it("appends fact cards from researcher output", async () => {
    const source = join(root, "note.md");
    const researcherOutput = join(root, "cards.jsonl");
    await writeFile(source, "Kiana knows Himeko.", "utf-8");
    await writeFile(researcherOutput, JSON.stringify({
      id: "fact_001",
      type: "canon_event",
      confidence: "canon",
      statement: "Kiana knows Himeko.",
      sourceId: "source_0001",
      sourceRef: "Canon Note",
      entities: ["Kiana", "Himeko"],
      tags: ["relationship"],
    }), "utf-8");
    await run(["research", "import", "demo-book", "--from", source, "--title", "Canon Note"]);
    output = [];
    await run(["research", "extract", "demo-book", "--source", "source_0001", "--from-output", researcherOutput]);
    expect(output.join("\n")).toContain("Extracted 1 fact card");
  });

  it("writes a research pack", async () => {
    await run(["research", "init", "demo-book"]);
    output = [];
    await run(["research", "pack", "demo-book", "--topic", "Himeko", "--out", "himeko.md"]);
    expect(output.join("\n")).toContain("Wrote research pack");
    expect(await readFile(join(root, "books", "demo-book", "research", "packs", "himeko.md"), "utf-8")).toContain("# Research Pack: Himeko");
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `pnpm --filter @actalk/inkos test -- research-command.test.ts`

Expected: FAIL because `research` command is not registered.

- [ ] **Step 3: Implement minimal research command**

Create `packages/cli/src/commands/research.ts`:

```ts
import { Command } from "commander";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  appendResearchFactCards,
  createBraveSearchFunction,
  createExternalTranscriptProvider,
  createUnavailableTranscriptProvider,
  discoverWithBrave,
  ensureResearchWorkspace,
  importResearchSourceFile,
  importVideoTranscriptResult,
  listResearchSources,
  parseResearcherFactCards,
  readResearchFactCards,
  ResearchDiscoveryListSchema,
  renderResearchContext,
  retrieveResearchCards,
} from "@actalk/inkos-core";
import { findProjectRoot, log, logError } from "../utils.js";

export const researchCommand = new Command("research")
  .description("Manage Research Info System sources and fact cards");

researchCommand.command("init")
  .argument("<bookId>")
  .action(async (bookId: string) => {
    try {
      const root = findProjectRoot();
      const paths = await ensureResearchWorkspace(root, bookId);
      log(`Created research workspace: ${paths.researchDir}`);
    } catch (e) {
      logError(`Failed to initialize research workspace: ${e}`);
      process.exit(1);
    }
  });

researchCommand.command("import")
  .argument("<bookId>")
  .requiredOption("--from <path>")
  .option("--title <title>", "Source title")
  .action(async (bookId: string, opts: { from: string; title?: string }) => {
    try {
      const root = findProjectRoot();
      const imported = await importResearchSourceFile(root, bookId, opts.from, {
        title: opts.title ?? opts.from,
        sourceType: "manual_note",
        platform: "manual",
      });
      log(`Imported ${imported.meta.path}`);
      log(`Next: inkos research extract ${bookId} --source ${imported.meta.id}`);
    } catch (e) {
      logError(`Failed to import research source: ${e}`);
      process.exit(1);
    }
  });

researchCommand.command("discover")
  .argument("<bookId>")
  .requiredOption("--query <query>")
  .option("--limit <limit>", "Max results", "10")
  .action(async (bookId: string, opts: { query: string; limit: string }) => {
    try {
      const root = findProjectRoot();
      const result = await discoverWithBrave(root, bookId, {
        query: opts.query,
        limit: Number(opts.limit),
        search: createBraveSearchFunction(),
      });
      log(`Found ${result.discoveries.length} discoveries`);
      log(`Next: inkos research fetch-transcripts ${bookId} --from-discovery latest`);
    } catch (e) {
      logError(`Failed to discover research sources: ${e}`);
      process.exit(1);
    }
  });

researchCommand.command("import-video")
  .argument("<bookId>")
  .requiredOption("--url <url>")
  .action(async (bookId: string, opts: { url: string }) => {
    try {
      const root = findProjectRoot();
      const provider = process.env.INKOS_TRANSCRIPT_COMMAND
        ? createExternalTranscriptProvider()
        : createUnavailableTranscriptProvider();
      const result = await provider.fetch(opts.url);
      const imported = await importVideoTranscriptResult(root, bookId, result, "manual");
      log(`Imported video ${imported.meta.path}`);
      log(`Next: inkos research extract ${bookId} --source ${imported.meta.id}`);
    } catch (e) {
      logError(`Failed to import video: ${e}`);
      process.exit(1);
    }
  });

researchCommand.command("fetch-transcripts")
  .argument("<bookId>")
  .option("--from-discovery <name>", "Discovery JSON name", "latest")
  .action(async (bookId: string, opts: { fromDiscovery: string }) => {
    try {
      const root = findProjectRoot();
      const fileName = opts.fromDiscovery === "latest"
        ? "latest.json"
        : opts.fromDiscovery.endsWith(".json") ? opts.fromDiscovery : `${opts.fromDiscovery}.json`;
      const discoveryPath = join(root, "books", bookId, "research", "discoveries", fileName);
      const discoveries = ResearchDiscoveryListSchema.parse(JSON.parse(await readFile(discoveryPath, "utf-8")));
      const provider = process.env.INKOS_TRANSCRIPT_COMMAND
        ? createExternalTranscriptProvider()
        : createUnavailableTranscriptProvider();
      let count = 0;
      for (const discovery of discoveries) {
        if (!discovery.selected) continue;
        if (discovery.sourceKind !== "youtube_video" && discovery.sourceKind !== "bilibili_video") continue;
        const result = await provider.fetch(discovery.url);
        await importVideoTranscriptResult(root, bookId, result, "brave");
        count += 1;
      }
      log(`Fetched ${count} video transcript source${count === 1 ? "" : "s"}`);
    } catch (e) {
      logError(`Failed to fetch transcripts: ${e}`);
      process.exit(1);
    }
  });

researchCommand.command("extract")
  .argument("<bookId>")
  .requiredOption("--source <sourceId>")
  .option("--from-output <path>", "Researcher JSONL output file to append")
  .action(async (bookId: string, opts: { source: string; fromOutput?: string }) => {
    try {
      const root = findProjectRoot();
      const sources = await listResearchSources(root, bookId);
      const source = sources.find((item) => item.id === opts.source);
      if (!source) throw new Error(`Source not found: ${opts.source}`);
      const text = await readFile(join(root, "books", bookId, "research", source.path), "utf-8");
      if (opts.fromOutput) {
        const cards = parseResearcherFactCards(await readFile(opts.fromOutput, "utf-8"));
        await appendResearchFactCards(root, bookId, cards);
        log(`Extracted ${cards.length} fact card${cards.length === 1 ? "" : "s"} from ${opts.fromOutput}`);
        return;
      }
      log(`Source ${source.id} is ready for researcher extraction (${text.length} chars).`);
      log(`Run ResearcherAgent.extract against this source, then append its JSONL output with: inkos research extract ${bookId} --source ${source.id} --from-output <path>`);
    } catch (e) {
      logError(`Failed to extract research facts: ${e}`);
      process.exit(1);
    }
  });

researchCommand.command("query")
  .argument("<bookId>")
  .requiredOption("--topic <topic>")
  .action(async (bookId: string, opts: { topic: string }) => {
    try {
      const root = findProjectRoot();
      const cards = await readResearchFactCards(root, bookId);
      const results = retrieveResearchCards(cards, { query: opts.topic, maxCards: 8 });
      log(renderResearchContext(results) || "No matching facts found.");
    } catch (e) {
      logError(`Failed to query research facts: ${e}`);
      process.exit(1);
    }
  });

researchCommand.command("check")
  .argument("<bookId>")
  .action(async (bookId: string) => {
    try {
      const root = findProjectRoot();
      const sources = await listResearchSources(root, bookId);
      const cards = await readResearchFactCards(root, bookId);
      log(`Sources: ${sources.length}`);
      log(`Fact cards: ${cards.length}`);
    } catch (e) {
      logError(`Failed to check research workspace: ${e}`);
      process.exit(1);
    }
  });

researchCommand.command("pack")
  .argument("<bookId>")
  .requiredOption("--topic <topic>")
  .option("--out <file>", "Research pack markdown file", "research-pack.md")
  .action(async (bookId: string, opts: { topic: string; out: string }) => {
    try {
      const root = findProjectRoot();
      const cards = await readResearchFactCards(root, bookId);
      const results = retrieveResearchCards(cards, { query: opts.topic, maxCards: 12 });
      const context = renderResearchContext(results) || "No matching facts found.";
      const packsDir = join(root, "books", bookId, "research", "packs");
      await mkdir(packsDir, { recursive: true });
      const outputPath = join(packsDir, opts.out);
      await writeFile(outputPath, [`# Research Pack: ${opts.topic}`, "", context, ""].join("\n"), "utf-8");
      log(`Wrote research pack: ${outputPath}`);
    } catch (e) {
      logError(`Failed to write research pack: ${e}`);
      process.exit(1);
    }
  });
```

- [ ] **Step 4: Register research command**

Modify `packages/cli/src/program.ts`:

```ts
import { researchCommand } from "./commands/research.js";
```

Add after other commands:

```ts
program.addCommand(researchCommand);
```

- [ ] **Step 5: Run CLI tests**

Run: `pnpm --filter @actalk/inkos test -- research-command.test.ts`

Expected: PASS.

---

### Task 8: Pipeline Research Context Hook

**Files:**
- Test: `packages/core/src/__tests__/pipeline-research-context.test.ts`
- Modify: `packages/core/src/agents/planner.ts`
- Modify: `packages/core/src/agents/writer.ts`
- Modify: `packages/core/src/agents/continuity.ts`
- Modify: `packages/core/src/pipeline/runner.ts`

- [ ] **Step 1: Write focused prompt injection tests first**

Create `packages/core/src/__tests__/pipeline-research-context.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { renderResearchContext } from "../research/research-retrieval.js";

describe("pipeline research context", () => {
  it("renders context suitable for planner/writer/auditor prompts", () => {
    const context = renderResearchContext([{ card: {
      id: "fact_001",
      type: "canon_event",
      confidence: "canon",
      statement: "Himeko protects Kiana.",
      sourceId: "source_0001",
      sourceRef: "Canon Note",
      entities: ["Himeko", "Kiana"],
      tags: ["sacrifice"],
      forbiddenUse: "Do not claim survival as canon.",
    }, score: 10, reasons: ["entity:Himeko"] }]);
    expect(context).toContain("Research Context / Canon Facts");
    expect(context).toContain("Do not claim survival as canon");
  });
});
```

Run: `pnpm --filter @actalk/inkos-core test -- pipeline-research-context.test.ts`

Expected: PASS after Task 5. This test is the baseline before touching large pipeline files.

- [ ] **Step 2: Add optional `researchContext` fields**

Modify planner/writer/continuity input types by adding:

```ts
readonly researchContext?: string;
```

In each prompt builder, inject this block near canon/fanfic/context sections:

```ts
const researchBlock = input.researchContext?.trim()
  ? `\n\n${input.researchContext.trim()}\n`
  : "";
```

Append `researchBlock` before final writing/audit rules, not after them.

- [ ] **Step 3: Add retrieval helper in runner**

In `packages/core/src/pipeline/runner.ts`, create a private method near other context-loading helpers:

```ts
private async loadResearchContext(bookId: string, query: string): Promise<string> {
  try {
    const cards = await readResearchFactCards(this.projectRoot, bookId);
    const results = retrieveResearchCards(cards, { query, maxCards: 10 });
    return renderResearchContext(results);
  } catch {
    return "";
  }
}
```

Add imports:

```ts
import { readResearchFactCards } from "../research/research-store.js";
import { renderResearchContext, retrieveResearchCards } from "../research/research-retrieval.js";
```

- [ ] **Step 4: Pass research context before planner/writer/auditor**

At the point where chapter intent/memo/context query exists, build a query from available chapter intent fields:

```ts
const researchQuery = [
  book.title,
  genreProfile.profile.id,
  chapterIntent?.goal,
  chapterIntent?.hook,
  externalContext,
].filter(Boolean).join("\n");
const researchContext = await this.loadResearchContext(bookId, researchQuery);
```

Then pass `researchContext` into planner, writer, and continuity/auditor inputs. If exact local variable names differ, keep the same behavior: construct once per chapter write and reuse the same string for all agents.

- [ ] **Step 5: Run pipeline and prompt tests**

Run: `pnpm --filter @actalk/inkos-core test -- pipeline-research-context.test.ts planner.test.ts writer.test.ts continuity.test.ts`

Expected: PASS.

---

### Task 9: Model Override Support for Researcher

**Files:**
- Modify: `packages/core/src/models/project.ts`
- Modify: `packages/cli/src/commands/config.ts`
- Test: existing `packages/cli/src/__tests__/llm-overrides.test.ts` or add a targeted config test if current suite has one.

- [ ] **Step 1: Inspect current override schema and whitelist**

Open:

- `packages/core/src/models/project.ts`
- `packages/cli/src/commands/config.ts`

Find `AgentLLMOverrideSchema` and CLI allowed agent list.

- [ ] **Step 2: Add accepted agent keys**

Ensure these override keys are accepted:

```ts
"researcher"
"planner"
"state-validator"
"foundation-reviewer"
"fanfic-canon-importer"
"short-outline"
"short-outline-review"
"short-writer"
"short-draft-review"
"short-revise"
"short-package"
```

Do not introduce nested `_tier*` model override shape. InkOS should keep flat `modelOverrides`.

- [ ] **Step 3: Add or update config test**

If a config model test exists, add this assertion:

```ts
expect(ProjectConfigSchema.parse({
  title: "Demo",
  modelOverrides: {
    researcher: "vx/gemini-3.1-pro-preview",
    planner: "vertex/gemini-3.5-flash",
    "state-validator": "vertex/gemini-3.5-flash",
    "short-writer": "Kimi-2.6-CB",
  },
}).modelOverrides?.researcher).toBe("vx/gemini-3.1-pro-preview");
```

- [ ] **Step 4: Run config tests**

Run: `pnpm --filter @actalk/inkos-core test -- config-loader.test.ts models.test.ts`

Expected: PASS.

---

### Task 10: Full Verification

**Files:**
- All files touched above.

- [ ] **Step 1: Run targeted core tests**

Run:

```bash
pnpm --filter @actalk/inkos-core test -- research-models.test.ts research-store.test.ts source-acquisition.test.ts source-providers.test.ts research-retrieval.test.ts researcher.test.ts pipeline-research-context.test.ts
```

Expected: all targeted tests PASS.

- [ ] **Step 2: Run targeted CLI tests**

Run:

```bash
pnpm --filter @actalk/inkos test -- research-command.test.ts
```

Expected: PASS.

- [ ] **Step 3: Build core and CLI**

Run:

```bash
pnpm --filter @actalk/inkos-core build
pnpm --filter @actalk/inkos build
```

Expected: both commands exit 0.

- [ ] **Step 4: Manual smoke test in `test-novel`**

Run from `E:\Tools\inkosLN\test-novel`:

```bash
node "E:\Tools\inkosLN\packages\cli\dist\index.js" research init man-troi-chieu-van-gioi
node "E:\Tools\inkosLN\packages\cli\dist\index.js" research import man-troi-chieu-van-gioi --from "E:\Tools\inkosLN\packages\core\genres\heavenscreen.md" --title "Heavenscreen Genre Notes"
node "E:\Tools\inkosLN\packages\cli\dist\index.js" research query man-troi-chieu-van-gioi --topic "livestream storyline gameplay observation"
```

Expected:

- First command prints `Created research workspace`.
- Second command prints `Imported sources/source_0001.md`.
- Third command prints either `No matching facts found.` if extraction has not been run, or a Research Context if fact cards exist.

---

## Self-Review Notes

- Spec coverage: The plan covers schemas, source store, Brave discovery abstraction, transcript import fallback, retrieval, researcher parser/agent, CLI, pipeline injection, model override support, tests, and smoke verification.
- Scope control: Actual YouTube/Bilibili scraping libraries are intentionally not selected in MVP. The provider interface and unavailable default let future implementations plug in without changing RIS core.
- Provider decision: `discover` uses Brave Web Search API through `BRAVE_API_KEY`. Transcript import uses `INKOS_TRANSCRIPT_COMMAND` when configured, otherwise it writes metadata-only sources through the unavailable provider. This keeps MVP functional offline while allowing a real YouTube/Bilibili transcript tool.
- No vector DB, embedding, OCR, audio transcription, danmaku scraping, or automatic web calls during `write next` are included.
