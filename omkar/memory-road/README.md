# Memory Road

A **visual search & recognition** game based on the original *"Memory Mission"* road
safety game. The player must find a target road item (traffic signal, zebra crossing,
STOP sign, etc.) among a grid of distraction tiles.

**Domain:** Visual Search & Recognition

---

## Concept

Target and filler items are laid out on a grid. The player is told what to find (e.g.
"find the traffic signal") and must tap the correct tiles as they appear, level by level.
As difficulty increases, more distraction tiles appear and the grid grows.

Rebuilt from the original HTML/CSS/JS game into a React component with the platform's
neobrutalist styling, adaptive difficulty, audio, and trilingual support.

---

## Targets

Traffic Signal 🚦, Zebra Crossing 🚸, STOP Sign 🛑, Home 🏠, Hospital 🏥, Person 🧍, Shop 🏪

---

## Phases

| Phase | Purpose |
|-------|---------|
| `intro` | Show instructions |
| `playing` | Find the target tile among the grid |
| `levelDone` | Level cleared — next level |
| `gameDone` | Results + play again |

---

## Accessibility

- Enlarged fonts (minimum 16px)
- `ChunkyButton` tactile controls
- Spoken prompts (`speak` / `stopSpeaking`)
- Procedural sound (`playPress`, `playCorrect`, `playComplete`, `playEncourage`, `playTapFeedback`)
- Adaptive difficulty via grid size / distraction count
- 8 progressive levels

---

## Files

- `MemoryRoadGame.tsx` — the full game component

## Localization

`en` / `hi` / `mr` supported through the `games.memoryRoad` message namespace.
