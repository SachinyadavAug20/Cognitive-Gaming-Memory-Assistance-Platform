# 🏠 A Day in My World

A **story-driven 3D therapeutic game** — an interactive morning-to-evening journey where the player navigates a memory challenge with the gentle guidance of **Saathi** 🗣️.

The patient wakes up at home to a ringing alarm clock and a half-finished note:
> *"Today is an important day..."*

**Mission:** Find the missing pieces of the day.

## 🎮 The Story (6 chapters)

1. **🌅 Opening — A Morning to Remember**
   Wake up, the alarm rings, and you notice a note on the table. Saathi appears to help.

2. **🎮 Chapter 1 — A Morning to Remember** (short-term memory + objects)
   Remember 🔑 Key, 🧢 Cap, 👜 Bag — then find them hidden around the house.
   • Levels 1–3 add more objects / place them in different spots
   • Level 4: remember the *order* — Key → Cap → Bag

3. **🎮 Chapter 2 — The Missing Photograph** (object recognition)
   An album is missing a family member. Choose the right photograph.
   • Levels add more choices and similar-looking scenes
   • Level 4: remember a photograph shown for just a moment

4. **🎮 Chapter 3 — The Way to the Market** (spatial memory + navigation)
   Walk from home through the 🌳 Park and past a 🛕 landmark to the 🛒 Market.
   • Level 1: follow the highlighted path
   • Level 2: a longer route, path shown briefly
   • Level 3: 🚧 a road is closed — find another way around
   • Level 4: no highlighted route — use the landmarks

5. **🎮 Chapter 4 — The Market Mission** (working memory + planning + budget)
   Get a shopping list (🥛 🍎 🍚...) — then buy the right items.
   • Level 3: shop from *memory* (list hidden)
   • Level 4: stay within a ₹500 budget
   • Level 5: count the shopkeeper's change (you gave ₹500)

6. **🎮 Chapter 5 — Something Isn't Right** (problem solving)
   Home again, but the door is locked. Figure out what you need, then solve everyday problems (rain, making tea, lights, calling for help).

7. **🎮 Final — The Memory**
   Reconstruct your whole day in the correct order. The sun sets as the character looks through the photo album.

## ▶ How to run
Double-click **`Start-Game.cmd`** — it opens the game in your browser. Close that window when done.

### Controls
| Platform | Action |
|----------|--------|
| **Desktop** | **W A S D** walk · **Mouse** look · **E / click** interact · **Esc** pause |
| **Mobile / tablet** | **Left joystick** walk · **drag right side** look · **tap** interact |

> 💾 **Progress is saved automatically.** After finishing a chapter, the start menu shows a **Continue** button that resumes from the next chapter.

## 🛠 Development
```bash
npm install     # first time only
npm start       # http://127.0.0.1:4173
```

Built with **Three.js** (WebGL) and **Express**. Sound (clock, birds, footsteps, music, Saathi's voice) is made with the Web Audio API — **no audio files or 3D assets needed.**

> 💡 *Personalization idea:* Chapter 2's photographs and the photo album in the final scene could later be loaded with a real family's photos, turning it into personalized gameplay.
