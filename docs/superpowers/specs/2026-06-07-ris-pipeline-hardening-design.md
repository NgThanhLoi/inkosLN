# RIS Pipeline Hardening Design

## Goal

Stabilize the current RIS + writing pipeline with minimal targeted fixes: clean up failed research artifacts safely, prevent obviously truncated chapters from being persisted as successful output, and stop the length normalizer from making drafts worse by pushing them farther outside the hard range.

## Approved Scope

- Add `inkos research clear <bookId>`.
- Add a chapter truncation guard in the writing/revision pipeline.
- Add a normalizer guard that keeps the original chapter when normalization makes hard-range fit worse.
- Keep the existing placeholder-overwrite fix.

## Research Clear

Default behavior is conservative:

- Without explicit mode flags, clear failed transcript sources and generated packs.
- Do not delete fact cards unless `--prune-facts` is passed.
- Support dry-run by default; require `--yes` to mutate files.

Flags:

- `--failed-transcripts`
- `--packs`
- `--metadata-only`
- `--prune-facts`
- `--dry-run`
- `--yes`

## Chapter Truncation Guard

Detect clearly incomplete chapter endings before treating a write/revise result as stable output. The guard only targets obvious failures, not subjective prose quality.

Examples to catch:

- ending inside unfinished dialogue attribution
- dangling unmatched quote near EOF
- very short final fragment line that looks cut off

When detected:

- stop persistence as ready output
- raise a clear error so the pipeline does not silently save broken chapters/state snapshots

## Normalizer Guard

If the length normalizer pushes a draft farther away from the hard range than the original draft, keep the original draft.

Rule:

- compare original count vs normalized count by distance to `[hardMin, hardMax]`
- choose the version with the smaller hard-range violation
- if equal, prefer normalized only when it improves readability/size without worsening fit

## Testing

- CLI tests for `research clear` dry-run and destructive modes.
- Core tests for fact pruning and source deletion.
- Core tests for truncation detection.
- Core tests for normalizer guard choosing original content.
