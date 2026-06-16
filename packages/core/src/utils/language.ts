/**
 * Language support for InkOS
 * Currently supports: zh (中文), en (English), vi (Tiếng Việt)
 */

export type InkOSLanguage = "zh" | "en" | "vi";

/** Display names for each language */
export const LANGUAGE_DISPLAY_NAMES: Record<InkOSLanguage, string> = {
  zh: "中文",
  en: "English",
  vi: "Tiếng Việt",
};

/** Word counting configuration per language */
export const LANGUAGE_WORD_COUNT_CONFIG: Record<InkOSLanguage, {
  unit: "characters" | "words" | "chars";
  defaultTarget: number;
  /** Regex pattern for detecting word/character boundaries */
  boundaryRegex: RegExp;
}> = {
  zh: {
    unit: "characters",
    defaultTarget: 3000,
    /** CJK character range: \u4e00-\u9fff */
    boundaryRegex: /[\u4e00-\u9fff]/g,
  },
  en: {
    unit: "words",
    defaultTarget: 2000,
    /** Word boundary: ASCII letters and numbers */
    boundaryRegex: /\b[a-zA-Z0-9]+\b/g,
  },
  vi: {
    unit: "words",
    defaultTarget: 2000,
    /** Unicode letters including Vietnamese diacritics */
    boundaryRegex: /[\p{L}]+/gu,
  },
};

/** Default target chapter lengths per language */
export const DEFAULT_CHAPTER_LENGTHS: Record<InkOSLanguage, number> = {
  zh: 3000,   // Chinese characters
  en: 2000,   // English words  
  vi: 2000,   // Vietnamese words
};

/** Check if a given language is supported */
export function isValidLanguage(lang: string): lang is InkOSLanguage {
  return ["zh", "en", "vi"].includes(lang);
}

/** Parse language string to InkOSLanguage, fallback to 'zh' */
export function parseLanguage(lang?: string): InkOSLanguage {
  if (!lang) return "zh";
  return isValidLanguage(lang) ? lang : "zh";
}

/** Get appropriate plural/singular form based on count and language */
export function formatCount(count: number, language: InkOSLanguage): string {
  switch (language) {
    case "zh":
      return `${count}`; // Chinese doesn't use plurals
    case "vi":
      return `${count} ${count === 1 ? "từ" : "từ"}`; // Vietnamese "từ" is invariant
    case "en":
    default:
      return `${count} ${count === 1 ? "word" : "words"}`;
  }
}

/** Format length spec with appropriate units */
export function formatLengthSpec(target: number, language: InkOSLanguage): string {
  const config = LANGUAGE_WORD_COUNT_CONFIG[language];
  const pluralUnit = formatCount(1, language).split(" ")[1];
  
  switch (language) {
    case "zh":
      return `~${target}字`;
    case "vi":
      return `~${target} từ`;
    case "en":
    default:
      return `~${target} words`;
  }
}

/** Detect language from text content (heuristic) */
export function detectLanguageFromContent(text: string): InkOSLanguage {
  // Count characters in different scripts
  const chineseMatches = text.match(/[\u4e00-\u9fff]/g) || [];
  const vietnameseLetters = text.match(/[\u0102\u01a0\u1ea1\u00e2\u00ea\u00f4\u00f1]/gi) || [];
  const hasVietnameseTones = /[áàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệóòỏõọôốồổỗộơớờởỡợíìỉĩịúùủũụưứừửữựýỳỷỹỵđ]/i.test(text);
  
  if (chineseMatches.length > text.length * 0.1) return "zh";
  if (hasVietnameseTones || vietnameseLetters.length > text.length * 0.05) return "vi";
  
  return "en"; // default to English
}

/** Normalize sentence for Vietnamese processing */
export function normalizeVietnameseSentence(sentence: string): string {
  // Remove extra whitespace, normalize unicode normalization
  return sentence.trim().replace(/\s+/g, " ");
}

/** Tokenize Vietnamese text into words */
export function tokenizeVietnamese(text: string): string[] {
  // Simple word tokenization using Unicode letter matching
  return text.match(/[\p{L}]+/gu) || [];
}

/** Count words in text according to language-specific rules */
export function countWords(text: string, language: InkOSLanguage): number {
  switch (language) {
    case "zh": {
      // Count CJK characters
      const matches = text.match(/[\u4e00-\u9fff]/g);
      return matches?.length || 0;
    }
    case "vi":
    case "en": {
      // Use word regex
      const regex = language === "vi" ? /[\p{L}]+/gu : /\b[a-zA-Z0-9]+\b/g;
      const matches = text.match(regex);
      return matches?.length || 0;
    }
    default:
      return 0;
  }
}
