import { PrismaClient, User } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../utils/AppError.js';
import { AuthObject } from '@clerk/clerk-sdk-node';

const prisma = new PrismaClient();

// --- ADDED: The new "Just-In-Time" user creation function ---
/**
 * Finds a user in the local database by their Clerk ID.
 * If the user does not exist, it creates them on the spot.
 * This is the function your order controller will use.
 * @param {AuthObject} auth - The req.auth object from Clerk's middleware.
 * @returns {Promise<User>} The user record from the Supabase database.
 */
const getOrCreateUserFromClerk = async (auth: AuthObject): Promise<User> => {
    const { userId } = auth;
    if (!userId) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Clerk user ID is missing.");
    }

    // 1. Check if the user already exists in your database
    const user = await prisma.user.findUnique({ where: { clerkId: userId } });
    if (user) {
        return user; // If they exist, return them immediately
    }

    // --- FIX APPLIED HERE ---
    // 2. If not, get their details from the Clerk token and create them
    const { first_name, last_name } = auth.sessionClaims;
    const emailAddress = auth.sessionClaims.email;

    // A more robust check to ensure the email is a non-empty string.
    // This helps TypeScript correctly infer the type and resolves the error.
    if (typeof emailAddress !== 'string' || emailAddress.length === 0) {
        throw new ApiError(httpStatus.BAD_REQUEST, "User cannot be created: A valid email was not found in the Clerk token.");
    }

    const newUser = await prisma.user.create({
        data: {
            clerkId: userId,
            email: emailAddress, // Use the new, explicitly typed variable
            name: `${first_name || ''} ${last_name || ''}`.trim(),
        },
    });
    return newUser;
};


// --- Your existing functions are below, unchanged ---

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
    // --- ADDED: The new function is now exported for use in your controller ---
    getOrCreateUserFromClerk,
};

