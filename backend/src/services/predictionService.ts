import { PredictionModel, PredictionDocument } from '../models/Prediction';

export interface SavePredictionInput {
  userId?: string;
  deviceId?: string;
  imageFilename: string;
  imageUrl: string;
  imageMimetype: string;
  imageSize: number;
  predictionLabel: string;
  confidence: number;
  modelProvider: string;
  rawResponse?: unknown;
}

export const savePrediction = async (
  input: SavePredictionInput,
): Promise<PredictionDocument | null> => {
  try {
    const doc = await PredictionModel.create({
      user: input.userId,
      deviceId: input.deviceId,
      imageFilename: input.imageFilename,
      imageUrl: input.imageUrl,
      imageMimetype: input.imageMimetype,
      imageSize: input.imageSize,
      predictionLabel: input.predictionLabel,
      confidence: input.confidence,
      modelProvider: input.modelProvider,
      rawResponse: input.rawResponse,
    });
    return doc;
  } catch (error) {
    console.error('Failed to save prediction to MongoDB', error);
    return null;
  }
};

