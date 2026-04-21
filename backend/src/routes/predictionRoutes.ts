import { Router } from 'express';
import {
  predictLeafDisease,
  healthCheck,
  getPredictionHistory,
  clearPredictionHistory,
  deletePrediction,
} from '../controllers/predictionController';
import { singleImageUpload } from '../middleware/uploadMiddleware';
import { requireAuth, optionalAuth } from '../middleware/authMiddleware';
import leafValidationMiddleware from '../middleware/leafValidationMiddleware';

const router = Router();

router.get('/health', healthCheck);
router.post('/predict', optionalAuth, singleImageUpload, leafValidationMiddleware, predictLeafDisease);
router.get('/predictions', optionalAuth, getPredictionHistory);
router.delete('/predictions', optionalAuth, clearPredictionHistory);
router.delete('/predictions/:id', optionalAuth, deletePrediction);

export default router;

