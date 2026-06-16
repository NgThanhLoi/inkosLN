# Research Pack Builder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an automated pipeline that imports reference material, extracts structured facts, and auto-selects relevant facts per chapter for injection into the writer prompt.

**Architecture:** Extend existing SQLite memory.db with FTS5-indexed research_facts table. A Pack Builder queries this table using outline hints + entity extraction + keyword FTS, scores results, trims to token budget, and formats as researchContext string for the writer.

**Tech Stack:** Node.js node:sqlite (built-in), SQLite FTS5, existing ResearcherAgent for extraction, existing CLI commander framework.

---

## File Structure

| File | Responsibility |
|------|---------------|
| `packages/core/src/research/research-facts-db.ts` | NEW — SQLite FTS5 CRUD for research_facts table |
| `packages/core/src/research/pack-builder.ts` | NEW — Query + score + format research pack |
| `packages/core/src/research/outline-hints.ts` | NEW — Parse outline hints and extract entities |
| `packages/core/src/__tests__/research-facts-db.test.ts` | NEW — Tests for FTS5 layer |
| `packages/core/src/__tests__/pack-builder.test.ts` | NEW — Tests for pack builder |
| `packages/core/src/__tests__/outline-hints.test.ts` | NEW — Tests for hint parsing |
| `packages/core/src/models/genre-profile.ts` | MODIFY — Add researchEnabled, researchBudgetTokens |
| `packages/core/src/models/book-rules.ts` | MODIFY — Add research override schema |
| `packages/core/src/pipeline/runner.ts` | MODIFY — Integrate pack builder before writeChapter |
| `packages/core/src/research/research-store.ts` | MODIFY — Insert facts into SQLite after extract |
| `packages/cli/src/commands/research.ts` | MODIFY — Add pack subcommand |

---

### Task 1: SQLite FTS5 Layer

**Files:**
- Create: `packages/core/src/research/research-facts-db.ts`
- Test: `packages/core/src/__tests__/research-facts-db.test.ts`

- [ ] **Step 1:** Write test file that constructs ResearchFactsDB with a temp dir and asserts `count()` returns 0.

- [ ] **Step 2:** Run test — expect FAIL (module not found).

- [ ] **Step 3:** Implement `ResearchFactsDB` class:
  - Constructor: open `{bookDir}/story/memory.db`, PRAGMA WAL, call migrate()
  - `migrate()`: CREATE TABLE IF NOT EXISTS research_facts (id TEXT PK, source_id, type, confidence, statement, entities, tags, timeline_arc, timeline_order, allowed_use, forbidden_use, notes, created_at) + FTS5 virtual table + insert/delete/update triggers for FTS sync
  - `insertCard(card: ResearchFactCard)`: INSERT OR REPLACE, join entities/tags with comma
  - `insertCards(cards)`: loop insertCard
  - `deleteBySourceId(sourceId)`: DELETE WHERE source_id = ?
  - `count()`: SELECT COUNT(*)
  - `queryByEntities(entities: string[])`: LIKE match on entities column
  - `queryByTimeline(arc, orderMin?, orderMax?)`: filter by timeline_arc + order range
  - `queryFTS(query, limit=20)`: FTS5 MATCH with rank ORDER, LIMIT
  - `close()`: close db

- [ ] **Step 4:** Run test — expect PASS.

- [ ] **Step 5:** Add tests: insert+queryByEntity, insert+queryFTS, insert+queryByTimeline, deleteBySourceId.

- [ ] **Step 6:** Run all tests — expect PASS.

- [ ] **Step 7:** Commit: `feat(research): add ResearchFactsDB with FTS5 index`

---

### Task 2: Outline Hints Parser

**Files:**
- Create: `packages/core/src/research/outline-hints.ts`
- Test: `packages/core/src/__tests__/outline-hints.test.ts`

- [ ] **Step 1:** Write tests:
  - Parse `<!-- timeline: 2010-08 | entities: Mateus, Blackburn -->` returns structured hints
  - No comment returns empty hints
  - Extracts capitalized proper nouns from plain text
  - Merges explicit hints + extracted entities

- [ ] **Step 2:** Run tests — expect FAIL.

- [ ] **Step 3:** Implement `parseOutlineHints(outlineEntry: string): OutlineHints`:
  - Regex for `<!-- timeline: (.+?) \| entities: (.+?) -->`
  - Proper noun extraction: `/\b[A-Z][a-z]{2,}/g` + CJK patterns
  - Return `{ timeline?: string, entities: string[] }`

- [ ] **Step 4:** Run tests — expect PASS.

- [ ] **Step 5:** Commit: `feat(research): add outline hint parser for pack builder`

---

### Task 3: Pack Builder Core

**Files:**
- Create: `packages/core/src/research/pack-builder.ts`
- Test: `packages/core/src/__tests__/pack-builder.test.ts`

- [ ] **Step 1:** Write tests:
  - Empty DB returns undefined
  - Facts with matching entities returns PackResult with formatted content
  - Token budget trims lowest-score facts
  - Timeline match scores higher than FTS-only
  - Saved pack file (`research/packs/ch003.md`) takes priority over auto-build

- [ ] **Step 2:** Run tests — expect FAIL.

- [ ] **Step 3:** Implement `buildResearchPack(options: BuildPackOptions): Promise<PackResult | undefined>`:
  - Check for saved pack file first (return file content if exists)
  - Open ResearchFactsDB
  - Parse outline hints
  - Query layer 1: entities, layer 2: timeline, layer 3: FTS keywords
  - Deduplicate by fact id
  - Score: timeline +3, entity +2, FTS +1, confidence (canon +2, official +1, speculative -1)
  - Sort desc, accumulate until budget (estimate 4 chars/token)
  - Format markdown: header, timeline context, bullet list with [confidence] prefix, entity section
  - Close DB, return PackResult

- [ ] **Step 4:** Run tests — expect PASS.

- [ ] **Step 5:** Commit: `feat(research): add pack builder with scoring and token budget`

---

### Task 4: Genre Profile + BookRules Config

**Files:**
- Modify: `packages/core/src/models/genre-profile.ts`
- Modify: `packages/core/src/models/book-rules.ts`
- Modify: `packages/core/genres/football-reincarnation.md`

- [ ] **Step 1:** Add to GenreProfileSchema:
  ```
  researchEnabled: z.boolean().default(false)
  researchBudgetTokens: z.number().int().positive().default(2000)
  ```

- [ ] **Step 2:** Add to BookRulesSchema:
  ```
  research: z.object({
    enabled: z.boolean(),
    budgetTokens: z.number().int().positive().optional(),
  }).optional()
  ```

- [ ] **Step 3:** Update `football-reincarnation.md` frontmatter: add `researchEnabled: true` and `researchBudgetTokens: 4000`.

- [ ] **Step 4:** Run existing tests — expect all pass (additive changes with defaults).

- [ ] **Step 5:** Commit: `feat(research): add researchEnabled config to genre profile and book rules`

---

### Task 5: Wire Extract to SQLite Insert

**Files:**
- Modify: `packages/core/src/research/research-store.ts`

- [ ] **Step 1:** Add `insertFactsToIndex(bookDir, cards)` function that opens ResearchFactsDB, inserts cards, closes. Wrap in try/catch (SQLite failure logs warning, does not break JSONL).

- [ ] **Step 2:** Call `insertFactsToIndex` at the end of `appendResearchFactCards` — dual-write to JSONL + SQLite.

- [ ] **Step 3:** Write test: after appendResearchFactCards, open DB and verify count matches card count.

- [ ] **Step 4:** Run tests — expect PASS.

- [ ] **Step 5:** Commit: `feat(research): dual-write facts to JSONL + SQLite FTS5`

---

### Task 6: Pipeline Integration

**Files:**
- Modify: `packages/core/src/pipeline/runner.ts`

- [ ] **Step 1:** Add helper `resolveResearchContext(bookDir, chapterNumber, outlineEntry, genreProfile, bookRules)`:
  - Check enabled: `bookRules?.research?.enabled ?? genreProfile.researchEnabled ?? false`
  - If disabled, return undefined
  - Resolve budget: `bookRules?.research?.budgetTokens ?? genreProfile.researchBudgetTokens ?? 2000`
  - Call buildResearchPack, return content

- [ ] **Step 2:** Before the `writeChapter` call in the pipeline, invoke resolveResearchContext and pass result as `researchContext` in WriteChapterInput. Read outline entry for the current chapter from volume outline.

- [ ] **Step 3:** Add integration test: with researchEnabled and facts in DB, verify non-empty researchContext reaches writer input.

- [ ] **Step 4:** Run tests — expect PASS.

- [ ] **Step 5:** Commit: `feat(research): auto-inject research pack in pipeline when enabled`

---

### Task 7: CLI Pack Command

**Files:**
- Modify: `packages/cli/src/commands/research.ts`

- [ ] **Step 1:** Add `pack` subcommand:
  - `--chapter <N>` (required): target chapter
  - `--save` (optional): write to `research/packs/ch{NNN}.md`
  - Action: load book config + genre profile, read outline entry, call buildResearchPack, print/save

- [ ] **Step 2:** Manual test: `inkos research pack --chapter 1` prints pack or "No research facts found".

- [ ] **Step 3:** Commit: `feat(cli): add research pack command for preview/save`

---

### Task 8: End-to-End Verification

- [ ] **Step 1:** Run full test suite: `pnpm test` — all pass.

- [ ] **Step 2:** Manual e2e flow:
  1. `inkos research import ./test-data.md` → imports + extracts + inserts SQLite
  2. `inkos research list` → shows source with fact count
  3. `inkos research pack --chapter 1` → formatted pack output
  4. Pipeline write with researchEnabled=true → researchContext in writer prompt

- [ ] **Step 3:** Build all packages: `pnpm build` — clean build.

- [ ] **Step 4:** Final commit: `feat(research): complete research pack builder pipeline`
