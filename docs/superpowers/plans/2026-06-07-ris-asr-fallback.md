# RIS ASR Fallback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add local ASR fallback so RIS can transcribe Chinese Bilibili audio when subtitles are unavailable.

**Architecture:** Extend `scripts/transcript-provider.mjs` with small exported helpers for ASR env parsing, ASR stdout parsing, and audio fallback. Keep ASR as an external command to avoid heavy dependencies in the repo.

**Tech Stack:** Node.js 20 ESM, Vitest, `yt-dlp`, optional Python/faster-whisper runtime.

---

### Task 1: ASR Helper Tests And Implementation

**Files:**
- Modify: `packages/core/src/__tests__/source-providers.test.ts`
- Modify: `scripts/transcript-provider.mjs`

- [ ] **Step 1: Write failing tests**

Add tests importing `parseCommandArgs`, `parseAsrOutput`, and `buildTranscriptWithMetadata` from `scripts/transcript-provider.mjs`.

- [ ] **Step 2: Verify red**

Run: `pnpm --filter @actalk/inkos-core test -- src/__tests__/source-providers.test.ts`

Expected: fail because helpers are missing.

- [ ] **Step 3: Implement helpers**

Export helpers from `scripts/transcript-provider.mjs`; keep behavior minimal and deterministic.

- [ ] **Step 4: Verify green**

Run: `pnpm --filter @actalk/inkos-core test -- src/__tests__/source-providers.test.ts`

Expected: pass.

### Task 2: ASR Fallback Flow

**Files:**
- Modify: `scripts/transcript-provider.mjs`
- Modify: `docs/research-info-system-roadmap.md`

- [ ] **Step 1: Add audio download fallback**

When no subtitle file exists and `INKOS_ASR_COMMAND` is set, run `yt-dlp --extract-audio --audio-format m4a` into the temp dir.

- [ ] **Step 2: Run ASR command**

Run `INKOS_ASR_COMMAND` with parsed `INKOS_ASR_ARGS` and the audio path as final arg. Parse JSON/plain text stdout.

- [ ] **Step 3: Return available auto caption**

Return transcript result with `transcriptKind: "auto_caption"`, language from ASR output or `INKOS_ASR_LANGUAGE`, and metadata appended.

- [ ] **Step 4: Document setup**

Add PowerShell examples for `INKOS_ASR_COMMAND`, `INKOS_ASR_ARGS`, and `INKOS_ASR_LANGUAGE`.

### Task 3: Verification

**Files:**
- Runtime source under `test-novel/books/khai-cuc-stream-belobog/research/sources/`

- [ ] **Step 1: Run tests and builds**

Run: `pnpm --filter @actalk/inkos-core test -- src/__tests__/source-providers.test.ts src/__tests__/source-acquisition.test.ts; if ($?) { pnpm --filter @actalk/inkos-core build }; if ($?) { pnpm --filter @actalk/inkos build }`

- [ ] **Step 2: Try E2E if ASR runtime exists**

If a Python ASR command can be configured, run `research import-video` for `BV1Us4y197yZ` and inspect whether the source is `Transcript kind: auto_caption`.
