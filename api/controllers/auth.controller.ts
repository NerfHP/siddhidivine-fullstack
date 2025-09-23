import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync.js';
import { authService, tokenService } from '../services/index.js';
import httpStatus from 'http-status';

/**
 * Handles user login with phone and password.
 */
const login = catchAsync(async (req: Request, res: Response) => {
    const { phone, password } = req.body;
    const user = await authService.loginWithPhoneAndPassword(phone, password);
    const tokens = await tokenService.generateAuthTokens(user);
    res.send({ user, tokens });
});

/**
 * Handles the initial Firebase OTP verification.
 * It will either return an existing user or a new, temporary user profile.
 */
const firebaseLogin = catchAsync(async (req: Request, res: Response) => {
  const { firebaseToken } = req.body;
  const { user, isNewUser } = await authService.loginOrRegisterWithFirebase(firebaseToken);
  
  // Only generate final login tokens if the user's profile is already complete.
  const tokens = user.isProfileComplete ? await tokenService.generateAuthTokens(user) : null;
  
  res.send({ 
    user, 
    tokens, 
    isNewUser,
  });
});

/**
 * Handles the final step of a new user's registration, including setting their password.
 */
const completeRegistration = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  
  // The request body now includes the password.
  const user = await authService.completeUserRegistration(userId, req.body);
  
  // After successful registration, generate their first set of login tokens.
  const tokens = await tokenService.generateAuthTokens(user);
  
  res.status(httpStatus.CREATED).send({ 
    user, 
    tokens,
    message: 'Registration completed successfully' 
  });
});

/**
 * Handles refreshing authentication tokens.
 */
const refreshTokens = catchAsync(async (req: Request, res: Response) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});


export const authController = {
  login,
  refreshTokens,
  firebaseLogin,
  completeRegistration,
};

