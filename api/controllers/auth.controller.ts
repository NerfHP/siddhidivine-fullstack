import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync.js';
import { userService } from '../services/index.js';
import { WebhookEvent } from '@clerk/clerk-sdk-node';
import httpStatus from 'http-status';

/**
 * Handles incoming webhooks from Clerk.
 * This single endpoint is responsible for keeping your database in sync with Clerk.
 */
const clerkWebhook = catchAsync(async (req: Request, res: Response) => {
  const evt = req.body as WebhookEvent;

  console.log(`[CLERK WEBHOOK] Received event: ${evt.type}`);

  switch (evt.type) {
    case 'user.created':
      // This event fires whenever a new user completes the sign-up process in Clerk.
      await userService.createUserFromClerk({
        clerkId: evt.data.id,
        email: evt.data.email_addresses[0].email_address,
        name: `${evt.data.first_name || ''} ${evt.data.last_name || ''}`.trim(),
        phone: evt.data.phone_numbers[0]?.phone_number,
      });
      console.log(`[CLERK WEBHOOK] User created in DB: ${evt.data.id}`);
      break;

    case 'user.updated':
      // This event fires when a user updates their profile information in Clerk.
      await userService.updateUserByClerkId(evt.data.id, {
        email: evt.data.email_addresses[0].email_address,
        name: `${evt.data.first_name || ''} ${evt.data.last_name || ''}`.trim(),
        phone: evt.data.phone_numbers[0]?.phone_number,
      });
      console.log(`[CLERK WEBHOOK] User updated in DB: ${evt.data.id}`);
      break;

    case 'user.deleted':
      // This event fires when a user is deleted from your Clerk application.
      await userService.deleteUserByClerkId(evt.data.id as string);
      console.log(`[CLERK WEBHOOK] User deleted from DB: ${evt.data.id}`);
      break;
  }

  // Respond to Clerk with a 200 OK to acknowledge receipt of the event.
  res.status(httpStatus.OK).send();
});

export const authController = {
  clerkWebhook,
};

