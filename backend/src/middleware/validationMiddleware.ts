import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validateRequest = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error: any) {
      const errors = error.issues?.map((e: any) => ({
        path: e.path.join('.'),
        message: e.message,
      })) || [];

      return res.status(400).json({
        error: 'Validation failed',
        details: errors,
      });
    }
  };
};
