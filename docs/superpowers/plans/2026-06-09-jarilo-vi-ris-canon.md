# Jarilo-VI RIS Canon Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a source-of-truth RIS canon file for Jarilo-VI and wire it into the next-chapter focus so writer cannot rely on memory.

**Architecture:** Add a dedicated `story/canon/jarilo-vi.md` file with source links, required beats, forbidden deviations, allowed adaptations, and near-term chapter mapping. Update `book_rules.md` and `current_focus.md` so future generation treats the canon file as mandatory context.

**Tech Stack:** Markdown story documents in the existing Inkos novel book directory.

---

### Task 1: Create Jarilo-VI Canon RIS

**Files:**
- Create: `test-novel/books/thien-mac-thong-van-gioi-khoi-/story/canon/jarilo-vi.md`

- [ ] Record the web sources used: Fandom chapter page, Fandom raw transcript pages, Game8 mission order cross-check.
- [ ] List the mission order for both Jarilo-VI chapters.
- [ ] Convert mission summaries into required canon beats.
- [ ] Add forbidden deviations that specifically prevent role swaps, missing characters, and reordered betrayals.
- [ ] Add allowed adaptations for thiên mạc reactions, comedy, and pacing.

### Task 2: Update Rules

**Files:**
- Modify: `test-novel/books/thien-mac-thong-van-gioi-khoi-/story/book_rules.md`

- [ ] Add a RIS rule: before starting a new canon arc, writer/focus must use `story/canon/<arc>.md` if present.
- [ ] Add a validation rule: post-write review must check required beats, not only word count/drift.

### Task 3: Update Current Focus

**Files:**
- Modify: `test-novel/books/thien-mac-thong-van-gioi-khoi-/story/current_focus.md`

- [ ] Replace Herta repair focus with Jarilo-VI Ch17-20 focus.
- [ ] Require using `story/canon/jarilo-vi.md` as source-of-truth.
- [ ] Map Ch17-20 to the first canon beats: Astral Express prep, landing, Sampo, Gepard, Belobog, Cocolia/Bronya setup.

### Task 4: Verify

**Files:**
- Verify: `test-novel/books/thien-mac-thong-van-gioi-khoi-/story/canon/jarilo-vi.md`
- Verify: `test-novel/books/thien-mac-thong-van-gioi-khoi-/story/book_rules.md`
- Verify: `test-novel/books/thien-mac-thong-van-gioi-khoi-/story/current_focus.md`

- [ ] Confirm canon file contains no incomplete markers.
- [ ] Confirm key names appear with correct spelling: `Jarilo-VI`, `Belobog`, `Sampo`, `Gepard`, `Cocolia`, `Bronya`, `Seele`, `Natasha`, `Svarog`, `Serval`, `Welt Yang`.
- [ ] Confirm forbidden drift terms do not appear outside explicit prohibition context.
