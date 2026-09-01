# Omkar — CogniCare Game Portfolio

This folder contains the personal collection of serious cognitive games built for the
**CogniCare** platform — an AI-powered Cognitive Digital Therapeutics (CDTx) and Memory
Assistance platform for elderly dementia patients.

Each game is purpose-built with:
- **Chunky neobrutalist UI** — high-contrast, large tactile buttons for elderly usability
- **Enlarged fonts** — the smallest text is 16px, body text is 18px+ for readability
- **Adaptive difficulty** — automatically scales to each patient's ability
- **Audio + speech** — procedural sound effects and spoken prompts (Web Speech TTS)
- **Trilingual support** — English (en), Hindi (hi), Marathi (mr)
- **Telemetry** — session scores/taps/errors are recorded for caregiver review

---

## Games

| Game | Folder | Domain |
|------|--------|--------|
| **Bazaar Buddies** | [`bazaar-buddies/`](bazaar-buddies/) | Budget & Money Management |
| **Memory Garden** | [`memory-garden/`](memory-garden/) | Multi-Activity Memory |
| **Memory Road** | [`memory-road/`](memory-road/) | Visual Search & Recognition |

Each game folder contains:
- The React component (`.tsx`)
- A `README.md` documenting the game, controls, phases, and how it maps to the original concept

---

## Where the games live in the platform

The working copies used by the running platform are in
`frontend/src/games/<game-id>/`. This `omkar` folder holds **copies** as a standalone
portfolio with documentation.

To run the full platform:

```bash
# frontend
cd frontend
npm install
npm run dev        # → http://localhost:3000

# backend (optional, for login/telemetry persistence)
cd backend
./mvnw spring-boot:run -Dspring-boot.run.profiles=demo
```
