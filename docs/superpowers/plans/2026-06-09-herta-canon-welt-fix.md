# Herta Canon Welt Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore the canonical Herta Space Station beat where Welt Yang intervenes when Caelus loses control of the Stellaron.

**Architecture:** Keep Chapters 13-14 intact. Rewrite Chapter 15 from the post-Doomsday-Beast moment onward, then rewrite Chapter 16 as aftermath, debrief, Welt introduction, and Astral Express boarding with the Jarilo-VI hook preserved.

**Tech Stack:** Markdown chapter files, JSON chapter index, existing Inkos novel project files.

---

### Task 1: Steering Rules

**Files:**
- Modify: `test-novel/books/thien-mac-thong-van-gioi-khoi-/story/book_rules.md`
- Modify: `test-novel/books/thien-mac-thong-van-gioi-khoi-/story/current_focus.md`

- [ ] Add a rule that major HSR canon beats cannot be skipped unless explicitly planned.
- [ ] Add the Herta finale required sequence: Doomsday Beast repelled, Stellaron outburst, Welt intervention, Caelus recovery, Astral Express invitation.
- [ ] Update current focus to Ch15-16 repair and next Ch17 Jarilo-VI start.

### Task 2: Chapter 15 Repair

**Files:**
- Modify: `test-novel/books/thien-mac-thong-van-gioi-khoi-/chapters/0015_Đỉnh_Điểm_Trạm_Herta_Đòn_Swing_Của_Stellaron.md`

- [ ] Preserve the existing Doomsday Beast climax through the orbital strike.
- [ ] Replace the immediate calm/invitation with Stellaron outburst.
- [ ] Add Welt Yang entering and stopping Caelus with calm authority.
- [ ] Add Honkai Impact 3rd recognition reaction without using forbidden drift names.
- [ ] End with Caelus unconscious and the Welt mystery hook.

### Task 3: Chapter 16 Repair

**Files:**
- Modify: `test-novel/books/thien-mac-thong-van-gioi-khoi-/chapters/0016_Chuyến_Tàu_Đầu_Tiên_và_Người_Mở_Đường_Mới.md`

- [ ] Open with Caelus waking after the Stellaron incident.
- [ ] Include Himeko and Welt explaining the danger without info-dumping.
- [ ] Preserve Herta/Asta aftermath and fun tone.
- [ ] Move Astral Express invitation after the debrief.
- [ ] Preserve March 7th comedy, light Caelus x March 7th hint, and Jarilo-VI/Belobog hook.

### Task 4: Metadata and Verification

**Files:**
- Modify if needed: `test-novel/books/thien-mac-thong-van-gioi-khoi-/chapters/index.json`
- Verify: Ch15-16 chapter files

- [ ] Count Vietnamese words for Ch15 and Ch16.
- [ ] Update `wordCount` and `lengthTelemetry.finalCount` if sync is unavailable.
- [ ] Check forbidden drift terms.
- [ ] Check no Chinese body text or `正文完` appears.
- [ ] Check Ch15-16 include `Welt Yang` and maintain `Jarilo-VI`/`Belobog` hook.
