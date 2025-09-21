import {prisma} from '../config/prisma.js';
import bcrypt from 'bcryptjs';
import { User } from '@prisma/client';

/**
 * Create a user. This function is now updated to handle both
 * email/password registration and phone-only registration from Firebase.
 * @param {object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody: Partial<User>): Promise<User> => {
  // Check if a user with this email already exists (for your email/password flow)
  if (userBody.email && await prisma.user.findUnique({ where: { email: userBody.email } })) {
    throw new Error('Email already taken');
  }

  // Hash the password only if one is provided
  if (userBody.password) {
    userBody.password = await bcrypt.hash(userBody.password, 8);
  }
  
  // Dynamically build the data object for Prisma to avoid errors
  const userData: any = {};
  if (userBody.email) userData.email = userBody.email;
  if (userBody.password) userData.password = userBody.password;
  if (userBody.name) userData.name = userBody.name;
  if (userBody.phone) userData.phone = userBody.phone;

  return prisma.user.create({
    data: userData,
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
 * Get user by their email address
 * @param {string} email
 * @returns {Promise<User | null>}
 */
const getUserByEmail = async (email: string): Promise<User | null> => {
  return prisma.user.findUnique({ where: { email } });
};

/**
 * --- NEWLY ADDED FUNCTION ---
 * Get user by their phone number
 * @param {string} phone
 * @returns {Promise<User | null>}
 */
const getUserByPhone = async (phone: string): Promise<User | null> => {
  return prisma.user.findUnique({ where: { phone } });
};

/**
 * Check if the provided password matches the user's stored password
 * @param {string} password
 * @param {User} user
 * @returns {Promise<boolean>}
 */
const isPasswordMatch = async (password: string, user: User): Promise<boolean> => {
  if (!user.password) return false;
  return bcrypt.compare(password, user.password);
};

export const userService = {
  createUser,
  getUserById, // <-- Now correctly exported, fixing the error in your auth service
  getUserByEmail,
  getUserByPhone, // <-- Now correctly exported
  isPasswordMatch,
};

