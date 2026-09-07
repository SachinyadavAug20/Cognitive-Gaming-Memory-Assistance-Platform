import { Haptics, ImpactStyle } from '@capacitor/haptics';

/**
 * Triggers tactile vibration for elderly dementia patients to provide
 * physical confirmation of screen taps (crucial for tremor-affected motor feedback).
 */
export async function triggerHapticFeedback(style: 'light' | 'medium' | 'heavy' = 'medium'): Promise<void> {
  try {
    const impactMap = {
      light: ImpactStyle.Light,
      medium: ImpactStyle.Medium,
      heavy: ImpactStyle.Heavy,
    };
    await Haptics.impact({ style: impactMap[style] });
  } catch {
    // Graceful fallback for non-vibrating devices
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(style === 'heavy' ? 40 : style === 'medium' ? 25 : 15);
    }
  }
}
