import { Request, Response } from 'express';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/clerk-sdk-node';
import httpStatus from 'http-status';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const createOrUpdateUser = async (userData: any) => {
    const { id, first_name, last_name, email_addresses, image_url, created_at, updated_at } = userData;
    
    const email = email_addresses[0]?.email_address;

    if (!email) {
        console.error('No email address found for user:', id);
        return;
    }
    try {
        const user = await prisma.user.upsert({
            where: { clerkId: id },
            update: {
                name: `${first_name || ''} ${last_name || ''}`.trim(),
                email: email,
                updatedAt: new Date(updated_at),
            },
            create: {
                clerkId: id,
                name: `${first_name || ''} ${last_name || ''}`.trim(),
                email: email,
                createdAt: new Date(created_at),
                updatedAt: new Date(updated_at),
            },
        });
        console.log('Successfully created/updated user:', user.id);
    } catch (error) {
        console.error('Error in createOrUpdateUser:', error);
    }
};

export const handleClerkWebhook = async (req: Request, res: Response) => {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

    if (!WEBHOOK_SECRET) {
        return res.status(httpStatus.INTERNAL_SERVER_ERROR).send('Error: CLERK_WEBHOOK_SECRET is not set in environment variables.');
    }

    const svix_id = req.headers['svix-id'] as string;
    const svix_timestamp = req.headers['svix-timestamp'] as string;
    const svix_signature = req.headers['svix-signature'] as string;

    if (!svix_id || !svix_timestamp || !svix_signature) {
        return res.status(httpStatus.BAD_REQUEST).send('Error: Missing svix headers');
    }
    
    const payload = (req as any).rawBody;
    const wh = new Webhook(WEBHOOK_SECRET);
    let evt: WebhookEvent;

    try {
        evt = wh.verify(payload, {
            'svix-id': svix_id,
            'svix-timestamp': svix_timestamp,
            'svix-signature': svix_signature,
        }) as WebhookEvent;
    } catch (err) {
        console.error('Error verifying webhook:', err);
        return res.status(httpStatus.BAD_REQUEST).send('Error: Webhook verification failed');
    }

    const eventType = evt.type;
    console.log(`Received webhook event: ${eventType}`);

    if (eventType === 'user.created' || eventType === 'user.updated') {
        await createOrUpdateUser(evt.data);
    }

    res.status(httpStatus.OK).send('Webhook received successfully');
};


