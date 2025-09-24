import seedContent from './seed-content.json' with { type: 'json' };
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path'

const prisma = new PrismaClient();

// Type definitions remain the same...
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

interface SeedFaq {
  question: string;
  answer: string;
}

interface SeedFaqEntry {
  productSlug: string;
  faqs: SeedFaq[];
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
  
  // Clear all content data, but leave user data alone.
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.productFaq.deleteMany(); // Also clear FAQs
  await prisma.contentItem.deleteMany();
  await prisma.category.deleteMany();
  await prisma.discount.deleteMany();
  
  // --- FIX: REMOVED User Deletion and Creation ---
  // User accounts are now managed exclusively by Clerk and the webhook.
  // The seed script is no longer responsible for creating test users.
  console.log('User data will be managed by Clerk. Skipping user seeding.');

  console.log('Creating categories from seed-content.json...');
  for (const categoryData of (seedContent.categories as SeedCategory[])) {
    await createCategory(categoryData);
  }
  console.log('Categories created.');

  console.log('Creating products...');
  let createdCount = 0;
  let skippedCount = 0;
  const skippedProducts: string[] = [];
  
  for (const item of (seedContent.items as SeedItem[])) {
    try {
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
            // Variants removed to match schema
            howToUse: JSON.stringify(item.howToUse || null),
            packageContents: JSON.stringify(item.packageContents || null),
            categories: {
              connect: [{ id: category.id }],
            },
            stock: 100,
            isPublished: true,
          },
        });
        createdCount++;
      } else {
        console.warn(`Category with slug "${item.categorySlug}" not found for item "${item.name}". Skipping.`);
        skippedProducts.push(`${item.name} (Category not found: ${item.categorySlug})`);
        skippedCount++;
      }
    } catch (error) {
      console.error(`Error creating product "${item.name}":`, error);
      skippedProducts.push(`${item.name} (Error: ${error instanceof Error ? error.message : 'Unknown error'})`);
      skippedCount++;
    }
  }
  
  console.log(`Products created: ${createdCount}, Skipped: ${skippedCount}`);
  
  if (skippedProducts.length > 0) {
    console.log('\nSkipped products:', skippedProducts);
  }

  // Create sample discount codes
  console.log('Creating sample discount codes...');
  await prisma.discount.createMany({
    data: [
      { code: 'WELCOME10', discountType: 'PERCENTAGE', value: 10, isActive: true },
      { code: 'DIWALI500', discountType: 'FIXED_AMOUNT', value: 500, isActive: true },
      { code: 'FIRSTTIME', discountType: 'PERCENTAGE', value: 15, isActive: true },
    ]
  });
  console.log('Sample discount codes created.');

  // Seed Product FAQs
  console.log('Seeding Product FAQs...');
  const faqDataPath = path.resolve(process.cwd(), 'api', 'prisma', 'seed-faqs.json');
  if (!fs.existsSync(faqDataPath)) {
    console.warn('⚠️ No seed-faqs.json file found. Skipping FAQ seeding.');
  } else {
    const faqData: SeedFaqEntry[] = JSON.parse(fs.readFileSync(faqDataPath, 'utf-8'));
    for (const faqEntry of faqData) {
      const product = await prisma.contentItem.findUnique({ where: { slug: faqEntry.productSlug } });
      if (product) {
        await prisma.productFaq.createMany({
          data: faqEntry.faqs.map((faq) => ({ ...faq, productId: product.id })),
        });
        console.log(`Seeded ${faqEntry.faqs.length} FAQs for ${product.name}.`);
      } else {
        console.warn(`⚠️ Warning: Product with slug "${faqEntry.productSlug}" not found. Skipping its FAQs.`);
      }
    }
  }

  console.log('Seeding process complete.');
}

main()
  .catch((e) => { 
    console.error('Seeding failed:', e); 
    throw e; 
  })
  .finally(async () => { 
    await prisma.$disconnect(); 
  });

