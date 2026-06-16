import { formatLengthCount, resolveLengthCountingMode } from "@actalk/inkos-core";

export type CliLanguage = "zh" | "en" | "vi";

type WriteIssue = {
  readonly severity: string;
  readonly category: string;
  readonly description: string;
};

type WriteResultShape = {
  readonly chapterNumber: number;
  readonly title: string;
  readonly wordCount: number;
  readonly status: string;
  readonly revised: boolean;
  readonly issues: ReadonlyArray<WriteIssue>;
  readonly auditPassed?: boolean;
  readonly passedAudit?: boolean;
};

type ImportResultShape = {
  readonly importedCount: number;
  readonly totalWords: number;
  readonly nextChapter: number;
  readonly continueBookId: string;
};

function localize(language: CliLanguage, messages: { zh: string; en: string; vi?: string }): string {
  if (language === "vi") return messages.vi ?? messages.zh;
  return language === "en" ? messages.en : messages.zh;
}

function formatStatus(language: CliLanguage, status: string): string {
  if (language !== "vi") return status;
  switch (status) {
    case "ready-for-review":
      return "sẵn sàng xem lại";
    case "audit-failed":
      return "cần sửa sau kiểm tra";
    case "state-degraded":
      return "cần sửa state";
    default:
      return status;
  }
}

function formatSeverity(language: CliLanguage, severity: string): string {
  if (language !== "vi") return severity;
  switch (severity) {
    case "critical":
    case "error":
      return "nghiêm trọng";
    case "warning":
      return "cảnh báo";
    case "info":
      return "thông tin";
    default:
      return severity;
  }
}

function formatIssueCategory(language: CliLanguage, category: string): string {
  if (language !== "vi") return category;
  const normalized = category.trim().toLowerCase();
  if (normalized.includes("伏笔") || normalized.includes("hook")) return "Nợ hook";
  if (normalized.includes("continuity") || normalized.includes("连续性")) return "Liên tục truyện";
  if (normalized.includes("pov")) return "Góc nhìn";
  if (normalized.includes("lexical") || normalized.includes("ai")) return "Văn phong";
  if (normalized.includes("state") || normalized.includes("状态")) return "State";
  if (normalized.includes("length") || normalized.includes("字数")) return "Độ dài";
  return category;
}

export function resolveCliLanguage(language?: string): CliLanguage {
  if (language === "en") return "en";
  if (language === "vi") return "vi";
  return "zh";
}

export function formatBookCreateCreating(
  language: CliLanguage,
  title: string,
  genre: string,
  platform: string,
): string {
  return localize(language, {
    zh: `创建书籍 "${title}"（${genre} / ${platform}）...`,
    en: `Creating book "${title}" (${genre} / ${platform})...`,
    vi: `Đang tạo sách "${title}" (${genre} / ${platform})...`,
  });
}

export function formatBookCreateCreated(language: CliLanguage, bookId: string): string {
  return localize(language, {
    zh: `已创建书籍：${bookId}`,
    en: `Book created: ${bookId}`,
    vi: `Đã tạo sách: ${bookId}`,
  });
}

export function formatBookCreateLocation(language: CliLanguage, bookId: string): string {
  return localize(language, {
    zh: `  位置：books/${bookId}/`,
    en: `  Location: books/${bookId}/`,
    vi: `  Vị trí: books/${bookId}/`,
  });
}

export function formatBookCreateFoundationReady(language: CliLanguage): string {
  return localize(language, {
    zh: "  故事圣经、大纲和书籍规则已生成。",
    en: "  Story bible, outline, book rules generated.",
    vi: "  Story bible, outline và book rules đã được tạo.",
  });
}

export function formatBookCreateNextStep(language: CliLanguage, bookId: string): string {
  return localize(language, {
    zh: `下一步：inkos write next ${bookId}`,
    en: `Next: inkos write next ${bookId}`,
    vi: `Tiếp theo: inkos write next ${bookId}`,
  });
}

export function formatWriteNextProgress(
  language: CliLanguage,
  current: number,
  total: number,
  bookId: string,
): string {
  return localize(language, {
    zh: `[${current}/${total}] 为「${bookId}」撰写章节...`,
    en: `[${current}/${total}] Writing chapter for "${bookId}"...`,
    vi: `[${current}/${total}] Đang viết chương cho "${bookId}"...`,
  });
}

export function formatWriteNextResultLines(
  language: CliLanguage,
  result: WriteResultShape,
): string[] {
  const auditPassed = result.auditPassed ?? result.passedAudit ?? false;
  const lengthLabel = formatLengthCount(result.wordCount, resolveLengthCountingMode(language));
  const lines = [
    localize(language, {
      zh: `  第${result.chapterNumber}章：${result.title}`,
      en: `  Chapter ${result.chapterNumber}: ${result.title}`,
      vi: `  Chương ${result.chapterNumber}: ${result.title}`,
    }),
    localize(language, {
      zh: `  字数：${lengthLabel}`,
      en: `  Length: ${lengthLabel}`,
      vi: `  Độ dài: ${lengthLabel}`,
    }),
    localize(language, {
      zh: `  审计：${auditPassed ? "通过" : "需复核"}`,
      en: `  Audit: ${auditPassed ? "PASSED" : "NEEDS REVIEW"}`,
      vi: `  Kiểm tra: ${auditPassed ? "ĐẠT" : "CẦN XEM LẠI"}`,
    }),
  ];

  if (result.revised) {
    lines.push(localize(language, {
      zh: "  自动修正：已执行（已修复关键问题）",
      en: "  Auto-revised: YES (critical issues were fixed)",
      vi: "  Tự động sửa: CÓ (đã sửa các vấn đề quan trọng)",
    }));
  }

  lines.push(localize(language, {
    zh: `  状态：${result.status}`,
    en: `  Status: ${result.status}`,
    vi: `  Trạng thái: ${formatStatus(language, result.status)}`,
  }));

  if (result.issues.length > 0) {
    lines.push(localize(language, {
      zh: "  问题：",
      en: "  Issues:",
      vi: "  Vấn đề:",
    }));
    for (const issue of result.issues) {
      lines.push(`    [${formatSeverity(language, issue.severity)}] ${formatIssueCategory(language, issue.category)}: ${issue.description}`);
    }
  }

  return lines;
}

export function formatWriteNextComplete(language: CliLanguage): string {
  return localize(language, {
    zh: "完成。",
    en: "Done.",
    vi: "Hoàn tất.",
  });
}

export function formatImportChaptersDiscovery(
  language: CliLanguage,
  chapterCount: number,
  bookId: string,
): string {
  return localize(language, {
    zh: `发现 ${chapterCount} 章，准备导入到「${bookId}」。`,
    en: `Found ${chapterCount} chapters to import into "${bookId}".`,
    vi: `Tìm thấy ${chapterCount} chương, chuẩn bị nhập vào "${bookId}".`,
  });
}

export function formatImportChaptersResume(
  language: CliLanguage,
  resumeFrom: number,
): string {
  return localize(language, {
    zh: `从第 ${resumeFrom} 章继续导入。`,
    en: `Resuming from chapter ${resumeFrom}.`,
    vi: `Tiếp tục nhập từ chương ${resumeFrom}.`,
  });
}

export function formatImportChaptersComplete(
  language: CliLanguage,
  result: ImportResultShape,
): string[] {
  const lengthLabel = formatLengthCount(result.totalWords, resolveLengthCountingMode(language));
  return [
    localize(language, {
      zh: "导入完成：",
      en: "Import complete:",
      vi: "Nhập hoàn tất:",
    }),
    localize(language, {
      zh: `  已导入章节：${result.importedCount}`,
      en: `  Chapters imported: ${result.importedCount}`,
      vi: `  Số chương đã nhập: ${result.importedCount}`,
    }),
    localize(language, {
      zh: `  总长度：${lengthLabel}`,
      en: `  Total length: ${lengthLabel}`,
      vi: `  Tổng độ dài: ${lengthLabel}`,
    }),
    localize(language, {
      zh: `  下一章编号：${result.nextChapter}`,
      en: `  Next chapter number: ${result.nextChapter}`,
      vi: `  Số chương tiếp theo: ${result.nextChapter}`,
    }),
    "",
    localize(language, {
      zh: `运行 "inkos write next ${result.continueBookId}" 继续写作。`,
      en: `Run "inkos write next ${result.continueBookId}" to continue writing.`,
      vi: `Chạy "inkos write next ${result.continueBookId}" để tiếp tục viết.`,
    }),
  ];
}

export function formatImportCanonStart(
  language: CliLanguage,
  parentBookId: string,
  targetBookId: string,
): string {
  return localize(language, {
    zh: `把 "${parentBookId}" 的正典导入到 "${targetBookId}"...`,
    en: `Importing canon from "${parentBookId}" into "${targetBookId}"...`,
    vi: `Đang nhập canon từ "${parentBookId}" vào "${targetBookId}"...`,
  });
}

export function formatImportCanonComplete(language: CliLanguage): string[] {
  return [
    localize(language, {
      zh: "正典已导入：story/parent_canon.md",
      en: "Canon imported: story/parent_canon.md",
      vi: "Canon đã được nhập: story/parent_canon.md",
    }),
    localize(language, {
      zh: "Writer 和 auditor 会在番外模式下自动识别这个文件。",
      en: "Writer and auditor will auto-detect this file for spinoff mode.",
      vi: "Writer và auditor sẽ tự động nhận diện file này ở chế độ spinoff.",
    }),
  ];
}
