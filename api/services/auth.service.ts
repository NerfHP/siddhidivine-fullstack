import httpStatus from 'http-status';
import ApiError from '../utils/AppError.js';
import { userService } from './user.service.js';
import { tokenService } from './token.service.js';
// 1. Install the Firebase Admin SDK in your API folder: npm install firebase-admin
import admin from 'firebase-admin';

// NOTE: This initialization must be done ONCE when your server starts.
// A good place for it is in your main `api/index.ts` or `api/app.ts` file.
/*
  import serviceAccount from '../config/serviceAccountKey.json'; // The file you downloaded from Firebase

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
*/

/**
 * Login with username and password (Your existing function)
 */
const loginUserWithEmailAndPassword = async (
  email: string,
  password: string,
): Promise<any> => {
  const user = await userService.getUserByEmail(email);
  if (!user || !(await userService.isPasswordMatch(password, user))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }
  return user;
};

/**
 * Refresh auth tokens (Your existing function)
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
 * --- NEW FIREBASE FUNCTION ---
 * Verifies a Firebase ID token from the frontend and then logs in or signs up the user in YOUR system.
 */
const loginOrRegisterWithFirebase = async (firebaseToken: string): Promise<any> => {
  try {
    // 1. Securely verify the token with Google's servers. This is the core security step. 
    const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
    const phone = decodedToken.phone_number;

    if (!phone) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Phone number not found in Firebase token.');
    }

    // 2. Find the user in YOUR database using their phone number.
    // This now works because you created getUserByPhone in your user.service.ts
    let user = await userService.getUserByPhone(phone);

    // 3. If the user does not exist in your database, create them.
    // This now works because you updated the createUser function in your user.service.ts
    if (!user) {
      // Cast to `any` to bypass the current type restriction; ideally add `phone` to your user type/interface.
      user = await userService.createUser({ phone } as any); 
    }

    // 4. Return the user. The controller will then generate your app's own JWT session token.
    return user;
  } catch (error) {
    console.error('Firebase token verification failed:', error);
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid Firebase token. Please login again.');
  }
};


export const authService = {
  loginUserWithEmailAndPassword,
  refreshAuth,
  loginOrRegisterWithFirebase, // <-- Add the new service function
};

