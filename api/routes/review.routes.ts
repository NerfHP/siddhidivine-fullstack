import express from 'express';
import { reviewController } from '../controllers/index.js';
import { auth } from '../middleware/auth.middleware.js';

const router = express.Router();

// --- Public Routes ---

// Gets all reviews for a specific product page.
router.get('/:productId', reviewController.getReviewsByProductId);

// Creates a new review. The controller handles both guest and authenticated users.
router.post('/', reviewController.createReview);


// --- Admin Routes ---

// The 'auth' middleware is correctly used here for admin-only routes.
router.get('/admin/pending', auth, reviewController.getPendingReviews);
router.patch('/admin/approve/:reviewId', auth, reviewController.approveReview);
router.delete('/admin/reject/:reviewId', auth, reviewController.rejectReview);
router.get('/admin/stats', auth, reviewController.getReviewStats);
router.get('/admin/guest/:email', auth, reviewController.getReviewsByGuestEmail);


export default router;

