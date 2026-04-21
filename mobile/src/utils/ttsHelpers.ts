/**
 * Text-to-Speech (TTS) Helpers for multilingual support
 * Handles language-specific voice selection and fallback strategies
 */

import * as Speech from "expo-speech";

export type SupportedLanguage = "en" | "ur" | "ps";

type SpeechVoice = {
  identifier?: string;
  language?: string;
  name?: string;
};

const LANGUAGE_CANDIDATES: Record<SupportedLanguage, string[]> = {
  en: ["en-US", "en-GB", "en"],
  ur: ["ur-PK", "ur-IN", "ur", "hi-IN", "hi", "en-US", "en"],
  // Pashto voices are often unavailable; fallback to Urdu then Hindi then English for audibility.
  ps: [
    "ps-AF",
    "ps-PK",
    "ps",
    "ur-PK",
    "ur-IN",
    "ur",
    "hi-IN",
    "hi",
    "en-US",
    "en",
  ],
};

/**
 * Get the appropriate language code for TTS based on user's selected language
 * @param language The selected language (en, ur, ps)
 * @returns A language code compatible with expo-speech
 */
export const getTTSLanguageCode = (language: SupportedLanguage): string => {
  switch (language) {
    case "ur":
      return "ur-PK"; // Urdu (Pakistan)
    case "ps":
      return "ps-AF"; // Pashto (Afghanistan)
    default:
      return "en-US"; // English (US)
  }
};

const normalizeLanguage = (value?: string): string => value?.toLowerCase() ?? "";

const matchesCandidate = (voiceLanguage: string, candidate: string): boolean => {
  const normalizedCandidate = candidate.toLowerCase();
  return (
    voiceLanguage === normalizedCandidate ||
    voiceLanguage.startsWith(`${normalizedCandidate}-`) ||
    normalizedCandidate.startsWith(`${voiceLanguage}-`)
  );
};

const getBestVoiceForLanguage = async (
  language: SupportedLanguage
): Promise<{ language: string; voice?: string }> => {
  const candidates = LANGUAGE_CANDIDATES[language];
  const defaultLanguage = candidates[0] ?? getTTSLanguageCode(language);

  try {
    const getAvailableVoicesAsync = (Speech as any).getAvailableVoicesAsync as
      | (() => Promise<SpeechVoice[]>)
      | undefined;

    const voices = (await getAvailableVoicesAsync?.()) ?? [];
    if (!Array.isArray(voices) || voices.length === 0) {
      return { language: defaultLanguage };
    }

    for (const candidate of candidates) {
      const matched = voices.find((voice) =>
        matchesCandidate(normalizeLanguage(voice.language), candidate)
      );
      if (matched) {
        return {
          language: matched.language ?? candidate,
          voice: matched.identifier,
        };
      }
    }

    return { language: defaultLanguage };
  } catch (error) {
    console.warn("Could not fetch available TTS voices:", error);
    return { language: defaultLanguage };
  }
};

const getVoiceAttemptsForLanguage = async (
  language: SupportedLanguage
): Promise<Array<{ language?: string; voice?: string }>> => {
  const candidates = LANGUAGE_CANDIDATES[language];
  const attempts: Array<{ language?: string; voice?: string }> = [];
  const seen = new Set<string>();

  const pushAttempt = (value: { language?: string; voice?: string }) => {
    const key = `${value.language ?? "default"}::${value.voice ?? "no-voice"}`;
    if (!seen.has(key)) {
      seen.add(key);
      attempts.push(value);
    }
  };

  try {
    const getAvailableVoicesAsync = (Speech as any).getAvailableVoicesAsync as
      | (() => Promise<SpeechVoice[]>)
      | undefined;
    const voices = (await getAvailableVoicesAsync?.()) ?? [];

    if (Array.isArray(voices) && voices.length > 0) {
      for (const candidate of candidates) {
        const matched = voices.find((voice) =>
          matchesCandidate(normalizeLanguage(voice.language), candidate)
        );
        if (matched) {
          pushAttempt({
            language: matched.language ?? candidate,
            voice: matched.identifier,
          });
        }
      }
    }
  } catch (error) {
    console.warn("Could not fetch available TTS voices:", error);
  }

  // Language-only attempts (without forcing a specific voice identifier).
  for (const candidate of candidates) {
    pushAttempt({ language: candidate });
  }

  // Guaranteed final fallback: let the OS choose default TTS voice.
  pushAttempt({});
  return attempts;
};

/**
 * Speak text with fallback to English if the primary language fails
 * @param text The text to speak
 * @param language The primary language for TTS
 * @param onDone Callback when speech is done
 * @param onError Callback when speech encounters an error
 */
export const speakWithFallback = async (
  text: string,
  language: SupportedLanguage,
  onDone?: () => void,
  onError?: () => void
): Promise<void> => {
  const primaryAttempts = await getVoiceAttemptsForLanguage(language);
  const englishAttempts =
    language === "en" ? [] : await getVoiceAttemptsForLanguage("en");
  const attempts = [...primaryAttempts, ...englishAttempts];

  return new Promise<void>((resolve, reject) => {
    const trySpeak = (index: number, lastError?: unknown) => {
      if (index >= attempts.length) {
        onError?.();
        reject(lastError ?? new Error("No TTS voice could speak the text."));
        return;
      }

      const attempt = attempts[index];
      const speechOptions: Speech.SpeechOptions = {
        pitch: 1.0,
        rate: 0.8,
        onDone: () => {
          onDone?.();
          resolve();
        },
        onError: (error) => {
          console.warn("TTS attempt failed:", {
            language: attempt.language ?? "default",
            voice: attempt.voice ?? "none",
            error,
          });
          trySpeak(index + 1, error);
        },
      };

      if (attempt.language) {
        speechOptions.language = attempt.language;
      }
      if (attempt.voice) {
        speechOptions.voice = attempt.voice;
      }

      try {
        Speech.speak(text, speechOptions);
      } catch (error) {
        trySpeak(index + 1, error);
      }
    };

    trySpeak(0);
  }).catch((error) => {
    console.error("Unexpected TTS error:", error);
    onError?.();
    throw error;
  });
};

/**
 * Stop currently playing speech
 */
export const stopSpeech = async (): Promise<void> => {
  try {
    await Speech.stop();
  } catch (error) {
    console.warn("Error stopping speech:", error);
  }
};

/**
 * Check if a language has TTS support on the device
 * Note: This is informational; expo-speech will still attempt to speak
 */
export const getSupportedLanguages = async (): Promise<string[]> => {
  try {
    const getAvailableLanguages = (Speech as any).getAvailableLanguages;
    const languages = await getAvailableLanguages?.();
    return Array.isArray(languages) ? languages : [];
  } catch (error) {
    console.warn("Could not fetch available languages:", error);
    return ["en-US"]; // Fallback to English
  }
};
