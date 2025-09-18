import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync.js';
import { reviewService } from '../services/index.js';

const getReviewsByProductId = catchAsync(async (req: Request, res: Response) => {
  const reviews = await reviewService.getReviewsByProductId(req.params.productId);
  res.send(reviews);
});

const createReview = catchAsync(async (req: Request, res: Response) => {

  
  // In a real app, you would get userId from the authenticated user (req.user.id)
  const { productId, rating, comment, userId } = req.body; 
  const review = await reviewService.createReview(productId, userId, rating, comment);
  res.status(201).send(review);
});

export const reviewController = {
  getReviewsByProductId,
  createReview,
};
