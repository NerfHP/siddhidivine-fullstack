import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { catchAsync } from '../utils/catchAsync.js';
import { authService, userService, tokenService } from '../services/index.js';

const register = catchAsync(async (req: Request, res: Response) => {
  const user = await userService.createUser(req.body);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ user, tokens });
});

const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await authService.loginUserWithEmailAndPassword(email, password);
  const tokens = await tokenService.generateAuthTokens(user);
  res.send({ user, tokens });
});

const refreshTokens = catchAsync(async (req: Request, res: Response) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

// --- ADD THIS NEW FUNCTION ---
/**
 * Handles the final step of the Firebase OTP login.
 * It receives a Firebase token from the frontend, verifies it using the authService,
 * and issues the app's own JWT tokens.
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
  register,
  login,
  refreshTokens,
  firebaseLogin, // <-- Export the new function
};

