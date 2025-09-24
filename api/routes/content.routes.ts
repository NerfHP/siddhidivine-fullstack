import express from 'express';
import { contentController } from '../controllers/index.js';
import { authorize } from '../middleware/auth.middleware.js'; 

const router = express.Router();

// --- PUBLIC ROUTES ---
// These are accessible to everyone.
router.get('/categories', contentController.getCategories);
router.get('/products', contentController.getAllProducts);
router.get('/featured', contentController.getFeaturedItems);
router.get('/bestsellers', contentController.getBestsellers);
router.get('/services', contentController.getAllServices);
router.get('/faqs', contentController.getFaqs);

// This route uses a wildcard to capture nested category paths.
router.get('/category-data/*', contentController.getCategoryPageData);
// This route is for a single product's detail page data.
router.get('/product-data/:slug', contentController.getProductPageData);
// This is a legacy/alternative route for getting an item by slug.
router.get('/product/:slug', contentController.getItemBySlug);


// --- ADMIN ROUTES ---
// These routes are protected and can only be accessed by logged-in admins.
router.post(
    '/products', 
    authorize(['admin']), 
    contentController.createProduct
);

router.patch(
    '/products/:productId', 
    authorize(['admin']), 
    contentController.updateProduct
);

router.delete(
    '/products/:productId',  
    authorize(['admin']), 
    contentController.deleteProduct
);


export default router;

