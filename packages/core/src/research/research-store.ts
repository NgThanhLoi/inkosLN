import { mkdir, readFile, writeFile, copyFile, appendFile, rm } from "node:fs/promises";
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

export interface ClearResearchArtifactsOptions {
  readonly failedTranscripts?: boolean;
  readonly metadataOnly?: boolean;
  readonly packs?: boolean;
  readonly pruneFacts?: boolean;
  readonly dryRun?: boolean;
}

export interface ClearResearchArtifactsResult {
  readonly removedSourceIds: string[];
  readonly removedSourcePaths: string[];
  readonly removedPackPaths: string[];
  readonly prunedFactCount: number;
}

const RESEARCH_README = `# Research workspace

Store canon/fact/source material for RIS Lite.
`;

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

export async function clearResearchArtifacts(
  projectRoot: string,
  bookId: string,
  options: ClearResearchArtifactsOptions,
): Promise<ClearResearchArtifactsResult> {
  const paths = await ensureResearchWorkspace(projectRoot, bookId);
  const dryRun = options.dryRun ?? true;
  const removeFailed = options.failedTranscripts ?? false;
  const removeMetadataOnly = options.metadataOnly ?? false;
  const removePacks = options.packs ?? false;
  const pruneFacts = options.pruneFacts ?? false;

  const sources = await listResearchSources(projectRoot, bookId);
  const removableSources = sources.filter((source) => {
    if (removeFailed && source.transcriptStatus === "failed") return true;
    if (removeMetadataOnly && source.sourceType === "video_metadata") return true;
    return false;
  });

  const removedSourceIds = removableSources.map((source) => source.id);
  const removedSourcePaths = removableSources.map((source) => join(paths.researchDir, source.path));

  let removedPackPaths: string[] = [];
  try {
    const packEntries = await readFile(paths.packsDir, "utf-8");
    void packEntries;
  } catch {
    // directory listing handled below when packs are requested
  }

  if (removePacks) {
    const { readdir } = await import("node:fs/promises");
    const entries = await readdir(paths.packsDir, { withFileTypes: true }).catch(() => []);
    removedPackPaths = entries
      .filter((entry) => entry.isFile())
      .map((entry) => join(paths.packsDir, entry.name));
  }

  let prunedFactCount = 0;
  if (!dryRun) {
    for (const filePath of removedSourcePaths) {
      await rm(filePath, { force: true });
    }
    if (removedSourceIds.length > 0) {
      await saveResearchSources(projectRoot, bookId, sources.filter((source) => !removedSourceIds.includes(source.id)));
    }
    for (const packPath of removedPackPaths) {
      await rm(packPath, { force: true });
    }
    if (pruneFacts && removedSourceIds.length > 0) {
      const cards = await readResearchFactCards(projectRoot, bookId);
      const kept = cards.filter((card) => !removedSourceIds.includes(card.sourceId));
      prunedFactCount = cards.length - kept.length;
      const lines = kept.map((card) => JSON.stringify(ResearchFactCardSchema.parse(card))).join("\n");
      await writeFile(paths.factCardsPath, lines.length > 0 ? `${lines}\n` : "", "utf-8");
    }
  } else if (pruneFacts && removedSourceIds.length > 0) {
    const cards = await readResearchFactCards(projectRoot, bookId);
    prunedFactCount = cards.filter((card) => removedSourceIds.includes(card.sourceId)).length;
  }

  return {
    removedSourceIds,
    removedSourcePaths,
    removedPackPaths,
    prunedFactCount,
  };
}
