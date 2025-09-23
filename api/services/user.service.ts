import { PrismaClient } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../utils/AppError.js';

const prisma = new PrismaClient();

/**
 * Get user by email. This will be the primary method for finding users.
 * @param {string} email
 * @returns {Promise<User | null>}
 */
const getUserByEmail = async (email: string) => {
    return prisma.user.findUnique({ where: { email } });
};

/**
 * Get user by phone number. Still useful for checking for duplicates.
 * @param {string} phone
 * @returns {Promise<User | null>}
 */
const getUserByPhone = async (phone: string) => {
  return prisma.user.findUnique({ where: { phone } });
};

/**
 * Get user by ID.
 * @param {string} id
 * @returns {Promise<User | null>}
 */
const getUserById = async (id: string) => {
    return prisma.user.findUnique({ where: { id } });
};

/**
 * Check if an email is already taken.
 * @param {string} email
 * @returns {Promise<boolean>}
 */
const isEmailTaken = async (email: string) => {
    const user = await prisma.user.findUnique({ where: { email } });
    return !!user;
}

/**
 * Create a new user in the database.
 * This is called after Firebase has successfully created the user.
 * @param {object} userData - The user's details from the registration form.
 * @returns {Promise<User>}
 */
const createUser = async (userData: {
    name: string;
    email: string;
    phone: string;
    address: string;
}) => {
  return prisma.user.create({
    data: {
      ...userData,
      isProfileComplete: true, // The profile is complete on creation.
      // NOTE: We do NOT store the password. It is managed securely by Firebase.
    },
  });
};

export const userService = {
  getUserByEmail,
  getUserByPhone,
  getUserById,
  isEmailTaken,
  createUser,
};

