import { describe, expect, it } from "vitest";
import { renderResearchContext } from "../research/research-retrieval.js";

describe("pipeline research context", () => {
  it("renders context suitable for planner/writer/auditor prompts", () => {
    const context = renderResearchContext([{ card: {
      id: "fact_001",
      type: "canon_event",
      confidence: "canon",
      statement: "Himeko protects Kiana.",
      sourceId: "source_0001",
      sourceRef: "Canon Note",
      entities: ["Himeko", "Kiana"],
      tags: ["sacrifice"],
      forbiddenUse: "Do not claim survival as canon.",
    }, score: 10, reasons: ["entity:Himeko"] }]);
    expect(context).toContain("Research Context / Canon Facts");
    expect(context).toContain("Do not claim survival as canon");
  });
});
