import httpStatus from 'http-status';
import ApiError from '../utils/AppError.js';
import { userService } from './user.service.js';
import { tokenService } from './token.service.js';
import admin from 'firebase-admin';

// NOTE: Remember to initialize Firebase Admin ONCE in your main server file.

/**
 * Refresh auth tokens (This is still needed for session management)
 */
const refreshAuth = async (refreshToken: string) => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(refreshToken, 'refresh');
    const user = await userService.getUserById(refreshTokenDoc.sub as string);
    if (!user) {
      throw new Error();
    }
    return tokenService.generateAuthTokens(user);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};

/**
 * Verifies Firebase ID token and handles user login/registration
 * Returns user object and indicates if user is new (needs registration)
 */
const loginOrRegisterWithFirebase = async (firebaseToken: string): Promise<{
  user: any;
  isNewUser: boolean;
}> => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
    const phone = decodedToken.phone_number;

    if (!phone) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Phone number not found in Firebase token.');
    }

    let user = await userService.getUserByPhone(phone);
    let isNewUser = false;

    if (!user) {
      // Create new user with just phone number
      user = await userService.createUser({ phone });
      isNewUser = true;
    }

    return { user, isNewUser };
  } catch (error) {
    console.error('Firebase token verification failed:', error);
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid Firebase token. Please login again.');
  }
};

/**
 * Complete user registration with additional details
 */
const completeUserRegistration = async (
  userId: string,
  userData: {
    name: string;
    email: string;
    address: string;
    alternativePhone?: string;
  }
): Promise<any> => {
  try {
    // Check if email is already taken
    if (await userService.isEmailTaken(userData.email)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Email is already registered');
    }

    const user = await userService.completeUserRegistration(userId, userData);
    return user;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to complete registration');
  }
};

export const authService = {
  refreshAuth,
  loginOrRegisterWithFirebase,
  completeUserRegistration,
};