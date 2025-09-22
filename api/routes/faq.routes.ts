import express from 'express';
import { faqController } from '../controllers/faq.controller.js';
import { auth } from '../middleware/auth.middleware.js';

const router = express.Router();

// --- Public Route ---
// Get all FAQs for a product
router.get('/:productId', faqController.getFaqsByProductId);


// --- Admin Routes (Requires Authentication) ---
// Note: You may want to add another middleware to check for 'admin' role specifically.
router.post('/', auth, faqController.createFaq);
router.patch('/:faqId', auth, faqController.updateFaq);
router.delete('/:faqId', auth, faqController.deleteFaq);

export default router;
