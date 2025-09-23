import { Request, Response } from 'express';
import { catchAsync } from '../utils/catchAsync.js';
import { contentSerivce } from '../services/index.js';
import httpStatus from 'http-status';
import { z } from 'zod';
import ApiError from '../utils/AppError.js';

// --- Validation Schema for Creating/Updating a Product ---
const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  slug: z.string().min(1, 'Product slug is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().positive('Price must be a positive number'),
  salePrice: z.number().positive().optional().nullable(),
  images: z.string().min(1, 'At least one image is required'), // Expecting JSON string of an array
  type: z.string().min(1, 'Product type is required'),
  categoryIds: z.array(z.string()).min(1, 'At least one category is required'),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  isPublished: z.boolean().optional(),
});


// --- PUBLIC CONTROLLERS (Unchanged) ---

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

// --- ADMIN CONTROLLERS (Newly Added with FIX) ---

const createProduct = catchAsync(async (req: Request, res: Response) => {
    const validationResult = productSchema.safeParse(req.body);
    if (!validationResult.success) {
        // FIX: Format Zod errors into a readable string.
        const errorMessage = validationResult.error.errors.map(e => e.message).join(', ');
        throw new ApiError(httpStatus.BAD_REQUEST, errorMessage);
    }
    const product = await contentSerivce.createProduct(validationResult.data);
    res.status(httpStatus.CREATED).send(product);
});

const updateProduct = catchAsync(async (req: Request, res: Response) => {
    const { productId } = req.params;
    const validationResult = productSchema.partial().safeParse(req.body); // .partial() allows updating only some fields
    if (!validationResult.success) {
        // FIX: Format Zod errors into a readable string.
        const errorMessage = validationResult.error.errors.map(e => e.message).join(', ');
        throw new ApiError(httpStatus.BAD_REQUEST, errorMessage);
    }
    const product = await contentSerivce.updateProduct(productId, validationResult.data);
    res.send(product);
});

const deleteProduct = catchAsync(async (req: Request, res: Response) => {
    const { productId } = req.params;
    await contentSerivce.deleteProduct(productId);
    res.status(httpStatus.NO_CONTENT).send();
});


export const contentController = {
  // Public
  getCategoryPageData,
  getProductPageData,
  getAllProducts,
  getItemBySlug,
  getCategories,
  getFeaturedItems,
  getBestsellers,
  getFaqs,
  getAllServices,
  // Admin
  createProduct,
  updateProduct,
  deleteProduct,
};

