# Opus Writing Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a proper Opus-oriented writer mode that constrains prose generation with all-user prompts, a hard state capsule, paragraph budget, tight completion tokens, and deterministic post-validation before state is trusted.

**Architecture:** Extend model override config with `maxTokens` and writer behavior with `writingMode: "opus"`. The writer injects an Opus control capsule into governed prompts and applies a deterministic validator after draft generation; pipeline metadata marks Opus deterministic failures as needing manual fix instead of trusting state drift.

**Tech Stack:** TypeScript, Vitest, InkOS core writer pipeline, existing post-write validator and model override schema.

---

### Task 1: Config Plumbing

**Files:**
- Modify: `packages/core/src/models/project.ts`
- Modify: `packages/core/src/pipeline/runner.ts`
- Test: `packages/core/src/__tests__/models.test.ts`

- [x] Add optional `maxTokens?: number` and `writingMode?: "standard" | "opus"` to `AgentLLMOverrideSchema`.
- [x] Carry `maxTokens` from agent override into the `LLMClient.defaults` or agent context in `PipelineRunner.resolveOverride`.
- [x] Add schema tests proving config accepts `maxTokens` and `writingMode` and rejects invalid mode.

### Task 2: Opus Control Capsule

**Files:**
- Create: `packages/core/src/agents/opus-writing-mode.ts`
- Modify: `packages/core/src/agents/writer.ts`
- Test: `packages/core/src/__tests__/opus-writing-mode.test.ts`

- [x] Implement `buildOpusHardStateCapsule()` that extracts compact current-state facts, forbidden events, style bans, and required chapter beats from writer inputs.
- [x] Implement `buildOpusParagraphBudget()` that maps target length into explicit passage/reaction paragraph limits.
- [x] Inject these blocks into governed writer prompts only when `writingMode === "opus"`.

### Task 3: Deterministic Opus Validator

**Files:**
- Create: `packages/core/src/agents/opus-post-validator.ts`
- Modify: `packages/core/src/agents/writer.ts`
- Test: `packages/core/src/__tests__/opus-post-validator.test.ts`

- [x] Add regex/structural checks for known Opus drift: `---`, italic prose, permanent `vết sẹo`, blood eyes/ears, forbidden meta words, vague reaction anchor, state-ahead hook markers.
- [x] Return errors for hard violations and warnings for style risks.
- [x] Merge errors/warnings into writer `postWriteErrors`/`postWriteWarnings`.

### Task 4: Pipeline Gating

**Files:**
- Modify: `packages/core/src/pipeline/runner.ts`
- Test: `packages/core/src/__tests__/pipeline-runner.test.ts` or a focused writer/pipeline test

- [x] Ensure post-write errors from Opus deterministic validator prevent `ready-for-review` and produce `needs-manual-fix`/existing audit-failed path before state is accepted as final truth.
- [x] Keep body as authority when deterministic validator flags state-ahead issues.

### Task 5: Project Config and Docs

**Files:**
- Modify: `test-novel/inkos.json`
- Modify: `docs/model-routing.md`

- [x] Configure writer/reviser with `instructionMode: "all-user"`, `writingMode: "opus"`, and tight `maxTokens`.
- [x] Document Opus writing mode and the reason `stream:false` may be needed for unreliable providers.

### Verification

- [x] Run `pnpm --filter @actalk/inkos-core test -- opus-writing-mode.test.ts opus-post-validator.test.ts models.test.ts`.
- [x] Run any runner/writer focused tests touched by gating.
- [x] Run `pnpm --filter @actalk/inkos build`.
