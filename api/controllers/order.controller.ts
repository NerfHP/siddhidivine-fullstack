import { Request, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { userService } from '../services/user.service.js';
import { sendOrderEmails } from '../services/email.service.js';
import { sendAdminNotification } from '../services/notification.service.js';
import httpStatus from 'http-status';

type CartItemPayload = {
    id: string;
    quantity: number;
    price: number;
    salePrice?: number | null;
}

export const createOrder = async (req: Request, res: Response) => {
  try {
    const userInDb = await userService.getOrCreateUserFromClerk((req as any).auth);
    const { shippingDetails, cartItems, total, paymentId } = req.body;

    const newOrder = await prisma.order.create({
        data: {
            total,
            paymentId,
            customerName: shippingDetails.fullName,
            customerPhone: shippingDetails.phone,
            shippingAddress: `${shippingDetails.address}, ${shippingDetails.city}, ${shippingDetails.state} ${shippingDetails.zipCode}`,
            userId: userInDb.id,
            items: {
                create: cartItems.map((item: CartItemPayload) => ({
                    quantity: item.quantity,
                    price: item.salePrice ?? item.price ?? 0,
                    product: { connect: { id: item.id } },
                })),
            },
        },
        include: {
            items: { include: { product: true } },
        },
    });
    
    await Promise.all([
        sendOrderEmails(newOrder, userInDb.email),
        sendAdminNotification(newOrder)
    ]);

    res.status(201).json(newOrder);
  } catch (error) {
      console.error("Order creation failed:", error);
      res.status(500).json({ message: 'Failed to create order.' });
  }
};

// --- FIX APPLIED HERE: This function is now correctly exported ---
export const trackOrder = async (req: Request, res: Response) => {
    const { orderId, email } = req.body;

    if (!orderId || !email) {
        return res.status(httpStatus.BAD_REQUEST).json({ message: 'Order ID and email are required.' });
    }

    try {
        const order = await prisma.order.findFirst({
            where: {
                id: orderId,
                user: {
                    email: email,
                },
            },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });

        if (!order) {
            return res.status(httpStatus.NOT_FOUND).json({ message: 'Order not found or email does not match.' });
        }

        res.status(httpStatus.OK).json(order);
    } catch (error) {
        console.error('Order tracking failed:', error);
        res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Failed to retrieve order details.' });
    }
};

