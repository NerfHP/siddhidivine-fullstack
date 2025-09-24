import express from 'express';
import { faqController } from '../controllers/faq.controller.js';
// --- FIX: Import 'authorize' instead of the old 'auth' middleware ---
import { authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// --- Public Route ---
// This route allows anyone to get the FAQs for a specific product.
router.get('/:productId', faqController.getFaqsByProductId);


// --- Admin Routes (Requires Authentication and 'admin' role) ---
// --- FIX: Replaced all instances of 'auth' with 'authorize(['admin'])' ---
// This ensures that only users with the 'admin' role can create, update, or delete FAQs.
router.post('/', authorize(['admin']), faqController.createFaq);
router.patch('/:faqId', authorize(['admin']), faqController.updateFaq);
router.delete('/:faqId', authorize(['admin']), faqController.deleteFaq);

export default router;

