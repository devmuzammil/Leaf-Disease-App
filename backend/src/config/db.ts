import mongoose from 'mongoose';
import { config } from './env';

mongoose.set('bufferCommands', false);
mongoose.set('bufferTimeoutMS', 5000);

export const connectToDatabase = async (): Promise<void> => {
  if (!config.mongoUri) {
    console.warn('MONGODB_URI is not set. Skipping database connection.');
    return;
  }

  try {
    await mongoose.connect(config.mongoUri, {
      dbName: 'leaf_disease_app',
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    });

    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB', error);
  }
};

