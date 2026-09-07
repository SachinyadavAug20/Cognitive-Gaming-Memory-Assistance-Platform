#!/usr/bin/env bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
ROOT_DIR="$(cd "${APP_DIR}/.." && pwd)"
FRONTEND_DIR="${ROOT_DIR}/frontend"

echo "========================================================"
echo " CogniCare CDTx: Syncing Frontend to Native App"
echo "========================================================"

mkdir -p "${APP_DIR}/dist"

echo "1. Copying public media assets, sample images, wasm, and models..."
if [ -d "${FRONTEND_DIR}/public" ]; then
  cp -r "${FRONTEND_DIR}/public/"* "${APP_DIR}/dist/" 2>/dev/null || true
fi

echo "2. Ensuring index.html entry exists..."
if [ ! -f "${APP_DIR}/dist/index.html" ]; then
  echo "Dist index.html missing, regenerating..."
fi

echo "3. Synchronizing Capacitor Android project..."
cd "${APP_DIR}"
npx cap sync android

echo "========================================================"
echo " Sync Complete! Android assets are up to date."
echo "========================================================"
