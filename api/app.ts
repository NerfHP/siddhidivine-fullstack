import express, { Express, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import httpStatus from 'http-status';
import config from './config/index.js';
import { errorConverter, errorHandler } from './middleware/error.middleware.js';
import ApiError from './utils/AppError.js';
import apiRoutes from './routes/index.js';
import reviewRoutes from './routes/review.routes.js'
import cors from 'cors';
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';

const app: Express = express();

// --- Middleware Setup ---
app.use(cors({ origin: config.clientOrigin || 'http://localhost:5173' }));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (config.env === 'development') {
  app.use(morgan('dev'));
}

// --- REMOVED: The old Firebase Admin SDK initialization has been deleted ---

// --- NEW: Add the Clerk middleware ---
// This middleware will verify the session token for every incoming request
// and make the authenticated user's ID available on `req.auth`.
// It should be placed BEFORE your API routes.
app.use(ClerkExpressWithAuth());


// --- Health Check & API Routes ---
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    message: 'Welcome to the Siddhidivine API!',
    status: 'ok',
  });
});

app.use('/api/reviews', reviewRoutes);
app.use('/api', apiRoutes);


// --- Error Handling ---
app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});
app.use(errorConverter);
app.use(errorHandler);

export default app;

