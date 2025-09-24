import seedContent from './seed-content.json' with { type: 'json' };
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path'

const prisma = new PrismaClient();

// --- TYPE DEFINITIONS (UNCHANGED) ---
type SeedVariant = {
  id: string;
  origin: string;
  price: number;
  salePrice?: number | null;
  stock: number;
}

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
    variants?: SeedVariant[];
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
  
  // --- THE DEFINITIVE FIX: Deleting tables sequentially without a transaction ---
  // This is a more robust method to avoid the "prepared statement" error on some systems.
  console.log('Clearing existing data...');
  await prisma.orderItem.deleteMany();
  await prisma.productFaq.deleteMany();
  await prisma.review.deleteMany();
  await prisma.order.deleteMany();
  // We must delete items that have relations to ContentItem and User first.
  
  // Now we can delete the ContentItems themselves
  await prisma.contentItem.deleteMany();

  // Now we can delete Categories
  await prisma.category.deleteMany();
  
  // Now we can delete Users (which will cascade to Tokens)
  await prisma.user.deleteMany();
  
  // Finally, delete independent tables
  await prisma.discount.deleteMany();
  await prisma.formSubmission.deleteMany(); // Added for completeness
  console.log('Data cleared.');
  
  
  // --- THE REST OF THE SCRIPT REMAINS THE SAME ---
  console.log('Creating test user...');
  await prisma.user.create({ 
    data: { 
      phone: '9999999999',
      name: 'Test User',
      email: 'testuser@example.com',
      address: 'Test Address, Test City',
      isProfileComplete: true,
      role: 'admin'
    } 
  });

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
        console.log(`Creating item "${item.name}" with type: "${item.type}"`);
        
        let basePrice = item.price;
        let salePrice = item.salePrice;

        if (item.variants && item.variants.length > 0) {
            const lowestVariantPrice = item.variants.reduce((minPrice, variant) => {
                const currentPrice = variant.salePrice ?? variant.price;
                return currentPrice < minPrice ? currentPrice : minPrice;
            }, Infinity);

            basePrice = lowestVariantPrice;
            salePrice = null; 
        }

        await prisma.contentItem.create({
          data: {
            name: item.name,
            slug: item.slug,
            description: item.description,
            type: item.type,
            content: item.content,
            price: basePrice,
            salePrice: salePrice,
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
            stock: 100,
            isPublished: true,
          },
        });
        createdCount++;
        
        if (createdCount % 50 === 0) {
          console.log(`Created ${createdCount} products so far...`);
        }
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
    console.log('\nSkipped products:');
    skippedProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product}`);
    });
  }

  console.log('Creating sample discount codes...');
  await prisma.discount.create({ data: { code: 'WELCOME10', discountType: 'PERCENTAGE', value: 10, isActive: true } });
  await prisma.discount.create({ data: { code: 'DIWALI500', discountType: 'FIXED_AMOUNT', value: 500, isActive: true } });
  await prisma.discount.create({ data: { code: 'FIRSTTIME', discountType: 'PERCENTAGE', value: 15, isActive: true } });
  console.log('Sample discount codes created.');

  console.log('Seeding Product FAQs...');
  const faqDataPath = path.resolve(process.cwd(), 'api', 'prisma', 'seed-faqs.json');

  if (!fs.existsSync(faqDataPath)) {
    console.warn('⚠️ No seed-faqs.json file found. Skipping FAQ seeding.');
  } else {
    const faqData: SeedFaqEntry[] = JSON.parse(fs.readFileSync(faqDataPath, 'utf-8'));

    for (const faqEntry of faqData) {
      const product = await prisma.contentItem.findUnique({ where: { slug: faqEntry.productSlug } });
      if (product) {
        await prisma.productFaq.deleteMany({ where: { productId: product.id } });
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

