import fs from 'fs';
import path from 'path';
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import { mlService, PredictionError } from '../services/mlService';
import { savePrediction } from '../services/predictionService';
import { PredictionModel } from '../models/Prediction';
import { taskQueue } from '../services/taskQueue';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import { AuthedRequest } from '../middleware/authMiddleware';

const ImageUploadSchema = z.object({
  file: z.object({
    originalname: z.string(),
    mimetype: z.string(),
    size: z.number(),
    path: z.string(),
  }),
});

const inferCrop = (disease: string): string => {
  const lower = disease.toLowerCase();
  if (lower.startsWith('apple')) return 'Apple';
  if (lower.startsWith('tomato')) return 'Tomato';
  if (lower.startsWith('grape')) return 'Grape';
  if (lower.startsWith('cherry')) return 'Cherry';
  return 'Unknown';
};

/**
 * Enhanced prediction controller with:
 * - Proper error separation (API vs confidence)
 * - Retry logic handled by MLService
 * - Support for background processing
 * - Comprehensive logging
 */
export const predictLeafDisease = async (req: AuthedRequest, res: Response, next: NextFunction) => {
  const taskId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  let file: Express.Multer.File | undefined;

  try {
    file = req.file;

    if (!file) {
      logger.warn('Prediction request missing file', { taskId });
      return res.status(400).json({
        error: 'Image file is required.',
        details: [{ path: 'file', message: 'Image file is required' }],
      });
    }

    const validation = ImageUploadSchema.safeParse({ file });
    if (!validation.success) {
      logger.warn('Invalid file upload', { taskId, issues: validation.error.issues });
      return res.status(400).json({
        error: 'Invalid file upload',
        details: validation.error.issues.map((e: any) => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      });
    }

    // Non-leaf detection
    if (!(req as any).isLeaf) {
      const crop = 'Unknown';
      const imageUrl = `/uploads/${path.basename(file.path)}`;

      logger.info('Non-leaf image detected', { taskId, filename: file.originalname });

      // Fire-and-forget: persist prediction without blocking response
      void savePrediction({
        userId: req.auth?.userId,
        deviceId: String(req.headers['x-device-id'] || ''),
        imageFilename: file.originalname || 'image',
        imageUrl,
        imageMimetype: file.mimetype,
        imageSize: file.size,
        predictionLabel: 'Non Leaf',
        confidence: 0,
        modelProvider: config.modelProvider,
        rawResponse: {},
      });

      return res.status(200).json({
        prediction: 'Non Leaf',
        confidence: 0,
        crop,
      });
    }

    // Check if client prefers background processing
    const useBackgroundProcessing = 
      config.enableBackgroundProcessing && 
      req.query.async === 'true';

    if (useBackgroundProcessing) {
      // Return immediately, process in background
      logger.info('Enqueuing background prediction', { taskId, filename: file.originalname });

      taskQueue.enqueue('prediction', taskId);

      // Register the handler if not already done
      if (!taskQueue.getStatus(taskId)?.result) {
        taskQueue.registerHandler('prediction', async () => {
          // This handler will process the prediction in the background
          // In a real scenario, you'd fetch the file path from persistence
          return { taskId, status: 'processing' };
        });
      }

      return res.status(202).json({
        taskId,
        status: 'processing',
        message: 'Prediction request queued for background processing',
      });
    }

    // Synchronous prediction (default)
    let result;
    try {
      logger.info('Starting synchronous prediction', { 
        taskId, 
        filename: file.originalname,
        fileSize: file.size,
      });

      result = await mlService.predictFromImage(file);
    } catch (err) {
      // Handle different error types appropriately
      if (err instanceof PredictionError) {
        const errorContext = {
          taskId,
          code: err.code,
          statusCode: err.statusCode,
        };

        switch (err.code) {
          case 'TIMEOUT':
            logger.error('Prediction request timeout', err, errorContext);
            return res.status(504).json({
              error: 'Prediction service took too long to respond. Please try again.',
            });

          case 'NETWORK':
            logger.error('Network error contacting ML service', err, errorContext);
            return res.status(503).json({
              error: 'Unable to contact prediction service. Please try again later.',
            });

          case 'HTTP':
            logger.error('ML service returned error', err, errorContext);
            // Don't expose internal ML service details
            return res.status(502).json({
              error: 'Prediction service error. Please try again later.',
            });

          case 'INVALID_RESPONSE':
          case 'MAX_RETRIES':
          default:
            logger.error('Prediction failed', err, errorContext);
            return res.status(502).json({
              error: 'Failed to generate prediction. Please try again.',
            });
        }
      }

      // Fallback for unexpected errors
      logger.error(
        'Unexpected error during prediction',
        err instanceof Error ? err : new Error(String(err)),
        { taskId },
      );
      return res.status(500).json({
        error: 'Internal server error',
      });
    }

    if (!result || typeof result.prediction !== 'string') {
      logger.error('Invalid prediction response', new Error('Missing prediction'), {
        taskId,
        result,
      });
      return res.status(502).json({
        error: 'Invalid response from prediction service.',
      });
    }

    const crop = inferCrop(result.prediction);

    // Log low confidence predictions for monitoring
    if (result.isLowConfidence) {
      logger.warn('Low confidence prediction', {
        taskId,
        prediction: result.prediction,
        confidence: result.confidence,
        threshold: config.confidenceThreshold,
      });
    } else {
      logger.info('High confidence prediction', {
        taskId,
        prediction: result.prediction,
        confidence: result.confidence,
      });
    }

    // Persist prediction without blocking response
    const imageUrl = `/uploads/${path.basename(file.path)}`;
    void savePrediction({
      userId: req.auth?.userId,
      deviceId: String(req.headers['x-device-id'] || ''),
      imageFilename: file.originalname || 'image',
      imageUrl,
      imageMimetype: file.mimetype,
      imageSize: file.size,
      predictionLabel: result.prediction,
      confidence: result.confidence,
      modelProvider: config.modelProvider,
      rawResponse: result.raw,
    });

    return res.status(200).json({
      prediction: result.prediction,
      confidence: result.confidence,
      crop,
      isLowConfidence: result.isLowConfidence,
    });
  } catch (error) {
    logger.error(
      'Unexpected error in predictLeafDisease',
      error instanceof Error ? error : new Error(String(error)),
      { taskId, hasFile: !!file },
    );
    next(error);
  }
};

export const getPredictionHistory = async (req: AuthedRequest, res: Response) => {
  const userId = req.auth?.userId;
  const deviceId = String(req.headers['x-device-id'] || '');

  if (!userId && !deviceId) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }

  try {
    // Pagination params
    const page = Math.max(1, parseInt(req.query.page as string || '1', 10));
    const pageSize = Math.max(1, Math.min(50, parseInt(req.query.pageSize as string || '10', 10)));
    const skip = (page - 1) * pageSize;

    if (mongoose.connection.readyState !== 1) {
      logger.error('MongoDB not connected');
      console.error('MongoDB is not connected.');
      return res.status(503).json({ error: 'Prediction history is temporarily unavailable.' });
    }

    // Build query: look for userId first, then fall back to deviceId
    let query: any = {};
    
    if (userId) {
      // Authenticated user: look for predictions under their userId
      // Also include deviceId if provided (for backward compatibility)
      query = { $or: [{ user: userId }] };
      if (deviceId) {
        query.$or.push({ deviceId });
      }
    } else if (deviceId) {
      // Anonymous user: look by deviceId only
      query = { deviceId };
    }

    logger.info('Fetching prediction history', { userId, deviceId, query });

    const total = await PredictionModel.countDocuments(query).maxTimeMS(3000);
    const predictions = await PredictionModel.find(query, {
      predictionLabel: 1,
      confidence: 1,
      createdAt: 1,
      imageUrl: 1,
    })
      .maxTimeMS(3000)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize)
      .lean();

    logger.info('Prediction history fetched', { total, returned: predictions.length });

    const result = predictions.map((p) => ({
      id: String(p._id),
      prediction: p.predictionLabel,
      confidence: p.confidence,
      imageUrl: p.imageUrl,
      createdAt: p.createdAt,
    }));

    return res.status(200).json({
      predictions: result,
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to fetch prediction history:', error);
    return res.status(503).json({
      error: 'Unable to load prediction history at this time. Please try again later.',
    });
  }
};

const getUploadFilePath = (imageUrl: string): string => {
  const filename = path.basename(imageUrl);
  return path.resolve(process.cwd(), 'uploads', filename);
};

const deleteFileIfExists = async (imageUrl?: string): Promise<void> => {
  if (!imageUrl) {
    return;
  }

  const filePath = getUploadFilePath(imageUrl);
  try {
    await fs.promises.unlink(filePath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.error('Failed to delete upload file:', filePath, error);
    }
  }
};

export const clearPredictionHistory = async (req: AuthedRequest, res: Response) => {
  const userId = req.auth?.userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized.' });

  const predictions = await PredictionModel.find({ user: userId }, { imageUrl: 1 }).lean();
  await Promise.all(predictions.map((prediction) => deleteFileIfExists(prediction.imageUrl)));
  await PredictionModel.deleteMany({ user: userId });
  return res.status(200).json({ status: 'ok' });
};

export const deletePrediction = async (req: AuthedRequest, res: Response) => {
  const userId = req.auth?.userId;
  const { id } = req.params;
  if (!userId) return res.status(401).json({ error: 'Unauthorized.' });

  const prediction = (await PredictionModel.findOne({ _id: id, user: userId }, { imageUrl: 1 }).lean()) as { imageUrl: string } | null;
  if (!prediction) {
    return res.status(404).json({ error: 'Prediction not found.' });
  }

  await deleteFileIfExists(prediction.imageUrl);
  await PredictionModel.deleteOne({ _id: id, user: userId });
  return res.status(200).json({ status: 'ok' });
};

export const healthCheck = async (_req: Request, res: Response) => {
  const mlHealth = await mlService.health();

  return res.status(200).json({
    status: 'ok',
    huggingface: mlHealth.status,
    huggingfaceDetails: mlHealth.details,
    timestamp: new Date().toISOString(),
  });
};

