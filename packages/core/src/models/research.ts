import { z } from "zod";

export const ResearchConfidenceSchema = z.enum([
  "canon",
  "official",
  "fanon",
  "commentary",
  "speculative",
  "unknown",
]);
export type ResearchConfidence = z.infer<typeof ResearchConfidenceSchema>;

export const ResearchFactTypeSchema = z.enum([
  "canon_event",
  "character_trait",
  "power_rule",
  "relationship",
  "location",
  "item",
  "timeline",
  "real_world_fact",
  "commentary",
  "behind_the_scenes",
  "video_candidate",
  "video_segment",
  "secret",
  "reaction_matrix",
  "spoiler_budget",
  "spoiler_budget_hint",
]);
export type ResearchFactType = z.infer<typeof ResearchFactTypeSchema>;

export const ResearchTimelineSchema = z.object({
  arc: z.string().min(1).optional(),
  order: z.number().finite().optional(),
});
export type ResearchTimeline = z.infer<typeof ResearchTimelineSchema>;

export const ResearchFactCardSchema = z.object({
  id: z.string().min(1),
  type: ResearchFactTypeSchema,
  confidence: ResearchConfidenceSchema,
  statement: z.string().min(1),
  sourceId: z.string().min(1),
  sourceRef: z.string().min(1),
  entities: z.array(z.string().min(1)),
  tags: z.array(z.string().min(1)),
  allowedUse: z.string().min(1).optional(),
  forbiddenUse: z.string().min(1).optional(),
  notes: z.string().min(1).optional(),
  timeline: ResearchTimelineSchema.optional(),
});
export type ResearchFactCard = z.infer<typeof ResearchFactCardSchema>;

export const ResearchSourceTypeSchema = z.enum([
  "manual_note",
  "web_page",
  "video_transcript",
  "video_metadata",
  "canon_doc",
]);
export type ResearchSourceType = z.infer<typeof ResearchSourceTypeSchema>;

export const ResearchPlatformSchema = z.enum([
  "manual",
  "youtube",
  "bilibili",
  "official",
  "wiki",
  "article",
  "forum",
  "unknown",
]);
export type ResearchPlatform = z.infer<typeof ResearchPlatformSchema>;

export const TranscriptStatusSchema = z.enum(["available", "unavailable", "failed"]);
export type TranscriptStatus = z.infer<typeof TranscriptStatusSchema>;

export const TranscriptKindSchema = z.enum([
  "official_caption",
  "auto_caption",
  "manual_transcript",
  "metadata_only",
]);
export type TranscriptKind = z.infer<typeof TranscriptKindSchema>;

export const SourceConfidenceSchema = z.enum([
  "source_only",
  "trusted",
  "unverified",
]);
export type SourceConfidence = z.infer<typeof SourceConfidenceSchema>;

export const ResearchSourceMetaSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  path: z.string().min(1),
  sourceType: ResearchSourceTypeSchema,
  platform: ResearchPlatformSchema.default("manual"),
  url: z.string().url().optional(),
  channel: z.string().min(1).optional(),
  language: z.string().min(1).optional(),
  transcriptKind: TranscriptKindSchema.optional(),
  transcriptStatus: TranscriptStatusSchema.optional(),
  discoveredBy: z.enum(["brave", "manual", "import"]).optional(),
  confidence: SourceConfidenceSchema.default("source_only"),
  createdAt: z.string().datetime(),
});
export type ResearchSourceMeta = z.infer<typeof ResearchSourceMetaSchema>;

export const ResearchSourceMetaListSchema = z.array(ResearchSourceMetaSchema);
export type ResearchSourceMetaList = z.infer<typeof ResearchSourceMetaListSchema>;

export const ResearchSourceKindSchema = z.enum([
  "youtube_video",
  "bilibili_video",
  "wiki_or_official_page",
  "article",
  "forum_or_commentary",
  "unknown",
]);
export type ResearchSourceKind = z.infer<typeof ResearchSourceKindSchema>;

export const ResearchDiscoverySchema = z.object({
  id: z.string().min(1),
  query: z.string().min(1),
  title: z.string().min(1),
  url: z.string().url(),
  platform: ResearchPlatformSchema,
  sourceKind: ResearchSourceKindSchema,
  snippet: z.string().default(""),
  rank: z.number().int().positive(),
  selected: z.boolean().default(true),
  discoveredAt: z.string().datetime(),
});
export type ResearchDiscovery = z.infer<typeof ResearchDiscoverySchema>;

export const ResearchDiscoveryListSchema = z.array(ResearchDiscoverySchema);
export type ResearchDiscoveryList = z.infer<typeof ResearchDiscoveryListSchema>;

export const TranscriptResultSchema = z.discriminatedUnion("status", [
  z.object({
    status: z.literal("available"),
    platform: ResearchPlatformSchema,
    url: z.string().url(),
    title: z.string().min(1).optional(),
    channel: z.string().min(1).optional(),
    language: z.string().min(1).optional(),
    transcriptKind: TranscriptKindSchema,
    text: z.string().min(1),
  }),
  z.object({
    status: z.literal("unavailable"),
    platform: ResearchPlatformSchema,
    url: z.string().url(),
    title: z.string().min(1).optional(),
    channel: z.string().min(1).optional(),
    reason: z.string().min(1),
    metadataText: z.string().min(1).optional(),
  }),
  z.object({
    status: z.literal("failed"),
    platform: ResearchPlatformSchema,
    url: z.string().url(),
    reason: z.string().min(1),
    retryable: z.boolean().default(true),
  }),
]);
export type TranscriptResult = z.infer<typeof TranscriptResultSchema>;

export const ResearchQueryResultSchema = z.object({
  card: ResearchFactCardSchema,
  score: z.number(),
  reasons: z.array(z.string()),
});
export type ResearchQueryResult = z.infer<typeof ResearchQueryResultSchema>;
