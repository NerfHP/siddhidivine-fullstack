import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
// Make sure your seed-content.json is in the correct path
import seedContent from './seed-content.json';

const prisma = new PrismaClient();

// This defines the exact shape of your product data from the JSON file
type SeedItem = {
    name: string;
    slug: string;
    description: string;
    type: string;
    categorySlug: string;
    content?: string | null;
    price?: number | null;
    salePrice?: number | null;
    images?: string[];
    vendor?: string;
    sku?: string;
    availability?: string;
    attributes?: string;
    specifications?: Record<string, string>;
    benefits?: any[];
    variants?: any[];
    howToUse?: any[];
    packageContents?: string[];
};

type SeedCategory = {
    name: string;
    slug: string;
    description: string;
    type: string;
    image?: string;
    children?: SeedCategory[];
}

async function createCategory(categoryData: SeedCategory, parentId: string | null = null) {
  const category = await prisma.category.create({
    data: {
      name: categoryData.name,
      slug: categoryData.slug,
      description: categoryData.description,
      type: categoryData.type,
      image: categoryData.image,
      parentId: parentId,
    },
  });

  if (categoryData.children) {
    for (const childData of categoryData.children) {
      await createCategory(childData, category.id);
    }
  }
}

async function main() {
  console.log('Start seeding ...');
  // Clear all data in the correct order
  await prisma.contentItem.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.discount.deleteMany(); // Clear discounts as well

  const hashedPassword = await bcrypt.hash('Password123!', 10);
  await prisma.user.create({ data: { email: 'testuser@example.com', name: 'Test User', password: hashedPassword } });

  console.log('Creating categories from seed-content.json...');
  for (const categoryData of (seedContent.categories as SeedCategory[])) {
    await createCategory(categoryData);
  }
  console.log('Categories created.');

  console.log('Creating products...');
  for (const item of (seedContent.items as SeedItem[])) {
    const category = await prisma.category.findUnique({ where: { slug: item.categorySlug } });
    if (category) {
      await prisma.contentItem.create({
        data: {
          name: item.name,
          slug: item.slug,
          description: item.description,
          type: item.type,
          content: item.content,
          price: item.price,
          salePrice: item.salePrice,
          vendor: item.vendor,
          sku: item.sku,
          availability: item.availability,
          attributes: item.attributes,
          images: JSON.stringify(item.images || []),
          specifications: JSON.stringify(item.specifications || null),
          benefits: JSON.stringify(item.benefits || null),
          variants: JSON.stringify(item.variants || null),
          howToUse: JSON.stringify(item.howToUse || null),
          packageContents: JSON.stringify(item.packageContents || null),
          categories: {
            connect: [{ id: category.id }],
          },
          // --- NEW DATA ADDED HERE ---
          stock: 100, // Set a default stock of 100 for every item
          isPublished: true, // Make all seeded items visible by default
        },
      });
    } else {
      console.warn(`--> Category with slug "${item.categorySlug}" not found for item "${item.name}". Skipping.`);
    }
  }
  console.log('Products created.');

  // --- NEW: CREATING SAMPLE DISCOUNT CODES ---
  console.log('Creating sample discount codes...');
  await prisma.discount.create({
    data: {
        code: 'WELCOME10',
        discountType: 'PERCENTAGE',
        value: 10, // 10% off
        isActive: true,
    }
  });
  await prisma.discount.create({
    data: {
        code: 'DIWALI500',
        discountType: 'FIXED_AMOUNT',
        value: 500, // ₹500 off
        isActive: true,
    }
  });
  await prisma.discount.create({
    data: {
        code: 'EXPIREDCODE',
        discountType: 'PERCENTAGE',
        value: 15,
        isActive: false, // This code is disabled
    }
  });
  console.log('Sample discount codes created.');
  
  console.log('Seeding finished.');
}

main().catch((e) => { console.error(e); throw e; }).finally(async () => { await prisma.$disconnect(); });