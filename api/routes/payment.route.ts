import express from 'express';
// Import the createRazorpayOrder function from the controller we just made
import { createRazorpayOrder } from '../controllers/payment.controller';

const router = express.Router();

// This sets up the API endpoint. When your website sends a POST request
// to '/api/payment/create-order', it will trigger the createRazorpayOrder function.
router.post('/create-order', createRazorpayOrder);

export default router;

