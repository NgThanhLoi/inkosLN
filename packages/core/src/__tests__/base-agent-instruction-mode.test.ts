import { describe, expect, it, vi } from "vitest";

const chatCompletionMock = vi.fn();

vi.mock("../llm/provider.js", () => ({
  chatCompletion: chatCompletionMock,
}));

const { BaseAgent } = await import("../agents/base.js");

class TestAgent extends BaseAgent {
  get name() {
    return "test";
  }

  runChat() {
    return this.chat([
      { role: "system", content: "Follow the format exactly." },
      { role: "user", content: "Write the result." },
    ]);
  }
}

describe("BaseAgent instructionMode", () => {
  it("folds system prompts into the user message for all-user clients", async () => {
    chatCompletionMock.mockResolvedValueOnce({
      content: "ok",
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
    });

    const agent = new TestAgent({
      client: {
        provider: "openai",
        apiFormat: "chat",
        stream: false,
        defaults: {
          temperature: 0.7,
          maxTokens: 4096,
          thinkingBudget: 0,
          extra: {},
          instructionMode: "all-user",
        },
      },
      model: "test-model",
      projectRoot: process.cwd(),
    });

    await agent.runChat();

    const messages = chatCompletionMock.mock.calls[0]?.[2];
    expect(messages).toEqual([
      {
        role: "user",
        content: expect.stringContaining("[SYSTEM INSTRUCTIONS]\nFollow the format exactly."),
      },
    ]);
    expect(messages?.[0]?.content).toContain("Write the result.");
  });
});
