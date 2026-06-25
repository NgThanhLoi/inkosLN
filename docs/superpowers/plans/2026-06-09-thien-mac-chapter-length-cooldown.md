# Thien Mac Chapter Length And Cooldown Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Increase the Vietnamese book's target chapter length to 1500 words and steer the next chapter toward cooldown/aftermath pacing.

**Architecture:** This is a focused content/config change. `book.json` owns book-level numeric generation targets, while `story/current_focus.md` steers the writer for the next 1-3 chapters.

**Tech Stack:** JSON book metadata, Markdown story guidance, PowerShell verification commands, existing grep/read tools.

---

## File Structure

- Modify: `test-novel/books/thien-mac-thong-van-gioi-khoi-/book.json`
  - Responsibility: stores the book id, title, active status, target chapter count, target chapter word count, language, and timestamps.
- Modify: `test-novel/books/thien-mac-thong-van-gioi-khoi-/story/current_focus.md`
  - Responsibility: gives the writer short-term direction for upcoming chapters.

### Task 1: Update Book Word Target

**Files:**
- Modify: `test-novel/books/thien-mac-thong-van-gioi-khoi-/book.json`

- [ ] **Step 1: Change chapterWordCount only**

Set `chapterWordCount` to `1500`. Do not change `targetChapters` because the user said total chapter count is not yet determined.

Expected final JSON shape:

```json
{
  "id": "thien-mac-thong-van-gioi-khoi-",
  "title": "Thiên Mạc Thông Vạn Giới Khởi Đầu Từ Star Rail",
  "platform": "other",
  "genre": "heavenscreen",
  "status": "active",
  "targetChapters": 80,
  "chapterWordCount": 1500,
  "language": "vi",
  "createdAt": "2026-06-08T07:19:35.170Z",
  "updatedAt": "2026-06-08T08:09:56.211Z"
}
```

- [ ] **Step 2: Verify the JSON fields**

Run a read or JSON parse check.

Expected: `chapterWordCount` is `1500`; `targetChapters` remains `80`.

### Task 2: Update Current Focus For Chapter 11

**Files:**
- Modify: `test-novel/books/thien-mac-thong-van-gioi-khoi-/story/current_focus.md`

- [ ] **Step 1: Replace stale Chapter 2 focus**

Replace the old Chapter 2-specific direction with Chapter 11 cooldown direction.

Expected final Markdown:

```markdown
# Tiêu điểm hiện tại

## Tiêu điểm đang hoạt động

Trong 1-3 chương tiếp theo, ưu tiên hạ nhiệt sau chuỗi chiến đấu căng thẳng ở Herta Space Station. Không mở bằng một trận đánh mới nếu chưa xử lý hậu quả cảm xúc và thể chất của Caelus sau áp lực Stellaron.

Chương 11 nên là chương hồi sức và đối thoại: Caelus tỉnh lại hoặc được sơ cứu trong một khu vực an toàn tạm thời của trạm, March 7th vừa lo vừa cố trêu cậu để che sự sợ hãi, Dan Heng quan sát các dấu hiệu bất thường của Stellaron, còn Himeko hoặc Arlan biến những gì vừa xảy ra thành phân tích hành động cụ thể. Chemistry Caelus x March 7th chỉ cần nhẹ và tự nhiên: một câu đùa, một động tác đỡ tay, hoặc một khoảnh khắc March phản ứng nhanh hơn lý trí.

Phản ứng vạn giới trong chương này phải chậm hơn và sâu hơn. Chọn 3-5 thế giới, mỗi thế giới có hành động hoặc đối thoại nội bộ rõ ràng: ghi chép, triệu tập người phân tích, thử kiểm tra ranh giới thiên mạc, hoặc thay đổi cách nhìn về Caelus như vừa là nguy cơ vừa là đồng minh tiềm năng.

Ưu tiên trả nợ hook hơn là gieo hook mới: nhắc lại giới hạn vật chứa Stellaron, tín hiệu thiên mạc bị nhiễu, trạng thái của March 7th khi thấy Caelus bị thương, và câu hỏi Herta Space Station sẽ xử lý sự kiện này thế nào. Nếu cần hook cuối chương, chỉ dùng một tín hiệu nhỏ hoặc một quyết định mới, không thêm đại boss mới.

Tránh montage, tránh phản ứng vạn giới dạng danh sách nhận xét, tránh lặp cấu trúc “Không A. Không B. Không C.” quá 1 lần trong chương. Đoạn văn nên hợp đọc mobile, ưu tiên 80-220 ký tự mỗi đoạn, chỉ dùng đoạn dài khi có cao trào.
```

- [ ] **Step 2: Verify forbidden drift**

Search the edited files for forbidden terms.

Expected: no matches for `ký túc xá`, `người chơi hiện đại`, `streamer`, `Trần Việt`, `Chen Yue`, `Stelle`, `Giê-pát`, `Bờ-rô`, `Cô-cô`, `Be-lo`, `Bronnya`, `Heavenscreen`, `buồng trồng`, `Sản Vụ Phu`, `vang vọo`.

### Task 3: Final Verification

**Files:**
- Read: `test-novel/books/thien-mac-thong-van-gioi-khoi-/book.json`
- Read: `test-novel/books/thien-mac-thong-van-gioi-khoi-/story/current_focus.md`

- [ ] **Step 1: Confirm target values and focus text**

Read both files.

Expected: `book.json` has `chapterWordCount: 1500`, `targetChapters: 80`; `current_focus.md` describes Chapter 11 cooldown/aftermath.

- [ ] **Step 2: Summarize outcome**

Tell the user which files changed and what verification was performed. Do not claim a generated Chapter 11 exists unless the writer command has actually been run.

## Self-Review

- Spec coverage: covered `chapterWordCount` update, keeping total chapter count unresolved, Chapter 11 cooldown guidance, and forbidden drift verification.
- Placeholder scan: no TBD/TODO placeholders remain.
- Type consistency: JSON property names match existing `book.json`; Markdown path matches existing story focus file.
