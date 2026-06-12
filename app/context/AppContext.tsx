import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";

export type PrivacySetting = "attendance" | "academic" | "none";

interface Settings {
  darkMode: boolean;
  classReminders: boolean;
  earlyReminder: boolean;
  attendanceAlerts: boolean;
}

interface Profile {
  name: string;
  email: string;
  phone: string;
}

interface AppContextType {
  settings: Settings;
  updateSetting: (key: keyof Settings, value: boolean) => void;
  profile: Profile;
  updateProfile: (p: Profile) => void;
  privacySetting: PrivacySetting;
  updatePrivacySetting: (v: PrivacySetting) => void;
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const DEFAULT_PROFILE: Profile = {
  name: "Ahmed Khan",
  email: "ahmed.khan@university.edu.pk",
  phone: "+92 300 1234567",
};

const DEFAULT_SETTINGS: Settings = {
  darkMode: false,
  classReminders: true,
  earlyReminder: true,
  attendanceAlerts: true,
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [privacySetting, setPrivacySetting] = useState<PrivacySetting>("attendance");

  useEffect(() => {
    async function load() {
      try {
        const savedProfile = await AsyncStorage.getItem("profile");
        if (savedProfile) setProfile(JSON.parse(savedProfile));
        const savedSettings = await AsyncStorage.getItem("settings");
        if (savedSettings) setSettings(JSON.parse(savedSettings));
        const savedPrivacy = await AsyncStorage.getItem("privacySetting");
        if (savedPrivacy) setPrivacySetting(savedPrivacy as PrivacySetting);
      } catch (e) {}
    }
    load();
  }, []);

  async function updateSetting(key: keyof Settings, value: boolean) {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    await AsyncStorage.setItem("settings", JSON.stringify(updated));
  }

  async function updateProfile(p: Profile) {
    setProfile(p);
    await AsyncStorage.setItem("profile", JSON.stringify(p));
  }

  async function updatePrivacySetting(v: PrivacySetting) {
    setPrivacySetting(v);
    await AsyncStorage.setItem("privacySetting", v);
  }

  function logout() {}

  return (
    <AppContext.Provider value={{ settings, updateSetting, profile, updateProfile, privacySetting, updatePrivacySetting, logout }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used inside AppProvider");
  return ctx;
}

export function useTheme() {
  const { settings } = useAppContext();
  const dark = settings.darkMode;
  return {
    dark,
    colors: {
      bg: dark ? "#111" : "#fff",
      bgSecondary: dark ? "#1e1e1e" : "#F5F5F3",
      bgCard: dark ? "#1a1a1a" : "#fff",
      bgHighlight: dark ? "#1e1b3a" : "#F8F7FF",
      text: dark ? "#f0f0f0" : "#111",
      textSecondary: dark ? "#aaa" : "#888",
      textMuted: dark ? "#666" : "#aaa",
      border: dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
      purple: "#534AB7",
      purpleLight: dark ? "#2a2560" : "#EEEDFE",
      purpleBorder: dark ? "#3d3880" : "#CECBF6",
    },
  };
}
