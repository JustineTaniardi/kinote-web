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
 * /api/tasks:
 *   get:
 *     tags:
 *       - Tasks
 *     summary: Get all tasks
 *     description: Get all tasks for authenticated user with optional filters
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by date (YYYY-MM-DD)
 *       - in: query
 *         name: category
 *         schema:
 *           type: number
 *         description: Filter by category ID
 *       - in: query
 *         name: difficulty
 *         schema:
 *           type: number
 *         description: Filter by difficulty ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: number
 *         description: Filter by status ID
 *     responses:
 *       200:
 *         description: List of tasks
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
 *                   description:
 *                     type: string
 *                   deadline:
 *                     type: string
 *                     format: date-time
 *                   priority:
 *                     type: string
 *                   categoryId:
 *                     type: number
 *                   difficultyId:
 *                     type: number
 *                   statusId:
 *                     type: number
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 *   post:
 *     tags:
 *       - Tasks
 *     summary: Create a new task
 *     description: Create a new task for authenticated user
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
 *               - deadline
 *               - difficultyId
 *               - statusId
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               deadline:
 *                 type: string
 *                 format: date-time
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               difficultyId:
 *                 type: number
 *               statusId:
 *                 type: number
 *     responses:
 *       201:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: number
 *                 title:
 *                   type: string
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
export async function GET(req: Request) {
  try {
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const url = new URL(req.url);
    const date = url.searchParams.get("date");
    const category = url.searchParams.get("category");
    const difficulty = url.searchParams.get("difficulty");
    const status = url.searchParams.get("status");

    // Build filter conditions
    const where: any = { userId };

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      where.deadline = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    if (category) {
      where.categoryId = parseInt(category);
    }

    if (difficulty) {
      where.difficultyId = parseInt(difficulty);
    }

    if (status) {
      where.statusId = parseInt(status);
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        difficulty: true,
        status: true,
        days: {
          include: {
            day: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Get tasks error:", error);
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
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { title, description, deadline, priority, difficultyId, statusId } = body;

    if (!title || !deadline || !difficultyId || !statusId) {
      return NextResponse.json(
        { message: "Missing required fields: title, deadline, difficultyId, statusId" },
        { status: 400 }
      );
    }

    try {
      const task = await prisma.task.create({
        data: {
          title,
          description,
          deadline: new Date(deadline),
          priority: priority || "medium",
          userId,
          difficultyId,
          statusId,
        },
        include: {
          difficulty: true,
          status: true,
        },
      });

      return NextResponse.json(task, { status: 201 });
    } catch (dbError) {
      console.error("Database error:", dbError);
      
      if (dbError instanceof Error && dbError.message.includes("Foreign key constraint")) {
        return NextResponse.json(
          { message: "Invalid difficultyId or statusId. Please ensure they exist in the database." },
          { status: 400 }
        );
      }
      
      throw dbError;
    }
  } catch (error) {
    console.error("Create task error:", error);
    return NextResponse.json(
      { message: "Internal server error: " + (error instanceof Error ? error.message : "Unknown error") },
      { status: 500 }
    );
  }
}
