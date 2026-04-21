/**
 * Image optimization middleware that compresses/resizes images before ML processing.
 *
 * Benefits:
 * - Reduces payload size sent to ML API
 * - Faster uploads and API requests
 * - Lower memory usage
 * - Maintains quality for ML model
 *
 * Implementation uses Sharp (lightweight, production-grade image processor)
 * Note: Requires installation of sharp package
 */

import fs from 'fs';
import path from 'path';
import { Request, Response, NextFunction } from 'express';

/**
 * Configuration for image optimization
 */
export interface ImageOptimizationConfig {
  maxWidth: number;
  maxHeight: number;
  quality: number;
  format: 'jpeg' | 'png' | 'webp';
}

const DEFAULT_CONFIG: ImageOptimizationConfig = {
  maxWidth: 800,
  maxHeight: 800,
  quality: 80,
  format: 'jpeg',
};

/**
 * Optimizes image by resizing and compressing.
 * Uses sharp if available; skips if sharp is not installed.
 *
 * INSTALLATION:
 * npm install sharp --save-optional
 *
 * If sharp is not available, the middleware will skip optimization
 * and continue with the original file.
 */
export const imageOptimizationMiddleware = (
  config: Partial<ImageOptimizationConfig> = {},
) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };

  return async (req: Request, res: Response, next: NextFunction) => {
    const file = req.file;

    if (!file) {
      return next();
    }

    try {
      // Dynamically require sharp to make it optional
      // eslint-disable-next-line global-require
      const sharp = require('sharp');

      const filePath = file.path;
      const ext = path.extname(file.originalname).toLowerCase();

      // Only optimize image formats
      if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
        return next();
      }

      const tempPath = `${filePath}.optimized`;

      // Build the sharp pipeline
      let pipeline = sharp(filePath).resize(finalConfig.maxWidth, finalConfig.maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      });

      // Apply format-specific compression
      if (finalConfig.format === 'jpeg') {
        pipeline = pipeline.jpeg({ quality: finalConfig.quality, progressive: true });
      } else if (finalConfig.format === 'png') {
        pipeline = pipeline.png({ quality: finalConfig.quality });
      } else if (finalConfig.format === 'webp') {
        pipeline = pipeline.webp({ quality: finalConfig.quality });
      }

      // Write optimized image
      await pipeline.toFile(tempPath);

      // Replace original file with optimized version
      fs.unlinkSync(filePath);
      fs.renameSync(tempPath, filePath);

      // Update file metadata
      const stats = fs.statSync(filePath);
      file.size = stats.size;
      if (finalConfig.format !== 'webp') {
        file.mimetype = `image/${finalConfig.format}`;
      }

      console.log(`[Image Optimization] Compressed ${file.originalname}`, {
        originalSize: `${(stats.size / 1024).toFixed(2)}KB`,
        format: finalConfig.format,
      });

      next();
    } catch (error) {
      // If sharp is not installed or optimization fails, continue with original file
      if ((error as any)?.code === 'MODULE_NOT_FOUND') {
        console.warn(
          '[Image Optimization] sharp not installed. Skipping image optimization. Install with: npm install sharp',
        );
      } else {
        console.warn('[Image Optimization] Failed to optimize image, using original', {
          error: error instanceof Error ? error.message : String(error),
        });
      }

      next();
    }
  };
};

export default imageOptimizationMiddleware;
