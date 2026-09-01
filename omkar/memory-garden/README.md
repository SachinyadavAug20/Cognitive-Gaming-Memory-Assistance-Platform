# Memory Garden

A **multi-activity memory** game that combines three classic memory exercises in one
garden-themed experience.

**Domain:** Multi-Activity Memory

---

## Concept

Based on the original *"Memory Game"* HTML/CSS/JS game, rebuilt as three selectable
sub-games. The player picks an activity from the garden home screen, then completes
the challenge. Difficulty (number of items, sequence length, preview time) scales
with the patient's adaptive level.

---

## The three activities

| Sub-game | What you do |
|----------|-------------|
| **Memory Match** (`memoryMatch`) | Flip cards to find matching pairs |
| **What Changed?** (`whatChanged`) | Study a grid, then spot which item changed |
| **Remember Sequence** (`sequence`) | Watch a sequence, then replay it in order |

---

## Phases

| Phase | Purpose |
|-------|---------|
| `intro` | Choose an activity |
| `preview` | Memorize the items / sequence before play |
| `play` | Complete the challenge |
| `play2` | Results + play again |

---

## Accessibility

- Enlarged fonts (minimum 16px)
- `ChunkyButton` tactile controls
- Spoken prompts (`speak` / `stopSpeaking`)
- Procedural sound (`playPress`, `playCorrect`, `playComplete`, `playEncourage`)
- Adaptive difficulty (`pairsForLevel`, `changeItemCount`, `sequenceLength`)

---

## Files

- `MemoryGardenGame.tsx` — the full game component

## Localization

`en` / `hi` / `mr` supported through the `games.memoryGarden` message namespace.
