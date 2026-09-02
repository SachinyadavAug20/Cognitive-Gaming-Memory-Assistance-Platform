# Bazaar Buddies

A shopping & budget-management game that trains **Instrumental Activities of Daily
Living (IADLs)** — staying within a budget while buying everyday groceries.

**Domain:** Budget & Money Management

---

## Concept

The player is given a fixed budget (₹500) and a shopping list of 8 everyday products
(basmati rice, toor dal, mustard oil, sugar, salt, tea powder, wheat atta, etc.).
They decide what to buy, watch the running total, and confirm before the budget runs out.

This mirrors the original *"Bazaar Buddies"* HTML/CSS/JS game, rebuilt as a modern
React component with the platform's neobrutalist styling, adaptive difficulty, audio,
and trilingual support.

---

## How to play

1. **Intro** — see your budget (₹500) and the instructions.
2. **Shop** — tap products to add them to your basket. The running total updates live.
3. **Payment / Change** — confirm your purchase and, where relevant, work out the
   change from the amount you pay.
4. **Done** — review what you bought and your remaining budget, then play again.

Aim to buy as many items as possible **without exceeding** ₹500.

---

## Phases

| Phase | Purpose |
|-------|---------|
| `intro` | Show budget + instructions |
| `shop` | Pick products, track running total |
| `payment` | Confirm and handle payment / change |
| `change` | Verify the change calculation |
| `done` | Results + play again |

---

## Accessibility

- Enlarged fonts (body 18px+, minimum 16px)
- `ChunkyButton` tactile controls
- Spoken prompts via Web Speech TTS (`speak`)
- Procedural sound feedback (`playPress`, `playCorrect`, `playComplete`)
- Adaptive difficulty via `resolveAdaptiveLevel`

---

## Files

- `BazaarBuddiesGame.tsx` — the full game component

## Localization

`en` / `hi` / `mr` supported through the `games.bazaarBuddies` message namespace.
