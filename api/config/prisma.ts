import { PrismaClient } from '@prisma/client';

// This prevents TypeScript from redeclaring the prisma instance in development.
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// This creates a single, reusable instance of the Prisma client.
// By adding 'export', we make this a named export, which fixes the crash.
export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

