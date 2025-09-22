import express from 'express';
import { contentController } from '../controllers/index.js';

const router = express.Router();

// --- REVIEW ROUTES (ADD THESE) ---
router.get('/reviews/highlighted', contentController.getHighlightedReviews);
router.get('/reviews', contentController.getAllReviews);

// --- YOUR EXISTING ROUTES ---
router.get('/bestsellers', contentController.getBestsellers);
router.get('/faqs', contentController.getFaqs);

// This endpoint is for CATEGORY pages.
router.get('/category-data/*', contentController.getCategoryPageData);

// This NEW endpoint is for PRODUCT pages.
router.get('/product-data/:slug', contentController.getProductPageData);

// --- Your other routes ---
router.get('/featured', contentController.getFeaturedItems);
router.get('/products', contentController.getAllProducts);
router.get('/services', contentController.getAllServices);
router.get('/product/:slug', contentController.getItemBySlug); 
router.get('/categories', contentController.getCategories);

export default router;