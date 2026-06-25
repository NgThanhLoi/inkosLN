# Thien Mac Thong Van Gioi Star Rail Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create and verify a new Vietnamese heavenscreen crossover book based on the approved `Thiên Mạc Thông Vạn Giới, Khởi Đầu Từ Star Rail` design.

**Architecture:** Keep this as a separate book inside `test-novel/books/`, initialized through the existing `inkos book create --brief` pipeline so it gets the standard foundation files. The setup uses one dedicated creative brief and then verifies book config, generated story foundation, and Chapter 1 readiness without altering the existing Belobog test book.

**Tech Stack:** Node.js CLI build from `packages/cli/dist/index.js`, core pipeline from `@actalk/inkos-core`, local configured LLM at `http://localhost:20128/v1`, project root `E:\Tools\inkosLN\test-novel`.

---

## File Structure

- Create: `test-novel/briefs/thien-mac-thong-van-gioi-star-rail.md`
  - Creative brief passed to `inkos book create --brief`.
- Create: `test-novel/books/thien-mac-thong-van-gioi-khoi-dau-tu-star-rail/`
  - Expected generated book directory because `deriveBookIdFromTitle()` derives from the Vietnamese title.
- Verify: `test-novel/books/thien-mac-thong-van-gioi-khoi-dau-tu-star-rail/book.json`
  - Must be Vietnamese, genre `heavenscreen`, status initialized by the pipeline.
- Verify: `test-novel/books/thien-mac-thong-van-gioi-khoi-dau-tu-star-rail/story/brief.md`
  - Must preserve no-copy rule, no-modern-player rule, Caelus choice, and Caelus x March 7th hint direction.
- Verify: `test-novel/books/thien-mac-thong-van-gioi-khoi-dau-tu-star-rail/story/story_bible.md`
  - Must encode the heavenscreen premise and early Herta Space Station arc.
- Verify after writing: `test-novel/books/thien-mac-thong-van-gioi-khoi-dau-tu-star-rail/chapters/index.json`
  - Must include Chapter 1 metadata and no truncation failure.

## Task 1: Create The Creative Brief

**Files:**
- Create: `test-novel/briefs/thien-mac-thong-van-gioi-star-rail.md`

- [ ] **Step 1: Write the brief file**

Use `apply_patch` to add this exact file:

```markdown
# Thiên Mạc Thông Vạn Giới, Khởi Đầu Từ Star Rail

Thể loại: Thiên Mạc / livestream vạn giới / Honkai: Star Rail fanfic crossover reaction.

Ngôn ngữ: tiếng Việt.

Tiền đề: Một thiên mạc vô danh đột nhiên xuất hiện trên bầu trời của vô số thế giới. Nó không phải livestream do người chơi hiện đại kích hoạt, không có streamer, không có ký túc xá, không có nhân vật hiện đại trung tâm. Thiên mạc tự phát mở ra như một hiện tượng siêu nhiên vượt qua mọi hệ thống sức mạnh, rồi hiển thị tiêu đề `Honkai: Star Rail`.

Nguồn cảm hứng cấu trúc: học nhịp và mô-típ từ truyện `崩铁直播通万界，开局吓跑无惨`: nhiều thế giới cùng thấy thiên mạc, mỗi thế giới hiểu sai hiện tượng theo quy tắc riêng, các đoạn phản ứng xen giữa broadcast chính. Không được copy câu chữ, không dịch lại chương, không giữ setup người chơi hiện đại, không sao chép thứ tự phản ứng y nguyên.

Arc đầu: Herta Space Station. Thiên mạc bắt đầu từ khủng hoảng trạm không gian: Kafka và Silver Wolf xâm nhập, Stellaron xuất hiện, Caelus thức tỉnh, March 7th và Dan Heng tìm thấy cậu, Antimatter Legion leo thang, Doomsday Beast tạo cú sốc sức mạnh đầu tiên cho vạn giới.

Nhà Khai Phá: Caelus. Dùng tên `Caelus`, không dùng Stelle, không lẫn giới tính.

Romance hint: tăng chemistry Caelus x March 7th hơn nguyên tác nhưng vẫn nhẹ. March 7th có thể lo lắng, trêu chọc, kéo Caelus vào nhịp đội tàu; Caelus có thể vụng về nhưng chân thành, có vài khoảnh khắc bảo vệ hoặc đáp lại sự quan tâm. Không tỏ tình sớm, không biến truyện thành ngôn tình, không làm March mất tính độc lập.

Thế giới phản ứng chính: Demon Slayer, Frieren, Akame ga Kill, Genshin Impact, Naruto, Bleach, Jujutsu Kaisen, Hunter x Hunter, Baki, Honkai Impact 3rd. Không cần mọi chương đều có mọi thế giới; mỗi chương ưu tiên 5-7 world phản ứng có chất lượng, còn lại cameo khi cần.

Quy tắc phản ứng: mỗi thế giới phải giải thích thiên mạc bằng hệ quy chiếu riêng. Demon Slayer nghi ngờ Huyết Quỷ Thuật hoặc thần tích; Frieren nghi là ma pháp cổ đại; Genshin nghi vực sâu hoặc thần linh; Jujutsu nghi kết giới hoặc chú thuật; Naruto nghi ảo thuật; Bleach nghi hiện tượng linh áp; Honkai Impact 3rd nghi anomaly cấp Herrscher hoặc hiện tượng thế giới song song. Tránh lặp lại kiểu “mọi người đều kinh hãi” mà không có nội dung mới.

Giọng văn: tiếng Việt rõ ràng, cinematic, dễ đọc kiểu webnovel. Có cảm giác kỳ quan thiên mạc, nhịp livestream nhanh, hài nhẹ từ hiểu lầm xuyên thế giới, nhưng vẫn tôn trọng trọng lượng của Star Rail. Không meme quá đà.

Tỷ lệ chương: khoảng 60-70% nội dung broadcast Star Rail, 30-40% phản ứng vạn giới. Reaction cut chỉ chen vào điểm có tín hiệu cao, không cắt sau từng câu thoại.

Tên riêng: giữ spelling canon/Latin khi phù hợp. Bắt buộc giữ `Caelus`, `March 7th`, `Dan Heng`, `Kafka`, `Silver Wolf`, `Herta`, `Muzan`, `Frieren`, `Mavuika`, `Mei`. Không Việt hóa sai tên riêng.

Yêu cầu chương 1: mở bằng thiên mạc hiện thân ở một thế giới có sức căng cao, ưu tiên Demon Slayer với Muzan hoảng hốt vì tưởng bị quyền năng lạ nhắm đến. Sau đó cắt nhanh sang Frieren, Genshin, Jujutsu, Honkai Impact 3rd hoặc vài world khác để chứng minh hiện tượng bao phủ vạn giới. Thiên mạc không thể bị chặn, vẫn nhìn thấy khi nhắm mắt hoặc ở trong nhà. Cuối chương hiển thị `Honkai: Star Rail`, hé lộ Herta Space Station và đặt hook rằng vạn giới sắp chứng kiến sự ra đời của một Nhà Khai Phá mới.
```

- [ ] **Step 2: Verify the brief exists**

Run from `E:\Tools\inkosLN`:

```powershell
Test-Path -LiteralPath "test-novel\briefs\thien-mac-thong-van-gioi-star-rail.md"
```

Expected: `True`.

## Task 2: Create The Book Foundation

**Files:**
- Create: `test-novel/books/thien-mac-thong-van-gioi-khoi-dau-tu-star-rail/`
- Create: generated story foundation files under `test-novel/books/thien-mac-thong-van-gioi-khoi-dau-tu-star-rail/story/`

- [ ] **Step 1: Ensure CLI and core are built**

Run from `E:\Tools\inkosLN`:

```powershell
pnpm --filter @actalk/inkos-core build
```

Expected: exit code `0` and no TypeScript errors.

Run from `E:\Tools\inkosLN`:

```powershell
pnpm --filter @actalk/inkos build
```

Expected: exit code `0` and no TypeScript errors.

- [ ] **Step 2: Create the book from the brief**

Run from `E:\Tools\inkosLN\test-novel`:

```powershell
node "..\packages\cli\dist\index.js" book create --title "Thiên Mạc Thông Vạn Giới Khởi Đầu Từ Star Rail" --genre heavenscreen --platform other --target-chapters 80 --chapter-words 1200 --lang vi --brief "briefs\thien-mac-thong-van-gioi-star-rail.md"
```

Expected output includes:

```text
books/thien-mac-thong-van-gioi-khoi-dau-tu-star-rail/
```

If the command fails because the book already exists, stop and inspect that directory. Do not delete it without user confirmation.

- [ ] **Step 3: Verify generated book config**

Read `E:\Tools\inkosLN\test-novel\books\thien-mac-thong-van-gioi-khoi-dau-tu-star-rail\book.json`.

Expected values:

```json
{
  "id": "thien-mac-thong-van-gioi-khoi-dau-tu-star-rail",
  "title": "Thiên Mạc Thông Vạn Giới Khởi Đầu Từ Star Rail",
  "platform": "other",
  "genre": "heavenscreen",
  "targetChapters": 80,
  "chapterWordCount": 1200,
  "language": "vi"
}
```

The actual file will also contain `status`, `createdAt`, and `updatedAt`.

## Task 3: Verify Foundation Content

**Files:**
- Verify: `test-novel/books/thien-mac-thong-van-gioi-khoi-dau-tu-star-rail/story/brief.md`
- Verify: `test-novel/books/thien-mac-thong-van-gioi-khoi-dau-tu-star-rail/story/story_bible.md`
- Verify: `test-novel/books/thien-mac-thong-van-gioi-khoi-dau-tu-star-rail/story/style_guide.md`

- [ ] **Step 1: Search generated foundation for required anchors**

Run from `E:\Tools\inkosLN`:

```powershell
rg -n "Caelus|March 7th|Herta Space Station|Kafka|Silver Wolf|Demon Slayer|Frieren|không có người chơi|không copy|thiên mạc" "test-novel\books\thien-mac-thong-van-gioi-khoi-dau-tu-star-rail\story"
```

Expected: matches across `brief.md`, `story_bible.md`, or other story foundation files.

- [ ] **Step 2: Search for forbidden setup drift**

Run from `E:\Tools\inkosLN`:

```powershell
rg -n "ký túc xá|người chơi hiện đại|streamer|Trần Việt|Chen Yue|Stelle|Giê-pát|Bờ-rô|Cô-cô|Be-lo" "test-novel\books\thien-mac-thong-van-gioi-khoi-dau-tu-star-rail\story"
```

Expected: no matches, except `người chơi hiện đại` may appear only in a negative rule saying there is no modern player. If forbidden names appear as positive content, manually patch the relevant story file before writing Chapter 1.

- [ ] **Step 3: If needed, patch generated story rules**

Only do this if Step 2 reveals setup drift or missing constraints. Use `apply_patch` to append this section to `test-novel/books/thien-mac-thong-van-gioi-khoi-dau-tu-star-rail/story/book_rules.md`:

```markdown

## Bộ mới: quy tắc thiên mạc vạn giới

- Không có người chơi hiện đại, streamer, ký túc xá, popup hệ thống cá nhân, hoặc nhân vật Trần Việt tương đương.
- Thiên mạc tự phát, vô danh, chiếu `Honkai: Star Rail` trực tiếp cho vạn giới.
- Nhà Khai Phá là Caelus, không dùng Stelle.
- Caelus x March 7th chỉ hint nhẹ, chemistry tự nhiên, không tỏ tình sớm.
- Học nhịp từ reference `崩铁直播通万界，开局吓跑无惨`, nhưng không copy câu chữ, trình tự phản ứng, hoặc joke nguyên bản.
- Giữ tên riêng canon/Latin: Caelus, March 7th, Dan Heng, Kafka, Silver Wolf, Herta, Muzan, Frieren, Mavuika, Mei.
```

After patching, rerun Step 1 and Step 2.

## Task 4: Write Chapter 1

**Files:**
- Create: first generated chapter under `test-novel/books/thien-mac-thong-van-gioi-khoi-dau-tu-star-rail/chapters/`
- Modify: `test-novel/books/thien-mac-thong-van-gioi-khoi-dau-tu-star-rail/chapters/index.json`
- Modify: story state files under `test-novel/books/thien-mac-thong-van-gioi-khoi-dau-tu-star-rail/story/`

- [ ] **Step 1: Run Chapter 1 generation**

Run from `E:\Tools\inkosLN\test-novel`:

```powershell
node "..\packages\cli\dist\index.js" write next thien-mac-thong-van-gioi-khoi-dau-tu-star-rail
```

Expected: command completes without a truncation error. It may return `ready-for-review` or `audit-failed`; `audit-failed` is acceptable for first generation if the chapter file exists and is not truncated.

- [ ] **Step 2: Find generated chapter path**

Run from `E:\Tools\inkosLN`:

```powershell
rg -n '"number": 1|"title"|"status"|"wordCount"' "test-novel\books\thien-mac-thong-van-gioi-khoi-dau-tu-star-rail\chapters\index.json"
```

Expected: Chapter 1 appears with a nonzero `wordCount`.

- [ ] **Step 3: Check language and premise anchors in Chapter 1**

Run from `E:\Tools\inkosLN`:

```powershell
rg -n "thiên mạc|Honkai: Star Rail|Caelus|March 7th|Kafka|Silver Wolf|Muzan|Frieren" "test-novel\books\thien-mac-thong-van-gioi-khoi-dau-tu-star-rail\chapters"
```

Expected: several matches in the Chapter 1 file.

- [ ] **Step 4: Check forbidden drift in Chapter 1**

Run from `E:\Tools\inkosLN`:

```powershell
rg -n "ký túc xá|người chơi hiện đại|streamer|Trần Việt|Chen Yue|Stelle|Giê-pát|Bờ-rô|Cô-cô|Be-lo|Bronnya|Heavenscreen" "test-novel\books\thien-mac-thong-van-gioi-khoi-dau-tu-star-rail\chapters"
```

Expected: no matches, except `người chơi hiện đại` is acceptable only if it appears in an explicit negation. If `Heavenscreen` appears in prose, patch to `thiên mạc` or `Thiên Mạc` according to sentence context.

## Task 5: Repair Chapter 1 If Needed

**Files:**
- Modify: generated Chapter 1 markdown file if checks fail.
- Modify: `test-novel/books/thien-mac-thong-van-gioi-khoi-dau-tu-star-rail/chapters/index.json` only if word count changes materially after manual edits.

- [ ] **Step 1: If Chapter 1 is truncated, stop and do not patch blindly**

A truncated chapter usually ends mid-dialogue, with an unmatched quote, incomplete sentence, or a dangling speaker tag. If found, rerun generation once with this command from `E:\Tools\inkosLN\test-novel`:

```powershell
node "..\packages\cli\dist\index.js" write rewrite thien-mac-thong-van-gioi-khoi-dau-tu-star-rail 1 --brief "Viết lại chương 1 hoàn chỉnh, không cắt cụt cuối chương. Giữ tiếng Việt, không có người chơi hiện đại, Nhà Khai Phá là Caelus, hint nhẹ Caelus x March 7th, mở từ thiên mạc vạn giới và Herta Space Station."
```

Expected: rewritten chapter ends with a complete hook sentence.

- [ ] **Step 2: If only forbidden terms appear, patch exact terms**

Use `apply_patch` to replace exact bad terms in the Chapter 1 markdown file. Acceptable replacements:

```text
Heavenscreen -> thiên mạc
Stelle -> Caelus
Giê-pát -> Gepard
Bờ-rô -> Bronya
Cô-cô -> Cocolia
Be-lo -> Belobog
Bronnya -> Bronya
```

After patching, rerun Task 4 Step 4.

- [ ] **Step 3: Recount Chapter 1 words if patched**

Run from `E:\Tools\inkosLN`:

```powershell
rg -n '"number": 1|"wordCount"' "test-novel\books\thien-mac-thong-van-gioi-khoi-dau-tu-star-rail\chapters\index.json"
```

Expected: `wordCount` remains in the target neighborhood around `1200`. If a manual edit changes only names or one sentence, do not update index manually.

## Task 6: Final Verification

**Files:**
- Verify: all generated files under `test-novel/books/thien-mac-thong-van-gioi-khoi-dau-tu-star-rail/`

- [ ] **Step 1: Run build verification**

Run from `E:\Tools\inkosLN`:

```powershell
pnpm --filter @actalk/inkos-core build
```

Expected: exit code `0`.

Run from `E:\Tools\inkosLN`:

```powershell
pnpm --filter @actalk/inkos build
```

Expected: exit code `0`.

- [ ] **Step 2: Summarize book state**

Run from `E:\Tools\inkosLN`:

```powershell
rg -n '"id"|"title"|"genre"|"targetChapters"|"chapterWordCount"|"language"' "test-novel\books\thien-mac-thong-van-gioi-khoi-dau-tu-star-rail\book.json"
```

Expected output confirms the new book identity and Vietnamese language.

Run from `E:\Tools\inkosLN`:

```powershell
rg -n '"number": 1|"title"|"status"|"wordCount"|"auditIssues"' "test-novel\books\thien-mac-thong-van-gioi-khoi-dau-tu-star-rail\chapters\index.json"
```

Expected output confirms Chapter 1 exists and has a status.

## Commit Policy

Do not commit automatically. The workspace currently contains many unrelated modified and untracked files, and the user has not explicitly requested a commit. If the user later asks for a commit, inspect `git status`, `git diff`, and `git log --oneline -10`, then stage only the design, plan, new brief, and new book files that belong to this task.

## Self-Review Notes

- Spec coverage: the plan creates a separate Vietnamese book, uses the approved no-copy/no-modern-player premise, sets Caelus, encodes light Caelus x March 7th hints, opens with Herta Space Station, and verifies proper-name constraints.
- Placeholder scan: no `TBD`, `TODO`, or unspecified implementation steps remain.
- Type consistency: paths consistently use expected generated id `thien-mac-thong-van-gioi-khoi-dau-tu-star-rail` from the CLI title.
