import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  appendResearchFactCards,
  clearResearchArtifacts,
  ensureResearchWorkspace,
  importResearchSourceFile,
  listResearchSources,
  readResearchFactCards,
  writeResearchSourceText,
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

  it("clears failed transcript sources and prunes orphan fact cards", async () => {
    await ensureResearchWorkspace(root, "demo-book");
    await writeResearchSourceText(root, "demo-book", "video-transcript.md", "failed source", {
      title: "Failed Video",
      sourceType: "video_metadata",
      platform: "bilibili",
      transcriptStatus: "failed",
    });
    await writeResearchSourceText(root, "demo-book", "video-transcript.md", "ok source", {
      title: "Good Video",
      sourceType: "video_transcript",
      platform: "bilibili",
      transcriptStatus: "available",
    });
    await appendResearchFactCards(root, "demo-book", [
      {
        id: "fact_failed",
        type: "video_segment",
        confidence: "unknown",
        statement: "failed",
        sourceId: "source_0001",
        sourceRef: "failed",
        entities: ["A"],
        tags: ["failed"],
      },
      {
        id: "fact_ok",
        type: "video_segment",
        confidence: "unknown",
        statement: "ok",
        sourceId: "source_0002",
        sourceRef: "ok",
        entities: ["B"],
        tags: ["ok"],
      },
    ]);

    const result = await clearResearchArtifacts(root, "demo-book", {
      failedTranscripts: true,
      pruneFacts: true,
      dryRun: false,
    });

    expect(result.removedSourceIds).toEqual(["source_0001"]);
    expect((await listResearchSources(root, "demo-book")).map((s) => s.id)).toEqual(["source_0002"]);
    expect((await readResearchFactCards(root, "demo-book")).map((c) => c.id)).toEqual(["fact_ok"]);
  });
});
