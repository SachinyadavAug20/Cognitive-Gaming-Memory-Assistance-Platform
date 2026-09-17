# CogniCare Mobile (Kotlin)

Native Android application for CogniCare CDTx platform.

## Features

- QR Code Scanner for kiosk login
- Patient Dashboard
- Cognitive Games (Memory Road)
- Offline local storage
- Haptic feedback

## Requirements

- Android Studio Ladybug (2024.2.1) or later
- JDK 17
- Android SDK 35

## Build

```bash
cd mobile
./gradlew assembleDebug
```

## Install

```bash
adb install app/build/outputs/apk/debug/app-debug.apk
```
