import { Request, Response } from 'express';
import Razorpay from 'razorpay';

// This initializes Razorpay with the secret keys from your .env file
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

/**
 * Creates a Razorpay order and sends the order ID back to the website.
 * Your website will use this ID to open the payment window.
 */
export const createRazorpayOrder = async (req: Request, res: Response) => {
  const { amount } = req.body; // The total amount of the order in INR

  if (!amount) {
    return res.status(400).json({ message: 'Amount is required' });
  }

  const options = {
    // Razorpay requires the amount in the smallest currency unit (e.g., paise for INR)
    amount: Math.round(amount * 100), 
    currency: 'INR',
    receipt: `receipt_order_${new Date().getTime()}`, // A unique receipt ID
  };

  try {
    // Ask Razorpay to create an order
    const order = await razorpay.orders.create(options);
    // Send the details of the order back to the website
    res.json(order);
  } catch (error) {
    console.error('Razorpay order creation failed:', error);
    res.status(500).json({ message: 'Failed to create payment order.' });
  }
};

