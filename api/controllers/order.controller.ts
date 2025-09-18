import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
// 1. Import the new, single email function from the service you just created
import { sendOrderEmails } from '../services/email.service';

const prisma = new PrismaClient();

// A helper type to define what the cart items from the frontend will look like
type CartItemPayload = {
    id: string;
    quantity: number;
    price: number;
    salePrice?: number | null;
}

export const createOrder = async (req: Request, res: Response) => {
    // This function expects an email, shipping details, cart items, and total
    const { shippingDetails, cartItems, total, customerEmail } = req.body as { 
        shippingDetails: any; 
        cartItems: CartItemPayload[]; 
        total: number; 
        customerEmail: string; 
    };
    
    // Basic validation to ensure we have all the necessary data
    if (!shippingDetails || !cartItems || !total || !customerEmail) {
        return res.status(400).json({ message: 'Missing required order information.' });
    }

    try {
        // Create the new order in the database
        const newOrder = await prisma.order.create({
            data: {
                total,
                customerName: shippingDetails.fullName,
                customerPhone: shippingDetails.phone,
                shippingAddress: `${shippingDetails.address}, ${shippingDetails.city}, ${shippingDetails.state} ${shippingDetails.zipCode}`,
                // Create the individual order items and link them to this order
                items: {
                    create: cartItems.map((item) => ({
                        quantity: item.quantity,
                        price: item.salePrice ?? item.price ?? 0, // Use sale price if available
                        product: { 
                            connect: { id: item.id } 
                        },
                    })),
                },
            },
            // After creating the order, include all the details needed for the emails
            include: {
                items: { include: { product: true } }, 
            },
        });
        
        // --- TRIGGER EMAILS ---
        // After successfully creating the order, this single function sends all emails.
        await sendOrderEmails(newOrder, customerEmail);

        // In a real application, you would also clear the user's cart here on the frontend.
        
        // Send a success response back to the website
        res.status(201).json(newOrder);
    } catch (error) {
        console.error("Order creation failed:", error);
        res.status(500).json({ message: 'Failed to create order.' });
    }
};

