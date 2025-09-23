import httpStatus from 'http-status';
import ApiError from '../utils/AppError.js';
import { userService } from './user.service.js';
import { tokenService } from './token.service.js';
import admin from 'firebase-admin';
import bcrypt from 'bcryptjs';

/**
 * Login a user with their phone number and password.
 * @param {string} phone - User's phone number.
 * @param {string} password - User's password.
 * @returns {Promise<User>}
 */
const loginWithPhoneAndPassword = async (phone: string, password: string) => {
  const user = await userService.getUserByPhone(phone);
  // Ensure the user exists and has a password set.
  if (!user || !user.password) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect phone or password');
  }
  // Compare the provided password with the hashed password in the database.
  const isPasswordMatch = await bcrypt.compare(password, user.password);
  if (!isPasswordMatch) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect phone or password');
  }
  return user;
};

/**
 * Verifies Firebase ID token and handles user login/registration.
 * If the user exists, it returns their data.
 * If the user is new, it creates a temporary user record.
 */
const loginOrRegisterWithFirebase = async (firebaseToken: string): Promise<{ user: any; isNewUser: boolean; }> => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
    const phone = decodedToken.phone_number;

    if (!phone) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Phone number not found in Firebase token.');
    }

    let user = await userService.getUserByPhone(phone);
    let isNewUser = false;

    if (!user) {
      // Create a new user with only a phone number. The profile is incomplete.
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
 * Complete user registration with additional details including a password.
 */
const completeUserRegistration = async (
  userId: string,
  userData: {
    name: string;
    email: string;
    address: string;
    password: string;
    alternativePhone?: string;
  }
): Promise<any> => {
  try {
    // Check if the email is already in use by another account, excluding the current user.
    if (await userService.isEmailTaken(userData.email, userId)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Email is already registered');
    }

    // The userService will handle hashing the password before saving.
    const user = await userService.completeUserRegistration(userId, userData);
    return user;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to complete registration');
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
      throw new Error();
    }
    return tokenService.generateAuthTokens(user);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate');
  }
};

export const authService = {
  loginWithPhoneAndPassword,
  refreshAuth,
  loginOrRegisterWithFirebase,
  completeUserRegistration,
};

