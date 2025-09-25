import express from 'express';
import { createOrder } from '../controllers/order.controller.js';
// --- ADDED: Import Clerk middleware to protect the route ---
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';

const router = express.Router();

// --- MODIFIED: The route is now protected ---
// This ensures only logged-in users can create an order.
// ClerkExpressRequireAuth() middleware runs first. If the user is not authenticated,
// it will automatically send a 401 Unauthorized error and stop the request.
// If the user IS authenticated, it adds the `req.auth` object and calls the next function, `createOrder`.
router.post('/', ClerkExpressRequireAuth(), createOrder);

export default router;

