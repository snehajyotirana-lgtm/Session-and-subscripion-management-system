import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'node:url';

import { connectDB } from './config/db.js';
import env, { validateEnv } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';
import apiRouter from './routes/index.js';
import { sendSuccess } from './utils/api.js';
import { seedDefaultUsers } from './utils/seedDefaults.js';

validateEnv();

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use('/uploads', express.static(path.join(path.dirname(fileURLToPath(import.meta.url)), 'uploads')));

app.get('/health', (_req, res) =>
  sendSuccess(res, {
    message: 'CSPMS server is healthy.',
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      environment: env.nodeEnv,
    },
  }),
);

app.use('/api', apiRouter);
app.use(notFoundHandler);
app.use(errorHandler);

export const startServer = async () => {
  await connectDB();
  await seedDefaultUsers(console);

  return new Promise((resolve) => {
    const server = app.listen(env.port, () => {
      console.info(`CSPMS backend listening on port ${env.port}`);
      resolve(server);
    });
  });
};

const currentFile = fileURLToPath(import.meta.url);

if (process.argv[1] === currentFile) {
  startServer().catch((error) => {
    console.error('Failed to start CSPMS backend.', error);
    process.exitCode = 1;
  });
}

export default app;
