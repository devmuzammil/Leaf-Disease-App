import { z } from 'zod';

export const PredictImageSchema = z.object({
  file: z.any().optional(),
}).strict();

export type PredictImage = z.infer<typeof PredictImageSchema>;
