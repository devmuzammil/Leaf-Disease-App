// This file is kept for backward compatibility with existing imports.
// The app now calls HuggingFace Spaces directly via `src/services/predictionService.ts`.

export type DiseasePrediction = {
  crop: string;
  disease: string;
  confidence: number; // 0..1
  recommendations?: string[]; // moved to list form
  severity?: "low" | "medium" | "high";
  isHealthy?: boolean;
};


