import jwt from 'jsonwebtoken';
import moment from 'moment';
import { User } from '@prisma/client';
import config from '../config';

/**
 * Generate token
 */
const generateToken = (
  userId: string,
  expires: moment.Moment,
  type: 'access' | 'refresh',
  secret = config.jwt.secret,
): string => {
  const payload = {
    sub: userId,
    iat: moment().unix(),
    exp: expires.unix(),
    type,
  };
  return jwt.sign(payload, secret);
};

/**
 * Verify token and return token doc (or throw an error if it is not valid)
 */
const verifyToken = async (
  token: string,
  type: 'access' | 'refresh',
): Promise<jwt.JwtPayload> => {
  const payload = jwt.verify(token, config.jwt.secret);
  if (typeof payload === 'string' || payload.type !== type) {
    throw new Error('Invalid token type');
  }
  return payload;
};

/**
 * Generate auth tokens
 */
const generateAuthTokens = async (user: User) => {
  const accessTokenExpires = moment().add(
    config.jwt.accessExpirationMinutes,
    'minutes',
  );
  const accessToken = generateToken(user.id, accessTokenExpires, 'access');

  const refreshTokenExpires = moment().add(
    config.jwt.refreshExpirationDays,
    'days',
  );
  const refreshToken = generateToken(user.id, refreshTokenExpires, 'refresh');

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
    refresh: {
      token: refreshToken,
      expires: refreshTokenExpires.toDate(),
    },
  };
};

export const tokenService = {
  generateToken,
  verifyToken,
  generateAuthTokens,
};