import { Request, Response } from 'express';
import { sendOrderEmails } from '../services/email.service.js';
import { prisma } from '../config/prisma.js';
// --- ADDED: Import the new services ---
import { userService } from '../services/user.service.js';
import { sendWhatsAppOrderNotification } from '../services/whatsapp.service.js';

type CartItemPayload = {
    id: string;
    quantity: number;
    price: number;
    salePrice?: number | null;
}

export const createOrder = async (req: Request, res: Response) => {
    // --- ADDED: JIT User Creation at the start ---
    // The route is now protected, so req.auth is guaranteed to exist.
    const userInDb = await userService.getOrCreateUserFromClerk((req as any).auth);

    // --- MODIFIED: Removed customerEmail from body ---
    const { shippingDetails, cartItems, total } = req.body as {
        shippingDetails: any;
        cartItems: CartItemPayload[];
        total: number;
    };

    if (!shippingDetails || !cartItems || !total) {
        return res.status(400).json({ message: 'Missing required order information.' });
    }

    try {
        const newOrder = await prisma.order.create({
            data: {
                total,
                customerName: shippingDetails.fullName,
                customerPhone: shippingDetails.phone,
                shippingAddress: `${shippingDetails.address}, ${shippingDetails.city}, ${shippingDetails.state} ${shippingDetails.zipCode}`,
                // --- ADDED: Link the order to the user in the database ---
                userId: userInDb.id,
                items: {
                    create: cartItems.map((item) => ({
                        quantity: item.quantity,
                        price: item.salePrice ?? item.price ?? 0,
                        product: {
                            connect: { id: item.id }
                        },
                    })),
                },
            },
            include: {
                items: { include: { product: true } },
            },
        });

        // --- MODIFIED: Trigger both emails and WhatsApp concurrently ---
        await Promise.all([
            sendOrderEmails(newOrder, userInDb.email), // Use the authenticated user's email
            sendWhatsAppOrderNotification(newOrder)
        ]);

        res.status(201).json(newOrder);
    } catch (error) {
        console.error("Order creation failed:", error);
        res.status(500).json({ message: 'Failed to create order.' });
    }
};
