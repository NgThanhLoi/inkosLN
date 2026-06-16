import { BaseAgent, type AgentContext } from "./base.js";
import { ResearchFactCardSchema, type ResearchFactCard } from "../models/research.js";

export interface ExtractResearchInput {
  readonly sourceId: string;
  readonly sourceRef: string;
  readonly sourceText: string;
  readonly genre?: string;
}

export interface ExtractResearchOutput {
  readonly cards: ResearchFactCard[];
}

const SYSTEM_PROMPT = `You are a research extraction agent for a novel writing system.
Extract only facts supported by the provided source text.
Do not infer hidden canon. If uncertain, mark confidence as unknown or speculative.
Output JSONL-compatible fact cards. Never invent source references.`;

function stripFence(text: string): string {
  const match = /```(?:jsonl|json)?\s*([\s\S]*?)```/i.exec(text);
  return match?.[1]?.trim() ?? text.trim();
}

export function parseResearcherFactCards(text: string): ResearchFactCard[] {
  const body = stripFence(text);
  const cards: ResearchFactCard[] = [];
  for (const line of body.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || !trimmed.startsWith("{")) continue;
    try {
      cards.push(ResearchFactCardSchema.parse(JSON.parse(trimmed)));
    } catch {
      continue;
    }
  }
  if (cards.length === 0) {
    throw new Error("No valid research fact cards found in researcher output");
  }
  return cards;
}

export class ResearcherAgent extends BaseAgent {
  constructor(ctx: AgentContext) {
    super(ctx);
  }

  get name(): string {
    return "researcher";
  }

  async extract(input: ExtractResearchInput): Promise<ExtractResearchOutput> {
    const userMessage = [
      `Source ID: ${input.sourceId}`,
      `Source Ref: ${input.sourceRef}`,
      `Genre: ${input.genre ?? "unknown"}`,
      "",
      "Extract supported facts as JSONL. Each line must contain:",
      "id,type,confidence,statement,sourceId,sourceRef,entities,tags,allowedUse,forbiddenUse,notes,timeline",
      "",
      "For heavenscreen/video material, distinguish canon_event, video_candidate, video_segment, commentary, speculative, and fanon.",
      "Transcript text proves what the video says, not automatically what canon proves.",
      "",
      "## Source Text",
      input.sourceText,
    ].join("\n");
    const response = await this.chat([
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ], { temperature: 0.2, maxTokens: 6000 });
    return { cards: parseResearcherFactCards(response.content) };
  }
}
