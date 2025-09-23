// api/services/auth.service.ts
import httpStatus from 'http-status';
import ApiError from '../utils/AppError.js';
import { userService } from './user.service.js';
import { tokenService } from './token.service.js';
import admin from '../config/firebase-admin.js'; // Import the initialized Firebase admin
import { User } from '@prisma/client';

/**
 * Verifies a Firebase ID token and finds the corresponding user in your database.
 * This is used for logging in existing users.
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
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid Firebase token or user does not exist.');
  }
};

/**
 * Registers a new user in your database after they have been created in Firebase.
 * This includes proper rollback if Supabase creation fails.
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
  let firebaseUid: string | null = null;
  
  try {
    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
    firebaseUid = decodedToken.uid;

    if (decodedToken.email !== userData.email) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Email mismatch between Firebase token and provided data.');
    }
    
    // Check for existing users
    if (await userService.isEmailTaken(userData.email)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Email is already registered.');
    }
    
    if (await userService.getUserByPhone(userData.phone)) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Phone number is already registered.');
    }

    // Create user in Supabase database
    const newUser = await userService.createUser(userData);
    
    console.log(`Successfully created user ${newUser.id} in database for Firebase UID ${firebaseUid}`);
    return newUser;
    
  } catch (error) {
    console.error('Registration failed:', error);
    
    // If user creation in Supabase failed but Firebase user was created,
    // we should ideally delete the Firebase user to maintain consistency
    if (firebaseUid && error instanceof ApiError) {
      try {
        console.log(`Attempting to clean up Firebase user ${firebaseUid} due to database creation failure`);
        await admin.auth().deleteUser(firebaseUid);
        console.log(`Successfully deleted Firebase user ${firebaseUid}`);
      } catch (cleanupError) {
        console.error(`Failed to cleanup Firebase user ${firebaseUid}:`, cleanupError);
        // Don't throw here - we want to show the original error
      }
    }
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Failed to complete registration.');
  }
};

/**
 * Refresh auth tokens.
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