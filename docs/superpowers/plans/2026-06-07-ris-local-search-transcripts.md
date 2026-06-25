# RIS Local Search And Transcripts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make RIS discovery and video transcript import usable for Chinese Bilibili story material.

**Architecture:** Keep Brave discovery as-is, extend the existing external transcript command to accept env args, and add a local `yt-dlp` wrapper script that emits the current transcript JSON contract. The script remains outside published packages and reads cookies only from env.

**Tech Stack:** Node.js 20 ESM, TypeScript, Vitest, Commander CLI, `yt-dlp` executable if installed locally.

---

### Task 1: External Transcript Command Args

**Files:**
- Modify: `packages/core/src/research/external-transcript-provider.ts`
- Test: `packages/core/src/__tests__/source-providers.test.ts`

- [ ] **Step 1: Write failing tests**

Add tests that set `INKOS_TRANSCRIPT_ARGS` and assert command args are inserted before the URL. Use a tiny Node fixture command that echoes the required transcript JSON.

- [ ] **Step 2: Verify red**

Run: `pnpm --filter @actalk/inkos-core test -- src/__tests__/source-providers.test.ts`

Expected: tests fail because `INKOS_TRANSCRIPT_ARGS` is ignored.

- [ ] **Step 3: Implement minimal support**

Parse `INKOS_TRANSCRIPT_ARGS` with a Windows-safe splitter that handles quoted args. Add optional `INKOS_TRANSCRIPT_TIMEOUT_MS` parsing.

- [ ] **Step 4: Verify green**

Run: `pnpm --filter @actalk/inkos-core test -- src/__tests__/source-providers.test.ts`

Expected: pass.

### Task 2: Local Transcript Provider Script

**Files:**
- Create: `scripts/transcript-provider.mjs`
- Create: `scripts/__fixtures__/bilibili.zh.vtt`
- Test: `packages/core/src/__tests__/source-providers.test.ts`

- [ ] **Step 1: Write failing parser tests**

Add tests for VTT cleanup: remove timestamps, cue numbers, duplicate adjacent subtitle lines, and preserve Chinese text.

- [ ] **Step 2: Verify red**

Run: `pnpm --filter @actalk/inkos-core test -- src/__tests__/source-providers.test.ts`

Expected: parser tests fail because script helpers do not exist.

- [ ] **Step 3: Implement script**

Create a Node ESM script that accepts `<url>`, calls `yt-dlp --dump-single-json --skip-download --write-subs --write-auto-subs --sub-langs zh,zh-CN,zh-Hans,zh-Hant,cmn,en --sub-format vtt/json3`, downloads subtitles to a temp dir, reads preferred Chinese subtitle, and prints transcript JSON.

- [ ] **Step 4: Verify green**

Run: `pnpm --filter @actalk/inkos-core test -- src/__tests__/source-providers.test.ts`

Expected: pass.

### Task 3: CLI/Docs Wiring

**Files:**
- Modify: `docs/research-info-system-roadmap.md`
- Maybe modify: `packages/cli/src/commands/research.ts`

- [ ] **Step 1: Document environment setup**

Add a short section with PowerShell examples for `BRAVE_API_KEY`, `INKOS_TRANSCRIPT_COMMAND`, `INKOS_TRANSCRIPT_ARGS`, `BILIBILI_COOKIES_FILE`, and `YT_DLP_COOKIES_FROM_BROWSER`.

- [ ] **Step 2: Build**

Run: `pnpm --filter @actalk/inkos-core build; if ($?) { pnpm --filter @actalk/inkos build }`

Expected: both builds pass.

### Task 4: E2E Verification

**Files:**
- Runtime output under `test-novel/books/khai-cuc-stream-belobog/research/`

- [ ] **Step 1: Check prerequisites**

Run: `yt-dlp --version`

Expected: prints a version. If missing, report that the provider is configured but runtime tool must be installed.

- [ ] **Step 2: Configure env for current shell**

Use PowerShell env vars, not repo config: `INKOS_TRANSCRIPT_COMMAND=node`, `INKOS_TRANSCRIPT_ARGS=..\scripts\transcript-provider.mjs`.

- [ ] **Step 3: Import Bilibili video**

From `test-novel`, run: `node "..\packages\cli\dist\index.js" research import-video khai-cuc-stream-belobog --url "https://www.bilibili.com/video/BV1Us4y197yZ/"`.

Expected: imported source has `Transcript status: available` and `Language: zh*`, or a clear metadata-only/cookie reason.

- [ ] **Step 4: Verify search if key exists**

If `BRAVE_API_KEY` is present, run `research discover` with a Chinese/Bilibili Belobog query.

Expected: discoveries are written and selected video records can be passed to `fetch-transcripts`.
