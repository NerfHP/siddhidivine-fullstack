import express from 'express';
import authRoutes from './auth.routes.js';
import contentRoutes from './content.routes.js';
import formRoutes from './form.routes.js';
import reviewRoutes from './review.routes.js';
import searchRoute from './search.route.js';
import paymentRoute from './payment.route.js';
import orderRoute from './order.route.js';
import faqRoutes from './faq.routes.js'; // <-- IMPORT THE NEW ROUTES

const router = express.Router();

const defaultRoutes = [
  { path: '/auth', route: authRoutes },
  { path: '/content', route: contentRoutes },
  { path: '/forms', route: formRoutes },
  { path: '/reviews', route: reviewRoutes },
  { path: '/search', route: searchRoute },
  { path: '/payment', route: paymentRoute },
  { path: '/orders', route: orderRoute },
  { path: '/faqs', route: faqRoutes }, // <-- ADD THE NEW ROUTE CONFIG
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
