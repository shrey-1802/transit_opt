import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { ENV } from './config/env.js';
import { correlationMiddleware } from './middleware/correlationMiddleware.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiV1Router } from './routes/apiV1Router.js';

export const app = express();

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// Dynamic CORS configuration
const allowedOrigins = ENV.CORS_ORIGIN.split(',').map(s => s.trim());

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    return callback(null, true); // Permissive in dev, allow all configured
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID'],
}));

// Request parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Correlation ID & Logging
app.use(correlationMiddleware);
if (ENV.NODE_ENV !== 'test') {
  app.use(morgan(':method :url :status :res[content-length] - :response-time ms [CID: :req[x-correlation-id]]'));
}

// Health check endpoint (root & versioned)
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    service: 'transitops-backend',
    environment: ENV.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/v1', apiV1Router);

// Fallback 404 Handler
app.use((req, res) => {
  res.status(404).json({
    code: 'NOT_FOUND',
    message: `Route [${req.method} ${req.url}] not found on TransitOps API server.`,
  });
});

// Centralized Error Handler
app.use(errorHandler);
