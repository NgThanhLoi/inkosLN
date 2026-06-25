# Thien Mac Chapter Length And Cooldown Design

## Context

The Vietnamese heavenscreen book `thien-mac-thong-van-gioi-khoi-` has generated through Chapter 10. The current chapter target is 1200 words, and the immediate story state is high pressure after repeated combat, Stellaron strain, and Herta Space Station crisis escalation.

The user clarified that `1500` means target words per chapter, not total chapter count. The final total chapter count remains undecided.

## Design

Update `book.json` so `chapterWordCount` becomes `1500`. Keep `targetChapters` unchanged because total length is not yet determined.

Update `story/current_focus.md` for the next 1-3 chapters, replacing the stale Chapter 2 focus. Chapter 11 should be a cooldown/aftermath chapter at Herta Space Station, with concrete dialogue and emotional processing rather than another combat escalation.

## Chapter 11 Focus

Chapter 11 should slow the pace after the previous combat arc. It should cover Caelus recovering from Stellaron strain, March 7th reacting with worry and light teasing, Dan Heng staying restrained but observant, and Himeko or Arlan turning the aftermath into actionable analysis.

World reactions should be fewer and deeper. Pick 3-5 worlds and give each an action or internal decision, such as recording, convening, testing boundaries, or reassessing Caelus as a risk and ally.

The chapter should advance existing hooks instead of adding many new ones. It should avoid montage, forbidden name drift, repeated slogan-like sentence structures, and overly long paragraphs.

## Verification

After editing, verify that `chapterWordCount` is `1500`, `targetChapters` remains unchanged, and the edited focus does not introduce forbidden name drift such as `Stelle`, `Bronnya`, `Giê-pát`, `Bờ-rô`, `Cô-cô`, `Be-lo`, `Sản Vụ Phu`, `buồng trồng`, or modern streamer/player setup terms.
