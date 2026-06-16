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
