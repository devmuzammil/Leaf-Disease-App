import AsyncStorage from "@react-native-async-storage/async-storage";
import type { SupportedLanguage } from "./preferencesSlice";

const LANG_KEY = "@smart_leaf_guard_language";

export async function persistPreferredLanguage(lang: SupportedLanguage): Promise<void> {
  await AsyncStorage.setItem(LANG_KEY, lang);
}

export async function loadPreferredLanguage(): Promise<SupportedLanguage | null> {
  try {
    const v = await AsyncStorage.getItem(LANG_KEY);
    if (v === "en" || v === "ur" || v === "ps") return v;
  } catch {
    /* ignore */
  }
  return null;
}
