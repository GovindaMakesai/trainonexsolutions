import path from 'path';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import mongoose from 'mongoose';
import morgan from 'morgan';
import { assertEnv, clientOrigins, env } from './config/env';
import { connectDb } from './config/db';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimit';
import { requireAjaxHeader, sanitizeInput } from './middleware/security';
import { apiRouter } from './routes';
import { ensureBaseline } from './services/baseline';
import { configureCloudinary } from './utils/images';
import { AppError } from './utils/AppError';

assertEnv();
configureCloudinary();

const app = express();
const origins = new Set(clientOrigins());

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || origins.has(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
app.use(cookieParser());
app.use(sanitizeInput);

let ready: Promise<void> | null = null;

function ensureReady(): Promise<void> {
  if (mongoose.connection.readyState === 1 && ready) return ready;
  if (!ready) {
    ready = (async () => {
      await connectDb();
      await ensureBaseline();
    })().catch((error) => {
      ready = null;
      throw error;
    });
  }
  return ready;
}

app.use(async (_req, _res, next) => {
  try {
    await ensureReady();
    next();
  } catch (error) {
    next(error);
  }
});

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

if (env.nodeEnv !== 'production') {
  app.use(morgan('dev'));
}

app.use('/api', apiLimiter, requireAjaxHeader, apiRouter);

app.use((req, _res, next) => {
  next(new AppError(`Cannot ${req.method} ${req.path}`, 404));
});
app.use(errorHandler);

async function start() {
  await ensureReady();
  const server = app.listen(env.port, () => {
    console.log(`API listening on port ${env.port}`);
  });

  const shutdown = () => {
    server.close(() => process.exit(0));
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

if (require.main === module && !process.env.VERCEL) {
  start().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}

export default app;
export { app };
