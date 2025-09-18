import express from 'express';
import authRoutes from './auth.routes.js';
import contentRoutes from './content.routes.js';
import formRoutes from './form.routes.js';
import reviewRoutes from './review.routes.js';
import searchRoute from './search.route.js';
import orderRoute from './order.route.js';
import paymentRoute from './payment.route.js';

const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoutes,
  },
  {
    path: '/content',
    route: contentRoutes,
  },
  {
    path: '/form',
    route: formRoutes,
  },
  {
    path: '/reviews',
    route: reviewRoutes,
  },
  {
    path: '/search',
    route: searchRoute,
  },
  {
    path: '/orders',
    route: orderRoute,
  },
  {
    path: '/payment',
    route: paymentRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;