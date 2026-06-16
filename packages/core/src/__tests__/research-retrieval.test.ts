import { describe, expect, it } from "vitest";
import { renderResearchContext, retrieveResearchCards } from "../research/research-retrieval.js";
import type { ResearchFactCard } from "../models/research.js";

const cards: ResearchFactCard[] = [
  {
    id: "fact_himeko_001",
    type: "canon_event",
    confidence: "canon",
    statement: "Himeko protects Kiana during Final Lesson.",
    sourceId: "source_0001",
    sourceRef: "Chapter 9 notes",
    entities: ["Himeko", "Kiana"],
    tags: ["final_lesson", "sacrifice"],
    forbiddenUse: "Do not claim Himeko survives as canon.",
  },
  {
    id: "fact_random_001",
    type: "commentary",
    confidence: "unknown",
    statement: "A fan says a rescue ending could happen.",
    sourceId: "source_0002",
    sourceRef: "Fan comment",
    entities: ["Himeko"],
    tags: ["fan_theory"],
  },
];

describe("research retrieval", () => {
  it("ranks entity and tag matches above weak commentary", () => {
    const results = retrieveResearchCards(cards, {
      query: "Kiana Himeko final lesson sacrifice",
      maxCards: 2,
    });
    expect(results[0]!.card.id).toBe("fact_himeko_001");
    expect(results[0]!.score).toBeGreaterThan(results[1]!.score);
  });

  it("renders forbidden use in context", () => {
    const context = renderResearchContext(retrieveResearchCards(cards, {
      query: "Kiana Himeko",
      maxCards: 1,
    }));
    expect(context).toContain("## Research Context / Canon Facts");
    expect(context).toContain("Do not claim Himeko survives as canon.");
  });
});
