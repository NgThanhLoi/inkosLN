# RIS Local Search And Transcript Design

## Goal

RIS must actually discover web/video material and import usable Chinese Bilibili transcript content for story writing, while keeping API keys, cookies, and other secrets out of the repository.

## Approved Approach

Use a pragmatic local-first pipeline:

- `research discover` continues to use Brave Search through `BRAVE_API_KEY`.
- `research import-video` and `research fetch-transcripts` use the existing external transcript contract.
- Add argument support for the external command so Windows users can run `node scripts/transcript-provider.mjs <url>` through environment variables.
- Add a local transcript provider script that shells out to `yt-dlp`.
- Prefer Chinese subtitles for Bilibili: `zh`, `zh-CN`, `zh-Hans`, `zh-Hant`, `cmn`.
- If transcript text is unavailable, import metadata-only rather than inventing transcript details.
- Optional cookies are only read from env-controlled paths/options, never from repo config.

## Interfaces

Environment variables:

- `BRAVE_API_KEY`: enables `research discover`.
- `INKOS_TRANSCRIPT_COMMAND`: executable used by `ExternalTranscriptProvider`, for example `node`.
- `INKOS_TRANSCRIPT_ARGS`: command arguments before the URL, for example `..\scripts\transcript-provider.mjs` from `test-novel`.
- `INKOS_TRANSCRIPT_TIMEOUT_MS`: optional timeout override.
- `BILIBILI_COOKIES_FILE`: optional cookie file path passed to `yt-dlp --cookies`.
- `YT_DLP_COOKIES_FROM_BROWSER`: optional browser source passed to `yt-dlp --cookies-from-browser`.

Transcript command JSON contract:

```json
{
  "status": "available",
  "platform": "bilibili",
  "title": "Video title",
  "channel": "Uploader",
  "language": "zh-CN",
  "transcriptKind": "official_caption",
  "text": "Chinese subtitle text..."
}
```

Failure and fallback contract:

```json
{
  "status": "unavailable",
  "platform": "bilibili",
  "title": "Video title if available",
  "channel": "Uploader if available",
  "reason": "No supported subtitle language found"
}
```

## Error Handling

- Missing `yt-dlp` returns `status: "failed"` with a clear reason.
- Missing subtitles returns `status: "unavailable"`, not an exception.
- Non-Chinese subtitles can be used only if no Chinese subtitle exists, and the returned `language` must say what was used.
- Cookies are optional. The provider reports access/cookie failures in `reason`.

## Testing

- Unit-test parsing of `INKOS_TRANSCRIPT_ARGS`.
- Unit-test command invocation includes configured args before URL.
- Unit-test transcript provider VTT parsing and Chinese subtitle preference using fixtures, without network.
- Verify CLI build and targeted tests.
- If environment has Brave key and `yt-dlp`, run a real `research discover` and `research import-video` against the Bilibili URL.
