import type { FrontendSettings } from '../../settings/types';

const SETTINGS_KEY = 'book-refresher:settings';

const defaultSettings: FrontendSettings = {
  backendBaseUrl: 'http://127.0.0.1:8787',
  featureFlags: {},
  helpDismissed: false
};

export class SettingsRepository {
  async get(): Promise<FrontendSettings> {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      const result = await chrome.storage.local.get(SETTINGS_KEY);
      return {
        ...defaultSettings,
        ...(result[SETTINGS_KEY] as Partial<FrontendSettings> | undefined)
      };
    }

    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      return defaultSettings;
    }

    return {
      ...defaultSettings,
      ...(JSON.parse(raw) as Partial<FrontendSettings>)
    };
  }

  async set(next: FrontendSettings): Promise<void> {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      await chrome.storage.local.set({ [SETTINGS_KEY]: next });
      return;
    }

    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  }
}

export const settingsRepository = new SettingsRepository();
