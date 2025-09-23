import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync.js';
import { authService, tokenService } from '../services/index.js';
import httpStatus from 'http-status';

/**
 * Handles login for existing users via Firebase token verification.
 * This is called after a user successfully signs in with email and password on the frontend.
 */
const firebaseLogin = catchAsync(async (req: Request, res: Response) => {
  const { firebaseToken } = req.body;
  // The service will verify the token and find the user in our database.
  const user = await authService.loginWithFirebase(firebaseToken);
  // If the user is found, generate our own session tokens.
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens });
});

/**
 * Handles registration for new users.
 * This is called after a new user is created in Firebase and they've submitted their details.
 */
const register = catchAsync(async (req: Request, res: Response) => {
  const { firebaseToken, userData } = req.body;
  // The service will create the user in our database.
  const user = await authService.registerWithFirebase(firebaseToken, userData);
  // Generate their first set of session tokens to log them in immediately.
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ user, tokens });
});

/**
 * Handles refreshing authentication tokens (unchanged).
 */
const refreshTokens = catchAsync(async (req: Request, res: Response) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});


export const authController = {
  firebaseLogin,
  register,
  refreshTokens,
};

