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
