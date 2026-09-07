# CogniCare CDTx Native Application (`/application`)

> **Native Android Mobile & Tablet Application for MDoNER Cognitive Digital Therapeutics (CDTx) Platform**  
> *Engineered for Elderly Dementia, Alzheimer's, and MCI Care in North East India*

---

## 📱 Overview

The `/application` project packages the **CogniCare CDTx** Next.js 16 web platform into a native Android tablet and mobile app using **Ionic Capacitor 7**.

### Why Capacitor?
1. **100% Game Preservation**: All **43 serious cognitive games** (Three.js 3D spatial scenes, GSAP animations, Web Audio synthesizers, and MediaPipe computer vision) run at full 60 FPS without code rewrites.
2. **Native Hardware Bridges**:
   - **Camera**: Native Android camera permissions for QR Kiosk card login and webcam hand-tracking (*Tea Garden Harvest*, *Air Mouse*).
   - **Tactile Haptics**: Device vibration feedback for elderly finger taps on chunky buttons.
   - **Native TTS**: Regional voice synthesis (Assamese, Bengali, Manipuri, Khasi, Mizo, Bodo, Hindi, English).
   - **Kiosk Mode**: Screen keep-awake, hardware back-button intercept, and full-screen immersive therapy display.
   - **Offline-Ready**: Pre-seeded with Biren Borah demo patient (`/patient/demo`) and local therapy assets.

---

## 🛠️ Project Structure

```
application/
├── android/                   # Native Android Studio Gradle Project
│   ├── app/
│   │   ├── build.gradle       # App dependencies and compile SDK (v35)
│   │   └── src/main/
│   │       ├── AndroidManifest.xml # Camera, Audio, Vibrate, WakeLock permissions
│   │       └── assets/public/ # Synchronized web assets, models, and wasm
│   └── build.gradle
├── capacitor.config.ts        # Capacitor App & Plugin Configuration
├── package.json               # Native bridge dependencies
├── scripts/
│   ├── sync-frontend.sh       # One-step asset synchronization script
│   └── build-apk.sh           # One-click Gradle build script for debug APK
├── src/                       # TypeScript Native Hardware Bridges
│   ├── index.ts               # Runtime initialization
│   └── plugins/
│       ├── haptics.ts         # Tactile vibration trigger
│       ├── kiosk.ts           # Screen lock and status bar control
│       └── speech.ts          # Native regional TTS engine
└── dist/                      # Static web distribution bundle
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18+ (tested on Node v26)
- **Java**: OpenJDK 17 or 21+
- **Android Studio** (recommended for testing with Emulator or physical tablet via USB)

### 1. Synchronize Web Assets into the App
Whenever changes are made to games, styles, or i18n in `frontend/`, synchronize them into the native app with:

```bash
cd application
npm run sync
```

This copies all media assets, sample images, wasm, and 3D models into `android/app/src/main/assets/public/` and refreshes the native plugins.

### 2. Open in Android Studio
To view, edit, or run the project in Android Studio:

```bash
cd application
npx cap open android
```

From Android Studio, click **Run (Shift+F10)** to install and launch directly on a connected Android phone or tablet.

### 3. Build Debug APK via Command Line
To compile the APK directly via Gradle:

```bash
cd application
npm run build:apk
```

The generated APK will be available at:
`application/android/app/build/outputs/apk/debug/app-debug.apk`

To install on a connected device via ADB:
```bash
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

### 4. Live-Reload Development on a Physical Tablet
To edit the code on your development laptop and see changes update live on a physical tablet:

1. Connect tablet and laptop to the same Wi-Fi network.
2. Run in `application/`:
   ```bash
   npx cap run android -l --external
   ```
3. Select your connected device. The app will launch with live-reload enabled.

---

## 🪪 Native Plugins Installed

| Plugin | Purpose in CogniCare |
|---|---|
| `@capacitor/camera` | Optical reticle QR kiosk scanner & vision motion tracking |
| `@capacitor/haptics` | Physical sensory vibration on button taps for tremor compensation |
| `@capacitor-community/text-to-speech` | Native offline regional dialect speech synthesis |
| `@capacitor/screen-orientation` | Orientation lock (landscape for tablets, adaptive for phones) |
| `@capacitor/status-bar` | Zero-distraction dark status bar for clinical therapy |
| `@capacitor/app` | Safe back-button handling preventing accidental therapy exit |

---

## 🔒 Offline & Security Compliance

- **Cleartext Traffic Enabled**: Allows tablets to communicate with local Spring Boot servers (`http://<ip>:8080/api/v1`) in rural North Eastern PHC health centers without SSL certificate errors.
- **Privacy First**: Patient biometric data, voice recordings, and webcam video feeds are processed **100% on-device**; no unencrypted health data leaves the local device.
