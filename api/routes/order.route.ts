import express from 'express';
// Import the createOrder function from the controller we just made
import { createOrder } from '../controllers/index.js/order.controller';

const router = express.Router();

// This sets up the API endpoint. When your website sends a POST request
// to '/api/orders', it will trigger the createOrder function.
router.post('/', createOrder);

export default router;

