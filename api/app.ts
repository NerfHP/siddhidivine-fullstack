import express, { Express, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import httpStatus from 'http-status';
import config from './config';
import { errorConverter, errorHandler } from './middleware/error.middleware';
import ApiError from './utils/AppError';
import apiRoutes from './routes'; // This is your master router

const app: Express = express();

// --- Middleware Setup ---

// Set security HTTP headers
app.use(helmet());

// Parse json request body
app.use(express.json());

// Parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// Morgan for logging HTTP requests in dev environment
if (config.env === 'development') {
  app.use(morgan('dev'));
}

// --- Health Check & API Routes ---

// Health check route for the base URL.
// THIS MUST BE BEFORE THE '/api' routes and the 404 handler.
app.get('/', (_req: Request, res: Response) => {
  res.status(200).json({
    message: 'Welcome to the Siddhidivine API!',
    status: 'ok',
  });
});

// All your API routes are prefixed with '/api'
app.use('/api', apiRoutes);


// --- Error Handling ---

// Send back a 404 error for any unknown API request that isn't caught by a router
app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// Convert errors to a consistent ApiError format
app.use(errorConverter);

// The final error handler that sends the response to the client
app.use(errorHandler);

export default app;

