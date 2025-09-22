// server/src/controllers/content.controller.ts
import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync.js';
import { contentSerivce } from '../services/index.js';
const getHighlightedReviews = catchAsync(async (_req: Request, res: Response) => {
  // For now, return mock data. Later you can implement real database logic
  const mockReviews = [
    {
      id: '1',
      rating: 5,
      comment: 'Absolutely amazing product! The quality is outstanding and delivery was super fast. Highly recommend to everyone.',
      imageUrl: null,
      createdAt: new Date().toISOString(),
      user: { name: 'Priya Sharma' },
      product: {
        id: '1',
        name: 'Rudraksha Mala',
        slug: 'rudraksha-mala',
        description: 'Sacred Rudraksha Mala',
        images: '["https://placehold.co/400x300/8B4513/FFF?text=Rudraksha+Mala"]',
        type: 'PRODUCT',
        categories: [],
        categoryId: '1'
      }
    },
    {
      id: '2',
      rating: 4,
      comment: 'Great service and authentic products. The spiritual energy is definitely felt. Thank you for this wonderful experience.',
      imageUrl: null,
      createdAt: new Date().toISOString(),
      user: { name: 'Amit Kumar' },
      product: {
        id: '2',
        name: 'Yantra Collection',
        slug: 'yantra-collection',
        description: 'Sacred Yantra Collection',
        images: '["https://placehold.co/400x300/FFD700/000?text=Sacred+Yantra"]',
        type: 'PRODUCT',
        categories: [],
        categoryId: '2'
      }
    },
    {
      id: '3',
      rating: 5,
      comment: 'Incredible quality and fast shipping. The product exceeded my expectations. Will definitely order again!',
      imageUrl: null,
      createdAt: new Date().toISOString(),
      user: { name: 'Sunita Devi' },
      product: {
        id: '3',
        name: 'Crystal Set',
        slug: 'crystal-set',
        description: 'Healing Crystal Set',
        images: '["https://placehold.co/400x300/9932CC/FFF?text=Healing+Crystals"]',
        type: 'PRODUCT',
        categories: [],
        categoryId: '3'
      }
    },
    {
      id: '4',
      rating: 5,
      comment: 'Perfect for meditation and daily prayers. The energy is pure and divine. Thank you for such an authentic product.',
      imageUrl: null,
      createdAt: new Date().toISOString(),
      user: { name: 'Rajesh Gupta' },
      product: {
        id: '4',
        name: 'Prayer Beads',
        slug: 'prayer-beads',
        description: 'Sacred Prayer Beads',
        images: '["https://placehold.co/400x300/CD853F/FFF?text=Prayer+Beads"]',
        type: 'PRODUCT',
        categories: [],
        categoryId: '4'
      }
    }
  ];
  
  res.send(mockReviews);
});

const getAllReviews = catchAsync(async (_req: Request, res: Response) => {
  // This can return all reviews, for now using the same mock data
  const mockReviews = [
    {
      id: '1',
      rating: 5,
      comment: 'Absolutely amazing product! The quality is outstanding and delivery was super fast.',
      imageUrl: null,
      createdAt: new Date().toISOString(),
      user: { name: 'Priya Sharma' },
      product: {
        id: '1',
        name: 'Rudraksha Mala',
        slug: 'rudraksha-mala',
        description: 'Sacred Rudraksha Mala',
        images: '["https://placehold.co/400x300/8B4513/FFF?text=Rudraksha+Mala"]',
        type: 'PRODUCT',
        categories: [],
        categoryId: '1'
      }
    }
  ];
  
  res.send(mockReviews);
});

const getCategoryPageData = catchAsync(async (req: Request, res: Response) => {
  const fullPath = req.params[0];
  const { sortBy, availability } = req.query;
  const availabilityArray = typeof availability === 'string' && availability ? availability.split(',') : [];
  
  const data = await contentSerivce.getCategoryDataByPath(fullPath, sortBy as string, availabilityArray);
  res.send(data);
});

const getProductPageData = catchAsync(async (req: Request, res: Response) => {
  const { slug } = req.params;
  const data = await contentSerivce.getProductDataBySlug(slug);
  res.send(data);
});

// --- THIS FUNCTION IS NOW FULLY IMPLEMENTED ---
const getAllProducts = catchAsync(async (req: Request, res: Response) => {
  const { sortBy, availability } = req.query;
  const availabilityArray = typeof availability === 'string' && availability ? availability.split(',') : [];
  // This line was missing. It now correctly calls the service.
  const items = await contentSerivce.getAllProducts(sortBy as string, availabilityArray);
  res.send(items);
});

const getItemBySlug = catchAsync(async (req: Request, res: Response) => {
  const item = await contentSerivce.getItemBySlug(req.params.slug);
  res.send(item);
});

const getCategories = catchAsync(async (_req: Request, res: Response) => {
  const categories = await contentSerivce.getCategories();
  res.send(categories);
});

const getFeaturedItems = catchAsync(async (_req: Request, res: Response) => {
  const items = await contentSerivce.getFeaturedItems();
  res.send(items);
});

const getBestsellers = catchAsync(async (_req: Request, res: Response) => {
  const items = await contentSerivce.getBestsellers();
  res.send(items);
});

const getFaqs = catchAsync(async (_req: Request, res: Response) => {
  const faqs = await contentSerivce.getFaqs();
  res.send(faqs);
});

const getAllServices = catchAsync(async (_req: Request, res: Response) => {
    const items = await contentSerivce.getAllServices();
    res.send(items);
});

export const contentController = {
  getCategoryPageData,
  getProductPageData,
  getAllProducts,
  getItemBySlug,
  getCategories,
  getFeaturedItems,
  getBestsellers,
  getFaqs,
  getAllServices,
  getHighlightedReviews,  // Add this
  getAllReviews,          // Add this
};

