import type { InkOSLanguage } from "../utils/language.js";
import type { PostWriteViolation } from "./post-write-validator.js";

export function validateOpusPostWrite(
  content: string,
  language: InkOSLanguage,
): ReadonlyArray<PostWriteViolation> {
  const isVietnamese = language === "vi";
  const issues: PostWriteViolation[] = [];
  const add = (rule: string, severity: "error" | "warning", description: string, suggestion: string) => {
    issues.push({ rule, severity, description, suggestion });
  };

  if (/^\s*---\s*$/m.test(content)) {
    add(
      "opus-section-divider",
      "error",
      isVietnamese ? "Opus tạo dòng phân cảnh --- trong chính văn." : "Opus emitted --- scene dividers.",
      isVietnamese ? "Xóa --- và chuyển cảnh bằng câu văn trực tiếp." : "Remove --- and transition with prose.",
    );
  }

  if (/(^|\s)\*[^\n*]{2,}\*(\s|$)/.test(content)) {
    add(
      "opus-italic-prose",
      "error",
      isVietnamese ? "Opus dùng italic cho nội tâm/chính văn." : "Opus emitted italic prose.",
      isVietnamese ? "Đổi italic thành câu văn thường." : "Rewrite italic text as regular prose.",
    );
  }

  if (/vết sẹo|sẹo băng|permanent scar/i.test(content)) {
    add(
      "opus-permanent-scar",
      "error",
      isVietnamese ? "Có dấu hiệu biến vết hằn tạm thời thành sẹo vĩnh viễn." : "Temporary mark may have become a permanent scar.",
      isVietnamese ? "Dùng 'vết hằn' hoặc mô tả tạm thời, không dùng 'vết sẹo'." : "Use temporary mark language, not scar language.",
    );
  }

  if (/máu[^\n。.!?]{0,30}(mắt|tai)|(?:mắt|tai)[^\n。.!?]{0,30}máu/i.test(content)) {
    add(
      "opus-eye-ear-blood",
      "error",
      isVietnamese ? "Có máu từ mắt/tai, trái guardrail cơ thể." : "Blood from eyes/ears violates body guardrail.",
      isVietnamese ? "Đổi thành máu miệng/môi hoặc ánh mắt mờ." : "Use mouth/lip blood or dim eyes instead.",
    );
  }

  if (/ở một thế giới khác/i.test(content)) {
    add(
      "opus-vague-reaction-anchor",
      "error",
      isVietnamese ? "Reaction dùng anchor mơ hồ 'ở một thế giới khác'." : "Reaction uses a vague anchor.",
      isVietnamese ? "Thay bằng anchor rõ: 'Ở lát cắt Honkai Impact 3rd', 'Ở thế giới Fullmetal Alchemist', v.v." : "Use an explicit world/IP anchor.",
    );
  }

  if (/\b(player|streamer|system|ranking|quiz|countdown|reward)\b|người chơi|bảng xếp hạng|điểm thưởng/i.test(content)) {
    add(
      "opus-meta-game-word",
      "error",
      isVietnamese ? "Có từ meta/game hóa bị cấm." : "Forbidden meta/game terms appear.",
      isVietnamese ? "Xóa player/system/quiz/ranking/countdown/reward khỏi chính văn." : "Remove meta/game terms from prose.",
    );
  }

  if (/State card|Hooks Pool|状态卡|伏笔池|PRE_WRITE_CHECK/i.test(content)) {
    add(
      "opus-state-memo-leak",
      "error",
      isVietnamese ? "Chính văn rò rỉ thuật ngữ state/hook/memo." : "Prose leaked state/hook/memo terms.",
      isVietnamese ? "Xóa thuật ngữ pipeline khỏi CHAPTER_CONTENT." : "Remove pipeline terms from chapter content.",
    );
  }

  return issues;
}
