import type { CapacitorConfig } from '@capacitor/cli';
import fs from 'node:fs';

// Automatically detect Android Studio on Arch Linux (/opt/android-studio) and common locations
if (!process.env.CAPACITOR_ANDROID_STUDIO_PATH) {
  const studioCandidates = [
    '/opt/android-studio/bin/studio.sh',
    '/usr/local/android-studio/bin/studio.sh',
    '/snap/android-studio/current/bin/studio.sh',
    `${process.env.HOME}/.local/share/JetBrains/Toolbox/apps/android-studio/bin/studio.sh`,
  ];
  for (const candidate of studioCandidates) {
    if (fs.existsSync(candidate)) {
      process.env.CAPACITOR_ANDROID_STUDIO_PATH = candidate;
      break;
    }
  }
}

const config: CapacitorConfig = {
  appId: 'in.gov.mdoner.cognicare',
  appName: 'CogniCare CDTx',
  webDir: 'dist',
  server: {
    androidScheme: 'http',
    cleartext: true,
    allowNavigation: ['*'],
  },
  android: {
    allowMixedContent: true,
    webContentsDebuggingEnabled: true,
    backgroundColor: '#FAF6F0',
  },
  plugins: {
    StatusBar: {
      overlaysWebView: false,
      style: 'DARK',
      backgroundColor: '#1E293B',
    },
    ScreenOrientation: {
      // Tablets default to landscape, phones adapt
    },
  },
};

export default config;
