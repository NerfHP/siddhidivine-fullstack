import { User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import httpStatus from 'http-status';
import ApiError from '../utils/AppError.js';
import { z } from 'zod';
import { authValidation } from '../validation/index.js';
import { prisma } from '../config/prisma.js';

/**
 * Create a user
 */
export const createUser = async (
  userBody: z.infer<typeof authValidation.register>['body'],
): Promise<User> => {
  if (await getUserByEmail(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  const hashedPassword = await bcrypt.hash(userBody.password, 8);
  return prisma.user.create({
    data: {
      email: userBody.email,
      name: userBody.name,
      password: hashedPassword,
    },
  });
};

/**
 * Get user by email
 */
export const getUserByEmail = async (email: string): Promise<User | null> => {
  return prisma.user.findUnique({
    where: { email },
  });
};

/**
 * Get user by id
 */
export const getUserById = async (id: string): Promise<User | null> => {
  return prisma.user.findUnique({ where: { id } });
};

/**
 * Check if password matches
 */
export const isPasswordMatch = async (
  password: string,
  user: User,
): Promise<boolean> => {
  return bcrypt.compare(password, user.password);
};

export const userService = {
  createUser,
  getUserByEmail,
  getUserById,
  isPasswordMatch,
};