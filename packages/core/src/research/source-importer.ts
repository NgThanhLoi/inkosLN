import type { TranscriptResult, ResearchSourceMeta } from "../models/research.js";
import { writeResearchSourceText, type ImportedResearchSource } from "./research-store.js";

function markdownForTranscript(result: TranscriptResult): string {
  if (result.status === "available") {
    return [
    `# ${"title" in result && result.title ? result.title : result.url}`,
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
    `# ${"title" in result && result.title ? result.title : result.url}`,
    "",
    `Source URL: ${result.url}`,
    `Platform: ${result.platform}`,
    `Transcript status: ${result.status}`,
    `Reason: ${result.reason}`,
    "",
    result.status === "unavailable" && result.metadataText ? "## Metadata" : undefined,
    result.status === "unavailable" && result.metadataText ? "" : undefined,
    result.status === "unavailable" ? result.metadataText : undefined,
    result.status === "unavailable" && result.metadataText ? "" : undefined,
    "No transcript text is available. Treat this source as metadata only.",
  ].filter((line) => line !== undefined).join("\n");
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
