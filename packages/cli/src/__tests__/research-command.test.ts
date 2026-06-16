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
  vi.spyOn(process.stdout, "write").mockImplementation((chunk: unknown) => { output.push(String(chunk ?? "").replace(/\n$/, "")); return true; });
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

  it("dry-runs research clear by default", async () => {
    await run(["research", "init", "demo-book"]);
    await writeFile(join(root, "books", "demo-book", "research", "packs", "temp.md"), "temp", "utf-8");
    output = [];
    await run(["research", "clear", "demo-book"]);
    expect(output.join("\n")).toContain("Dry run");
    expect(await readFile(join(root, "books", "demo-book", "research", "packs", "temp.md"), "utf-8")).toBe("temp");
  });
});
