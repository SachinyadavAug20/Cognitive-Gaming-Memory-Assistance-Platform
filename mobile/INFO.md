# CogniCare Mobile — Technical Reference

> **Factual engineering reference for the SIH 2026 CogniCare Android app**
> Kotlin • Jetpack Compose • CameraX • ML Kit • Room Database

---

## 1. Stack & Project Setup

| Item | Value |
|---|---|
| **Language** | Kotlin 2.1.0 |
| **UI** | Jetpack Compose (Material 3) |
| **Min SDK** | 26 (Android 8.0) |
| **Target SDK** | 35 (Android 15) |
| **Build** | Gradle 8.11.1, AGP 8.7.3 |
| **Architecture** | Single-Activity, Compose Navigation |
| **Database** | Room 2.6.1 (SQLite, offline-first) |
| **Camera** | CameraX 1.4.1 + ML Kit Barcode 17.3.0 |
| **Images** | Coil 2.7.0 (Compose) |
| **Networking** | Retrofit2 2.9.0 + OkHttp 4.12.0 + Gson 2.11.0 |
| **DI** | ServiceLocator (manual, no Hilt/Koin) |
| **Persistence** | DataStore Preferences + Room |

---

## 2. Project Structure

```
mobile/
├── build.gradle.kts                  # Root build (plugin versions)
├── settings.gradle.kts               # Module includes
├── gradle.properties                 # JVM args, AndroidX
├── gradle/wrapper/                   # Gradle wrapper (8.11.1)
├── INFO.md                           # This file
└── app/
    ├── build.gradle.kts              # App module (dependencies)
    └── src/main/
        ├── AndroidManifest.xml       # Permissions, activity
        ├── res/
        │   ├── values/strings.xml
        │   └── values/themes.xml
        └── java/com/cognicare/
            ├── MainActivity.kt           # Entry point, Navigation host, Theme
            ├── data/
            │   ├── local/
            │   │   ├── AppDatabase.kt    # Room database
            │   │   ├── Patient.kt        # Patient entity
            │   │   ├── PatientDao.kt     # Patient DAO
            │   │   ├── GameScore.kt      # Game score entity
            │   │   ├── GameScoreDao.kt   # Game score DAO
            │   │   ├── RoutineChecklistItem.kt  # Routine entity
            │   │   └── SettingsDataStore.kt     # DataStore prefs
            │   ├── remote/
            │   │   ├── CogniCareApi.kt        # Retrofit API interface (40+ endpoints)
            │   │   ├── TokenManager.kt        # JWT token storage
            │   │   └── dto/
            │   │       ├── AuthDto.kt
            │   │       ├── PatientDto.kt
            │   │       ├── GameSessionDto.kt
            │   │       ├── AdminDtos.kt
            │   │       ├── SurveillanceDtos.kt
            │   │       └── AiDtos.kt
            │   └── repository/
            │       ├── AuthRepository.kt
            │       ├── PatientRepository.kt
            │       ├── GameSessionRepository.kt
            │       ├── AiRepository.kt
            │       ├── SurveillanceRepository.kt
            │       └── AdminRepository.kt
            ├── di/
            │   └── ServiceLocator.kt     # DI container
            ├── ui/
            │   ├── navigation/
            │   │   └── Screen.kt         # Route definitions
            │   ├── screens/
            │   │   ├── SplashScreen.kt
            │   │   ├── LoginScreen.kt
            │   │   ├── QRScannerScreen.kt
            │   │   ├── PatientDashboardScreen.kt
            │   │   ├── GamesHubScreen.kt
            │   │   ├── GameScreen.kt     # Game router (42 games)
            │   │   ├── EchoesOfHome3DScreen.kt
            │   │   ├── CaregiverScreen.kt
            │   │   └── AdminScreen.kt
            │   ├── games/
            │   │   ├── GameRegistry.kt        # Game metadata & mapping
            │   │   ├── AlpanaGame.kt
            │   │   ├── AncestralHerbalistGame.kt
            │   │   ├── AutoRickshawGame.kt
            │   │   ├── BambooCraftGame.kt
            │   │   ├── BazaarBuddiesGame.kt
            │   │   ├── BihuDholGame.kt
            │   │   ├── BrahmaputraBoatGame.kt
            │   │   ├── ButterflySanctuaryGame.kt
            │   │   ├── ChurchBellGame.kt
            │   │   ├── CompanionGame.kt
            │   │   ├── DailyRoutineGame.kt
            │   │   ├── DailyTasksGame.kt
            │   │   ├── DayInMyWorldGame.kt
            │   │   ├── DzukouBotanistGame.kt
            │   │   ├── FamilyEmotionsGame.kt
            │   │   ├── GrandchildChatGame.kt
            │   │   ├── HeritageKitchenGame.kt
            │   │   ├── HornbillFlightGame.kt
            │   │   ├── JigsawGame.kt
            │   │   ├── LoomGame.kt
            │   │   ├── LotusPainterGame.kt
            │   │   ├── MajuliPotteryGame.kt
            │   │   ├── MajuliWalk3DGame.kt
            │   │   ├── MarketVisitGame.kt
            │   │   ├── MemoryDetectiveGame.kt
            │   │   ├── MemoryRoadGame.kt
            │   │   ├── MonasteryBellGame.kt
            │   │   ├── RadioGame.kt
            │   │   ├── RhythmHillsGame.kt
            │   │   ├── RiverLanternsGame.kt
            │   │   ├── RootBridgeGame.kt
            │   │   ├── SchoolDaysGame.kt
            │   │   ├── SortingGame.kt
            │   │   ├── StorybookGame.kt
            │   │   ├── TeaGardenCatchGame.kt
            │   │   ├── TeaGardenGame.kt
            │   │   ├── TeaGardenMatchGame.kt
            │   │   ├── TeaGardenVisionGame.kt
            │   │   ├── TemplePrayerGame.kt
            │   │   ├── TimelineGame.kt
            │   │   ├── TunedDrumGame.kt
            │   │   └── WayfindingGame.kt
            │   ├── components/
            │   │   ├── CogniCareTopBar.kt
            │   │   ├── CogniCareDrawerContent.kt
            │   │   ├── SettingsDrawer.kt
            │   │   └── SharedComponents.kt
            │   └── theme/
            │       ├── Color.kt
            │       ├── Theme.kt         # Light + Dark color schemes
            │       └── Type.kt
            ├── viewmodel/
            │   ├── AuthViewModel.kt
            │   ├── DashboardViewModel.kt
            │   ├── GameSessionViewModel.kt
            │   ├── AiChatViewModel.kt
            │   ├── CaregiverViewModel.kt
            │   └── AdminViewModel.kt
            └── util/
                ├── LocalizationManager.kt
                ├── HapticUtil.kt
                ├── NotificationHelper.kt
                └── PatientMediaManager.kt
```

---

## 3. Screens & Navigation

| Screen | Route | Description |
|---|---|---|
| Splash | `splash` | Animated logo, auto-navigate to login |
| Login | `login` | QR scan + demo patient buttons (5 patients) |
| QR Scanner | `qr_scanner` | CameraX + ML Kit barcode scanning |
| Patient Dashboard | `patient_dashboard` | Greeting, progress, quick actions, mood, routine |
| Games Hub | `games_hub` | 2-column grid of 42 game cards |
| Game Player | `game_player/{gameId}` | Routes to the selected game composable |
| Echoes of Home 3D | `echoes_of_home_3d` | Immersive 3D memory environment |
| Caregiver | `caregiver` | Patient stats, sessions, alerts |
| Admin | `admin` | Mission-control dashboard, analytics, alerts |

---

## 4. Games (42 implementations)

### Domain: Memory
| Game | Mechanic | Cultural Anchor |
|---|---|---|
| Memory Road | Find target in shuffled grid | NE India landmarks |
| Market Visit | Memorize shopping list | Local bazaar |
| Tea Garden Match | Match pairs (memory) | Assam tea garden |
| Tea Garden Catch | Catch falling tea items | Assam tea garden |
| Heritage Kitchen | Match NE dish ingredients | Regional cuisine |
| Memory Detective | Visual/episodic recall | Detective theme |
| Timeline | Order events chronologically | Historical events |
| Storybook | Read & recall story details | NE folk tales |

### Domain: Attention
| Game | Mechanic | Cultural Anchor |
|---|---|---|
| Tea Garden | Timed target picking | Tea plantation |
| Church Bell | Watch & repeat color pattern | NE churches |
| Bihu Dhol | Follow rhythm sequence | Assam Bihu |
| Tuned Drum | Match drum patterns | Traditional drums |
| Rhythm Hills | Tap rhythm on hills | Melody landscape |
| Monastery Bell | Follow bell pattern | Buddhist monastery |
| Hornbill Flight | Track flying hornbill | NE bird |

### Domain: Executive Function
| Game | Mechanic | Cultural Anchor |
|---|---|---|
| Bamboo Craft | Complete color pattern | Bamboo weaving |
| Auto Rickshaw | Follow route in order | Local transport |
| Alpana | Complete Rangoli pattern | Floor art |
| Loom | Complete weaving pattern | Textile craft |
| Sorting | Sort items into categories | Daily objects |
| Daily Tasks | Sequence daily activities | ADL training |
| Daily Routine | Complete routine checklist | Personal care |
| Wayfinding | Navigate through maze | Local paths |
| Majuli Pottery | Complete pottery sequence | Majuli island craft |

### Domain: Language
| Game | Mechanic | Cultural Anchor |
|---|---|---|
| School Days | Match English → local words | NE languages |
| Grandchild Chat | AI reminiscence conversation | Family dialogue |
| Family Emotions | Identify facial emotions | Family photos |
| Ancestral Herbalist | Match herbs to remedies | NE traditional medicine |
| Companion | Conversational companion | AI companion |
| Radio | Tune to correct station | Local radio |

### Domain: Visuospatial / 3D
| Game | Mechanic | Cultural Anchor |
|---|---|---|
| Brahmaputra Boat | Navigate 3D river | Brahmaputra river |
| Majuli Walk 3D | Walk through 3D village | Majuli island |
| Butterfly Sanctuary | Catch butterflies in 3D | NE wildlife |
| Root Bridge | Navigate 3D bridge | Meghalaya living bridges |
| Day In My World | Explore 3D environment | NE village life |
| Jigsaw | Assemble puzzle pieces | NE scenery |
| Lotus Painter | Color lotus patterns | Assam lotus |
| Dzukou Botanist | Identify flowers | Dzukou Valley |
| Tea Garden Vision | Vision-based tea picking | Tea plantation |

### Domain: Reminiscence / Calm
| Game | Mechanic | Cultural Anchor |
|---|---|---|
| Temple Prayer | Match pairs (calm) | NE temples |
| River Lanterns | Place floating lanterns | River ritual |
| Wayfinding | Navigate paths | Local geography |

---

## 5. Data Layer

### Room Database (`cognicare_db`)

**Tables:**

| Table | Columns | Purpose |
|---|---|---|
| `patients` | id (PK), name, age, gender, state, photoUrl, language | Patient profiles |
| `game_scores` | id (PK, auto), patientId, gameId, score, timestamp | Game session history |
| `routine_checklist` | id (PK, auto), patientId, text, completed | Daily routine items |

**DAOs:**

- `PatientDao`: getPatientById, getFirstPatient, insertPatient, getAllPatients
- `GameScoreDao`: getScoresForPatient (Flow), insertScore, getTotalScore, getRecentSessions
- `RoutineChecklistDao`: getItemsForPatient, insertItem, toggleItem, deleteAllForPatient

### DataStore Preferences

| Key | Type | Default | Purpose |
|---|---|---|---|
| `font_size` | Float | 18f | Body font size |
| `language` | String | "en" | UI language |
| `night_mode` | Boolean | false | Dark theme toggle |
| `read_aloud` | Boolean | false | Listen-first mode |
| `sound_enabled` | Boolean | true | Sound effects |
| `current_mood` | String | "" | Patient mood label |
| `routine_items` | String Set | empty | Daily routine checklist |

---

## 6. Networking & API

### Retrofit API (`CogniCareApi.kt`)

40+ endpoints covering:

| Category | Endpoints |
|---|---|
| Auth | `/auth/kiosk/demo`, `/auth/login`, `/auth/refresh` |
| Patients | CRUD, family, photos, mood, routine |
| Game Sessions | CRUD, patient history, analytics |
| Surveillance | Vitals, geofence, alerts, SOS |
| AI | `/ai/clinical/analyze`, `/ai/reminiscence/chat`, `/ai/report/generate` |
| Admin | Overview, regions, medications, alerts, patients, sessions |
| Kiosk | QR generation, kiosk config |

### Base URL
`http://10.0.2.2:8080` (Android emulator → localhost)

---

## 7. Key Features

### QR Code Scanner
- CameraX with `ImageAnalysis` + `STRATEGY_KEEP_ONLY_LATEST`
- ML Kit `BarcodeScanning.getClient()` for real-time detection
- Supports `TYPE_URL` and `TYPE_TEXT` barcodes
- Permission handling via `rememberLauncherForActivityResult`

### Haptic Feedback
- `VibratorManager` (API 31+) or `Vibrator` (legacy)
- `VibrationEffect.createOneShot()` for tap feedback
- 60ms for correct actions, 200ms for errors

### Localization (11 Languages)
- `LocalizationManager` singleton with TTS support
- Languages: en, hi, as, mr, bn, ne, mni, lus, kha, brx, grt
- Per-screen font size persistence
- Text-to-speech with language-appropriate voices

### Dark Theme
- Light + Dark Material 3 color schemes
- Persisted via DataStore `night_mode` preference
- Warm dark palette (not pure black) for elderly comfort

### Listen-First Mode
- Persisted via DataStore `read_aloud` preference
- Auto-speaks dashboard greeting on screen load
- Per-game TTS instructions available

### Elderly-Friendly Design
- **Typography**: 18sp body, 22sp titles, 28sp headlines
- **Touch targets**: 80dp minimum for buttons
- **Colors**: High contrast green on cream/white (light) / warm dark (dark)
- **Language**: Simple, clear instructions
- **Feedback**: Visual + haptic on every interaction

---

## 8. Build & Run

```bash
# Build debug APK
cd mobile
./gradlew assembleDebug

# Install on connected device
adb install app/build/outputs/apk/debug/app-debug.apk

# Or open in Android Studio
# File → Open → mobile/
```

### Prerequisites
- Android Studio Ladybug (2024.2.1) or later
- JDK 17
- Android SDK 35
- Physical device recommended (camera for QR)

---

## 9. Permissions

| Permission | Purpose |
|---|---|
| `CAMERA` | QR code scanning |
| `INTERNET` | Backend API calls (when connected) |
| `VIBRATE` | Haptic feedback |

---

## 10. Design Tokens

### Colors
| Token | Light Hex | Dark Hex | Usage |
|---|---|---|---|
| Green40/Green80 | `#2D6A4F` | `#A5D6A7` | Primary brand |
| DeepGreen | `#1B4332` | — | Gradient endpoints |
| SoftGreen | `#D8F3DC` | — | Background tint |
| WarmWhite | `#FFFDF5` | `#161310` | Screen background |
| Cream | `#F5F0E8` | `#2A2520` | Surface variant |
| CardOrange | `#E07A3A` | `#F4A261` | Secondary accent |
| SuccessGreen | `#2D6A4F` | `#A5D6A7` | Positive feedback |
| ErrorRed | `#D62828` | `#FFB4AB` | Negative feedback |

### Typography (elderly-optimized)
| Style | Size | Weight |
|---|---|---|
| Display | 40sp | Bold |
| Headline | 28sp | Bold |
| Title | 22sp | Bold |
| Body | 18sp | Normal |
| Label | 18sp | Bold |

---

## 11. Assets

| Asset | Count | Location |
|---|---|---|
| Patient sample images | 56 | `assets/sample-images/` |
| i18n JSON files | 11 | `assets/messages/` |
| Patient profiles | 5 | bundled in `assets/sample-images/` |

---

## 12. File Statistics

| Metric | Value |
|---|---|
| Kotlin source files | 88 |
| Game implementations | 42 |
| Screen composables | 9 |
| ViewModels | 6 |
| Repository classes | 6 |
| Translation files | 11 |
| Total lines (Kotlin) | ~12,600 |
| Total lines (i18n) | ~12,700 |
