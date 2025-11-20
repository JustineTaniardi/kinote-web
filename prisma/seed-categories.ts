import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedCategories() {
  try {
    console.log("🌱 Seeding categories and subcategories...");

    // Delete existing data
    await prisma.subCategory.deleteMany({});
    await prisma.category.deleteMany({});
    console.log("✓ Cleared existing categories and subcategories");

    // Create categories
    const categories = await Promise.all([
      prisma.category.create({ data: { name: "Productivity" } }),
      prisma.category.create({ data: { name: "Health" } }),
      prisma.category.create({ data: { name: "Learning" } }),
      prisma.category.create({ data: { name: "Creativity" } }),
      prisma.category.create({ data: { name: "Lifestyle" } }),
    ]);

    console.log(`✓ Created ${categories.length} categories`);

    // Create subcategories
    const subcategories = await prisma.subCategory.createMany({
      data: [
        // Productivity (1)
        { name: "Task Management", categoryId: categories[0].id },
        { name: "Time Blocking", categoryId: categories[0].id },
        { name: "Meeting Preparation", categoryId: categories[0].id },
        { name: "Email Management", categoryId: categories[0].id },
        { name: "Project Planning", categoryId: categories[0].id },
        // Health (2)
        { name: "Cardio Exercise", categoryId: categories[1].id },
        { name: "Weight Training", categoryId: categories[1].id },
        { name: "Yoga & Stretching", categoryId: categories[1].id },
        { name: "Meditation", categoryId: categories[1].id },
        { name: "Nutrition Planning", categoryId: categories[1].id },
        // Learning (3)
        { name: "Language Learning", categoryId: categories[2].id },
        { name: "Online Courses", categoryId: categories[2].id },
        { name: "Book Reading", categoryId: categories[2].id },
        { name: "Skill Development", categoryId: categories[2].id },
        { name: "Research & Study", categoryId: categories[2].id },
        // Creativity (4)
        { name: "Writing", categoryId: categories[3].id },
        { name: "Drawing & Design", categoryId: categories[3].id },
        { name: "Music & Audio", categoryId: categories[3].id },
        { name: "Video Production", categoryId: categories[3].id },
        { name: "Photography", categoryId: categories[3].id },
        // Lifestyle (5)
        { name: "Cooking", categoryId: categories[4].id },
        { name: "Home Organization", categoryId: categories[4].id },
        { name: "Social Activities", categoryId: categories[4].id },
        { name: "Travel Planning", categoryId: categories[4].id },
        { name: "Personal Development", categoryId: categories[4].id },
      ],
    });

    console.log(`✓ Created ${subcategories.count} subcategories`);
    console.log("✅ Seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding categories:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedCategories();
