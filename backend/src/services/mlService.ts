/**
 * Enhanced ML Service with:
 * - Retry logic with exponential backoff
 * - Configurable timeouts
 * - Proper error typing and separation of concerns
 * - Comprehensive logging
 * - Confidence thresholding
 *
 * Design decisions:
 * 1. Retries use exponential backoff to avoid overwhelming the API
 * 2. Timeout is configurable per environment (longer for prod with retries)
 * 3. Errors are properly typed to distinguish API failures from low confidence
 * 4. Confidence threshold is separate from API error logic
 */

import fs from 'fs';
import axios, { AxiosError } from 'axios';
import FormData from 'form-data';
import { config } from '../config/env';
import { logger } from '../utils/logger';

export interface PredictionResponse {
  prediction: string;
  confidence: number;
  raw?: unknown;
  isLowConfidence?: boolean;
}

export interface HealthStatus {
  status: string;
  details?: unknown;
}

export class PredictionError extends Error {
  constructor(
    message: string,
    public code: 'TIMEOUT' | 'NETWORK' | 'HTTP' | 'INVALID_RESPONSE' | 'MAX_RETRIES',
    public statusCode?: number,
    public originalError?: Error,
  ) {
    super(message);
    this.name = 'PredictionError';
  }
}

type HuggingFacePredictResponse = Record<string, unknown> | unknown[];

interface RetryConfig {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 2,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
};

const normalizeConfidence = (value: unknown): number => {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0;
  if (value > 1 && value <= 100) return value / 100;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
};

const pickDiseaseName = (data: any): string => {
  const candidates: unknown[] = [
    data?.disease,
    data?.prediction,
    data?.label,
    data?.class,
    data?.class_name,
    data?.predicted_class,
  ];

  for (const c of candidates) {
    if (typeof c === 'string' && c.trim()) return c.trim();
  }

  if (Array.isArray(data?.predictions) && data.predictions.length) {
    const top = data.predictions[0];
    if (top && typeof top.label === 'string') return top.label.trim();
  }

  if (Array.isArray(data) && data.length) {
    const top = data[0];
    if (top && typeof top.label === 'string') return top.label.trim();
  }

  return 'Unknown';
};

const pickConfidence = (data: any): number => {
  const candidates: unknown[] = [
    data?.confidence,
    data?.score,
    data?.probability,
    data?.confidence_score,
  ];

  for (const c of candidates) {
    const normalized = normalizeConfidence(c);
    if (normalized > 0) return normalized;
  }

  if (Array.isArray(data?.predictions) && data.predictions.length) {
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

export class MLService {
  private readonly baseUrl: string;
  private readonly predictUrl: string;
  private readonly healthUrl: string;
  private readonly timeoutMs: number;
  private readonly confidenceThreshold: number;
  private readonly retryConfig: RetryConfig;

  constructor(
    baseUrl: string,
    timeoutMs: number = 25000,
    confidenceThreshold: number = 0.5,
    retryConfig?: Partial<RetryConfig>,
  ) {
    const cleanedUrl = baseUrl.replace(/\/+$/, '');
    const predictPath = '/predict';
    const hasPredictPath = cleanedUrl.toLowerCase().endsWith(predictPath);

    this.baseUrl = cleanedUrl;
    this.predictUrl = hasPredictPath ? cleanedUrl : `${cleanedUrl}${predictPath}`;
    this.healthUrl = hasPredictPath
      ? cleanedUrl.slice(0, -predictPath.length) || cleanedUrl
      : cleanedUrl;
    this.timeoutMs = timeoutMs;
    this.confidenceThreshold = confidenceThreshold;
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };

    logger.info('MLService initialized', {
      baseUrl: this.baseUrl,
      timeoutMs: this.timeoutMs,
      confidenceThreshold: this.confidenceThreshold,
      retryConfig: this.retryConfig,
    });
  }

  /**
   * Calculates exponential backoff delay with jitter
   */
  private getBackoffDelay(attempt: number): number {
    const delay = Math.min(
      this.retryConfig.initialDelayMs * Math.pow(this.retryConfig.backoffMultiplier, attempt),
      this.retryConfig.maxDelayMs,
    );
    // Add jitter: ±10%
    const jitter = delay * 0.1 * (Math.random() * 2 - 1);
    return Math.round(delay + jitter);
  }

  /**
   * Determines if an error is retryable
   */
  private isRetryable(error: unknown): boolean {
    if (axios.isAxiosError(error)) {
      // Timeout or network errors are retryable
      if (error.code === 'ECONNABORTED' || error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        return true;
      }
      // 5xx errors are retryable (server error)
      if (error.response?.status && error.response.status >= 500) {
        return true;
      }
    }
    return false;
  }

  /**
   * Makes an API request with retry logic
   */
  private async makeRequestWithRetry(
    file: Express.Multer.File,
    attempt: number = 0,
  ): Promise<HuggingFacePredictResponse> {
    try {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(file.path), {
        filename: file.originalname || 'image.jpg',
        contentType: file.mimetype,
      });

      const headers = formData.getHeaders();

      logger.debug('Sending prediction request', {
        attempt,
        url: this.predictUrl,
        filename: file.originalname,
        timeout: this.timeoutMs,
      });

      const response = await axios.post<HuggingFacePredictResponse>(
        this.predictUrl,
        formData,
        {
          headers,
          timeout: this.timeoutMs,
          maxBodyLength: Infinity,
          maxContentLength: Infinity,
          validateStatus: () => true,
        },
      );

      // Handle non-2xx responses
      if (response.status < 200 || response.status >= 300) {
        const errorMessage =
          (response.data as any)?.error ||
          (response.data as any)?.message ||
          `ML API returned status ${response.status}`;

        logger.warn('ML API error response', {
          attempt,
          status: response.status,
          message: errorMessage,
        });

        throw new PredictionError(errorMessage, 'HTTP', response.status);
      }

      logger.info('Prediction request successful', {
        attempt,
        status: response.status,
      });

      return response.data;
    } catch (error) {
      // Check if we should retry
      if (this.isRetryable(error) && attempt < this.retryConfig.maxRetries) {
        const backoffDelay = this.getBackoffDelay(attempt);
        logger.warn('Prediction request failed, retrying', {
          attempt,
          remainingRetries: this.retryConfig.maxRetries - attempt,
          backoffDelayMs: backoffDelay,
          error: error instanceof Error ? error.message : String(error),
        });

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, backoffDelay));
        return this.makeRequestWithRetry(file, attempt + 1);
      }

      // All retries exhausted or error is not retryable
      if (error instanceof PredictionError) {
        throw error;
      }

      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          throw new PredictionError(
            `Request timeout after ${this.timeoutMs}ms`,
            'TIMEOUT',
            undefined,
            error,
          );
        }
        throw new PredictionError(
          error.message || 'Network error',
          'NETWORK',
          error.response?.status,
          error,
        );
      }

      throw new PredictionError(
        error instanceof Error ? error.message : 'Unknown error',
        'INVALID_RESPONSE',
        undefined,
        error instanceof Error ? error : new Error(String(error)),
      );
    }
  }

  /**
   * Main prediction method with retry logic and confidence thresholding
   */
  async predictFromImage(file: Express.Multer.File): Promise<PredictionResponse> {
    logger.info('Starting prediction', {
      filename: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    });

    const data = await this.makeRequestWithRetry(file);

    const prediction = pickDiseaseName(data);
    const confidence = pickConfidence(data);

    // Separate concern: low confidence is NOT an error, it's a valid model output
    const isLowConfidence = confidence < this.confidenceThreshold;

    logger.info('Prediction parsed', {
      prediction,
      confidence,
      isLowConfidence,
      threshold: this.confidenceThreshold,
    });

    return {
      prediction,
      confidence,
      raw: data,
      isLowConfidence,
    };
  }

  /**
   * Health check with timeout
   */
  async health(): Promise<HealthStatus> {
    try {
      const response = await axios.get(`${this.healthUrl}/`, {
        timeout: 5000,
        validateStatus: () => true,
      });

      const isHealthy = response.status >= 200 && response.status < 500;
      logger.info('Health check completed', {
        status: response.status,
        healthy: isHealthy,
      });

      return {
        status: isHealthy ? 'up' : 'down',
        details: { statusCode: response.status },
      };
    } catch (error) {
      logger.error('Health check failed', error instanceof Error ? error : new Error(String(error)));
      return {
        status: 'down',
        details: error instanceof Error ? error.message : String(error),
      };
    }
  }
}

// Initialize with config values
export const mlService = new MLService(
  config.hfServiceUrl,
  config.mlRequestTimeoutMs || 25000,
  config.confidenceThreshold || 0.5,
  {
    maxRetries: config.mlMaxRetries || 2,
    initialDelayMs: config.mlRetryInitialDelayMs || 1000,
  },
);

export default mlService;
