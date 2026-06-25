# RIS ASR Fallback Design

## Goal

When a Bilibili or YouTube video has no subtitle file, RIS should still be able to produce usable source-grounded writing material for heavenscreen by transcribing audio with a local ASR command.

## Approved Approach

- Keep subtitle extraction as the first choice.
- If no subtitle text is found, download audio with `yt-dlp` into a temp directory.
- Run an external ASR command configured through environment variables.
- Return ASR output as `status: "available"`, `language: "zh"`, `transcriptKind: "auto_caption"`.
- Append fetched metadata to the transcript text so writer has both speech text and title/tags/description context.
- If ASR is not configured or fails, keep metadata-only import with a clear reason.

## Environment Variables

- `INKOS_ASR_COMMAND`: executable for ASR, for example `python`.
- `INKOS_ASR_ARGS`: arguments before audio file path, for example `scripts\asr-whisper-provider.py --language zh`.
- `INKOS_ASR_TIMEOUT_MS`: optional ASR timeout, default 10 minutes.
- `INKOS_ASR_LANGUAGE`: optional language hint, default `zh`.

## ASR Contract

The ASR command receives the audio file path as the final argument and may output either plain text or JSON:

```json
{
  "text": "Chinese transcript text...",
  "language": "zh"
}
```

Plain stdout is treated as transcript text with language `INKOS_ASR_LANGUAGE`.

## Safety

- ASR transcript is not canon. It is `auto_caption` material and can contain recognition errors.
- Writer must still respect existing `allowedUse` / `forbiddenUse` fact card policy.
- The provider must not invent transcript content when ASR is unavailable.
