import express from 'express';
// --- MODIFIED: Import both controller functions ---
import { createOrder, trackOrder } from '../controllers/order.controller.js';
// --- ADDED: Import the specific middleware for protecting routes ---
import { ClerkExpressRequireAuth } from '@clerk/clerk-sdk-node';

const router = express.Router();

// --- FIX APPLIED HERE ---
// This route is for creating orders and MUST be protected.
// ClerkExpressRequireAuth() runs first. If the user is not authenticated,
// it will automatically send a 401 Unauthorized error and stop.
// If the user IS authenticated, it calls the next function, `createOrder`.
router.post('/', ClerkExpressRequireAuth(), createOrder);

// This route is for tracking orders and can remain public
router.post('/track', trackOrder);

export default router;

