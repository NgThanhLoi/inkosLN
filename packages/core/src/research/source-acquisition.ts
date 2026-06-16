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
