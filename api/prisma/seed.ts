import seedContent from './seed-content.json' with { type: 'json' };
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path'

const prisma = new PrismaClient();

// --- CHANGE: Defined a specific type for variants for better type safety ---
type SeedVariant = {
  id: string;
  origin: string;
  price: number;
  salePrice?: number | null;
  stock: number;
}

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
    variants?: SeedVariant[]; // --- CHANGE: Use the specific SeedVariant type ---
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

// FAQ types
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
  
  // Clear all data in the correct order (be careful with user data)
  await prisma.productFaq.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.contentItem.deleteMany();
  await prisma.category.deleteMany();
  await prisma.discount.deleteMany();
  
  // Only delete users if you're sure you want to clear all user data
  // This will also cascade delete tokens
  await prisma.user.deleteMany();

  // Create a test user with phone number (for testing purposes)
  console.log('Creating test user...');
  await prisma.user.create({ 
    data: { 
      phone: '9999999999', // Test phone number
      name: 'Test User',
      email: 'testuser@example.com',
      address: 'Test Address, Test City',
      isProfileComplete: true,
      role: 'admin' // Make test user an admin
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
        
        // --- LOGIC TO DETERMINE THE BASE PRICE ---
        let basePrice = item.price; // Default to the price in JSON
        let salePrice = item.salePrice;

        // If the product has variants, find the lowest price to display on product cards.
        if (item.variants && item.variants.length > 0) {
            // Find the lowest price (considering both salePrice and regular price)
            const lowestVariantPrice = item.variants.reduce((minPrice, variant) => {
                const currentPrice = variant.salePrice ?? variant.price;
                return currentPrice < minPrice ? currentPrice : minPrice;
            }, Infinity);

            // Set the product's main price to the lowest variant price.
            basePrice = lowestVariantPrice;
            // When variants exist, the main salePrice on the item itself should be null.
            salePrice = null; 
        }
        // --- END OF PRICE LOGIC ---

        await prisma.contentItem.create({
          data: {
            name: item.name,
            slug: item.slug,
            description: item.description,
            type: item.type,
            content: item.content,
            price: basePrice, // Use the dynamically determined base price
            salePrice: salePrice, // Use the determined sale price
            vendor: item.vendor,
            sku: item.sku,
            availability: item.availability,
            attributes: item.attributes,
            images: JSON.stringify(item.images || []),
            specifications: JSON.stringify(item.specifications || null),
            benefits: JSON.stringify(item.benefits || null),
            variants: JSON.stringify(item.variants || null), // Still store the full variants object
            howToUse: JSON.stringify(item.howToUse || null),
            packageContents: JSON.stringify(item.packageContents || null),
            categories: {
              connect: [{ id: category.id }],
            },
            stock: 100, // Set default stock
            isPublished: true, // Make all items visible
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

  // Create sample discount codes (Your existing logic is preserved)
  console.log('Creating sample discount codes...');
  await prisma.discount.create({ data: { code: 'WELCOME10', discountType: 'PERCENTAGE', value: 10, isActive: true } });
  await prisma.discount.create({ data: { code: 'DIWALI500', discountType: 'FIXED_AMOUNT', value: 500, isActive: true } });
  await prisma.discount.create({ data: { code: 'FIRSTTIME', discountType: 'PERCENTAGE', value: 15, isActive: true } });
  console.log('Sample discount codes created.');

  // Seed Product FAQs (Your existing logic is preserved)
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

