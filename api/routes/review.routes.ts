import express from 'express';
import { reviewController } from '../controllers/index.js';
import { auth } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes (no authentication required)
router.get('/:productId', reviewController.getReviewsByProductId);
router.get('/reviews/testimonials/featured', reviewController.getTestimonialReviews);

// Review creation - supports both authenticated and anonymous users
// The controller will handle the logic for both cases
router.post('/', reviewController.createReview);

// Admin routes (authentication required)
router.get('/admin/pending', auth, reviewController.getPendingReviews);
router.get('/admin/stats', auth, reviewController.getReviewStats);
router.get('/admin/guest/:email', auth, reviewController.getReviewsByGuestEmail);
router.patch('/admin/approve/:reviewId', auth, reviewController.approveReview);
router.delete('/admin/reject/:reviewId', auth, reviewController.rejectReview);

export default router;