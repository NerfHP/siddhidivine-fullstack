import { Request, Response } from 'express';
import { z } from 'zod';
import { faqService } from '../services/faq.service.js';
import { catchAsync } from '../utils/catchAsync.js';
import httpStatus from 'http-status';

// --- Validation Schemas ---
const createFaqSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  question: z.string().min(5, 'Question must be at least 5 characters long'),
  answer: z.string().min(10, 'Answer must be at least 10 characters long'),
});

const updateFaqSchema = z.object({
  question: z.string().min(5, 'Question must be at least 5 characters long').optional(),
  answer: z.string().min(10, 'Answer must be at least 10 characters long').optional(),
});


// --- Controller Functions ---

// PUBLIC: Get all FAQs for a single product
const getFaqsByProductId = catchAsync(async (req: Request, res: Response) => {
  const { productId } = req.params;
  const faqs = await faqService.getFaqsByProductId(productId);
  res.status(httpStatus.OK).json(faqs);
});

// ADMIN: Create a new FAQ
const createFaq = catchAsync(async (req: Request, res: Response) => {
  const validationResult = createFaqSchema.safeParse(req.body);
  if (!validationResult.success) {
    return res.status(httpStatus.BAD_REQUEST).json({ message: 'Invalid input', errors: validationResult.error.errors });
  }
  const { productId, question, answer } = validationResult.data;
  const newFaq = await faqService.createFaq(productId, question, answer);
  res.status(httpStatus.CREATED).json(newFaq);
});

// ADMIN: Update an existing FAQ
const updateFaq = catchAsync(async (req: Request, res: Response) => {
  const { faqId } = req.params;
  const validationResult = updateFaqSchema.safeParse(req.body);
  if (!validationResult.success) {
    return res.status(httpStatus.BAD_REQUEST).json({ message: 'Invalid input', errors: validationResult.error.errors });
  }
  const updatedFaq = await faqService.updateFaq(faqId, validationResult.data);
  res.status(httpStatus.OK).json(updatedFaq);
});

// ADMIN: Delete an FAQ
const deleteFaq = catchAsync(async (req: Request, res: Response) => {
  const { faqId } = req.params;
  await faqService.deleteFaq(faqId);
  res.status(httpStatus.NO_CONTENT).send();
});


export const faqController = {
  getFaqsByProductId,
  createFaq,
  updateFaq,
  deleteFaq,
};
