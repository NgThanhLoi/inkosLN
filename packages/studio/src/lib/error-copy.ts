type Lang = "zh" | "en" | "vi";

/**
 * Active UI language for runtime error localization. Updated by `App.tsx`
 * whenever the user switches language via the LanguageSelector, so pure
 * functions in this module can return the right translation without
 * threading `lang` through every caller.
 */
let currentLang: Lang = "zh";

export function setLocalizerLang(lang: Lang): void {
  currentLang = lang;
}

type ReplacementRule = {
  readonly pattern: RegExp;
  readonly replacements: Readonly<Record<Lang, string>>;
};

/**
 * Order matters — first match wins. Keep the more specific patterns
 * (those that capture `chapter N`) before the catch-all API-key rules
 * so the numbered pattern wins on a longer match.
 */
const KNOWN_RUNTIME_REPLACEMENTS: ReadonlyArray<ReplacementRule> = [
  {
    pattern: /Latest chapter (\d+) is state-degraded\. Repair state or rewrite that chapter before continuing\./g,
    replacements: {
      zh: "最新第 $1 章处于状态降级（state-degraded）。继续写下一章前，请先修复状态，或重写这一章。",
      en: "Latest chapter $1 is state-degraded. Repair state or rewrite that chapter before continuing.",
      vi: "Chương $1 mới nhất đang ở trạng thái suy giảm (state-degraded). Hãy sửa trạng thái hoặc viết lại chương đó trước khi tiếp tục.",
    },
  },
  {
    pattern: /Chapter (\d+) is not state-degraded\./g,
    replacements: {
      zh: "第 $1 章不是状态降级（state-degraded），无需按状态修复。",
      en: "Chapter $1 is not state-degraded — no state repair needed.",
      vi: "Chương $1 không ở trạng thái suy giảm (state-degraded), không cần sửa theo trạng thái.",
    },
  },
  {
    pattern: /Only the latest state-degraded chapter can be repaired safely \(latest is (\d+)\)\./g,
    replacements: {
      zh: "只能安全修复最新的状态降级（state-degraded）章节；当前最新章是第 $1 章。",
      en: "Only the latest state-degraded chapter can be repaired safely (latest is $1).",
      vi: "Chỉ có thể sửa an toàn chương state-degraded mới nhất; chương mới nhất hiện tại là chương $1.",
    },
  },
  {
    pattern: /State repair still failed for chapter (\d+)\./g,
    replacements: {
      zh: "第 $1 章状态修复仍然失败。",
      en: "State repair still failed for chapter $1.",
      vi: "Sửa trạng thái cho chương $1 vẫn thất bại.",
    },
  },
  {
    pattern: /Studio LLM API key not set\. Open Studio services and save an API key for the selected service\./g,
    replacements: {
      zh: "Studio 模型 API Key 未设置。请打开“模型配置”，为当前服务保存 API Key。",
      en: "Studio LLM API key is not set. Open Studio services and save an API key for the selected service.",
      vi: "Chưa đặt API Key cho mô hình trong Studio. Hãy mở \"Cấu hình mô hình\" và lưu API Key cho dịch vụ hiện tại.",
    },
  },
  {
    pattern: /INKOS_LLM_API_KEY not set\. Run 'inkos config set-global' or add it to project \.env file\./g,
    replacements: {
      zh: "INKOS_LLM_API_KEY 未设置。请运行 `inkos config set-global`，或在项目 .env 文件中添加它。",
      en: "INKOS_LLM_API_KEY is not set. Run `inkos config set-global` or add it to the project .env file.",
      vi: "Chưa đặt INKOS_LLM_API_KEY. Hãy chạy `inkos config set-global` hoặc thêm nó vào tệp .env của dự án.",
    },
  },
];

export function localizeKnownRuntimeMessage(message: string): string {
  let localized = message;
  for (const rule of KNOWN_RUNTIME_REPLACEMENTS) {
    localized = localized.replace(rule.pattern, rule.replacements[currentLang]);
  }
  return localized;
}