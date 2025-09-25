import express from 'express';
import { handleClerkWebhook } from '../controllers/webhook.controller.js';

const router = express.Router();

// IMPORTANT: We need the raw body for Svix verification
// The default express.json() middleware would parse it and break the verification
router.post(
    '/clerk', 
    express.raw({ type: 'application/json' }), 
    handleClerkWebhook
);

export default router;
