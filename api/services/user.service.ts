import {prisma} from '../config/prisma.js';
import { User } from '@prisma/client';

/**
 * Create a user with phone number only (after OTP verification)
 * @param {object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody: { phone: string }): Promise<User> => {
  return prisma.user.create({
    data: {
      phone: userBody.phone,
      isProfileComplete: false, // User needs to complete registration
    },
  });
};

/**
 * Complete user registration with additional details
 * @param {string} userId
 * @param {object} userData
 * @returns {Promise<User>}
 */
const completeUserRegistration = async (
  userId: string, 
  userData: {
    name: string;
    email: string;
    address: string;
    alternativePhone?: string;
  }
): Promise<User> => {
  return prisma.user.update({
    where: { id: userId },
    data: {
      name: userData.name,
      email: userData.email,
      address: userData.address,
      alternativePhone: userData.alternativePhone,
      isProfileComplete: true,
    },
  });
};

/**
 * Get user by their unique ID
 * @param {string} id
 * @returns {Promise<User | null>}
 */
const getUserById = async (id: string): Promise<User | null> => {
  return prisma.user.findUnique({ where: { id } });
};

/**
 * Get user by their phone number (primary lookup method)
 * @param {string} phone
 * @returns {Promise<User | null>}
 */
const getUserByPhone = async (phone: string): Promise<User | null> => {
  return prisma.user.findUnique({ where: { phone } });
};

/**
 * Check if email is already taken (for registration validation)
 * @param {string} email
 * @returns {Promise<boolean>}
 */
const isEmailTaken = async (email: string): Promise<boolean> => {
  const user = await prisma.user.findUnique({ where: { email } });
  return !!user;
};

/**
 * Update user profile
 * @param {string} userId
 * @param {object} updateData
 * @returns {Promise<User>}
 */
const updateUser = async (userId: string, updateData: Partial<User>): Promise<User> => {
  return prisma.user.update({
    where: { id: userId },
    data: updateData,
  });
};

export const userService = {
  createUser,
  completeUserRegistration,
  getUserById,
  getUserByPhone,
  isEmailTaken,
  updateUser,
};