import axios from 'axios';

// --- FIX APPLIED HERE ---
// We've defined a basic 'Order' type directly in this file to resolve the import error.
// This ensures the file is self-contained and works correctly.
export type Order = {
  id: string;
  total: number;
  // Add any other fields that your backend returns for an order
  [key: string]: any;
};

// Create a reusable Axios instance.
// With Clerk, you no longer need interceptors to add auth headers.
// The secure session cookie is sent automatically by the browser.
const api = axios.create({
  // By setting the baseURL to '/', API calls to '/api/orders' will work correctly
  // in both development and on your Vercel deployment.
  baseURL: '/',
  headers: {
    'Content-Type': 'application/json',
  },
});

// A helper type for the data we need to send to create an order
type CreateOrderPayload = {
    shippingDetails: any;
    cartItems: { id: string; quantity: number; price: number; salePrice?: number | null }[];
    total: number;
    paymentId?: string;
};

/**
 * Creates a new order by sending a POST request to the backend.
 * This is now a secure, authenticated request thanks to Clerk's SDK.
 * @param {CreateOrderPayload} orderData - The details of the order.
 * @returns {Promise<Order>} The newly created order from the database.
 */
export const createOrder = async (orderData: CreateOrderPayload): Promise<Order> => {
    // We use our configured axios instance to make the request.
    const response = await api.post('/api/orders', orderData);
    return response.data;
};

// Export the instance as default so any other code that uses `api.post(...)` continues to work.
export default api;

