import type { ResearchFactCard, ResearchQueryResult } from "../models/research.js";

export interface ResearchQueryInput {
  readonly query: string;
  readonly maxCards?: number;
  readonly recentFactIds?: readonly string[];
}

function tokenize(value: string): string[] {
  return Array.from(new Set(value.toLowerCase().match(/[\p{L}\p{N}_-]+/gu) ?? []));
}

function scoreCard(card: ResearchFactCard, queryTokens: readonly string[], recentFactIds: readonly string[]): ResearchQueryResult {
  let score = 0;
  const reasons: string[] = [];
  const query = new Set(queryTokens);

  for (const entity of card.entities) {
    const entityTokens = tokenize(entity);
    if (entityTokens.some((token) => query.has(token))) {
      score += 5;
      reasons.push(`entity:${entity}`);
    }
  }
  for (const tag of card.tags) {
    if (query.has(tag.toLowerCase())) {
      score += 3;
      reasons.push(`tag:${tag}`);
    }
  }
  for (const token of tokenize(card.statement)) {
    if (query.has(token)) {
      score += 2;
    }
  }
  if (card.timeline?.arc && tokenize(card.timeline.arc).some((token) => query.has(token))) {
    score += 2;
    reasons.push(`arc:${card.timeline.arc}`);
  }
  if (card.confidence === "canon" || card.confidence === "official") {
    score += 1;
    reasons.push(`confidence:${card.confidence}`);
  }
  if (card.confidence === "unknown") {
    score -= 3;
    reasons.push("confidence:unknown");
  }
  if (recentFactIds.includes(card.id)) {
    score -= 2;
    reasons.push("recently-used");
  }
  return { card, score, reasons };
}

export function retrieveResearchCards(cards: readonly ResearchFactCard[], input: ResearchQueryInput): ResearchQueryResult[] {
  const queryTokens = tokenize(input.query);
  const recentFactIds = input.recentFactIds ?? [];
  return cards
    .map((card) => scoreCard(card, queryTokens, recentFactIds))
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score || a.card.id.localeCompare(b.card.id))
    .slice(0, input.maxCards ?? 10);
}

export function renderResearchContext(results: readonly ResearchQueryResult[]): string {
  if (results.length === 0) {
    return "";
  }
  const lines = [
    "## Research Context / Canon Facts",
    "",
    "Use these facts as source-grounded constraints. Do not invent canon beyond them.",
    "",
    "### Fact Cards",
  ];
  results.forEach((result, index) => {
    const card = result.card;
    lines.push(
      `${index + 1}. [${card.type}/${card.confidence}] ${card.statement}`,
      `   Source: ${card.sourceId} / ${card.sourceRef}`,
      `   Entities: ${card.entities.join(", ") || "none"}`,
    );
    if (card.allowedUse) lines.push(`   Allowed: ${card.allowedUse}`);
    if (card.forbiddenUse) lines.push(`   Forbidden: ${card.forbiddenUse}`);
    if (card.notes) lines.push(`   Notes: ${card.notes}`);
    lines.push("");
  });
  lines.push(
    "### Canon Safety Rules",
    "- If a detail is not in these facts, write it as uncertain/speculative, not canon.",
    "- Do not fabricate exact quotes unless the source provides exact quotes.",
    "- Mark fan-made/commentary/speculative material explicitly.",
  );
  return lines.join("\n");
}
