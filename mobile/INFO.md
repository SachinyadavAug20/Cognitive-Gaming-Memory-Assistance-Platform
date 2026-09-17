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
| **DI** | Manual (no Hilt/Koin) |

---

## 2. Project Structure

```
mobile/
├── build.gradle.kts              # Root build (plugin versions)
├── settings.gradle.kts           # Module includes
├── gradle.properties             # JVM args, AndroidX
├── gradle/wrapper/               # Gradle wrapper
└── app/
    ├── build.gradle.kts          # App module (dependencies)
    └── src/main/
        ├── AndroidManifest.xml   # Permissions, activity
        ├── res/
        │   ├── values/strings.xml
        │   └── values/themes.xml
        └── java/com/cognicare/
            ├── MainActivity.kt           # Entry point, Navigation host
            ├── data/
            │   ├── Patient.kt            # Room entities
            │   ├── PatientDao.kt         # DAOs
            │   └── AppDatabase.kt        # Room database
            ├── ui/
            │   ├── navigation/Screen.kt  # Route definitions
            │   ├── screens/              # All screen composables
            │   ├── games/                # Game composables
            │   └── theme/                # Colors, Typography
            └── util/
                └── HapticUtil.kt         # Vibration feedback
```

---

## 3. Screens & Navigation

| Screen | Route | Description |
|---|---|---|
| Splash | `splash` | Animated logo, auto-navigate to login |
| Login | `login` | QR scan + demo patient buttons |
| QR Scanner | `qr_scanner` | CameraX + ML Kit barcode scanning |
| Patient Dashboard | `patient_dashboard` | Greeting, progress, quick actions |
| Games Hub | `games_hub` | 2-column grid of 8 game cards |
| Memory Road | `memory_road` | Find landmarks in shuffled grid |
| Tea Garden | `tea_garden` | Timed pick-the-target game |
| Market Visit | `market_visit` | Memorize shopping list |
| Temple Prayer | `temple_prayer` | Match pairs (memory) |
| Church Bell | `church_bell` | Watch & repeat color pattern |
| Bamboo Craft | `bamboo_craft` | Complete color sequence |
| Auto Rickshaw | `auto_rickshaw` | Follow route in order |
| School Days | `school_days` | Match English → local words |
| Caregiver | `caregiver` | Patient stats, sessions, alerts |

---

## 4. Games & Clinical Domains

| Game | Domain | Mechanic | Difficulty |
|---|---|---|---|
| Memory Road | Memory | Find target in grid | Grid grows with level |
| Tea Garden | Attention | Timed target picking | More items, less time |
| Market Visit | Memory | Memorize list, recall | Longer lists |
| Temple Prayer | Calm | Match pairs | More pairs |
| Church Bell | Attention | Pattern repetition | Longer sequences |
| Bamboo Craft | Executive | Complete pattern | Longer patterns |
| Auto Rickshaw | Visuospatial | Route following | Longer routes |
| School Days | Language | Word matching | More word pairs |

---

## 5. Data Layer

### Room Database (`cognicare_db`)

**Tables:**

| Table | Columns | Purpose |
|---|---|---|
| `patients` | id (PK), name, age, gender, state, photoUrl, language | Patient profiles |
| `game_scores` | id (PK, auto), patientId, gameId, score, timestamp | Game session history |

**DAOs:**

- `PatientDao`: getPatientById, getFirstPatient, insertPatient
- `GameScoreDao`: getScoresForPatient (Flow), insertScore

---

## 6. Key Features

### QR Code Scanner
- CameraX with `ImageAnalysis` + `STRATEGY_KEEP_ONLY_LATEST`
- ML Kit `BarcodeScanning.getClient()` for real-time detection
- Supports `TYPE_URL` and `TYPE_TEXT` barcodes
- Permission handling via `rememberLauncherForActivityResult`

### Haptic Feedback
- `VibratorManager` (API 31+) or `Vibrator` (legacy)
- `VibrationEffect.createOneShot()` for tap feedback
- 60ms for correct actions, 200ms for errors

### Elderly-Friendly Design
- **Typography**: 18sp body, 22sp titles, 28sp headlines
- **Touch targets**: 80dp minimum for buttons
- **Colors**: High contrast green on cream/white
- **Language**: Simple, clear instructions
- **Feedback**: Visual + haptic on every interaction

---

## 7. Build & Run

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

## 8. Permissions

| Permission | Purpose |
|---|---|
| `CAMERA` | QR code scanning |
| `INTERNET` | Backend API calls (when connected) |
| `VIBRATE` | Haptic feedback |

---

## 9. Integration with Backend

The mobile app can connect to the Spring Boot backend for:

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/v1/auth/kiosk/demo` | POST | Demo patient login |
| `/api/v1/patients/{id}` | GET | Patient profile |
| `/api/v1/patients/{id}/sessions` | GET | Game session history |
| `/api/v1/patients/{id}/sessions` | POST | Submit game score |

Currently runs **offline-first** with Room database. Backend integration is optional.

---

## 10. Design Tokens

### Colors
| Token | Hex | Usage |
|---|---|---|
| Green40 | `#2E7D32` | Primary brand |
| DeepGreen | `#1B5E20` | Gradient endpoints |
| SoftGreen | `#E8F5E9` | Background tint |
| WarmWhite | `#FFFDF5` | Screen background |
| SuccessGreen | `#43A047` | Positive feedback |
| ErrorRed | `#E53935` | Negative feedback |

### Typography (elderly-optimized)
| Style | Size | Weight |
|---|---|---|
| Display | 40sp | Bold |
| Headline | 28sp | Bold |
| Title | 22sp | Medium |
| Body | 18sp | Normal |
| Label | 18sp | Medium |
