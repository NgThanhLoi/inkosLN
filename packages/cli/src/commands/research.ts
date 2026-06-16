import { Command } from "commander";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  appendResearchFactCards,
  clearResearchArtifacts,
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

researchCommand.command("clear")
  .argument("<bookId>")
  .option("--failed-transcripts", "Remove failed transcript sources")
  .option("--metadata-only", "Remove metadata-only video sources")
  .option("--packs", "Remove generated research packs")
  .option("--prune-facts", "Prune fact cards that point to removed sources")
  .option("--yes", "Apply changes")
  .action(async (bookId: string, opts: {
    failedTranscripts?: boolean;
    metadataOnly?: boolean;
    packs?: boolean;
    pruneFacts?: boolean;
    yes?: boolean;
  }) => {
    try {
      const root = findProjectRoot();
      const result = await clearResearchArtifacts(root, bookId, {
        failedTranscripts: opts.failedTranscripts ?? (!opts.metadataOnly && !opts.packs),
        metadataOnly: opts.metadataOnly ?? false,
        packs: opts.packs ?? (!opts.failedTranscripts && !opts.metadataOnly),
        pruneFacts: opts.pruneFacts ?? false,
        dryRun: !opts.yes,
      });
      if (!opts.yes) {
        log(`Dry run: would remove ${result.removedSourceIds.length} source(s), ${result.removedPackPaths.length} pack(s), prune ${result.prunedFactCount} fact card(s).`);
        return;
      }
      log(`Removed ${result.removedSourceIds.length} source(s), ${result.removedPackPaths.length} pack(s), pruned ${result.prunedFactCount} fact card(s).`);
    } catch (e) {
      logError(`Failed to clear research artifacts: ${e}`);
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
