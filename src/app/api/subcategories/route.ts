import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * @swagger
 * /api/subcategories:
 *   get:
 *     tags:
 *       - SubCategories
 *     summary: Get all subcategories
 *     description: Retrieve all available subcategories with their category IDs
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of subcategories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: number
 *                   name:
 *                     type: string
 *                   categoryId:
 *                     type: number
 *       500:
 *         description: Internal server error
 */
export async function GET(request: NextRequest) {
  try {
    const subcategories = await prisma.subCategory.findMany({
      select: {
        id: true,
        name: true,
        categoryId: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(subcategories);
  } catch (error) {
    console.error("Error fetching subcategories:", error);
    return NextResponse.json(
      { error: "Failed to fetch subcategories" },
      { status: 500 }
    );
  }
}
