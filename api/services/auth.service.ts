import httpStatus from 'http-status';
import ApiError from '../utils/AppError';
import { userService } from './user.service';
import { tokenService } from './token.service';

/**
 * Login with username and password
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
 * Refresh auth tokens
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
  loginUserWithEmailAndPassword,
  refreshAuth,
};