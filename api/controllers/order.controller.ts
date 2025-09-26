import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { userService } from '../services/user.service.js';
import { sendOrderEmails } from '../services/email.service.js';
// --- ADDED: Import from the new notification service ---
import { sendAdminNotification } from '../services/notification.service.js';

type CartItemPayload = {
    id: string;
    quantity: number;
    price: number;
    salePrice?: number | null;
}

export const createOrder = async (req: Request, res: Response) => {
  try {
    // --- CHANGE 1: Get or Create User ---
    // Instead of getting email from the body, we securely get the logged-in
    // user and create them in our database if they don't exist.
    const userInDb = await userService.getOrCreateUserFromClerk((req as any).auth);

    // --- CHANGE 2: Updated Request Body ---
    // We no longer need customerEmail, as we get it from the userInDb object.
    const { shippingDetails, cartItems, total, paymentId } = req.body;

    // Create the order in your Supabase database
    const newOrder = await prisma.order.create({
        data: {
            total,
            paymentId,
            customerName: shippingDetails.fullName,
            customerPhone: shippingDetails.phone,
            shippingAddress: `${shippingDetails.address}, ${shippingDetails.city}, ${shippingDetails.state} ${shippingDetails.zipCode}`,
            // --- CHANGE 3: Link Order to User ---
            // The new order is now associated with the authenticated user.
            userId: userInDb.id,
            items: {
                create: cartItems.map((item: CartItemPayload) => ({
                    quantity: item.quantity,
                    price: item.salePrice ?? item.price ?? 0,
                    product: { connect: { id: item.id } },
                })),
            },
        },
        // We include all the details so we can send them in the notifications
        include: {
            items: { include: { product: true } },
        },
    });
    
    // --- CHANGE 4: Trigger All Notifications ---
    // This now sends the customer email and your admin notification at the same time.
    await Promise.all([
        sendOrderEmails(newOrder, userInDb.email),
        sendAdminNotification(newOrder)
    ]);

    // Send a success response back to the frontend
    res.status(201).json(newOrder);
  } catch (error) {
      console.error("Order creation failed:", error);
      res.status(500).json({ message: 'Failed to create order.' });
  }
};

