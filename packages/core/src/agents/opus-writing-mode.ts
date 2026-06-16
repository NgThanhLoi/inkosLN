import type { InkOSLanguage } from "../utils/language.js";

export type WritingMode = "standard" | "opus";

export function isOpusWritingMode(extra: Record<string, unknown> | undefined): boolean {
  return extra?.writingMode === "opus";
}

export function buildOpusHardStateCapsule(input: {
  readonly language: InkOSLanguage;
  readonly currentState: string;
  readonly externalContext?: string;
  readonly chapterNumber: number;
}): string {
  const stateLines = input.currentState
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.includes("|") || /当前|Current|Trạng thái|状态|位置|目标|限制/.test(line))
    .slice(0, 10)
    .join("\n");
  const external = (input.externalContext ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 8)
    .join("\n");

  if (input.language === "vi") {
    return `## HARD STATE CAPSULE - Chương ${input.chapterNumber}

Đây là capsule bắt buộc cho Opus. Không được tự ý đổi state, không tự thêm sự kiện ngoài body, không để state/hook đi trước chính văn.

State hiện hành:
${stateLines || "(không có state hiện hành)"}

Brief cứng từ người vận hành:
${external || "(không có brief ngoài)"}

Luật cấm drift:
- Không dùng --- làm phân cảnh.
- Không dùng italic cho nội tâm/chính văn.
- Không biến vết hằn/tạm thời thành vết sẹo vĩnh viễn.
- Không có máu từ mắt/tai; nếu cần chỉ dùng máu miệng/môi.
- Không thêm quiz/ranking/player/system/streamer/countdown/reward.
- Reaction phải có anchor rõ, không dùng mơ hồ "ở một thế giới khác".`;
  }

  return `## HARD STATE CAPSULE - Chapter ${input.chapterNumber}

Mandatory Opus guardrail. Do not change hard state, do not add off-body events, and do not let state/hooks get ahead of prose.

Current state:
${stateLines || "(no current state)"}

Operator brief:
${external || "(no external brief)"}

Drift bans:
- No --- scene dividers.
- No italic prose/interior monologue.
- Do not turn temporary marks into permanent scars.
- No blood from eyes/ears.
- No quiz/ranking/player/system/streamer/countdown/reward.
- Reaction anchors must be explicit.`;
}

export function buildOpusParagraphBudget(input: {
  readonly language: InkOSLanguage;
  readonly targetWords: number;
}): string {
  const minParagraphs = Math.max(14, Math.round(input.targetWords / 85));
  const maxParagraphs = Math.max(minParagraphs + 4, Math.round(input.targetWords / 58));

  if (input.language === "vi") {
    return `## PARAGRAPH BUDGET

- Mục tiêu ${input.targetWords} từ: viết khoảng ${minParagraphs}-${maxParagraphs} đoạn; với 1500 từ tương đương 18-26 đoạn.
- Mỗi đoạn 1 nhịp hành động/cảm xúc rõ, tránh đoạn trên 300 ký tự nếu có thể.
- Nếu là heavenscreen/livestream: dùng 2-3 cụm reaction, mỗi cụm 1-3 người nói, tổng khoảng 35-45% chương khi brief yêu cầu reaction core.
- không dùng --- để ngắt cảnh; chuyển cảnh bằng câu văn trực tiếp.
- Kết chương chỉ mở đúng hook đã được brief cho phép.`;
  }

  return `## PARAGRAPH BUDGET

- Target ${input.targetWords} words: write about ${minParagraphs}-${maxParagraphs} paragraphs.
- One clear action/emotional beat per paragraph; avoid paragraphs over 300 characters when possible.
- For heavenscreen/livestream chapters: 2-3 reaction clusters, 1-3 speakers each, about 35-45% when the brief requires reaction core.
- Do not use --- scene dividers.
- End only on hooks explicitly allowed by the brief.`;
}
