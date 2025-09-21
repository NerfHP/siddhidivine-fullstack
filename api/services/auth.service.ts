import httpStatus from 'http-status';
import ApiError from '../utils/AppError.js';
import { userService } from './user.service.js';
import { tokenService } from './token.service.js';
import admin from 'firebase-admin';

// NOTE: Remember to initialize Firebase Admin ONCE in your main server file.
/*
  import serviceAccount from '../config/serviceAccountKey.json';
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
*/

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
    // --- TYPO FIX HERE ---
    // Corrected http-status to httpStatus (camelCase)
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};

/**
 * Verifies a Firebase ID token from the frontend and then logs in or signs up the user in YOUR system.
 */
const loginOrRegisterWithFirebase = async (firebaseToken: string): Promise<any> => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
    const phone = decodedToken.phone_number;

    if (!phone) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Phone number not found in Firebase token.');
    }

    let user = await userService.getUserByPhone(phone);

    if (!user) {
      user = await userService.createUser({ phone }); 
    }

    return user;
  } catch (error) {
    console.error('Firebase token verification failed:', error);
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid Firebase token. Please login again.');
  }
};


export const authService = {
  refreshAuth,
  loginOrRegisterWithFirebase,
};

