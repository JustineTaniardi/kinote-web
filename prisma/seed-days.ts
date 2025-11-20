import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedDays() {
  try {
    console.log("🌱 Seeding days of the week...");

    // Delete existing days
    await prisma.day.deleteMany({});
    console.log("✓ Cleared existing days");

    // Create days of the week
    const days = await prisma.day.createMany({
      data: [
        { name: "Monday" },
        { name: "Tuesday" },
        { name: "Wednesday" },
        { name: "Thursday" },
        { name: "Friday" },
        { name: "Saturday" },
        { name: "Sunday" },
      ],
    });

    console.log(`✓ Created ${days.count} days of the week`);
    console.log("✅ Seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding days:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedDays();
