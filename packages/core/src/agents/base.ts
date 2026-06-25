import type { LLMClient, LLMMessage, LLMResponse, OnStreamProgress } from "../llm/provider.js";
import { chatCompletion } from "../llm/provider.js";
import { searchWeb, fetchUrl } from "../utils/web-search.js";
import type { Logger } from "../utils/logger.js";

/**
 * Helper to build the structural instruction block that must be obeyed by
 * models that ignore system prompts.
 */
const STRUCTURAL_INSTRUCTION_TAG_OPEN = "<EXTREMELY_IMPORTANT>";
const STRUCTURAL_INSTRUCTION_TAG_CLOSE = "</EXTREMELY_IMPORTANT>";

export interface AgentContext {
  readonly client: LLMClient;
  readonly model: string;
  readonly projectRoot: string;
  readonly bookId?: string;
  readonly logger?: Logger;
  readonly onStreamProgress?: OnStreamProgress;
}

export abstract class BaseAgent {
  protected readonly ctx: AgentContext;

  constructor(ctx: AgentContext) {
    this.ctx = ctx;
  }

  protected get log() {
    return this.ctx.logger;
  }

  /**
   * Check if the current LLM client is configured to inject structural
   * instructions into user messages instead of system messages.
   */
  protected get instructionMode(): "system" | "user" | "all-user" {
    return this.ctx.client.defaults?.instructionMode ?? "system";
  }

  /**
   * Build messages for a chat call, optionally wrapping critical structural
   * instructions in a user-role block so models that ignore system prompts
   * still follow section-header contracts (e.g. architect's === SECTION: ===
   * format).
   *
   * When `instructionMode === "user"`:
   * - `systemPrompt` stays as the system message
   * - `structuralInstructions` are wrapped in <EXTREMELY_IMPORTANT> tags
   *   and prepended to the user message
   *
   * When `instructionMode === "system"` (default):
   * - `structuralInstructions` are appended to the system message
   * - The user message is used as-is
   */
  protected buildChatMessages(
    systemPrompt: string,
    userMessage: string,
    structuralInstructions: string,
  ): ReadonlyArray<LLMMessage> {
    if (this.instructionMode === "all-user") {
      const wrappedInstruction =
        `\n\n${STRUCTURAL_INSTRUCTION_TAG_OPEN}\n` +
        `[SYSTEM INSTRUCTIONS]\n${systemPrompt}\n\n` +
        `[STRUCTURAL INSTRUCTIONS]\n${structuralInstructions}\n` +
        `${STRUCTURAL_INSTRUCTION_TAG_CLOSE}\n\n`;
      return [
        { role: "user", content: wrappedInstruction + userMessage },
      ];
    }

    if (this.instructionMode === "user") {
      const wrappedInstruction =
        `\n\n${STRUCTURAL_INSTRUCTION_TAG_OPEN}${structuralInstructions}${STRUCTURAL_INSTRUCTION_TAG_CLOSE}\n\n`;
      return [
        { role: "system", content: systemPrompt },
        { role: "user", content: wrappedInstruction + userMessage },
      ];
    }

    // Default: append structural instructions to system message
    return [
      { role: "system", content: systemPrompt + structuralInstructions },
      { role: "user", content: userMessage },
    ];
  }

  protected async chat(
    messages: ReadonlyArray<LLMMessage>,
    options?: { readonly temperature?: number; readonly maxTokens?: number; readonly reasoningEffort?: string },
  ): Promise<LLMResponse> {
    return chatCompletion(this.ctx.client, this.ctx.model, this.applyInstructionMode(messages), {
      ...options,
      onStreamProgress: this.ctx.onStreamProgress,
    });
  }

  private applyInstructionMode(messages: ReadonlyArray<LLMMessage>): ReadonlyArray<LLMMessage> {
    if (this.instructionMode !== "all-user" || !messages.some((message) => message.role === "system")) {
      return messages;
    }

    const systemInstructions = messages
      .filter((message) => message.role === "system")
      .map((message) => message.content)
      .join("\n\n");
    const nonSystemMessages = messages.filter((message) => message.role !== "system");
    const instructionBlock =
      `${STRUCTURAL_INSTRUCTION_TAG_OPEN}\n` +
      `[SYSTEM INSTRUCTIONS]\n${systemInstructions}\n` +
      `${STRUCTURAL_INSTRUCTION_TAG_CLOSE}\n\n`;
    const firstUserIndex = nonSystemMessages.findIndex((message) => message.role === "user");

    if (firstUserIndex === -1) {
      return [{ role: "user", content: instructionBlock }];
    }

    return nonSystemMessages.map((message, index) => (
      index === firstUserIndex
        ? { ...message, content: instructionBlock + message.content }
        : message
    ));
  }

  /**
   * Chat with web search enabled.
   * OpenAI: uses native web_search_options / web_search_preview.
   * Other providers: searches via Tavily API (TAVILY_API_KEY), injects results into prompt.
   */
  protected async chatWithSearch(
    messages: ReadonlyArray<LLMMessage>,
    options?: { readonly temperature?: number; readonly maxTokens?: number },
  ): Promise<LLMResponse> {
    // OpenAI has native search — use it directly
    if (this.ctx.client.provider === "openai") {
      return chatCompletion(this.ctx.client, this.ctx.model, messages, {
        ...options,
        webSearch: true,
        onStreamProgress: this.ctx.onStreamProgress,
      });
    }

    // Other providers: self-hosted search → inject results into prompt
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    if (!lastUserMsg) {
      return this.chat(messages, options);
    }

    try {
      // Extract search query from user message (first 200 chars)
      const query = lastUserMsg.content.slice(0, 200);
      this.log?.info(`[search] Searching: ${query.slice(0, 60)}...`);

      const results = await searchWeb(query, 3);
      if (results.length === 0) {
        this.log?.warn("[search] No results found, falling back to regular chat");
        return this.chat(messages, options);
      }

      // Fetch top result for full content
      let fullContent = "";
      try {
        fullContent = await fetchUrl(results[0]!.url, 4000);
      } catch {
        // Fetch failed, use snippets only
      }

      const searchContext = [
        "## Web Search Results\n",
        ...results.map((r, i) => `${i + 1}. **${r.title}**\n   ${r.url}\n   ${r.snippet}`),
        ...(fullContent ? [`\n## Full Content (Top Result)\n${fullContent}`] : []),
      ].join("\n");

      // Inject search results before the last user message
      const augmentedMessages: LLMMessage[] = messages.map((m) =>
        m === lastUserMsg
          ? { ...m, content: `${searchContext}\n\n---\n\n${m.content}` }
          : m,
      );

      return this.chat(augmentedMessages, options);
    } catch (e) {
      this.log?.warn(`[search] Search failed: ${e}, falling back to regular chat`);
      return this.chat(messages, options);
    }
  }

  abstract get name(): string;
}
