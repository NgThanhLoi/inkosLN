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
