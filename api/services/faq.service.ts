import { prisma } from '../config/prisma.js';

/**
 * Get all FAQs for a specific product
 * @param {string} productId - The ID of the product
 * @returns {Promise<ProductFaq[]>}
 */
const getFaqsByProductId = async (productId: string) => {
  return prisma.productFaq.findMany({
    where: { productId },
    orderBy: { createdAt: 'asc' },
  });
};

/**
 * Create a new FAQ for a product (Admin)
 * @param {string} productId - The ID of the product
 * @param {string} question - The FAQ question
 * @param {string} answer - The FAQ answer
 * @returns {Promise<ProductFaq>}
 */
const createFaq = async (productId: string, question: string, answer: string) => {
  return prisma.productFaq.create({
    data: {
      productId,
      question,
      answer,
    },
  });
};

/**
 * Update an existing FAQ (Admin)
 * @param {string} faqId - The ID of the FAQ
 * @param {Partial<{question: string, answer: string}>} updateBody - The fields to update
 * @returns {Promise<ProductFaq>}
 */
const updateFaq = async (faqId: string, updateBody: { question?: string; answer?: string }) => {
  return prisma.productFaq.update({
    where: { id: faqId },
    data: updateBody,
  });
};

/**
 * Delete an FAQ (Admin)
 * @param {string} faqId - The ID of the FAQ to delete
 * @returns {Promise<void>}
 */
const deleteFaq = async (faqId: string) => {
  await prisma.productFaq.delete({
    where: { id: faqId },
  });
};

export const faqService = {
  getFaqsByProductId,
  createFaq,
  updateFaq,
  deleteFaq,
};
