import dotenv from 'dotenv';

dotenv.config();

export interface AppConfig {
  port: number;
  nodeEnv: string;
  logLevel: string;
  hfServiceUrl: string;
  modelProvider: string;
  maxFileSizeBytes: number;
  allowedMimeTypes: string[];
  mongoUri?: string;
  googleClientId?: string;
  googleClientSecret?: string;
  googleCallbackUrl?: string;
  resendApiKey?: string;
  emailFrom: string;
  // ML Service configuration
  mlRequestTimeoutMs: number;
  mlMaxRetries: number;
  mlRetryInitialDelayMs: number;
  confidenceThreshold: number;
  // Enable background processing (async predictions)
  enableBackgroundProcessing: boolean;
}

const parseNumber = (value: string | undefined, fallback: number): number => {
  const parsed = value ? Number(value) : NaN;
  return Number.isFinite(parsed) ? parsed : fallback;
};

const parseMimeTypes = (value: string | undefined, fallback: string[]): string[] => {
  if (!value) return fallback;
  return value
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
};

const maxFileSizeMb = parseNumber(process.env.MAX_FILE_SIZE_MB, 5);

export const config: AppConfig = {
  port: parseNumber(process.env.PORT, 4000),
  nodeEnv: process.env.NODE_ENV || 'development',
  logLevel: process.env.LOG_LEVEL || 'dev',
  hfServiceUrl: process.env.HF_SERVICE_URL || 'https://a-rehman-12-leafdiseasedetection.hf.space/predict',
  modelProvider: process.env.MODEL_PROVIDER || 'huggingface',
  maxFileSizeBytes: maxFileSizeMb * 1024 * 1024,
  allowedMimeTypes: parseMimeTypes(process.env.ALLOWED_MIME_TYPES, [
    'image/jpeg',
    'image/png',
    'image/jpg',
  ]),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/leaf_disease_app',
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL,
  resendApiKey: process.env.RESEND_API_KEY,
  emailFrom: process.env.EMAIL_FROM || 'noreply@leafdiseaseapp.com',
  // ML Service configuration
  mlRequestTimeoutMs: parseNumber(process.env.ML_REQUEST_TIMEOUT_MS, 25000),
  mlMaxRetries: parseNumber(process.env.ML_MAX_RETRIES, 2),
  mlRetryInitialDelayMs: parseNumber(process.env.ML_RETRY_INITIAL_DELAY_MS, 1000),
  confidenceThreshold: parseNumber(process.env.CONFIDENCE_THRESHOLD as any, 0.5 as any) as any,
  enableBackgroundProcessing: process.env.ENABLE_BACKGROUND_PROCESSING === 'true',
};

if (!config.hfServiceUrl) {
  // eslint-disable-next-line no-console
  console.warn(
    'HF_SERVICE_URL is not set. Falling back to https://a-rehman-12-leafdiseasedetection.hf.space/predict',
  );
}
