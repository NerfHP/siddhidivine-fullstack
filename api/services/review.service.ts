import { prisma } from '../config/prisma';
import { Category } from '@prisma/client';

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
async function getCategoryAncestry(categoryId: string | null): Promise<Category[]> {
  if (!categoryId) return [];
  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: { parent: true },
    });
    if (!category) return [];
    if (!category.parent) return [category];
    if (category.parentId === category.id) return [category];
    const ancestors = await getCategoryAncestry(category.parentId);
    return [...ancestors, category];
  } catch (error) {
    console.error(`Error fetching category ancestry for ID "${categoryId}":`, error);
    return [];
  }
}

// --- MAIN SERVICE FUNCTIONS ---

// --- THIS FUNCTION IS THE FIX ---
const getHighlightedReviews = async () => {
  console.log("[Backend Service] Fetching highlighted reviews...");
  const reviews = await prisma.review.findMany({ 
    include: {
      user: { select: { name: true } },
      product: { include: categoryHierarchyInclude },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 10, // Get the latest 10 reviews
  });
  console.log(`[Backend Service] Found ${reviews.length} reviews to highlight.`);
  return reviews;
};

const getReviewsByProductId = async (productId: string) => {
  const reviews = await prisma.review.findMany({
    where: { productId },
    include: { user: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return reviews;
};

const createReview = async (
  productId: string, 
  userId: string, 
  rating: number, 
  comment: string,
  imageUrl?: string
) => {
  return prisma.review.create({
    data: {
      rating,
      comment,
      imageUrl,
      product: { connect: { id: productId } },
      user: { connect: { id: userId } }
    },
  });
};


export const reviewService = {
  getReviewsByProductId,
  createReview,
  getHighlightedReviews,
};

