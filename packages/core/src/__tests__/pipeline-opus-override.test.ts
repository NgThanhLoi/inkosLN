import { describe, expect, it } from "vitest";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createLLMClient } from "../llm/provider.js";
import { PipelineRunner } from "../pipeline/runner.js";

describe("PipelineRunner Opus override", () => {
  it("passes maxTokens and writingMode into the writer agent context", () => {
    const projectRoot = mkdtempSync(join(tmpdir(), "inkos-opus-override-"));
    const defaultLLMConfig = {
      provider: "custom",
      service: "custom",
      configSource: "env",
      baseUrl: "http://localhost:20128/v1",
      apiKey: "",
      model: "default-model",
      apiFormat: "chat",
      stream: true,
      instructionMode: "system",
      temperature: 0.7,
      thinkingBudget: 0,
    } as const;
    const client = createLLMClient(defaultLLMConfig);
    const runner = new PipelineRunner({
      client,
      model: "default-model",
      projectRoot,
      defaultLLMConfig,
      modelOverrides: {
        writer: {
          provider: "custom",
          baseUrl: "http://localhost:20128/v1",
          model: "claude-opus-4-6",
          stream: false,
          instructionMode: "all-user",
          maxTokens: 2800,
          writingMode: "opus",
        },
      },
    });

    const ctx = runner.createAgentContext("writer");

    expect(ctx.model).toBe("claude-opus-4-6");
    expect(ctx.client.stream).toBe(false);
    expect(ctx.client.defaults.instructionMode).toBe("all-user");
    expect(ctx.client.defaults.maxTokens).toBe(2800);
    expect(ctx.client.defaults.extra.writingMode).toBe("opus");
  });
});
