import { Request, Response, NextFunction } from 'express';
import httpStatus from 'http-status';
import ApiError from '../utils/AppError.js';

/**
 * A new middleware function designed to work with Clerk.
 * It checks if a user is not only authenticated (which Clerk already does)
 * but also has a specific role in their session claims.
 * @param {string[]} requiredRoles - An array of roles that are allowed to access the route.
 */
export const authorize = (requiredRoles: string[]) => (req: Request, _res: Response, next: NextFunction) => {
    // Clerk's `ClerkExpressWithAuth` middleware puts user data on `req.auth`.
    // The user's role is stored in the public metadata of their session token.
    const userRole = (req as any).auth?.sessionClaims?.metadata?.role as string;

    if (!userRole || !requiredRoles.includes(userRole)) {
        return next(new ApiError(httpStatus.FORBIDDEN, 'Forbidden: You do not have the required permissions.'));
    }
    
    // If the user has the required role, proceed to the next handler.
    next();
};

// The old `auth` function is no longer needed because Clerk's `ClerkExpressWithAuth` handles this automatically.

