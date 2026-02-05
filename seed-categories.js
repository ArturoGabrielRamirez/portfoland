/**
 * Quick script to seed default skill categories
 */

const { PrismaClient } = require('@prisma/client');
const { DEFAULT_CATEGORIES, CATEGORY_COLORS } = require('./features/skills/constants/categories');

const prisma = new PrismaClient();

async function seedCategories() {
  try {
    console.log('Seeding default skill categories...');
    
    for (const category of DEFAULT_CATEGORIES) {
      const color = CATEGORY_COLORS[category.slug];
      
      // Check if category already exists
      const existing = await prisma.skillCategory.findFirst({
        where: {
          slug: category.slug,
          userId: null,
        },
      });
      
      if (!existing) {
        console.log(`Creating category: ${category.name}`);
        await prisma.skillCategory.create({
          data: {
            slug: category.slug,
            name: category.name,
            color,
            isDefault: true,
          },
        });
      } else {
        console.log(`Category ${category.name} already exists`);
      }
    }
    
    console.log('Categories seeded successfully!');
  } catch (error) {
    console.error('Error seeding categories:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedCategories();