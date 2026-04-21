import NetInfo from "@react-native-community/netinfo";
import axios from "axios";
import { API_BASE_URL } from "../config/backend";
import { getAuthToken } from "./authService";
import { getDeviceId } from "./deviceService";
import { formatDiseaseName } from "../utils/formatDisease";

const PREDICT_URL = `${API_BASE_URL}/predict`;

let predictionHistoryDirty = true;

export function markPredictionHistoryDirty(): void {
  predictionHistoryDirty = true;
}

export function markPredictionHistoryClean(): void {
  predictionHistoryDirty = false;
}

export function isPredictionHistoryDirty(): boolean {
  return predictionHistoryDirty;
}

export type PredictionResult = {
  crop: string;
  disease: string;
  confidence: number; // 0..1
  recommendations: string[];
  severity: "low" | "medium" | "high";
  isHealthy: boolean;
  raw?: any;
};

export type PredictionHistoryItem = {
  id: string;
  prediction: string;
  confidence: number;
  crop: string;
  modelProvider?: string;
  createdAt: string;
  imageUrl?: string;
};

type HuggingFacePredictResponse = Record<string, any>;

const normalizeConfidence = (value: unknown): number => {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  // Support both 0..1 and 0..100 responses
  if (value > 1 && value <= 100) return value / 100;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
};

const inferCrop = (disease: string): string => {
  const lower = disease.toLowerCase();
  if (lower.startsWith("apple")) return "Apple";
  if (lower.startsWith("tomato")) return "Tomato";
  if (lower.startsWith("grape")) return "Grape";
  if (lower.startsWith("cherry")) return "Cherry";
  return "Unknown";
};

const pickDiseaseName = (data: HuggingFacePredictResponse): string => {
  // Try common keys first
  const candidates: unknown[] = [
    data.disease,
    data.prediction,
    data.label,
    data.class,
    data.class_name,
    data.predicted_class,
  ];

  for (const c of candidates) {
    if (typeof c === "string" && c.trim()) return c.trim();
  }

  // Some HF apps return arrays of {label, score}
  if (Array.isArray(data.predictions) && data.predictions.length) {
    const top = data.predictions[0];
    if (top && typeof top.label === "string") return top.label.trim();
  }
  if (Array.isArray(data) && data.length) {
    const top = data[0];
    if (top && typeof top.label === "string") return top.label.trim();
  }

  return "Unknown";
};

const pickConfidence = (data: HuggingFacePredictResponse): number => {
  const candidates: unknown[] = [
    data.confidence,
    data.score,
    data.probability,
    data.confidence_score,
  ];

  for (const c of candidates) {
    const normalized = normalizeConfidence(c);
    if (normalized > 0) return normalized;
  }

  if (Array.isArray(data.predictions) && data.predictions.length) {
    const top = data.predictions[0];
    const normalized = normalizeConfidence(top?.score ?? top?.confidence);
    if (normalized > 0) return normalized;
  }
  if (Array.isArray(data) && data.length) {
    const top = data[0];
    const normalized = normalizeConfidence(top?.score ?? top?.confidence);
    if (normalized > 0) return normalized;
  }

  return 0;
};

export class PredictionError extends Error {
  code:
    | "OFFLINE"
    | "NETWORK"
    | "BAD_RESPONSE"
    | "SERVER"
    | "UNKNOWN";

  constructor(message: string, code: PredictionError["code"]) {
    super(message);
    this.code = code;
  }
}

export async function predictDisease(imageUri: string): Promise<PredictionResult> {
  const net = await NetInfo.fetch();
  if (net.isConnected === false) {
    throw new PredictionError(
      "No internet connection. Please connect to use disease detection.",
      "OFFLINE",
    );
  }

  const fileName = imageUri.split("/").pop() ?? "leaf.jpg";
  const match = /\.(\w+)$/.exec(fileName);
  const type = match ? `image/${match[1]}` : "image/jpeg";

  const formData = new FormData();
  // HuggingFace endpoint expects field name "image" (not "file").
  formData.append("image", {
    uri: imageUri,
    name: fileName,
    type,
  } as any);

  let data: any = null;
  try {
    const token = await getAuthToken();
    const deviceId = await getDeviceId();

    const response = await axios.post(PREDICT_URL, formData, {
      headers: {
        Accept: "application/json",
        "Content-Type": "multipart/form-data",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(deviceId ? { "x-device-id": deviceId } : {}),
      },
      timeout: 30000,
    });
    data = response.data;
  } catch (e: any) {
    const status = e?.response?.status;
    const msg =
      e?.response?.data?.error ||
      e?.response?.data?.message ||
      (typeof status === "number" ? `Prediction request failed (${status}).` : null) ||
      "Network error. Please try again in a moment.";
    throw new PredictionError(String(msg), status ? "SERVER" : "NETWORK");
  }

  if (!data) {
    throw new PredictionError("Unexpected response from server.", "BAD_RESPONSE");
  }

  const disease = formatDiseaseName(pickDiseaseName(data));
  const confidence = pickConfidence(data);
  const crop = typeof data.crop === 'string' && data.crop ? data.crop : inferCrop(disease);

  // Recommendations/severity are resolved in UI layer from constants map.
  return {
    crop,
    disease,
    confidence,
    recommendations: [],
    severity: "low",
    isHealthy: /healthy/i.test(disease),
    raw: data,
  };
}

export async function fetchPredictionHistory(): Promise<PredictionHistoryItem[]> {
  const token = await getAuthToken();
  const deviceId = await getDeviceId();

  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (deviceId) headers["x-device-id"] = deviceId;

  const res = await axios.get(`${API_BASE_URL}/predictions`, {
    headers,
    timeout: 15000,
  });
  return (res.data as any).predictions as PredictionHistoryItem[];
}

export async function fetchPredictionHistoryPaginated(page = 1, pageSize = 10): Promise<{ predictions: PredictionHistoryItem[]; page: number; pageSize: number; total: number; totalPages: number }> {
  const token = await getAuthToken();
  const deviceId = await getDeviceId();

  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (deviceId) headers["x-device-id"] = deviceId;

  const res = await axios.get(`${API_BASE_URL}/predictions`, {
    headers,
    timeout: 15000,
    params: { page, pageSize },
  });
  return res.data as any;
}

export async function clearHistory(): Promise<void> {
  const token = await getAuthToken();
  if (!token) return;

  await axios.delete(`${API_BASE_URL}/predictions`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    timeout: 15000,
  });
}

export async function deleteHistoryItem(itemId: string): Promise<void> {
  const token = await getAuthToken();
  if (!token) return;

  await axios.delete(`${API_BASE_URL}/predictions/${itemId}`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    timeout: 15000,
  });
}

