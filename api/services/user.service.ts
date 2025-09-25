import { PrismaClient, User } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../utils/AppError.js';
import { AuthObject } from '@clerk/clerk-sdk-node';

const prisma = new PrismaClient();

/**
 * Finds a user in the local database by their Clerk ID.
 * If the user does not exist, it creates them just-in-time using Clerk's token info.
 * This is the primary function to use when a logged-in user performs an action.
 * @param {AuthObject} auth - The req.auth object from Clerk's middleware.
 * @returns {Promise<User>} The user record from the Supabase database.
 */
const getOrCreateUserFromClerk = async (auth: AuthObject): Promise<User> => {
    // 1. Get the Clerk user ID from the authenticated request.
    const clerkId = auth.userId;
    if (!clerkId) {
        // This should theoretically never happen if the route is protected.
        throw new ApiError(httpStatus.UNAUTHORIZED, "Authentication error: Clerk user ID is missing.");
    }

    // 2. Try to find the user in your database.
    const user = await prisma.user.findUnique({
        where: { clerkId: clerkId },
    });

    // 3. If the user already exists in your database, return them.
    if (user) {
        return user;
    }

    // 4. If the user does NOT exist, create them now.
    // --- IMPROVEMENT HERE: Simplified and made the email check safer ---
    const { email, first_name, last_name } = auth.sessionClaims;

    // Validate that the email exists and is a non-empty string.
    if (typeof email !== 'string' || !email) {
        throw new ApiError(httpStatus.BAD_REQUEST, "User cannot be created: A valid email was not found in the Clerk token.");
    }

    const newUser = await prisma.user.create({
        data: {
            clerkId: clerkId,
            email: email,
            name: `${first_name || ''} ${last_name || ''}`.trim(),
        },
    });

    return newUser;
};


// --- Your old functions are below, unchanged ---

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
    // --- ADDED: The new JIT function is now exported ---
    getOrCreateUserFromClerk,
};

