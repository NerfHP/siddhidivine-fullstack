import { PrismaClient } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../utils/AppError.js';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// This service now includes password hashing logic and updated checks.

const getUserByPhone = async (phone: string) => {
  return prisma.user.findUnique({ where: { phone } });
};

const getUserById = async (id: string) => {
    return prisma.user.findUnique({ where: { id } });
};

// Updated to optionally exclude a user ID. This is important for allowing a user
// to update their profile without the system flagging their own email as "taken".
const isEmailTaken = async (email: string, excludeUserId?: string) => {
    const whereClause: any = { email };
    if (excludeUserId) {
        whereClause.id = { not: excludeUserId };
    }
    const user = await prisma.user.findFirst({ where: whereClause });
    return !!user;
}

const createUser = async (userData: { phone: string }) => {
  // This function remains simple as it's for the initial OTP step.
  return prisma.user.create({
    data: {
      phone: userData.phone,
      isProfileComplete: false, // The user must complete the registration form next.
    },
  });
};

// This is a critical update: This function now hashes the password.
const completeUserRegistration = async (
  userId: string,
  userData: {
    name: string;
    email: string;
    address: string;
    password: string; // The raw password from the form
    alternativePhone?: string;
  }
) => {
  // Hash the password with bcrypt before saving it to the database for security.
  const hashedPassword = await bcrypt.hash(userData.password, 8);
  
  return prisma.user.update({
    where: { id: userId },
    data: {
      ...userData,
      password: hashedPassword, // Store the secure, hashed password
      isProfileComplete: true, // Mark the profile as complete
    },
  });
};

export const userService = {
  getUserByPhone,
  getUserById,
  isEmailTaken,
  createUser,
  completeUserRegistration,
};

