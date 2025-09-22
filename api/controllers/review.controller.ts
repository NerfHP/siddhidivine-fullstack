import { Request, Response } from 'express';
import { reviewService } from '../services/index.js';
import { z } from 'zod';
import { catchAsync } from '../utils/catchAsync.js';
import httpStatus from 'http-status';

// Validation schemas
const createReviewSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'), 
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  imageUrl: z.string().url().optional(),
  // Guest review fields
  guestName: z.string().min(2).optional(),
  guestEmail: z.string().email().optional(),
  isGuestReview: z.boolean().optional(),
});

// Get reviews for a specific product (public endpoint)
const getReviewsByProductId = catchAsync(async (req: Request, res: Response) => {
  const { productId } = req.params;

  if (!productId) {
    return res.status(httpStatus.BAD_REQUEST).json({ message: 'Product ID is required' });
  }

  const reviews = await reviewService.getReviewsByProductId(productId);
  res.status(httpStatus.OK).json(reviews);
});

// Create a new review (supports both authenticated and guest users)
const createReview = catchAsync(async (req: Request, res: Response) => {
  const validationResult = createReviewSchema.safeParse(req.body);

  if (!validationResult.success) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: 'Invalid input',
      errors: validationResult.error.errors,
    });
  }

  const { productId, rating, comment, imageUrl, guestName, guestEmail, isGuestReview } = validationResult.data;

  const userId = (req as any).user?.id;

  if (!userId && !isGuestReview) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: 'Authentication required or guest information must be provided',
    });
  }

  if (isGuestReview && (!guestName || !guestEmail)) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: 'Guest name and email are required for anonymous reviews',
    });
  }

  try {
    const review = await reviewService.createReview(productId, rating, comment || '', {
      userId,
      imageUrl,
      guestName,
      guestEmail,
      isGuestReview,
    });

    const responseMessage = userId ? 'Review created successfully' : 'Review submitted for approval. Thank you!';

    res.status(httpStatus.CREATED).json({
      message: responseMessage,
      review,
      needsApproval: !userId,
    });
  } catch (error: any) {
    console.error('Error creating review:', error);
    res.status(httpStatus.BAD_REQUEST).json({
      message: error.message || 'Failed to create review',
    });
  }
});

// --- Admin Endpoints ---

const getPendingReviews = catchAsync(async (req: Request, res: Response) => {
  const pendingReviews = await reviewService.getPendingReviews();
  res.status(httpStatus.OK).json(pendingReviews);
});

const approveReview = catchAsync(async (req: Request, res: Response) => {
  const { reviewId } = req.params;
  const user = (req as any).user;
  const approvedReview = await reviewService.approveReview(reviewId, user.id);
  res.status(httpStatus.OK).json({
    message: 'Review approved successfully',
    review: approvedReview,
  });
});

const rejectReview = catchAsync(async (req: Request, res: Response) => {
  const { reviewId } = req.params;
  await reviewService.rejectReview(reviewId);
  res.status(httpStatus.OK).json({ message: 'Review rejected and deleted successfully' });
});

const getReviewStats = catchAsync(async (req: Request, res: Response) => {
  const stats = await reviewService.getReviewStats();
  res.status(httpStatus.OK).json(stats);
});

const getReviewsByGuestEmail = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.params;
  const reviews = await reviewService.getReviewsByGuestEmail(email);
  res.status(httpStatus.OK).json(reviews);
});

export const reviewController = {
  getReviewsByProductId,
  createReview,
  getPendingReviews,
  approveReview,
  rejectReview,
  getReviewStats,
  getReviewsByGuestEmail,
};

