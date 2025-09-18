// This is an example of an auth middleware to protect routes.
// It is not currently used but is ready for integration.

import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import ApiError from '../utils/AppError.js';
import { userService } from '../services/index.js';

export const auth = async (req: Request, _res: Response, next: NextFunction) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
  }

  try {
    const payload = jwt.verify(token, config.jwt.secret) as { sub: string };
    const user = await userService.getUserById(payload.sub);

    if (!user) { 
      return next(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
    }

    req.user = user;
    next();
  } catch (error) {
    return next(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
  }
};