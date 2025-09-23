import httpStatus from 'http-status';
import ApiError from '../utils/AppError.js';
import { userService } from './user.service.js';
import { tokenService } from './token.service.js';
import admin from 'firebase-admin';
import { User } from '@prisma/client';

/**
 * Verifies a Firebase ID token and finds the corresponding user in the database.
 * This is used for logging in existing users.
 * @param {string} firebaseToken - The ID token from the Firebase client.
 * @returns {Promise<User>}
 */
const loginWithFirebase = async (firebaseToken: string): Promise<User> => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
    const email = decodedToken.email;

    if (!email) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Email not found in Firebase token.');
    }

    const user = await userService.getUserByEmail(email);
    if (!user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'User not found. Please sign up first.');
    }

    return user;
  } catch (error) {
    console.error('Firebase token verification failed during login:', error);
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid Firebase token or user does not exist.');
  }
};

/**
 * Registers a new user in your database after they have been created in Firebase.
 * @param {string} firebaseToken - The ID token from the Firebase client after signup.
 * @param {object} userData - Additional user data from the registration form.
 * @returns {Promise<User>}
 */
const registerWithFirebase = async (
  firebaseToken: string,
  userData: {
    name: string;
    email: string;
    phone: string;
    address: string;
  }
): Promise<User> => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(firebaseToken);

    // Security check: Ensure the email in the token matches the form data.
    if (decodedToken.email !== userData.email) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Email mismatch. Registration failed.');
    }
    
    // Check if email or phone is already taken in your database.
    if (await userService.isEmailTaken(userData.email)) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Email is already registered.');
    }
    if (await userService.getUserByPhone(userData.phone)) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'Phone number is already registered.');
    }

    // Create the user in your database. The password is handled securely by Firebase.
    const newUser = await userService.createUser(userData);

    return newUser;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error('Firebase registration failed:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to complete registration.');
  }
};

/**
 * Refresh auth tokens using a valid refresh token.
 */
const refreshAuth = async (refreshToken: string) => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(refreshToken, 'refresh');
    const user = await userService.getUserById(refreshTokenDoc.sub as string);
    if (!user) {
      throw new Error('User not found');
    }
    return tokenService.generateAuthTokens(user);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};

export const authService = {
  loginWithFirebase,
  registerWithFirebase,
  refreshAuth,
};

