#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
ANDROID_DIR="${APP_DIR}/android"

echo "========================================================"
echo " CogniCare CDTx: Building Native Android APK"
echo "========================================================"

# 1. First ensure all assets are synchronized
bash "${SCRIPT_DIR}/sync-frontend.sh"

# 2. Check Android SDK environment
if [ -z "$ANDROID_HOME" ] && [ -z "$ANDROID_SDK_ROOT" ]; then
  if [ -d "$HOME/Android/Sdk" ]; then
    export ANDROID_HOME="$HOME/Android/Sdk"
    echo "Using default Android SDK: $ANDROID_HOME"
  else
    echo "⚠️  ANDROID_HOME is not set."
    echo "To compile directly via command line, install the Android SDK or set ANDROID_HOME."
    echo "Alternatively, open the project in Android Studio with:"
    echo "   cd application && npx cap open android"
  fi
fi

# 3. Attempt Gradle Build if gradlew exists
if [ -f "${ANDROID_DIR}/gradlew" ]; then
  echo "Invoking Gradle Wrapper..."
  cd "${ANDROID_DIR}"
  chmod +x ./gradlew
  
  if ./gradlew assembleDebug; then
    APK_PATH="${ANDROID_DIR}/app/build/outputs/apk/debug/app-debug.apk"
    if [ -f "${APK_PATH}" ]; then
      echo "========================================================"
      echo "✅ SUCCESS! Debug APK Generated at:"
      echo "   ${APK_PATH}"
      echo "========================================================"
      echo "To install on connected tablet / phone:"
      echo "   adb install -r ${APK_PATH}"
    fi
  else
    echo "========================================================"
    echo "Gradle build completed with warnings or requires Android SDK."
    echo "You can open the project in Android Studio directly:"
    echo "   cd application && npx cap open android"
    echo "========================================================"
  fi
else
  echo "Error: gradlew not found in ${ANDROID_DIR}"
  exit 1
fi
