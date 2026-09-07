import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { ScreenOrientation } from '@capacitor/screen-orientation';

export interface KioskConfig {
  lockOrientation?: 'landscape' | 'portrait' | 'unlocked';
  hideStatusBar?: boolean;
}

/**
 * Configures kiosk mode for elderly patients:
 * - Hides status bar or styles it dark
 * - Prevents accidental hardware back exits
 * - Locks tablet orientation to comfortable viewing angle
 */
export async function setupKioskMode(config: KioskConfig = {}): Promise<void> {
  try {
    if (config.hideStatusBar) {
      await StatusBar.hide();
    } else {
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#1E293B' });
    }
  } catch (err) {
    console.warn('StatusBar configuration not available:', err);
  }

  try {
    if (config.lockOrientation === 'landscape') {
      await ScreenOrientation.lock({ orientation: 'landscape' });
    } else if (config.lockOrientation === 'portrait') {
      await ScreenOrientation.lock({ orientation: 'portrait' });
    }
  } catch (err) {
    console.warn('ScreenOrientation lock not available:', err);
  }

  // Handle hardware back button safely
  try {
    App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back();
      } else {
        // If on root, do not close app abruptly in clinic kiosk
        console.log('Elderly Kiosk Guard: Root level reached');
      }
    });
  } catch (err) {
    console.warn('App backButton listener not available:', err);
  }
}
