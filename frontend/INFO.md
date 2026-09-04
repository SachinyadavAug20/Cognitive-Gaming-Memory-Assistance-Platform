# CogniCare Frontend — Technical Reference

> **Factual engineering reference for the SIH 2026 CogniCare frontend**  
> Next.js 16.3.3 • React 19 • TypeScript 5 • Tailwind CSS 4 • next-intl 4 • Three.js • recharts 3

---

## 1. Stack & Project Setup

| Item | Value |
|---|---|
| **Framework** | Next.js **16.3.3** (App Router, Turbopack) |
| **React** | 19.2.8 |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 (`@tailwindcss/postcss`) |
| **i18n** | next-intl **4.14.0** |
| **3D** | three 0.185 + gsap 3.15 |
| **Charts** | recharts 3.10 |
| **State** | zustand 5 (persist) |
| **Vision/QR** | @mediapipe/tasks-vision 1.0, html5-qrcode 2.3, qrcode.react 4.2 |
| **Icons** | lucide-react 1.37 |
| **Scripts** | `dev` (next dev), `build` (next build), `start` (next start), `lint` (eslint) |

**Visual design system:** a neo-brutalist "clinical scrapbook" UI — paper-texture canvas, black-bordered chunky buttons (`border-3 border-black shadow-[4px_4px_0px_#000]`), Fraunces serif + Atkinson Hyperlegible + JetBrains Mono web fonts, GIGW AAA accessibility toolbar.

---

## 2. Routing & Auth

Routes live under `src/app/[locale]/` (App Router). Root redirects `/` → `/en`.

| Route | Purpose | Auth-gated |
|---|---|---|
| `/` | Home — 3D diorama hero, kiosk CTA, **Try Demo Patient**, Regional States Hub, Clinical Impact | Public |
| `/login` | Staff / caregiver / clinician manual login + QR section | Public |
| `/kiosk/login` | Zero-touch patient QR kiosk check-in | Public |
| `/command-center` | MDoNER 8-State epidemiology & telemetry dashboard | Public |
| `/caregiver` | Caregiver dashboard — patient list, sessions, adherence | Public |
| `/caregiver/add-patient` | Patient intake wizard | Public |
| `/caregiver/patients/[id]` | Patient detail — vitals, biomarkers, family, life-story | Public |
| `/caregiver/patients/[id]/card` | Printable secure patient identity card (QR) | Public |
| `/patient` | Patient home — greeting, therapy grid, wellbeing, Saathi AI companion | **Auth-gated** |
| `/patient/games` | Games hub — filter by clinical domain, featured showcase | **Auth-gated** |
| `/patient/games/[gameId]` | Individual game (dynamic) | **Auth-gated** |
| `/admin` | Mission-control panel (14 tabs) | Public |
| `/api/tts` | Server-side TTS proxy (see §5.5 Language "Listen") | — |

**Auth gate** (`src/app/[locale]/patient/layout.tsx`): a client layout uses `useSyncExternalStore` reading `useAuthStore.persist.hasHydrated()`; if hydrated but `isAuthenticated === false` it redirects to `/kiosk/login`, otherwise renders a `<Spinner />`. The authenticated layout mounts `<CaregiverSosButton />`.

**State (`src/store/useAuthStore.ts`):** zustand + `persist`, persisted to `localStorage` under `"cognicare-auth"`, holding `token`, `patient`, `isAuthenticated`, with `login(token, patient)` / `logout()`.

---

## 3. API Client & Session Behavior

`src/lib/api.ts`:

- **Base URL** — `getApiBase()` resolves at runtime: `http://localhost:8080/api/v1` on `localhost`/`127.0.0.1`, `http://{hostname}:8080/api/v1` on LAN, and `NEXT_PUBLIC_API_URL || http://localhost:8080/api/v1` as SSR fallback.
- **Auth header** — `Authorization: Bearer {token}` from the auth store on every request (only when a token exists).
- **`HttpError`** — typed error carrying an HTTP `status`.
- **Session expiration** — a `401` on `/patients/**` paths calls `handleSessionExpired()` (clears `cognicare-auth`, redirects to `/en/kiosk/login`). Other `401`s (e.g. a bad QR scan) do **not** wipe the session.
- **Endpoints** — typed `get/post/postMultipart` plus AI-reminiscence helpers (`aiChat`, `aiClues`, `aiStoryChapter`, `aiBazaar`, `aiProverb`, `aiMemoir`) and surveillance helpers.

---

## 4. Demo / Kiosk Sign-In

**`POST /api/v1/auth/kiosk/demo`** (Home "Try Demo Patient"): on success stores the returned token + patient and routes to `/patient`. If the backend is unreachable it falls back to a **mock offline session**: `login("demo-offline-session", { id: 2, name: "Biren Borah", languagePreference: "as" })`.

**Kiosk (`KioskLoginClient.tsx`)** — `html5-qrcode` webcam scanner → `POST /api/v1/auth/kiosk/scan` with `{ qrData }`. A `401` shows "Unrecognized Health Card"; success caches token/patient and auto-redirects to `/patient` (~1.5s). Footer notes "Ayushman Bharat Digital Mission (ABDM) Compatible Kiosk".

---

## 5. i18n — 11 Languages, Zero Flicker

**Locales** (`src/i18n/routing.ts`: `en` default, `localePrefix: 'always'`):

`en` English · `hi` Hindi · `as` Assamese · `mr` Marathi · `bn` Bengali · `ne` Nepali · `mni` Meitei/Manipuri · `lus` Mizo · `kha` Khasi · `brx` Bodo · `grt` Garo

**Loading** (`src/i18n/request.ts`): English is always loaded first, then **deep-merged** over the target locale (custom `deepMerge`), so a missing key falls back to English instead of rendering blank. Unknown/absent locale falls back to `en`.

**Navigation** (`src/i18n/navigation.ts`): `createNavigation(routing)` exports typed `Link`, `redirect`, `usePathname`, `useRouter`, `getPathname`. `hasLocale` validates the route param and triggers `notFound()` for invalid locales.

**Persistence** — font size (`cognicare_font_size`) and high-contrast mode are stored in `localStorage` and applied pre-paint (inline script) to prevent an SSR hydration flash; route changes use React 19 `useTransition`.

---

## 5.5 Language "Listen" — Text-to-Speech (TTS)

How the platform **speaks** any string in the patient's preferred language.

### Entry points (the "Listen" / "Speak" buttons)
- A **Listen to memory** button in `MemoryLightbox`, a **Speak** (`AudioPrompt`), voice prompts in `GameHeader` / `AudioPrompt`, `useListenFirst` (read-aloud-on-load), `SaathiVoiceCompanion`, `DailyRoutineSchedule`, and the kiosk scanner greeting.
- Components import `{ speak }` from `@/lib/speech`, a thin adapter that re-exports `speakText` from `@/lib/sound` — the single resilient engine, so the API and the engine stay in sync.

### Engine API (`src/lib/sound.ts`)
```
speakText(text, locale = "en", rate = 0.82, onStart?, onEnd?)
```
- `locale` — the source language (see plumbing below). `rate` — speech tempo (call-sites often pass `0.82`; patient-driven rate comes from `speechRate(patient)` in `games/config.ts`, default `0.85`).
- `onStart`/`onEnd` fire to flip the button to "Speaking…" state.

### Hybrid dual-path strategy
`speakText` runs **two alternative paths**:

1. **Neural audio stream (preferred)** — builds `GET /api/tts?text=..&lang=..` and plays it through an HTML `<audio>` element:
   - The route (`src/app/api/tts/route.ts`) normalizes the locale via `TTS_LANG_MAP` (see below), streams an MP3 relayed from Google `translate_tts`, and returns it with `Cache-Control: public, max-age=86400, immutable`.
   - Responses are memoized in an **in-memory LRU cache (250 entries)**, keyed by `lang:text-prefix`.
   - Text passed to the network is truncated to the first **200 chars**.
2. **Native Web Speech API (fallback)** — used on `audio.onerror`, a blocked `audio.play()` (autoplay policy), or if the endpoint throws:
   - Drives `window.speechSynthesis` with a `SpeechSynthesisUtterance`, picking a voice via `pickVoice(locale)`.
   - `stopSpeaking()` cancels **both** the active utterance and the active `<audio>` element (`_activeCogniUtterance`).

### Multi-tier voice selection & script fallback
The 11 locales rarely have a matching native engine voice, so selection uses ordered fallbacks — one list for the **provider** and one for the **browser voice**:

- **`TTS_LANG_MAP` (provider language, shared Unicode script):** `as → bn`, `mni → bn`, `brx → hi`, `grt|kha|lus → en`; `en`, `hi`, `bn`, `mr`, `ne` map to themselves. So Assamese/Manipuri audio is rendered by the Bengali engine, Bodo by Hindi, and Roman-script languages (Garo/Khasi/Mizo) by English.
- **`VOICE_TIERS` (browser voice cascade per language):** e.g. `as: [as-in, as, bn-in, bn, hi-in, hi, en-in, en-gb, en-us]`. `pickVoice` walks the tier list for an **exact `lang` tag match**, else any voice whose prefix matches, else any English voice, else the first voice available (`LANG_BY_TAG` collapses region tags such as `as-in` → `as`).

### Language plumbing (how the language is chosen)
The `locale` is resolved from three places, in order of specificity:
- Current active locale via `next-intl` `useLocale()`.
- Per-request / per-patient language: `patientLangCode(patient?.preferredLanguage)` (e.g. the caregiver photo lightbox speaks in the patient's language regardless of the UI locale).
- A per-game `lang` prop on `AudioPrompt` / game players.

### Guardrails
- **SSR-safe**: engine guards `typeof window === "undefined"`.
- **Autoplay policy**: callers `unlockAudio()` before speaking; any audio-play rejection falls back to Web Speech.
- **Mute/volume**: if muted or `volume <= 0`, it fires `onEnd()` without audio.
- **Chrome speech staleness**: a 4.5 s resume timer keeps `speechSynthesis` from pausing mid-utterance; background audio is ducked during speech.

> **Caveat:** the `/api/tts` neural path depends on the external Google `translate_tts` endpoint; in a fully offline/air-gapped deployment it degrades gracefully to the native Web Speech fallback path (voice availability depends on the host OS/browser voices).

---

## 6. Game Portfolio (43 Serious Games)

**Metadata** (`src/games/meta.ts`, **server-safe** — no component or icon imports, so it is safe to use from the sitemap/build graph): each game exposes `id`, `titleKey`, `descKey`, `domain`. Exports `GAME_META`, `GAME_IDS`, `getGameMeta(id)`.

**Registry** (`src/games/registry.tsx`, client-only — imports every game component + lucide icon): `GameDef { id, icon, titleKey, descKey, accent, domain, category, recommended?, component }`, `42` entries + the `pathways` alias = **43 unique IDs**.

**Clinical domains** — `reminiscence | vision-3d | attention | iadl | calm`.

**Config/algorithms** (`src/games/config.ts`): `startLevel(detail)` (reads `medicalProfile.gameConfig.startLevel` or `recommendedStartDifficulty`, clamped 1–3), `speechRate` (default `0.85`), `memoryGridSize` (default 3), `memoryPreviewSeconds`, `memoryShowHints`, `wayfindingRouteLength`; scaffolding levels (`none|gentle|focused|direct`); clinical AI helpers — neuroplastic scaffold hints, EMA kinetic smoothing, bilateral symmetry, acoustic hesitation scoring, cognitive fatigue, spaced retrieval intervals, MoCA trajectory prediction, dementia staging risk, caregiver co-pilot tips, and an ethnobotanical `HERBAL_MEMORY_BANK`.

### Complete 43-game roster (`src/games/meta.ts`)

Domains: **vision-3d · reminiscence · attention · iadl · calm · spatial/advanced**

| ID | Cognitive Domain / Modality |
|---|---|
| `lotus-painter` | vision-3d — OpenCV optical air-canvas & lotus bloom |
| `butterfly-sanctuary` | vision-3d — OpenCV optical hand-perch stabilization |
| `tea-garden-catch` | vision-3d — OpenCV dual-hand kinesthetic harvest |
| `alpana` | vision-3d — computer-vision air-canvas |
| `river-lanterns` | vision-3d — 3D graphics & optical vision |
| `loom` | vision-3d — 3D constructional praxis |
| `drum` | vision-3d — 3D auditory-motor entrainment |
| `tuned-drum` | vision-3d — auto-tuned rhythmic entrainment (OpenCV left/right + rhythm snap-to-grid auto-tuner) |
| `hornbill-flight` | vision-3d — visuomotor glider physics |
| `majuli-pottery` | vision-3d — tactile motor praxis |
| `grandchild-chat` | reminiscence — AI conversational reminiscence |
| `memory-detective` | reminiscence — face & clue spaced retrieval |
| `timeline` | reminiscence — chronological life milestones |
| `jigsaw` | reminiscence — visuospatial family puzzles |
| `radio` | reminiscence — auditory vintage reminiscence |
| `tea-harvest` | attention — selective attention |
| `monastery-bell` | attention — auditory working-memory span |
| `brahmaputra-boat` | attention — spatial navigation & tracking |
| `dzukou-botanist` | attention — visual discrimination & search |
| `wayfinding` | attention — spatial orientation |
| `root-bridge` | attention — spatial strategy |
| `storybook` | attention — AI branching life tales |
| `daily-routine` | iadl — prospective memory & routine |
| `heritage-kitchen` | iadl — recipe sequencing |
| `sorting` | iadl — executive categorisation |
| `arrow-escape` | spatial — planning & vector clearance |
| `majuli-walk` | advanced — 3D spatial-memory navigation |
| `tea-harvest-vision` | advanced — OpenCV motion-tracking harvest |
| `bihu-dhol` | advanced — adaptive acoustic drum rhythm |
| `day-in-my-world` | advanced — 6-chapter 3D story campaign & Saathi AI (flagship) |
| `bazaar-buddies` | advanced — IADL budget & money management |
| `memory-garden` | advanced — multi-activity memory suite |
| `memory-road` | advanced — road safety & visual search |
| `daily-tasks` | advanced — IADL sequencing & daily routine |
| `companion` | advanced — conversational reminiscence companion |
| `rhythm-hills` | advanced — kinesthetic rhythm & tempo matching |
| `weaving` | advanced — traditional-motif pattern completion |

---

## 7. SEO & Performance (recent hardening)

- **Centralized site config** (`src/lib/site.ts`): `SITE_URL` from `NEXT_PUBLIC_SITE_URL` (falls back to `https://cognitive-gaming-memory-assistance.vercel.app`), `SITE_NAME`, `SITE_DESCRIPTION`.
- **Metadata builder** (`src/lib/metadata.ts`): `buildMetadata({locale,title,description,path,keywords})` emits canonical, **hreflang alternates for all 11 locales + x-default**, OpenGraph and Twitter cards; `getPath`/`resolveMessage` translate i18n message keys; `defaultMetadata` convenience fallback.
- **Per-route titles**: every public + caregiver route and all `[gameId]` pages export `generateMetadata` (localized via `games/meta.ts` + `resolveMessage`). Auth-gated dynamic pages use a **server page wrapper + client component** pattern so SSR HTML carries a real `<title>` (e.g. "Patient Record — ID {id} · Cognitive Care Dashboard").
- **Layout metadata** (`src/app/[locale]/layout.tsx`): title template `"%s | CogniCare CDTx"`, theme-color `#15803D`, `StructuredData`, icons, and the pre-paint inline scripts.
- **Sitemap** (`src/app/sitemap.ts`): **7 core pages × 11 locales + 43 games × 11 locales = 550 URLs**, each with locale alternates + `x-default`. Uses `games/meta.ts` (not `registry.tsx`) to avoid pulling the heavy game bundle into the build.
- **Robots** (`src/app/robots.ts`): disallow `/api/`; allow `/`; sitemap pointer for all user agents (`*`, Googlebot, Bingbot).
- **Cache headers** (`next.config.ts`): `LONG_CACHE = "public, max-age=31536000, immutable"` for `/wasm/:path*`, `/models/:path*`, `/sample-images/:path*`, `/_next/static/:path*`.
- **Lazy loading** via `next/dynamic(..., { ssr: false })`: `Hero3DLandscape` (Three.js) on Home; `BiomarkerRadarChart`, `TrajectoryHeatmap`, `CognitiveGamingProgressCard` (recharts) on patient detail; `IntakeWizard` on intake — each with a loading skeleton. This keeps Three.js (~670 KB) and recharts (~540 KB) out of the home initial critical-path bundle.

**Static assets (`/public`)**: `/wasm/*` (MediaPipe WASM), `/models/hand_landmarker.task`, `/sample-images/` (5 demo patients: `patient_1_biren_borah`, `patient_2_mary_nongrum`, `patient_3_ibochouba_singh`, `patient_4_lalhmingmawii_sailo`, `patient_5_kevichusa_angami`, each with `places/` and `relatives/`), plus `icon.svg`, `favicon.ico`, `apple-touch-icon.png`, `og-image.png`.

---

## 8. Key Feature Modules

### Home (`page.tsx` server + `HomeClient.tsx` client)
3D hero (`Hero3DLandscape`, lazy), kiosk 3-step portal, **Try Demo Patient** (demo-login + offline fallback), `RegionalStatesHub` (client, has state), `ClinicalImpactBadges` (static server component).

### Caregiver Patient Detail (`PatientDetailClient.tsx`)
Fetches `GET /patients/{id}`; renders PatientHeroCard, PatientVitalsRow, ClinicalSummaryCard, lazy BiomarkerRadarChart + TrajectoryHeatmap, CognitiveGamingProgressCard, FamilyNetworkCard, FamiliarPlacesCard, PatientLifeStoryCard, DemographicsAdminCard, and a MemoryLightbox with localized TTS narration (`speechRate` per patient).

### Command Center (`CommandCenterClient.tsx`)
8-state NER roster (Assam, Meghalaya, Manipur, Mizoram, Nagaland, Tripura, Arunachal Pradesh, Sikkim) with `registeredPatients`, `adherenceRate`, `stabilityIndex`, `activePHCs`, `topModule`, per-district `districts[]`; aggregations + live session feed.

### Games Hub (`/patient/games`)
Featured showcase (A Day in My World, Majuli Walk, Tea Garden Harvest Vision, Bihu Dhol, Voice of Brahmaputra) playable as fullscreen modals; domain filter tabs; per-game CDTx badge, adaptive level, Start Session CTA.

### Admin (`/admin`, 831-line client)
14 tabs (surveillance, regions, predictive, tele-manas, medications, burnout, alerts, incentives, broadcast, patients, sessions, AI, kiosks, cultural, audit); fetches ~20 parallel API endpoints, auto-refresh 30s; QR card revoke/re-issue, alert resolution, ASHA incentive approval, emergency broadcast, IVR medication reminders, AI tuning, cultural proverb management, JSON/CSV audit export; offline demo-data fallback.

### Patient Home (`/patient`)
Time-of-day greeting in all 11 languages, Digital Memory Bonsai growth, TherapySuiteGrid, DailyRoutineSchedule, MemorySpotlightCard, SensoryCalmCard, DailyMoodTracker, SaathiVoiceCompanion, `useIdleTimeout()` session management.

---

## 9. Verification

```bash
cd frontend
npm run lint          # eslint
npx tsc --noEmit      # typecheck
npm run build         # production build (type-checks + lints + compiles routes)
```

Production smoke test: `npm run build && npm run start` then check each route returns `200` with a unique per-locale `<title>`, canonical, and hreflang tags; verify `Cache-Control: public, max-age=31536000, immutable` on `/wasm/*`, `/models/*`, `/sample-images/*`; confirm `sitemap.xml` (550 URLs) and `robots.txt`.