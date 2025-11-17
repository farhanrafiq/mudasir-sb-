import * as express from 'express';
import * as cors from 'cors';
import { config } from './config';
import { errorHandler, notFound } from './middleware/errorHandler';
const morgan = require('morgan');
const Sentry = require('@sentry/node');
if (process.env.SENTRY_DSN) {
  Sentry.init({ dsn: process.env.SENTRY_DSN });
}

// Import routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import adminRoutes from './routes/adminRoutes';
import dealerRoutes from './routes/dealerRoutes';
import searchRoutes from './routes/searchRoutes';

// Import database
import mongoose from 'mongoose';

const app = express();

// Middleware
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use(morgan('combined'));

// Health check route
app.get('/health', (_req: any, res: any) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Test MongoDB connection route
app.get('/test-db', async (_req: any, res: any) => {
  const state = mongoose.connection.readyState;
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  let status = '';
  switch (state) {
    case 0:
      status = 'disconnected';
      break;
    case 1:
      status = 'connected';
      break;
    case 2:
      status = 'connecting';
      break;
    case 3:
      status = 'disconnecting';
      break;
    default:
      status = 'unknown';
  }
  res.json({ mongoState: status, timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/dealer', dealerRoutes);
app.use('/api', searchRoutes);

// 404 handler
app.use(notFound);

// Error handler (must be last)
if (Sentry.Handlers && Sentry.Handlers.errorHandler) {
  app.use(Sentry.Handlers.errorHandler());
}
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    const mongoUri = process.env.NODE_ENV === 'test' ? (process.env.TEST_MONGO_URI || 'mongodb://localhost:27017/testdb') : config.mongoUri;
    await mongoose.connect(mongoUri);
    console.log('MongoDB connected successfully');

    const port = process.env.NODE_ENV === 'test' ? 0 : config.port;
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
      console.log(`Environment: ${config.nodeEnv}`);
      console.log(`CORS origin: ${config.cors.origin}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  await mongoose.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  await mongoose.disconnect();
  process.exit(0);
});

export default app;
