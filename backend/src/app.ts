import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import fs from 'fs';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import predictionRoutes from './routes/predictionRoutes';
import authRoutes from './routes/authRoutes';
import { config } from './config/env';

const app = express();

const uploadsPath = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));

app.use(helmet());

// CORS configuration: Allow both local development and production
let corsOptions: any;

if (process.env.NODE_ENV === 'production') {
  // Production: Use explicit allowed origins
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()) || [];
  corsOptions = {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
} else {
  // Development: Allow all local origins
  corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no origin (like mobile apps)
      if (!origin) {
        callback(null, true);
        return;
      }
      // Allow localhost in any form
      if (origin.includes('localhost') || origin.includes('127.0.0.1') || origin.includes('192.168')) {
        callback(null, true);
      } else {
        callback(null, true); // Allow all in development
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
}

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(config.logLevel));

app.use('/api', predictionRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'Leaf disease prediction API' });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
  });
});

// Global error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  // eslint-disable-next-line no-console
  console.error(err);

  res.status(500).json({
    error: 'Internal server error.',
    message: process.env.NODE_ENV === 'production' ? undefined : err.message,
  });
});

export default app;

