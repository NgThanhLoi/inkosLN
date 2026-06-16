#!/usr/bin/env node
import { execFile } from "node:child_process";
import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const CHINESE_LANGS = ["zh", "zh-CN", "zh-Hans", "zh-Hant", "cmn"];
const FALLBACK_LANGS = ["en"];
const SUB_LANGS = [...CHINESE_LANGS, ...FALLBACK_LANGS].join(",");

export function cleanVttTranscript(input) {
  const lines = input
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && line !== "WEBVTT")
    .filter((line) => !/^NOTE\b/.test(line))
    .filter((line) => !/^\d+$/.test(line))
    .filter((line) => !line.includes("-->"))
    .map((line) => line.replace(/<[^>]+>/g, "").trim())
    .filter(Boolean);

  const deduped = [];
  for (const line of lines) {
    if (deduped.at(-1) !== line) deduped.push(line);
  }
  return deduped.join("\n");
}

export function cleanJson3Transcript(input) {
  const parsed = JSON.parse(input);
  const events = Array.isArray(parsed.events) ? parsed.events : [];
  const lines = [];
  for (const event of events) {
    const segments = Array.isArray(event.segs) ? event.segs : [];
    const text = segments.map((segment) => typeof segment.utf8 === "string" ? segment.utf8 : "").join("").trim();
    if (text) lines.push(text);
  }
  const deduped = [];
  for (const line of lines) {
    if (deduped.at(-1) !== line) deduped.push(line);
  }
  return deduped.join("\n");
}

function classifyPlatform(url) {
  const lower = url.toLowerCase();
  if (lower.includes("bilibili.com/video/")) return "bilibili";
  if (lower.includes("youtube.com/watch") || lower.includes("youtu.be/")) return "youtube";
  return "unknown";
}

function cookieArgsFromEnv() {
  if (process.env.BILIBILI_COOKIES_FILE) return ["--cookies", process.env.BILIBILI_COOKIES_FILE];
  if (process.env.YT_DLP_COOKIES_FROM_BROWSER) return ["--cookies-from-browser", process.env.YT_DLP_COOKIES_FROM_BROWSER];
  return [];
}

export function parseCommandArgs(value) {
  const args = [];
  let current = "";
  let quote;
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

function browserHeaderArgs(url) {
  return [
    "--user-agent",
    process.env.YT_DLP_USER_AGENT ?? "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "--referer",
    process.env.YT_DLP_REFERER ?? (url.includes("bilibili.com") ? "https://www.bilibili.com/" : url),
  ];
}

function metadataTextFromYtDlp(metadata) {
  const tags = Array.isArray(metadata.tags) ? metadata.tags.join(", ") : undefined;
  return [
    metadata.title ? `Title: ${metadata.title}` : undefined,
    metadata.uploader ? `Uploader: ${metadata.uploader}` : undefined,
    metadata.description ? `Description:\n${metadata.description}` : undefined,
    tags ? `Tags: ${tags}` : undefined,
    typeof metadata.duration === "number" ? `Duration seconds: ${metadata.duration}` : undefined,
    typeof metadata.view_count === "number" ? `View count: ${metadata.view_count}` : undefined,
    typeof metadata.like_count === "number" ? `Like count: ${metadata.like_count}` : undefined,
  ].filter(Boolean).join("\n\n");
}

export function buildTranscriptWithMetadata(transcript, metadata) {
  const metadataText = metadataTextFromYtDlp(metadata);
  if (!metadataText) return transcript.trim();
  return [transcript.trim(), "", "## Video Metadata", "", metadataText].join("\n");
}

export function parseAsrOutput(stdout, fallbackLanguage) {
  const trimmed = stdout.trim();
  if (!trimmed) return { text: "", language: fallbackLanguage };
  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === "object" && typeof parsed.text === "string") {
      return {
        text: parsed.text.trim(),
        language: typeof parsed.language === "string" && parsed.language.trim() ? parsed.language.trim() : fallbackLanguage,
      };
    }
  } catch {
    // Plain text stdout is supported for simple ASR commands.
  }
  return { text: trimmed, language: fallbackLanguage };
}

async function listFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(fullPath));
    if (entry.isFile()) files.push(fullPath);
  }
  return files;
}

function languageScore(file) {
  const normalized = file.replace(/\\/g, "/").toLowerCase();
  const langs = [...CHINESE_LANGS, ...FALLBACK_LANGS];
  for (let index = 0; index < langs.length; index += 1) {
    const lang = langs[index].toLowerCase();
    if (normalized.includes(`.${lang}.`) || normalized.includes(`.${lang}-`)) return index;
  }
  return langs.length + 1;
}

function inferLanguage(file) {
  const normalized = file.replace(/\\/g, "/").toLowerCase();
  for (const lang of [...CHINESE_LANGS, ...FALLBACK_LANGS]) {
    const lower = lang.toLowerCase();
    if (normalized.includes(`.${lower}.`) || normalized.includes(`.${lower}-`)) return lang;
  }
  return undefined;
}

async function readTranscriptFile(file) {
  const raw = await readFile(file, "utf-8");
  if (file.toLowerCase().endsWith(".json3")) return cleanJson3Transcript(raw);
  return cleanVttTranscript(raw);
}

async function downloadAudio(url, tempDir, ytdlpCommand) {
  const args = [
    "--format",
    "bestaudio/best",
    "--paths",
    tempDir,
    "--output",
    "%(id)s.%(ext)s",
    "--no-playlist",
    ...browserHeaderArgs(url),
    ...cookieArgsFromEnv(),
    url,
  ];
  await execFileAsync(ytdlpCommand, args, {
    timeout: Number(process.env.INKOS_YTDLP_TIMEOUT_MS ?? 120_000),
    windowsHide: true,
    maxBuffer: 50 * 1024 * 1024,
  });
  const files = await listFiles(tempDir);
  return files.find((file) => /\.(m4a|mp3|wav|webm|opus|mp4)$/i.test(file));
}

async function runAsr(audioPath) {
  const command = process.env.INKOS_ASR_COMMAND;
  if (!command) return undefined;
  const args = [...parseCommandArgs(process.env.INKOS_ASR_ARGS ?? ""), audioPath];
  const { stdout } = await execFileAsync(command, args, {
    timeout: Number(process.env.INKOS_ASR_TIMEOUT_MS ?? 600_000),
    windowsHide: true,
    maxBuffer: 50 * 1024 * 1024,
  });
  return parseAsrOutput(stdout, process.env.INKOS_ASR_LANGUAGE ?? "zh");
}

async function main() {
  const url = process.argv.at(-1);
  if (!url || !/^https?:\/\//.test(url)) {
    console.log(JSON.stringify({
      status: "failed",
      platform: "unknown",
      url: url ?? "https://invalid.local/",
      reason: "Usage: transcript-provider.mjs <video-url>",
      retryable: false,
    }));
    return;
  }

  const platform = classifyPlatform(url);
  const tempDir = await mkdtemp(join(tmpdir(), "inkos-transcript-"));
  try {
    const args = [
      "--dump-single-json",
      "--skip-download",
      "--write-subs",
      "--write-auto-subs",
      "--sub-langs",
      SUB_LANGS,
      "--sub-format",
      "vtt/json3",
      "--paths",
      tempDir,
      "--output",
      "%(id)s.%(ext)s",
      "--no-playlist",
      ...browserHeaderArgs(url),
      ...cookieArgsFromEnv(),
      url,
    ];
    const ytdlpCommand = process.env.YT_DLP_COMMAND ?? "yt-dlp";
    const { stdout } = await execFileAsync(ytdlpCommand, args, {
      timeout: Number(process.env.INKOS_YTDLP_TIMEOUT_MS ?? 120_000),
      windowsHide: true,
      maxBuffer: 50 * 1024 * 1024,
    });
    const metadata = JSON.parse(stdout);
    const files = (await listFiles(tempDir))
      .filter((file) => /\.(vtt|json3)$/i.test(file))
      .sort((a, b) => languageScore(a) - languageScore(b));
    for (const file of files) {
      const text = await readTranscriptFile(file);
      if (!text) continue;
      console.log(JSON.stringify({
        status: "available",
        platform,
        title: metadata.title,
        channel: metadata.uploader ?? metadata.channel,
        language: inferLanguage(file) ?? metadata.language,
        transcriptKind: file.toLowerCase().includes("auto") ? "auto_caption" : "official_caption",
        text,
      }));
      return;
    }
    if (process.env.INKOS_ASR_COMMAND) {
      const audioPath = await downloadAudio(url, tempDir, ytdlpCommand);
      if (audioPath) {
        const asr = await runAsr(audioPath);
        if (asr?.text) {
          console.log(JSON.stringify({
            status: "available",
            platform,
            title: metadata.title,
            channel: metadata.uploader ?? metadata.channel,
            language: asr.language,
            transcriptKind: "auto_caption",
            text: buildTranscriptWithMetadata(asr.text, metadata),
          }));
          return;
        }
      }
    }
    console.log(JSON.stringify({
      status: "unavailable",
      platform,
      title: metadata.title,
      channel: metadata.uploader ?? metadata.channel,
      reason: `No supported subtitle file found for languages: ${SUB_LANGS}`,
      metadataText: metadataTextFromYtDlp(metadata),
    }));
  } catch (error) {
    console.log(JSON.stringify({
      status: "failed",
      platform,
      url,
      reason: String(error),
      retryable: true,
    }));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/")}` || process.argv[1]?.endsWith("transcript-provider.mjs")) {
  await main();
}
