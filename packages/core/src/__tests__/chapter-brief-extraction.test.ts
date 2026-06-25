import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import {
  extractChapterSection,
  findAndExtractChapterBrief,
} from "../utils/planning-materials.js";

// ---------------------------------------------------------------------------
// extractChapterSection — pure function, no filesystem
// ---------------------------------------------------------------------------
describe("extractChapterSection", () => {
  const viBrief = `# chapter_briefs_001_010.md

# Chương 001 — Tụ Linh Trận Dưới Mưa Sớm
## Mục tiêu chương
Giới thiệu MC, sửa trận.
## Cảnh bắt buộc
Cúi xem trận văn.

# Chương 002 — Tiệm Sách Của Mạnh Tố Nguyệt
## Mục tiêu chương
Giới thiệu mẹ MC.
## Cảnh bắt buộc
Mẹ đưa ghi chú.

# Chương 004 — Bản Trận Đồ Không Khớp
## Mục tiêu chương
Phát hiện bản sao trận đồ khác nhau.
## Xung đột chính
Hai bản sao cùng một trận pháp có nét khác nhau.
`;

  const enBrief = `# Chapter Briefs

# Chapter 1: The Opening
## Goals
Introduce the protagonist.

# Chapter 2: The Journey
## Goals
Leave home and meet allies.
`;

  const zhBrief = `# 章节概要

# 第 1 章
## 目标
介绍主角。

# 第 2 章
## 目标
离开家乡。
`;

  it("extracts Vietnamese chapter section by number", () => {
    const result = extractChapterSection(viBrief, 2);
    expect(result).toContain("Giới thiệu mẹ MC");
    expect(result).toContain("Mẹ đưa ghi chú");
    expect(result).not.toContain("Giới thiệu MC, sửa trận");
  });

  it("extracts Vietnamese chapter section with zero-padded number", () => {
    const result = extractChapterSection(viBrief, 4);
    expect(result).toContain("Phát hiện bản sao trận đồ khác nhau");
    expect(result).toContain("Hai bản sao cùng một trận pháp");
  });

  it("extracts English chapter section", () => {
    const result = extractChapterSection(enBrief, 2);
    expect(result).toContain("Leave home and meet allies");
    expect(result).not.toContain("Introduce the protagonist");
  });

  it("extracts Chinese chapter section", () => {
    const result = extractChapterSection(zhBrief, 1);
    expect(result).toContain("介绍主角");
  });

  it("returns undefined when chapter not found", () => {
    expect(extractChapterSection(viBrief, 99)).toBeUndefined();
  });

  it("returns undefined for empty content", () => {
    expect(extractChapterSection("", 1)).toBeUndefined();
  });

  it("handles ## headings (level 2)", () => {
    const content = `# Overview

## Chương 5 — Cuộc Khảo Hạch
Nội dung chương 5.
`;
    const result = extractChapterSection(content, 5);
    expect(result).toContain("Nội dung chương 5");
  });
});

// ---------------------------------------------------------------------------
// findAndExtractChapterBrief — filesystem integration
// ---------------------------------------------------------------------------
describe("findAndExtractChapterBrief", () => {
  let root: string;
  let bookDir: string;

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), "inkos-brief-extract-"));
    bookDir = join(root, "book");
    await mkdir(join(bookDir, "story", "outline"), { recursive: true });
  });

  afterEach(async () => {
    await rm(root, { recursive: true, force: true });
  });

  it("returns legacy brief.md content when it exists", async () => {
    await writeFile(
      join(bookDir, "story", "brief.md"),
      "# My Brief\nLegacy brief content here.\n",
      "utf-8",
    );
    const result = await findAndExtractChapterBrief(bookDir, 5);
    expect(result).toContain("Legacy brief content here");
  });

  it("falls back to outline/*brief*.md when brief.md is empty", async () => {
    await writeFile(
      join(bookDir, "story", "outline", "chapter_briefs_001_010.md"),
      [
        "# Briefs",
        "",
        "# Chương 003 — Lời Cha Trước Cửa Trận",
        "## Mục tiêu chương",
        "Đào sâu quan hệ cha con.",
        "## Cảnh bắt buộc",
        "Cha đưa bút trận cho con.",
        "",
        "# Chương 004 — Bản Trận Đồ Không Khớp",
        "## Mục tiêu chương",
        "Phát hiện bản sao trận đồ khác nhau.",
      ].join("\n"),
      "utf-8",
    );

    const result = await findAndExtractChapterBrief(bookDir, 3);
    expect(result).toContain("Đào sâu quan hệ cha con");
    expect(result).toContain("Cha đưa bút trận cho con");
    expect(result).not.toContain("Phát hiện bản sao");
  });

  it("returns empty string when no brief files exist", async () => {
    const result = await findAndExtractChapterBrief(bookDir, 1);
    expect(result).toBe("");
  });

  it("returns empty string when outline dir does not exist", async () => {
    await rm(join(bookDir, "story", "outline"), { recursive: true, force: true });
    const result = await findAndExtractChapterBrief(bookDir, 1);
    expect(result).toBe("");
  });

  it("prefers brief.md over outline brief files", async () => {
    await writeFile(
      join(bookDir, "story", "brief.md"),
      "# Brief\nBrief.md wins.\n",
      "utf-8",
    );
    await writeFile(
      join(bookDir, "story", "outline", "chapter_briefs.md"),
      "# Chương 1\nOutline brief.\n",
      "utf-8",
    );
    const result = await findAndExtractChapterBrief(bookDir, 1);
    expect(result).toContain("Brief.md wins");
    expect(result).not.toContain("Outline brief");
  });

  it("scans multiple brief files in outline/ alphabetically", async () => {
    await writeFile(
      join(bookDir, "story", "outline", "chapter_briefs_001_005.md"),
      "# Chương 3\nBrief A content.\n",
      "utf-8",
    );
    await writeFile(
      join(bookDir, "story", "outline", "chapter_briefs_006_010.md"),
      "# Chương 7\nBrief B content.\n",
      "utf-8",
    );

    const resultA = await findAndExtractChapterBrief(bookDir, 3);
    expect(resultA).toContain("Brief A content");

    const resultB = await findAndExtractChapterBrief(bookDir, 7);
    expect(resultB).toContain("Brief B content");
  });

  it("ignores non-brief markdown files in outline/", async () => {
    await writeFile(
      join(bookDir, "story", "outline", "volume_map.md"),
      "# Chương 1\nThis is not a brief.\n",
      "utf-8",
    );
    const result = await findAndExtractChapterBrief(bookDir, 1);
    expect(result).toBe("");
  });
});
