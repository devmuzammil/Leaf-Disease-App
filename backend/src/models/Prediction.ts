import mongoose, { Schema, Document } from 'mongoose';
import { config } from '../config/env';

export interface PredictionDocument extends Document {
  user?: mongoose.Types.ObjectId;
  deviceId?: string;
  imageFilename: string;
  imageUrl: string;
  imageMimetype: string;
  imageSize: number;
  predictionLabel: string;
  confidence: number;
  modelProvider: string;
  rawResponse?: unknown;
  createdAt: Date;
}

const PredictionSchema = new Schema<PredictionDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: false, index: true },
    deviceId: { type: String, required: false, index: true },
    imageFilename: { type: String, required: true },
    imageUrl: { type: String, required: true },
    imageMimetype: { type: String, required: true },
    imageSize: { type: Number, required: true },
    predictionLabel: { type: String, required: true },
    confidence: { type: Number, required: true },
    modelProvider: { type: String, required: true, default: config.modelProvider },
    rawResponse: { type: Schema.Types.Mixed, required: false },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

// Add compound index for efficient querying and sorting
PredictionSchema.index({ user: 1, createdAt: -1 });
PredictionSchema.index({ deviceId: 1, createdAt: -1 });

export const PredictionModel =
  mongoose.models.Prediction || mongoose.model<PredictionDocument>('Prediction', PredictionSchema);

