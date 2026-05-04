import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

export type NotificationType = "sound" | "vibrate" | "silent";

export interface AppSettings {
  notificationsEnabled: boolean;
  notificationType: NotificationType;
  compactView: boolean;
  showOnlineStatus: boolean;
  autoMarkRead: boolean;
}

const STORAGE_KEY = "@whatsapp_dashboard_settings";

const DEFAULT_SETTINGS: AppSettings = {
  notificationsEnabled: true,
  notificationType: "sound",
  compactView: false,
  showOnlineStatus: true,
  autoMarkRead: true,
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          try {
            setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(raw) });
          } catch {
            setSettings(DEFAULT_SETTINGS);
          }
        }
      })
      .finally(() => setLoaded(true));
  }, []);

  const updateSetting = useCallback(
    async <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
      const next = { ...settings, [key]: value };
      setSettings(next);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    },
    [settings]
  );

  const resetSettings = useCallback(async () => {
    setSettings(DEFAULT_SETTINGS);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
  }, []);

  return { settings, loaded, updateSetting, resetSettings };
}
