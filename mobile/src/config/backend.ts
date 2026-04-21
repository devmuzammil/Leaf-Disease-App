import Constants from "expo-constants";
import { Platform } from "react-native";

// Express backend base URL (used for auth + optional prediction proxy).
//
// When running on a device with Expo Go, "localhost" is not your PC, so we try
// to infer the real host from Expo's runtime configuration.
//
// In production, replace this value with your deployed backend (e.g. https://my-app.example.com/api).

const extractHost = (value?: string): string | null => {
  if (!value) return null;

  // Typical formats:
  // - "192.168.1.5:19000"
  // - "exp://192.168.1.5:19000"
  // - "http://192.168.1.5:19000"
  // - "localhost:19000"
  const match = value.match(/([0-9.]+|localhost)(?::\d+)?$/);
  return match ? match[1] : null;
};

const getDevHost = (): string | null => {
  // Expo stores a host hint in multiple places depending on SDK/version.
  const candidates = [
    Constants.manifest?.debuggerHost,
    (Constants as any).manifest2?.debuggerHost,
    Constants.manifest?.hostUri,
    (Constants as any).manifest2?.hostUri,
    Constants.expoConfig?.extra?.hostUri,
  ];

  for (const candidate of candidates) {
    const host = extractHost(candidate);
    if (host && host !== "localhost" && host !== "127.0.0.1") {
      return host;
    }
  }

  return null;
};

// Allow overriding the URL in app.json via `expo.extra.apiBaseUrl`.
const explicitApiUrl =
  (Constants.expoConfig as any)?.extra?.apiBaseUrl ||
  Constants.manifest?.extra?.apiBaseUrl ||
  (Constants as any).manifest2?.extra?.apiBaseUrl ||
  null;

const getPlatformFallbackHost = () => {
  if (Platform.OS === "android") {
    return "10.0.2.2"; // Android emulator host loopback
  }
  if (Platform.OS === "web") {
    return "localhost"; // Web runs on same machine
  }
  return "localhost";
};

// Determine a host from Expo runtime (e.g. 192.168.10.3).
// Web platform: always uses localhost (ignores explicitApiUrl which is for mobile)
// Mobile platform: uses explicit apiBaseUrl from app.json
const devHost = Platform.OS === "web" ? null : getDevHost();

const computedApiUrl = devHost ? `http://${devHost}:4000/api` : null;

// Web should ALWAYS use localhost, ignore the mobile IP from app.json
let finalApiUrl: string;
if (Platform.OS === "web") {
  finalApiUrl = `http://localhost:4000/api`;
} else {
  // Mobile: use explicit URL from app.json, or computed/fallback
  const fallbackApiUrl = explicitApiUrl || `http://${getPlatformFallbackHost()}:4000/api`;
  finalApiUrl = computedApiUrl || fallbackApiUrl;
}

export const API_BASE_URL = finalApiUrl;

// Debug help: log the URL used for API calls.
console.log("[config/backend] Platform:", Platform.OS);
console.log("[config/backend] API_BASE_URL:", API_BASE_URL);
if (explicitApiUrl && computedApiUrl && explicitApiUrl !== computedApiUrl) {
  console.warn(
    "[config/backend] explicit apiBaseUrl differs from Expo runtime host; using runtime host for local development.",
    { explicitApiUrl, computedApiUrl },
  );
}
if (!explicitApiUrl && !devHost) {
  console.warn(
    "[config/backend] no explicit apiBaseUrl or Expo host found; using platform fallback.",
    { platform: Platform.OS, fallback: API_BASE_URL },
  );
}

