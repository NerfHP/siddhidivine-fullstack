import express from 'express';
import { authController } from '../controllers/index.js';
import { Webhook } from 'svix';
import { buffer } from 'micro';
import ApiError from '../utils/AppError.js';
import httpStatus from 'http-status';

const router = express.Router();

router.post(
  '/webhook',
  // We need to use `express.raw` to get the raw request body for verification.
  express.raw({ type: 'application/json' }),
  async (req, res, next) => {
    try {
      const payload = await buffer(req);
      const headers = req.headers;

      const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET as string);
      const verifiedPayload = wh.verify(payload, headers as any);

      // Attach the verified payload to the request body for the controller.
      req.body = verifiedPayload;
      next();
    } catch (err) {
      console.error('[CLERK WEBHOOK VERIFICATION FAILED]', err);
      return next(new ApiError(httpStatus.BAD_REQUEST, 'Webhook verification failed'));
    }
  },
  authController.clerkWebhook
);

export default router;

