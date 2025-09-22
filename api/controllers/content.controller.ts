// server/src/controllers/content.controller.ts
import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync.js';
import { contentSerivce, reviewService } from '../services/index.js';

const getHighlightedReviews = catchAsync(async (_req: Request, res: Response) => {
  // Use real database service instead of mock data
  const reviews = await reviewService.getHighlightedReviews();
  res.send(reviews);
});

const getAllReviews = catchAsync(async (_req: Request, res: Response) => {
  // Use real database service instead of mock data
  const reviews = await reviewService.getTestimonialReviews(50);
  res.send(reviews);
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

const getAllProducts = catchAsync(async (req: Request, res: Response) => {
  const { sortBy, availability } = req.query;
  const availabilityArray = typeof availability === 'string' && availability ? availability.split(',') : [];
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
  getHighlightedReviews,
  getAllReviews,
};