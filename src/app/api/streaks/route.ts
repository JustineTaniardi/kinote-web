import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET!;

// Helper to get userId from JWT
function getUserIdFromRequest(req: Request): number | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  try {
    const token = authHeader.substring(7);
    const decoded: any = jwt.verify(token, JWT_SECRET);
    return decoded.id;
  } catch {
    return null;
  }
}

/**
 * @swagger
 * /api/streaks:
 *   get:
 *     tags:
 *       - Streak
 *     summary: Get all streaks for authenticated user
 *     description: Retrieve all streaks belonging to the currently authenticated user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of streaks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: number
 *                   title:
 *                     type: string
 *                   dayId:
 *                     type: number
 *                   totalTime:
 *                     type: number
 *                   breakTime:
 *                     type: number
 *                   breakCount:
 *                     type: number
 *                   description:
 *                     type: string
 *                   photoUrl:
 *                     type: string
 *                   verified:
 *                     type: boolean
 *                   userId:
 *                     type: number
 *                   categoryId:
 *                     type: number
 *                   subCategoryId:
 *                     type: number
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *   post:
 *     tags:
 *       - Streak
 *     summary: Create a new streak
 *     description: Create a new streak record for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - categoryId
 *               - dayId
 *             properties:
 *               title:
 *                 type: string
 *               categoryId:
 *                 type: number
 *               subCategoryId:
 *                 type: number
 *               dayId:
 *                 type: number
 *               totalTime:
 *                 type: number
 *                 default: 0
 *               breakTime:
 *                 type: number
 *                 default: 0
 *               breakCount:
 *                 type: number
 *                 default: 0
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Streak created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export async function GET(req: Request) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const streaks = await prisma.streak.findMany({
      where: { userId },
      include: {
        day: true,
        category: true,
        subCategory: true,
        histories: {
          select: {
            id: true,
            verifiedAI: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate streak count from verified histories
    const streaksWithCount = streaks.map((streak: any) => ({
      ...streak,
      streakCount: streak.histories.filter((h: any) => h.verifiedAI).length,
    }));

    return NextResponse.json(streaksWithCount);
  } catch (error) {
    console.error("Get streaks error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log("Create streak payload:", body);

    const {
      title,
      categoryId,
      subCategoryId,
      dayIds = [],
      totalTime = 0,
      breakTime = 0,
      breakCount = 0,
      description,
    } = body;

    if (!title || !categoryId) {
      return NextResponse.json(
        { message: "Missing required fields: title, categoryId" },
        { status: 400 }
      );
    }

    // Ensure dayIds is an array and parse to integers
    const dayIdsArray = Array.isArray(dayIds) 
      ? dayIds.map(id => typeof id === 'string' ? parseInt(id) : id).filter(id => !isNaN(id))
      : dayIds ? [typeof dayIds === 'string' ? parseInt(dayIds) : dayIds].filter(id => !isNaN(id)) : [];

    // Parse categoryId as integer
    const parsedCategoryId = typeof categoryId === 'string' ? parseInt(categoryId) : categoryId;
    const parsedSubCategoryId = subCategoryId ? (typeof subCategoryId === 'string' ? parseInt(subCategoryId) : subCategoryId) : null;

    console.log("Parsed values - userId:", userId, "categoryId:", parsedCategoryId, "dayIds:", dayIdsArray);

    // Validate category exists
    const category = await prisma.category.findUnique({
      where: { id: parsedCategoryId },
    });

    if (!category) {
      console.error("Category not found:", parsedCategoryId);
      return NextResponse.json(
        { message: "Category not found" },
        { status: 400 }
      );
    }

    // Validate subcategory if provided
    if (parsedSubCategoryId) {
      const subCategory = await prisma.subCategory.findUnique({
        where: { id: parsedSubCategoryId },
      });

      if (!subCategory) {
        console.error("SubCategory not found:", parsedSubCategoryId);
        return NextResponse.json(
          { message: "SubCategory not found" },
          { status: 400 }
        );
      }
    }

    // Validate user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      console.error("User not found:", userId);
      return NextResponse.json(
        { message: "User not found. Please log in again." },
        { status: 401 }
      );
    }

    // Validate days exist if provided
    if (dayIdsArray.length > 0) {
      const days = await prisma.day.findMany({
        where: { id: { in: dayIdsArray } },
      });

      if (days.length !== dayIdsArray.length) {
        console.error("Some days not found. Requested:", dayIdsArray, "Found:", days.map(d => d.id));
        return NextResponse.json(
          { message: "Some days not found in database" },
          { status: 400 }
        );
      }
    }

    const streak = await prisma.streak.create({
      data: {
        title,
        userId,
        categoryId: parsedCategoryId,
        subCategoryId: parsedSubCategoryId,
        dayId: dayIdsArray.length > 0 ? dayIdsArray[0] : null,
        dayIds: dayIdsArray.length > 0 ? JSON.stringify(dayIdsArray) : "[]",
        totalTime: parseInt(String(totalTime)) || 0,
        breakTime: parseInt(String(breakTime)) || 0,
        breakCount: parseInt(String(breakCount)) || 0,
        streakCount: 0,
        description: description || null,
      },
      include: {
        category: true,
        subCategory: true,
        day: true,
      },
    });

    console.log("Streak created successfully:", streak.id);
    return NextResponse.json(streak, { status: 201 });
  } catch (error) {
    console.error("Create streak error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { message: "Internal server error", error: errorMessage },
      { status: 500 }
    );
  }
}
