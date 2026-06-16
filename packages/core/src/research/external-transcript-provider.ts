import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { TranscriptResultSchema, type TranscriptResult } from "../models/research.js";
import { classifyResearchUrl, type TranscriptProvider } from "./source-acquisition.js";

const execFileAsync = promisify(execFile);

export interface ExternalTranscriptProviderOptions {
  readonly command?: string;
  readonly args?: readonly string[];
  readonly timeoutMs?: number;
}

export function parseTranscriptCommandArgs(value: string): string[] {
  const args: string[] = [];
  let current = "";
  let quote: '"' | "'" | undefined;
  let escaping = false;

  for (let index = 0; index < value.length; index += 1) {
    const char = value[index] ?? "";
    const next = value[index + 1];
    if (char === "\\" && (next === '"' || next === "'" || next === "\\")) {
      current += next;
      index += 1;
      continue;
    }
    if ((char === '"' || char === "'") && !quote) {
      quote = char;
      continue;
    }
    if (char === quote) {
      quote = undefined;
      continue;
    }
    if (/\s/.test(char) && !quote) {
      if (current) {
        args.push(current);
        current = "";
      }
      continue;
    }
    current += char;
  }
  if (current) args.push(current);
  return args;
}

function parseTranscriptTimeoutMs(value: string | undefined): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

export function parseTranscriptCommandOutput(url: string, stdout: string): TranscriptResult {
  const raw = JSON.parse(stdout) as unknown;
  const parsed = TranscriptResultSchema.parse({
    ...(typeof raw === "object" && raw !== null ? raw : {}),
    url,
  });
  return parsed;
}

export class ExternalTranscriptProvider implements TranscriptProvider {
  private readonly command: string;
  private readonly args: readonly string[];
  private readonly timeoutMs: number;

  constructor(options: ExternalTranscriptProviderOptions = {}) {
    this.command = options.command ?? process.env.INKOS_TRANSCRIPT_COMMAND ?? "";
    this.args = options.args ?? parseTranscriptCommandArgs(process.env.INKOS_TRANSCRIPT_ARGS ?? "");
    this.timeoutMs = options.timeoutMs ?? parseTranscriptTimeoutMs(process.env.INKOS_TRANSCRIPT_TIMEOUT_MS) ?? 60_000;
  }

  async fetch(url: string): Promise<TranscriptResult> {
    const classified = classifyResearchUrl(url);
    if (!this.command) {
      return {
        status: "unavailable",
        platform: classified.platform,
        url,
        reason: "INKOS_TRANSCRIPT_COMMAND is not configured",
      };
    }
    try {
      const { stdout } = await execFileAsync(this.command, [...this.args, url], {
        timeout: this.timeoutMs,
        windowsHide: true,
        maxBuffer: 20 * 1024 * 1024,
      });
      return parseTranscriptCommandOutput(url, stdout);
    } catch (error) {
      return {
        status: "failed",
        platform: classified.platform,
        url,
        reason: String(error),
        retryable: true,
      };
    }
  }
}

export function createExternalTranscriptProvider(options: ExternalTranscriptProviderOptions = {}): TranscriptProvider {
  return new ExternalTranscriptProvider(options);
}
