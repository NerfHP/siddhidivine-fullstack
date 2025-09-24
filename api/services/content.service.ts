import { Category, Prisma } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../utils/AppError.js';
import { prisma } from '../config/prisma.js';

// This is the original, complex include. We will keep it for pages that need it.
const categoryHierarchyInclude = {
  categories: {
    include: {
      parent: {
        include: {
          parent: true,
        },
      },
    },
  },
};

// --- NEW: A simpler, more robust include for homepage cards ---
const simpleCategoryInclude = {
    categories: true,
};


// --- HELPER FUNCTIONS (Unchanged) ---
async function getDescendantCategoryIds(categoryId: string): Promise<string[]> {
    const children = await prisma.category.findMany({ where: { parentId: categoryId }, select: { id: true } });
    let ids = children.map(child => child.id);
    for (const child of children) {
        const descendantIds = await getDescendantCategoryIds(child.id);
        ids = [...ids, ...descendantIds];
    }
    return ids;
}

async function getCategoryAncestry(categoryId: string | null): Promise<Category[]> {
  if (!categoryId) {
    console.error("getCategoryAncestry was called with a null or undefined categoryId.");
    return [];
  }
  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: { parent: true },
    });
    if (!category) {
      console.warn(`Category with ID "${categoryId}" not found during ancestry lookup.`);
      return [];
    }
    if (!category.parent) { return [category]; }
    if (category.parentId === category.id) {
        console.error(`Circular reference detected for ID "${categoryId}".`);
        return [category];
    }
    const ancestors = await getCategoryAncestry(category.parentId);
    return [...ancestors, category];
  } catch (error) {
    console.error(`Error fetching category ancestry for ID "${categoryId}":`, error);
    return [];
  }
}

// --- MAIN PUBLIC SERVICE FUNCTIONS ---
const getCategoryDataByPath = async (fullPath: string, sortBy?: string, availability?: string[]) => {
  if (!fullPath) throw new ApiError(httpStatus.BAD_REQUEST, 'Category path is required');
  const slugs = fullPath.split('/');
  const finalSlug = slugs[slugs.length - 1];
  const category = await prisma.category.findFirst({
    where: { slug: finalSlug, parent: slugs.length > 1 ? { slug: slugs[slugs.length - 2] } : null },
  });
  if (!category) throw new ApiError(httpStatus.NOT_FOUND, 'Category not found');
  const breadcrumbs = await getCategoryAncestry(category.id);
  const categoryIds = [category.id, ...(await getDescendantCategoryIds(category.id))];
  let orderBy: Prisma.ContentItemOrderByWithRelationInput = { createdAt: 'desc' };
  if (sortBy === 'price-asc') orderBy = { price: 'asc' };
  if (sortBy === 'price-desc') orderBy = { price: 'desc' };
  const where: Prisma.ContentItemWhereInput = { categories: { some: { id: { in: categoryIds } } } };
  if (availability && availability.length > 0) where.availability = { in: availability };
  const items = await prisma.contentItem.findMany({ where, include: categoryHierarchyInclude, orderBy });
  return { category, items, breadcrumbs };
};

const getProductDataBySlug = async (slug: string) => {
  const product = await prisma.contentItem.findFirst({
    where: { slug: slug, type: 'PRODUCT' },
    include: categoryHierarchyInclude,
  });
  if (!product) { throw new ApiError(httpStatus.NOT_FOUND, 'Product not found'); }
  const breadcrumbs = (product.categories && product.categories.length > 0) ? await getCategoryAncestry(product.categories[0].id) : [];
  return { product, breadcrumbs };
};

// UPDATED: This now uses the simpler include for better performance and stability.
const getAllProducts = async (sortBy?: string, availability?: string[]) => {
  let orderBy: Prisma.ContentItemOrderByWithRelationInput = { createdAt: 'desc' };
  if (sortBy === 'price-asc') orderBy = { price: 'asc' };
  if (sortBy === 'price-desc') orderBy = { price: 'desc' };
  const where: Prisma.ContentItemWhereInput = { type: 'PRODUCT' };
  if (availability && availability.length > 0) where.availability = { in: availability };
  return prisma.contentItem.findMany({ where, include: simpleCategoryInclude, orderBy });
};

// --- FIX: UPDATED HOMEPAGE FUNCTIONS ---

const getFeaturedItems = async () => {
  const products = await prisma.contentItem.findMany({ where: { type: 'PRODUCT' }, take: 4, include: simpleCategoryInclude, orderBy: { createdAt: 'desc' } });
  const services = await prisma.contentItem.findMany({ where: { type: 'SERVICE' }, take: 2, include: simpleCategoryInclude, orderBy: { createdAt: 'desc' } });
  return { products, services };
};

const getBestsellers = async () => {
  const items = await prisma.contentItem.findMany({
    where: { type: 'PRODUCT' },
    take: 8,
    include: simpleCategoryInclude, // Using the safer include
    orderBy: { createdAt: 'asc' }
  });
  return items; // Return the array, even if empty
};

const getFaqs = async () => {
  return [
    { id: 'faq1', question: 'Are your Rudraksha beads authentic?', answer: 'Yes, all our Rudraksha beads are 100% authentic and sourced directly from trusted suppliers in Nepal and Indonesia. Each bead comes with a certificate of authenticity.' },
    { id: 'faq2', question: 'How are the products energized?', answer: 'Every spiritual item, including Rudraksha, gemstones, and yantras, undergoes a traditional energization process (Prana Pratishtha) performed by our expert priests to ensure it is spiritually activated and ready for use.' },
    { id: 'faq3', question: 'What is your return policy?', answer: 'We offer a 7-day return policy for items that are in their original, unused condition. Please refer to our detailed Returns & Exchanges Policy page for more information.' },
    { id: 'faq4', question: 'Do you ship internationally?', answer: 'Yes, we offer worldwide shipping. Shipping costs and delivery times are calculated at checkout based on your location.' }
  ];
};

const getAllServices = async () => {
  return prisma.contentItem.findMany({ where: { type: 'SERVICE' }, include: simpleCategoryInclude, orderBy: { createdAt: 'desc' } });
};


// --- OTHER FUNCTIONS (Unchanged) ---
const getItemBySlug = async (slug: string) => {
  const item = await prisma.contentItem.findUnique({ where: { slug }, include: categoryHierarchyInclude });
  if (!item) throw new ApiError(httpStatus.NOT_FOUND, 'Item not found');
  return item;
};
const getCategories = async () => {
  return prisma.category.findMany({ where: { parentId: null } });
};


// --- ADMIN FUNCTIONS (Unchanged) ---
const createProduct = async (productData: any) => {
    const { categoryIds, ...data } = productData;
    return prisma.contentItem.create({ data: { ...data, categories: { connect: categoryIds.map((id: string) => ({ id })) }, }, });
};
const updateProduct = async (productId: string, productData: any) => {
    const { categoryIds, ...data } = productData;
    return prisma.contentItem.update({ where: { id: productId }, data: { ...data, ...(categoryIds && { categories: { set: categoryIds.map((id: string) => ({ id })) }, }), }, });
};
const deleteProduct = async (productId: string) => {
    return prisma.contentItem.delete({ where: { id: productId }, });
};


// --- FINAL EXPORT (Unchanged) ---
export const contentSerivce = {
  getItemBySlug, 
  getCategories, 
  getFeaturedItems, 
  getAllProducts, 
  getCategoryDataByPath, 
  getProductDataBySlug, 
  getAllServices, 
  getBestsellers, 
  getFaqs, 
  createProduct, 
  updateProduct, 
  deleteProduct,
};

