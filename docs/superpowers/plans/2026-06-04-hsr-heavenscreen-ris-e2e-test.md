# HSR Heavenscreen RIS E2E Test Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Run a real end-to-end Vietnamese HSR heavenscreen test that exercises genre generation, RIS local research, Brave discovery, transcript fallback/tool behavior, and first-chapter writing.

**Architecture:** Use `test-novel` as the runtime project. Start with preflight checks for built CLI, Brave discovery, and transcript provider behavior, then create a scoped HSR Belobog heavenscreen book from a brief and run the research/write flow.

**Tech Stack:** PowerShell, Node CLI dist build, InkOS CLI commands, built-in `heavenscreen` genre, RIS Lite research commands.

---

### Task 1: Build and Preflight Providers

**Files:**
- Runtime project: `E:\Tools\inkosLN\test-novel`
- CLI entry: `E:\Tools\inkosLN\packages\cli\dist\index.js`

- [ ] **Step 1: Build core package**

Run from `E:\Tools\inkosLN`:

```powershell
pnpm --filter @actalk/inkos-core build
```

Expected: exit 0.

- [ ] **Step 2: Build CLI package**

Run from `E:\Tools\inkosLN`:

```powershell
pnpm --filter @actalk/inkos build
```

Expected: exit 0 and `packages\cli\dist\index.js` exists.

- [ ] **Step 3: Preflight Brave discovery**

Run from `E:\Tools\inkosLN\test-novel`:

```powershell
node "E:\Tools\inkosLN\packages\cli\dist\index.js" research init brave-preflight
node "E:\Tools\inkosLN\packages\cli\dist\index.js" research discover brave-preflight --query "Honkai Star Rail Belobog Trailblazer" --limit 3
```

Expected: if `BRAVE_API_KEY` is configured, discovery writes latest results. If missing or API fails, record the failure and continue with local-source E2E.

- [ ] **Step 4: Preflight transcript provider behavior**

Run from `E:\Tools\inkosLN\test-novel`:

```powershell
node "E:\Tools\inkosLN\packages\cli\dist\index.js" research import-video brave-preflight --url "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
node "E:\Tools\inkosLN\packages\cli\dist\index.js" research check brave-preflight
```

Expected: if `INKOS_TRANSCRIPT_COMMAND` is configured, a transcript source may be imported. If not configured, metadata-only source is imported with unavailable transcript status.

- [ ] **Step 5: Clean preflight book**

Run from `E:\Tools\inkosLN`:

```powershell
Remove-Item -LiteralPath "E:\Tools\inkosLN\test-novel\books\brave-preflight" -Recurse -Force
```

Expected: no output or successful removal.

---

### Task 2: Create HSR Belobog Heavenscreen Book

**Files:**
- Create: `E:\Tools\inkosLN\test-novel\briefs\khai-cuc-stream-belobog.md`
- Runtime book: `E:\Tools\inkosLN\test-novel\books\khai-cuc-stream-belobog`

- [ ] **Step 1: Write creative brief**

Create `test-novel\briefs\khai-cuc-stream-belobog.md` with Vietnamese requirements:

```markdown
# Khai Cục Stream Belobog

Thể loại: Thiên Mạc / livestream storyline game / Honkai: Star Rail fanfic.

Ngôn ngữ: tiếng Việt.

Tiền đề: Một thiên mạc khổng lồ đột nhiên xuất hiện trước nhiều phe phái trong vũ trụ Honkai: Star Rail. Trên thiên mạc không phải dự ngôn cổ điển, mà là giao diện livestream gameplay storyline: màn hình nhiệm vụ, lựa chọn hội thoại, thanh tiến độ, bình luận chạy ngang và các đoạn cutscene của Nhà Khai Phá.

Phạm vi test: tập trung arc Jarilo-VI / Belobog. Chương đầu cần đặt nền cho việc các nhân vật quan sát hành trình của Nhà Khai Phá như một tuyến nhiệm vụ game, nhưng phản ứng phải là phản ứng nhân vật trong thế giới thật, không biến họ thành khán giả hiện đại.

Nhân vật trọng tâm: Nhà Khai Phá, March 7th, Dan Heng, Bronya, Seele, Cocolia, Serval, Gepard, Sampo, Natasha, cư dân Belobog và một số người ngoài hành tinh đang xem thiên mạc.

Yêu cầu giọng văn: rõ ràng, có nhịp livestream, có cảm giác kỳ quan thiên mạc, không meme quá đà, không bẻ canon khi chưa có nguồn. Bình luận thiên mạc có thể hài hước nhưng không làm giảm trọng lượng câu chuyện Belobog.

Yêu cầu chương 1: mở bằng hiện tượng thiên mạc phủ lên Belobog hoặc nhiều thế giới, hiển thị tiêu đề nhiệm vụ liên quan Jarilo-VI, sau đó cho các nhân vật phản ứng với giao diện gameplay/storyline và đặt hook rằng lựa chọn của Nhà Khai Phá sắp phơi bày bí mật của Belobog.
```

Expected: file exists.

- [ ] **Step 2: Create the book**

Run from `E:\Tools\inkosLN\test-novel`:

```powershell
node "E:\Tools\inkosLN\packages\cli\dist\index.js" book create --title "Khai Cục Stream Belobog" --genre heavenscreen --platform other --target-chapters 20 --chapter-words 1200 --lang vi --brief "E:\Tools\inkosLN\test-novel\briefs\khai-cuc-stream-belobog.md"
```

Expected: book created at `books\khai-cuc-stream-belobog` and foundation ready.

---

### Task 3: Attach RIS Sources to HSR Book

**Files:**
- Runtime book: `E:\Tools\inkosLN\test-novel\books\khai-cuc-stream-belobog`
- Built-in genre source: `E:\Tools\inkosLN\packages\core\genres\heavenscreen.md`

- [ ] **Step 1: Initialize research workspace**

Run from `E:\Tools\inkosLN\test-novel`:

```powershell
node "E:\Tools\inkosLN\packages\cli\dist\index.js" research init khai-cuc-stream-belobog
```

Expected: `Created research workspace`.

- [ ] **Step 2: Run Brave discovery for HSR Belobog**

Run from `E:\Tools\inkosLN\test-novel`:

```powershell
node "E:\Tools\inkosLN\packages\cli\dist\index.js" research discover khai-cuc-stream-belobog --query "Honkai Star Rail Belobog Trailblazer livestream storyline gameplay" --limit 5
```

Expected: if Brave works, latest discovery JSON is created. If not, record failure and continue.

- [ ] **Step 3: Fetch transcripts from latest discovery if possible**

Run from `E:\Tools\inkosLN\test-novel`:

```powershell
node "E:\Tools\inkosLN\packages\cli\dist\index.js" research fetch-transcripts khai-cuc-stream-belobog --from-discovery latest
```

Expected: imports video transcript or metadata-only sources for selected video discoveries. If no discovery exists, record failure and continue.

- [ ] **Step 4: Import stable heavenscreen genre notes**

Run from `E:\Tools\inkosLN\test-novel`:

```powershell
node "E:\Tools\inkosLN\packages\cli\dist\index.js" research import khai-cuc-stream-belobog --from "E:\Tools\inkosLN\packages\core\genres\heavenscreen.md" --title "Heavenscreen Genre Notes"
```

Expected: `Imported sources/source_####.md`.

- [ ] **Step 5: Check and query research inventory**

Run from `E:\Tools\inkosLN\test-novel`:

```powershell
node "E:\Tools\inkosLN\packages\cli\dist\index.js" research check khai-cuc-stream-belobog
node "E:\Tools\inkosLN\packages\cli\dist\index.js" research query khai-cuc-stream-belobog --topic "Belobog livestream Trailblazer gameplay storyline"
```

Expected: sources count is at least 1. Query returns `No matching facts found.` unless fact cards already exist.

---

### Task 4: Generate First Chapter

**Files:**
- Runtime book: `E:\Tools\inkosLN\test-novel\books\khai-cuc-stream-belobog`

- [ ] **Step 1: Generate next chapter**

Run from `E:\Tools\inkosLN\test-novel`:

```powershell
node "E:\Tools\inkosLN\packages\cli\dist\index.js" write next khai-cuc-stream-belobog
```

Expected: chapter 1 is generated successfully.

- [ ] **Step 2: Inspect generated artifacts**

Check generated chapter files under `books\khai-cuc-stream-belobog`.

Expected qualitative signals: Vietnamese output, heavenscreen/livestream/gameplay interface elements, HSR Belobog premise, character reactions, no crash from research context loading.

---

## Self-Review Notes

- Spec coverage: Covers genre creation, RIS init/import/query, Brave discovery, transcript provider behavior, and write pipeline.
- Scope control: This is an operational E2E test only; it does not add code or require commits.
- Fallback behavior: Brave/transcript failures are recorded as environment-dependent preflight failures, not blockers for the local E2E path.
