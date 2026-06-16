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
