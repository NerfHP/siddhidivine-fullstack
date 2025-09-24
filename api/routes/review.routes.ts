import express from 'express';
import { reviewController } from '../controllers/index.js';
// --- FIX: Import 'authorize' instead of the old 'auth' middleware ---
import { authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// --- Public Routes ---
// These routes are accessible to everyone.
router.get('/:productId', reviewController.getReviewsByProductId);
router.post('/', reviewController.createReview);


// --- Admin Routes ---
// --- FIX: Replaced all instances of 'auth' with 'authorize(['admin'])' ---
// This ensures that only users with the 'admin' role can access these endpoints.
router.get('/admin/pending', authorize(['admin']), reviewController.getPendingReviews);
router.patch('/admin/approve/:reviewId', authorize(['admin']), reviewController.approveReview);
router.delete('/admin/reject/:reviewId', authorize(['admin']), reviewController.rejectReview);
router.get('/admin/stats', authorize(['admin']), reviewController.getReviewStats);
router.get('/admin/guest/:email', authorize(['admin']), reviewController.getReviewsByGuestEmail);


export default router;

