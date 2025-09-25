import { PrismaClient } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../utils/AppError.js';

const prisma = new PrismaClient();

/**
 * Get user by their Clerk ID. This will be the new primary way to find users.
 * @param {string} clerkId
 * @returns {Promise<User | null>}
 */
const getUserByClerkId = async (clerkId: string) => {
    return prisma.user.findUnique({ where: { clerkId } });
};

/**
 * Get user by email. Still useful for checks.
 * @param {string} email
 * @returns {Promise<User | null>}
 */
const getUserByEmail = async (email: string) => {
    return prisma.user.findUnique({ where: { email } });
};

/**
 * Create a new user in the database.
 * This is called by the Clerk webhook when a new user signs up.
 * @param {object} userData - The user's details from the Clerk webhook payload.
 * @returns {Promise<User>}
 */
const createUserFromClerk = async (userData: {
    clerkId: string;
    email: string;
    name?: string;
    phone?: string;
}) => {
    // Check if a user with this email or Clerk ID already exists to prevent duplicates.
    const existingUser = await prisma.user.findFirst({
        where: { OR: [{ clerkId: userData.clerkId }, { email: userData.email }] }
    });

    if (existingUser) {
        throw new ApiError(httpStatus.BAD_REQUEST, 'User already exists.');
    }

    return prisma.user.create({
        data: {
            clerkId: userData.clerkId,
            email: userData.email,
            name: userData.name || '',
            phone: userData.phone,
            isProfileComplete: true, // The user is created with all available info from Clerk.
        },
    });
};

/**
 * Update a user's details in the database.
 * This is called by the Clerk webhook when a user updates their profile.
 * @param {string} clerkId
 * @param {object} dataToUpdate
 * @returns {Promise<User>}
 */
const updateUserByClerkId = async (clerkId: string, dataToUpdate: { email: string, name?: string, phone?: string }) => {
    return prisma.user.update({
        where: { clerkId },
        data: {
            email: dataToUpdate.email,
            name: dataToUpdate.name || '',
            phone: dataToUpdate.phone,
        },
    });
};

/**
 * Delete a user from the database.
 * This is called by the Clerk webhook when a user is deleted.
 * @param {string} clerkId
 * @returns {Promise<User>}
 */
const deleteUserByClerkId = async (clerkId: string) => {
    return prisma.user.delete({
        where: { clerkId },
    });
};


export const userService = {
  getUserByClerkId,
  getUserByEmail,
  createUserFromClerk,
  updateUserByClerkId,
  deleteUserByClerkId,
};

