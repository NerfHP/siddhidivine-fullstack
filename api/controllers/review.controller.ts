import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync.js';
import { reviewService } from '../services/index.js';
import { z } from 'zod';

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
    return res.status(400).json({ message: 'Product ID is required' });
  }

  const reviews = await reviewService.getReviewsByProductId(productId);
  res.json(reviews);
});

// Create a new review (supports both authenticated and guest users)
const createReview = catchAsync(async (req: Request, res: Response) => {
  // Validate request body
  const validationResult = createReviewSchema.safeParse(req.body);
  
  if (!validationResult.success) {
    return res.status(400).json({
      message: 'Invalid input',
      errors: validationResult.error.errors
    });
  }

  const { productId, rating, comment, imageUrl, guestName, guestEmail, isGuestReview } = validationResult.data;

  // Check if user is authenticated
  const userId = (req as any).user?.id;
  
  // Determine review type and validate accordingly
  if (!userId && !isGuestReview) {
    return res.status(400).json({
      message: 'Authentication required or guest information must be provided'
    });
  }

  if (isGuestReview) {
    // Validate guest review requirements
    if (!guestName || !guestEmail) {
      return res.status(400).json({
        message: 'Guest name and email are required for anonymous reviews'
      });
    }
    
    // Additional comment requirement for guest reviews
    if (!comment || comment.length < 10) {
      return res.status(400).json({
        message: 'Comment with minimum 10 characters is required for guest reviews'
      });
    }
  }

  try {
    const review = await reviewService.createReview(
      productId,
      rating,
      comment || '',
      {
        userId,
        imageUrl,
        guestName,
        guestEmail,
        isGuestReview
      }
    );

    const responseMessage = userId 
      ? 'Review created successfully'
      : 'Review submitted for approval. Thank you for your feedback!';

    res.status(201).json({
      message: responseMessage,
      review,
      needsApproval: !userId
    });
  } catch (error: any) {
    console.error('Error creating review:', error);
    res.status(400).json({
      message: error.message || 'Failed to create review'
    });
  }
});

// Admin endpoints for managing reviews
const getPendingReviews = catchAsync(async (req: Request, res: Response) => {
  // Check if user is admin (implement your admin check logic)
  const user = (req as any).user;
  
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const pendingReviews = await reviewService.getPendingReviews();
  res.json(pendingReviews);
});

const approveReview = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const { reviewId } = req.params;
  
  if (!reviewId) {
    return res.status(400).json({ message: 'Review ID is required' });
  }

  try {
    const approvedReview = await reviewService.approveReview(reviewId, user.id);
    res.json({
      message: 'Review approved successfully',
      review: approvedReview
    });
  } catch (error: any) {
    res.status(404).json({ message: 'Review not found or already approved' });
  }
});

const rejectReview = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const { reviewId } = req.params;
  
  if (!reviewId) {
    return res.status(400).json({ message: 'Review ID is required' });
  }

  try {
    await reviewService.rejectReview(reviewId);
    res.json({ message: 'Review rejected and deleted successfully' });
  } catch (error: any) {
    res.status(404).json({ message: 'Review not found' });
  }
});

// Get testimonial reviews (high-rated approved reviews)
const getTestimonialReviews = catchAsync(async (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 20;
  const testimonials = await reviewService.getTestimonialReviews(limit);
  res.json(testimonials);
});

// Get review statistics (admin endpoint)
const getReviewStats = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const stats = await reviewService.getReviewStats();
  res.json(stats);
});

// Get reviews by guest email (admin endpoint)
const getReviewsByGuestEmail = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  const { email } = req.params;
  
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const reviews = await reviewService.getReviewsByGuestEmail(email);
  res.json(reviews);
});

export const reviewController = {
  // Public endpoints
  getReviewsByProductId,
  createReview,
  getTestimonialReviews,
  
  // Admin endpoints
  getPendingReviews,
  approveReview,
  rejectReview,
  getReviewStats,
  getReviewsByGuestEmail,
};