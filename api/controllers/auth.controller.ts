import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync.js';
import { authService, tokenService } from '../services/index.js';

// This function is still needed for your app's session management.
const refreshTokens = catchAsync(async (req: Request, res: Response) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

// --- THIS IS THE NEW PRIMARY LOGIN FUNCTION ---
/**
 * Handles the final step of the Firebase OTP login.
 * It receives a Firebase token from the frontend, verifies it using the authService,
 * and issues the app's own JWT tokens for the user's session.
 */
const firebaseLogin = catchAsync(async (req: Request, res: Response) => {
    const { firebaseToken } = req.body;
    // The service function does all the heavy lifting (verification, user creation/lookup)
    const user = await authService.loginOrRegisterWithFirebase(firebaseToken);
    // Once we have a user from our database, we generate our own session tokens for them.
    const tokens = await tokenService.generateAuthTokens(user);
    res.send({ user, tokens });
});

export const authController = {
  refreshTokens,
  firebaseLogin,
};

