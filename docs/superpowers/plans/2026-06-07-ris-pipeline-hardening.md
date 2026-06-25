# RIS Pipeline Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add safe RIS cleanup and small writer guards so the pipeline fails less dangerously.

**Architecture:** Extend the research store/CLI with a conservative cleanup command, then add two narrow pipeline guards: one for clearly truncated chapter endings and one for over-aggressive normalization. Keep all changes local to existing command/store/runner patterns.

**Tech Stack:** Node.js 20 ESM, TypeScript, Vitest, Commander CLI.

---

### Task 1: Research Clear

**Files:**
- Modify: `packages/cli/src/commands/research.ts`
- Modify: `packages/core/src/research/research-store.ts`
- Test: `packages/cli/src/__tests__/research-command.test.ts`
- Test: `packages/core/src/__tests__/research-store.test.ts`

- [ ] **Step 1: Write failing tests**
- [ ] **Step 2: Run tests to verify red**
- [ ] **Step 3: Implement minimal clear/prune support**
- [ ] **Step 4: Run tests to verify green**

### Task 2: Chapter Truncation Guard

**Files:**
- Modify: `packages/core/src/pipeline/runner.ts`
- Maybe modify: `packages/core/src/agents/writer-parser.ts`
- Test: `packages/core/src/__tests__/pipeline-runner.test.ts`

- [ ] **Step 1: Write failing test for truncated chapter rejection**
- [ ] **Step 2: Run test to verify red**
- [ ] **Step 3: Implement minimal EOF truncation heuristic**
- [ ] **Step 4: Run test to verify green**

### Task 3: Normalizer Guard

**Files:**
- Modify: `packages/core/src/pipeline/runner.ts`
- Test: `packages/core/src/__tests__/pipeline-runner.test.ts`

- [ ] **Step 1: Write failing test where normalized draft is worse than original**
- [ ] **Step 2: Run test to verify red**
- [ ] **Step 3: Implement hard-range distance comparison and keep better version**
- [ ] **Step 4: Run test to verify green**

### Task 4: Final Verification

**Files:**
- Runtime verification in `test-novel/`

- [ ] **Step 1: Run targeted tests**
- [ ] **Step 2: Build core and CLI**
- [ ] **Step 3: Dry-run `research clear` on current book**
- [ ] **Step 4: Report resulting recommended cleanup command**
