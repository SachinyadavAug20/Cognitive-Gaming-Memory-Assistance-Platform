export * from './plugins/haptics';
export * from './plugins/speech';
export * from './plugins/kiosk';

/**
 * Initializes all native features when running inside Capacitor.
 */
export async function initCogniCareApp(): Promise<void> {
  if (typeof window === 'undefined' || !(window as unknown as { Capacitor?: unknown }).Capacitor) {
    return;
  }

  const { setupKioskMode } = await import('./plugins/kiosk');
  await setupKioskMode({
    hideStatusBar: false,
    lockOrientation: 'unlocked', // Default unlocked, adapts to tablet or phone
  });

  console.log('✅ CogniCare CDTx Native App Runtime Initialized');
}
