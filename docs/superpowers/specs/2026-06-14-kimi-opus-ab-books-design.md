# Kimi vs Opus A/B Book Test Design

## Goal

Create two clean InkOS books that share the same Star Rail heavenscreen reference frame, rules, canon, and opening brief. The only intended variable is the writer model:

- `tm-hsr-ab-kimi`
- `tm-hsr-ab-opus`

Both books start from Chapter 1. They do not continue from Chapter 32 and do not copy existing chapters, runtime snapshots, memory databases, pending hook debt, or post-Ch32 state from `thien-mac-livestream-van-gioi-star-rail`.

## Source Material

Use `test-novel/books/thien-mac-livestream-van-gioi-star-rail` as the seed for:

- `book_rules.md`
- `story/author_intent.md`
- `story/reaction_pool.md`
- `story/canon/*`
- opening-level current focus and state files adapted for Chapter 1

Do not copy:

- `chapters/*.md`
- populated `chapters/index.json`
- `story/runtime`
- `story/snapshots`
- `story/memory.db`
- `story/pending_hooks.md`
- post-Ch32 `story/current_state.md`

## Book Shape

Each test book gets:

- `book.json` with a unique id and title, `language = vi`, `targetChapters = 40`, `chapterWordCount = 1500`.
- `chapters/index.json` initialized to an empty array.
- shared rules, canon, reaction RIS, and author intent.
- a clean `story/current_state.md` describing the pre-Chapter-1 Herta Space Station opening.
- a clean `story/current_focus.md` with the same Chapter 1 target brief.
- minimal state/snapshot scaffolding only if the existing InkOS writer requires it.

## Model Routing

The current CLI routes writer models through project-level `inkos.json` under `modelOverrides.writer`; `write next` does not expose a per-book writer override. The test procedure therefore changes the project writer override between runs:

1. Back up `test-novel/inkos.json`.
2. Set writer to Kimi Zen Go.
3. Run Chapter 1 for `tm-hsr-ab-kimi` with the shared brief.
4. Set writer to Opus VietAPI.
5. Run Chapter 1 for `tm-hsr-ab-opus` with the same brief.
6. Restore the original writer override.

Planner, auditor, length normalizer, chapter analyzer, and state validator stay unchanged so they remain controlled variables.

## Verification

After setup:

- Both book directories exist.
- Neither book contains copied chapter bodies.
- Both `chapters/index.json` files are empty.
- Both books have identical seed canon/rules/focus except for book identity.
- The original `thien-mac-livestream-van-gioi-star-rail` book is not modified.

After each test chapter:

- Chapter 1 exists in the intended book only.
- `chapters/index.json` contains one entry.
- `wordCount` and `lengthTelemetry.finalCount` are plausible.
- `story/state/manifest.json.lastAppliedChapter` matches the generated chapter.
- Drift grep finds no forbidden player/system/quiz/ranking/streamer terms.
- The model route used for that run is recorded in the operator notes or terminal output.
