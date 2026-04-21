import AsyncStorage from "@react-native-async-storage/async-storage";

const DEVICE_ID_KEY = "device_id";

const generateUuid = (): string => {
  // Simple RFC4122 v4 UUID generator (not crypto-grade but sufficient for device ID).
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export async function getDeviceId(): Promise<string> {
  const existing = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;

  const id = generateUuid();
  await AsyncStorage.setItem(DEVICE_ID_KEY, id);
  return id;
}
