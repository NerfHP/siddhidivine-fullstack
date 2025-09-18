import { PrismaClient, Category, Prisma } from '@prisma/client';
import httpStatus from 'http-status';
import ApiError from '../utils/AppError.js';

const prisma = new PrismaClient();

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

// --- HELPER FUNCTIONS ---
async function getDescendantCategoryIds(categoryId: string): Promise<string[]> {
    const children = await prisma.category.findMany({ where: { parentId: categoryId }, select: { id: true } });
    let ids = children.map(child => child.id);
    for (const child of children) {
        const descendantIds = await getDescendantCategoryIds(child.id);
        ids = [...ids, ...descendantIds];
    }
    return ids;
}

// THIS FUNCTION IS NOW MORE ROBUST AND INCLUDES DEBUGGING LOGS
async function getCategoryAncestry(categoryId: string | null): Promise<Category[]> {
  // Prevent crash if categoryId is null or undefined
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
    if (!category.parent) {
      return [category];
    }
    // Ensure we don't get stuck in an infinite loop
    if (category.parentId === category.id) {
        console.error(`Circular reference detected in category hierarchy for ID "${categoryId}".`);
        return [category];
    }

    const ancestors = await getCategoryAncestry(category.parentId);
    return [...ancestors, category];
  } catch (error) {
    console.error(`Error fetching category ancestry for ID "${categoryId}":`, error);
    // Return an empty array on error to prevent the whole page from crashing
    return [];
  }
}

// --- MAIN SERVICE FUNCTIONS (CORRECTED) ---

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
  else if (sortBy === 'price-desc') orderBy = { price: 'desc' };
  const where: Prisma.ContentItemWhereInput = { categories: { some: { id: { in: categoryIds } } } };
  if (availability && availability.length > 0) where.availability = { in: availability };
  const items = await prisma.contentItem.findMany({ where, include: categoryHierarchyInclude, orderBy });
  return { category, items, breadcrumbs };
};

const getProductDataBySlug = async (slug: string) => {
  console.log(`[Backend Service] Searching for product with slug: "${slug}"`);
  const product = await prisma.contentItem.findFirst({
    where: { 
      slug: slug, 
      type: 'PRODUCT' 
    },
    include: categoryHierarchyInclude,
  });


  console.log('[Backend Service] Product found in database:', product ? product.name : 'null');
  if (!product) {
    console.error(`Product with slug "${slug}" not found.`);
    throw new ApiError(httpStatus.NOT_FOUND, 'Product not found');
  }
  
  let breadcrumbs: Category[] = [];
  // This check is now safer
  if (product.categories && product.categories.length > 0) {
    breadcrumbs = await getCategoryAncestry(product.categories[0].id);
  } else {
    console.warn(`Product with slug "${slug}" has no categories assigned.`);
  }
  return { product, breadcrumbs };
};

// ... (Rest of your service file remains the same) ...
const getAllProducts = async (sortBy?: string, availability?: string[]) => {
  let orderBy: Prisma.ContentItemOrderByWithRelationInput = { createdAt: 'desc' };
  if (sortBy === 'price-asc') orderBy = { price: 'asc' };
  else if (sortBy === 'price-desc') orderBy = { price: 'desc' };
  const where: Prisma.ContentItemWhereInput = { type: 'PRODUCT' };
  if (availability && availability.length > 0) where.availability = { in: availability };
  return prisma.contentItem.findMany({ where, include: categoryHierarchyInclude, orderBy });
};

// THIS IS THE CORRECTED FUNCTION WITH THE DUPLICATE REMOVED
const getFeaturedItems = async () => {
  const products = await prisma.contentItem.findMany({
    where: { type: 'PRODUCT' },
    take: 4,
    include: categoryHierarchyInclude,
    orderBy: { createdAt: 'desc' }
  });
  const services = await prisma.contentItem.findMany({
    where: { type: 'SERVICE' },
    take: 2,
    include: categoryHierarchyInclude,
    orderBy: { createdAt: 'desc' }
  });
  return { products, services };
};

// --- NEW FUNCTIONS TO ADD ---

const getBestsellers = async () => {
  // In a real application, you would have sales data to determine bestsellers.
  // For now, we will simulate this by taking a few products randomly.
  return prisma.contentItem.findMany({
    where: { type: 'PRODUCT' },
    take: 8, // Get 8 products for the bestsellers page
    include: categoryHierarchyInclude,
    orderBy: {
      // You can change this to a real metric later, like `orders: 'desc'`
      createdAt: 'asc' 
    }
  });
};

const getFaqs = async () => {
  // For now, we will hardcode the FAQ data.
  // In the future, you could move this to a database table.
  return [
    {
      id: 'faq1',
      question: 'Are your Rudraksha beads authentic?',
      answer: 'Yes, all our Rudraksha beads are 100% authentic and sourced directly from trusted suppliers in Nepal and Indonesia. Each bead comes with a certificate of authenticity.'
    },
    {
      id: 'faq2',
      question: 'How are the products energized?',
      answer: 'Every spiritual item, including Rudraksha, gemstones, and yantras, undergoes a traditional energization process (Prana Pratishtha) performed by our expert priests to ensure it is spiritually activated and ready for use.'
    },
    {
      id: 'faq3',
      question: 'What is your return policy?',
      answer: 'We offer a 7-day return policy for items that are in their original, unused condition. Please refer to our detailed Returns & Exchanges Policy page for more information.'
    },
    {
      id: 'faq4',
      question: 'Do you ship internationally?',
      answer: 'Yes, we offer worldwide shipping. Shipping costs and delivery times are calculated at checkout based on your location.'
    }
  ];
};

const getAllServices = async () => {
  return prisma.contentItem.findMany({
    where: { type: 'SERVICE' },
    include: { categories: true },
    orderBy: { createdAt: 'desc' }
  });
};

const getItemBySlug = async (slug: string) => {
  const item = await prisma.contentItem.findUnique({ where: { slug }, include: categoryHierarchyInclude });
  if (!item) throw new ApiError(httpStatus.NOT_FOUND, 'Item not found');
  return item;
};

const getCategories = async () => {
  return prisma.category.findMany({ where: { parentId: null } });
};

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
};

