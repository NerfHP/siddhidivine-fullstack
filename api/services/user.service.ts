import {prisma} from '../config/prisma.js';
import { User } from '@prisma/client';

/**
 * Create a user. This function is now simplified for phone-only registration.
 * It also handles creating users with other data for potential admin use.
 * @param {object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody: Partial<User>): Promise<User> => {
  // We no longer need the check for existing emails for the main user flow.
  
  // Dynamically build the data object for Prisma
  const userData: any = {};
  // --- TYPO FIX HERE ---
  if (userBody.name) userData.name = userBody.name;
  if (userBody.email) userData.email = userBody.email;
  if (userBody.phone) userData.phone = userBody.phone;

  return prisma.user.create({
    data: userData,
  });
};

/**
 * Get user by their unique ID. This is still useful for other parts of the system.
 * @param {string} id
 * @returns {Promise<User | null>}
 */
const getUserById = async (id: string): Promise<User | null> => {
  return prisma.user.findUnique({ where: { id } });
};

/**
 * Get user by their phone number. This is the primary lookup method now.
 * @param {string} phone
 * @returns {Promise<User | null>}
 */
const getUserByPhone = async (phone: string): Promise<User | null> => {
  return prisma.user.findUnique({ where: { phone } });
};

export const userService = {
  createUser,
  getUserById,
  getUserByPhone,
};

