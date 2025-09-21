import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync.js';
import { authService, tokenService } from '../services/index.js';

// Refresh tokens endpoint
const refreshTokens = catchAsync(async (req: Request, res: Response) => {
  const tokens = await authService.refreshAuth(req.body.refreshToken);
  res.send({ ...tokens });
});

/**
 * Firebase login endpoint - handles OTP verification
 * Returns user data and indicates if user needs to complete registration
 */
const firebaseLogin = catchAsync(async (req: Request, res: Response) => {
  const { firebaseToken } = req.body;
  
  const { user, isNewUser } = await authService.loginOrRegisterWithFirebase(firebaseToken);
  
  // Generate tokens for the user
  const tokens = await tokenService.generateAuthTokens(user);
  
  res.send({ 
    user, 
    tokens, 
    isNewUser, // Frontend will use this to show registration form
    needsRegistration: !user.isProfileComplete // Additional check
  });
});

/**
 * Complete user registration endpoint
 */
const completeRegistration = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { name, email, address, alternativePhone } = req.body;
  
  const user = await authService.completeUserRegistration(userId, {
    name,
    email,
    address,
    alternativePhone,
  });
  
  // Generate new tokens with updated user data
  const tokens = await tokenService.generateAuthTokens(user);
  
  res.send({ 
    user, 
    tokens,
    message: 'Registration completed successfully' 
  });
});

export const authController = {
  refreshTokens,
  firebaseLogin,
  completeRegistration,
};