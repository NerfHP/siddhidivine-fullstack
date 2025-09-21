import { prisma } from '../config/prisma.js';
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
export async function getCategoryAncestry(categoryId: string | null): Promise<Category[]> {
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

const getHighlightedReviews = async () => {
  console.log("[Backend Service] Fetching highlighted reviews...");
  const reviews = await prisma.review.findMany({ 
    where: { isApproved: true }, // Only approved reviews
    include: {
      user: { select: { name: true } },
      product: { include: categoryHierarchyInclude },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 10,
  });
  console.log(`[Backend Service] Found ${reviews.length} approved reviews to highlight.`);
  return reviews;
};

const getReviewsByProductId = async (productId: string) => {
  const reviews = await prisma.review.findMany({
    where: { 
      productId,
      isApproved: true // Only return approved reviews to public
    },
    include: { 
      user: { select: { name: true } } 
    },
    orderBy: { createdAt: 'desc' },
  });
  return reviews;
};

// Updated to handle both authenticated and guest reviews
const createReview = async (
  productId: string, 
  rating: number, 
  comment: string,
  options: {
    userId?: string;
    imageUrl?: string;
    guestName?: string;
    guestEmail?: string;
    isGuestReview?: boolean;
  } = {}
) => {
  const { userId, imageUrl, guestName, guestEmail, isGuestReview } = options;

  // Validate input
  if (!userId && !isGuestReview) {
    throw new Error('Either userId or guest information is required');
  }

  if (isGuestReview && (!guestName || !guestEmail)) {
    throw new Error('Guest name and email are required for anonymous reviews');
  }

  // Determine if review should be auto-approved
  const shouldAutoApprove = !!userId; // Only auto-approve for registered users

  const reviewData: any = {
    rating,
    comment,
    imageUrl,
    isApproved: shouldAutoApprove,
    product: { connect: { id: productId } },
  };

  if (userId) {
    // Registered user review
    reviewData.user = { connect: { id: userId } };
  } else {
    // Guest review
    reviewData.guestName = guestName;
    reviewData.guestEmail = guestEmail;
  }

  return prisma.review.create({
    data: reviewData,
    include: {
      user: { select: { name: true } },
      product: { select: { name: true } }
    }
  });
};

// Admin functions for managing reviews
const getPendingReviews = async () => {
  return prisma.review.findMany({
    where: { isApproved: false },
    include: {
      user: { select: { name: true } },
      product: { select: { name: true, slug: true } }
    },
    orderBy: { createdAt: 'desc' },
  });
};

const approveReview = async (reviewId: string, approvedBy: string) => {
  return prisma.review.update({
    where: { id: reviewId },
    data: {
      isApproved: true,
      approvedAt: new Date(),
      approvedBy: approvedBy
    },
    include: {
      user: { select: { name: true } },
      product: { select: { name: true } }
    }
  });
};

const rejectReview = async (reviewId: string) => {
  return prisma.review.delete({
    where: { id: reviewId }
  });
};

// Get approved reviews for testimonials (with additional filtering)
const getTestimonialReviews = async (limit: number = 20) => {
  return prisma.review.findMany({
    where: {
      isApproved: true,
      rating: { gte: 4 }, // Only 4-5 star reviews for testimonials
      comment: { not: null }, // Must have a comment
    },
    include: {
      user: { select: { name: true } },
      product: { select: { name: true } }
    },
    orderBy: [
      { rating: 'desc' },
      { createdAt: 'desc' }
    ],
    take: limit
  });
};

// Get reviews by guest email (for admin to track specific guests)
const getReviewsByGuestEmail = async (email: string) => {
  return prisma.review.findMany({
    where: { guestEmail: email },
    include: {
      product: { select: { name: true, slug: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
};

// Analytics: Get review stats
const getReviewStats = async () => {
  const [totalReviews, approvedReviews, pendingReviews, guestReviews] = await Promise.all([
    prisma.review.count(),
    prisma.review.count({ where: { isApproved: true } }),
    prisma.review.count({ where: { isApproved: false } }),
    prisma.review.count({ where: { userId: null } })
  ]);

  const averageRating = await prisma.review.aggregate({
    where: { isApproved: true },
    _avg: { rating: true }
  });

  return {
    totalReviews,
    approvedReviews,
    pendingReviews,
    guestReviews,
    averageRating: averageRating._avg.rating || 0
  };
};

export const reviewService = {
  getReviewsByProductId,
  createReview,
  getHighlightedReviews,
  
  // Admin functions
  getPendingReviews,
  approveReview,
  rejectReview,
  
  // Testimonial functions
  getTestimonialReviews,
  getReviewsByGuestEmail,
  
  // Analytics
  getReviewStats,
};