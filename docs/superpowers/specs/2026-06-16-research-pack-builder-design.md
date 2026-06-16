# Research Pack Builder — Design Spec

**Date:** 2026-06-16  
**Status:** Approved  
**Scope:** Automated research-to-writer pipeline for reference-heavy genres

---

## Problem

InkOS pipeline hiện tại không có cơ chế tự động đưa tư liệu tham khảo vào writer prompt. Với thể loại cần nhiều facts (bóng đá, lịch sử, fanfic), user phải tự soạn `researchContext` bằng tay hoặc bỏ qua hoàn toàn.

## Goal

Import tư liệu → tự extract facts → tự chọn facts phù hợp/chương → inject vào writer. Một nút bấm.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Research Pipeline                       │
├─────────────┬───────────────┬───────────────────────────┤
│  Importer   │   Extractor   │       Pack Builder        │
│ (A: file)   │ (LLM extract) │ (auto per-chapter query)  │
│ (B: URL)    │  → fact cards  │  → researchContext string │
└─────┬───────┴───────┬───────┴───────────┬───────────────┘
      │               │                   │
      ▼               ▼                   ▼
┌─────────────────────────────────────────────────────────┐
│         research_facts (SQLite FTS5 table)               │
│  in: {bookDir}/story/memory.db                           │
└─────────────────────────────────────────────────────────┘
```

### Data flow khi viết 1 chương

1. PipelineRunner bắt đầu viết chương N
2. Check `researchEnabled` (genre profile hoặc book_rules override)
3. Nếu enabled → gọi `buildResearchPack(bookDir, chapterNumber)`
4. Pack Builder: đọc outline → extract query terms → query FTS5 → score → trim to budget → format
5. Kết quả trả về `researchContext` string → inject vào `WriteChapterInput`

---

## Research Toggle

**Mặc định OFF.** Bật qua genre profile hoặc book config.

```
researchEnabled = book_rules.research?.enabled 
                  ?? genreProfile.researchEnabled 
                  ?? false
```

Khi OFF hoặc DB trống → skip pack builder hoàn toàn, pipeline chạy bình thường.

### Genre profile config

```json
{
  "researchEnabled": true,
  "researchBudgetTokens": 4000
}
```

Ví dụ:
- `fantasy.md`: không set (default false, 0 tokens)
- `football-reincarnation.md`: `researchEnabled: true`, `researchBudgetTokens: 4000`
- Fanfic: genre default false, book override enabled

### Book-level override (book_rules.json)

```json
{
  "research": {
    "enabled": true,
    "budgetTokens": 3000
  }
}
```

---

## Importer Module

### A: File Import

Mở rộng `importResearchSourceFile` hiện tại:
- Batch import: `inkos research import ./data/*.md`
- Auto-extract sau import (flag `--extract`, mặc định on)
- Insert extracted facts vào SQLite FTS5

### B: URL Import

```
inkos research fetch <url>
```

Hỗ trợ:
- Web page → fetch HTML, strip to markdown
- YouTube → `transcript-provider.mjs` (đã có)
- Bilibili → `asr-whisper-provider.py` (đã có)

Kết quả lưu vào `research/sources/`, chạy extract, insert SQLite.

### Extract step

`ResearcherAgent.extract()` không đổi. Sau extract:
- Append vào file `.jsonl` (backup/human-readable)
- INSERT vào `research_facts` SQLite table (index chính cho query)

---

## Pack Builder

### Interface

```typescript
interface PackResult {
  readonly content: string;        // markdown block inject vào writer
  readonly factCount: number;
  readonly tokenEstimate: number;
  readonly queryTerms: string[];
}

async function buildResearchPack(options: {
  bookDir: string;
  chapterNumber: number;
  outlineEntry: string;
  budgetTokens: number;
  hints?: { timeline?: string; entities?: string[] };
}): Promise<PackResult | undefined>
```

### Query strategy (3 layers, ưu tiên giảm dần)

1. **Explicit hints** — outline có `<!-- timeline: 2010-08 | entities: Mateus, Blackburn -->` → query trực tiếp
2. **Entity extraction** — regex match tên riêng trong outline entry → FTS5 match trên `entities`
3. **Keyword FTS** — fallback full-text search trên `statement`

### Scoring

- Timeline match: +3 (cùng arc + gần order)
- Entity match: +2 (per entity trùng)
- FTS relevance: +1 (BM25)
- Confidence boost: `canon` +2, `official` +1, `speculative` -1

Sort descending, fill cho đến hết budget.

### Output format

```markdown
## Tư liệu tham khảo (Chương N)

**Timeline: [arc context]**

- [confidence] statement
- [confidence] statement

**Nhân vật liên quan:**
- entity: relevant facts
```

### Auto vs Manual

- **Auto**: PipelineRunner gọi trước `writeChapter()` — transparent, zero intervention
- **Manual**: `inkos research pack --chapter 3` → preview; `--save` → lưu vào `research/packs/ch003.md`
- Pipeline ưu tiên saved pack file nếu tồn tại, fallback auto-build

---

## SQLite FTS5 Schema

Thêm vào `{bookDir}/story/memory.db` hiện tại:

```sql
CREATE TABLE IF NOT EXISTS research_facts (
  id             TEXT PRIMARY KEY,
  source_id      TEXT NOT NULL,
  type           TEXT NOT NULL,
  confidence     TEXT NOT NULL,
  statement      TEXT NOT NULL,
  entities       TEXT NOT NULL DEFAULT '',
  tags           TEXT NOT NULL DEFAULT '',
  timeline_arc   TEXT,
  timeline_order REAL,
  allowed_use    TEXT,
  forbidden_use  TEXT,
  notes          TEXT,
  created_at     TEXT NOT NULL
);

CREATE VIRTUAL TABLE IF NOT EXISTS research_facts_fts USING fts5(
  statement, entities, tags,
  content='research_facts',
  content_rowid='rowid'
);
```

Triggers sync FTS5 on insert/delete. Migration bằng `CREATE TABLE IF NOT EXISTS`.

---

## Error Handling

| Case | Behavior |
|------|----------|
| Research DB trống | Pack returns undefined, writer runs normally |
| Extract fail (LLM rác) | Log warning, source saved, no facts inserted |
| Pack query < 3 results | Log info, inject what's available |
| Token budget vượt | Trim lowest-score facts |
| Duplicate source import | Skip with warning |
| Outline missing chapter entry | Fallback: extract entities from recent 3 chapter summaries |

---

## CLI Commands

```bash
# Import
inkos research import <file|glob>         # import + extract
inkos research fetch <url>                # fetch + import + extract

# Manage
inkos research list                       # list sources + fact count
inkos research stats                      # total facts, coverage per arc
inkos research clear --failed             # cleanup failed transcripts

# Pack
inkos research pack --chapter <N>         # preview pack
inkos research pack --chapter <N> --save  # save for pipeline use

# Toggle: via genre profile or book_rules.json
```

---

## Out of Scope

- Vector DB / embeddings (overkill cho scale này)
- Auto-discovery via Brave search (available but optional, not core flow)
- Semantic search (FTS5 + structured metadata đủ dùng)

## Future Extensions

- Embedding layer on top nếu corpus vượt ~5000 facts
- Cross-book fact sharing (universe-level canon)
- Confidence decay (facts từ source cũ giảm score)
