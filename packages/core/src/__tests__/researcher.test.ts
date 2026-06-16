import { describe, expect, it } from "vitest";
import { parseResearcherFactCards } from "../agents/researcher.js";

describe("researcher agent", () => {
  it("parses JSONL fact cards from fenced output", () => {
    const cards = parseResearcherFactCards(`Here are cards:\n\n\`\`\`jsonl
{"id":"fact_001","type":"canon_event","confidence":"canon","statement":"Kiana sees Himeko.","sourceId":"source_0001","sourceRef":"note","entities":["Kiana","Himeko"],"tags":["meeting"]}
\`\`\``);
    expect(cards).toHaveLength(1);
    expect(cards[0]!.id).toBe("fact_001");
  });

  it("rejects malformed fact card output", () => {
    expect(() => parseResearcherFactCards("{bad json}")).toThrow(/No valid research fact cards/);
  });
});
