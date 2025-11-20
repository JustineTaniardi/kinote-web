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
 * /api/ai/career/checklist:
 *   get:
 *     tags:
 *       - AI Career Coach
 *     summary: Get user's checklist/tasks for AI analysis
 *     description: Retrieve user's tasks/checklist to be used in AI career coaching analysis
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's checklist retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalTasks:
 *                   type: number
 *                 completedTasks:
 *                   type: number
 *                 pendingTasks:
 *                   type: number
 *                 tasks:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: number
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       priority:
 *                         type: string
 *                       status:
 *                         type: string
 *                       difficulty:
 *                         type: string
 *                       deadline:
 *                         type: string
 *                         format: date-time
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

    // Fetch user's tasks with relationships
    const tasks = await prisma.task.findMany({
      where: {
        userId,
      },
      include: {
        status: {
          select: {
            name: true,
          },
        },
        difficulty: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        deadline: "asc",
      },
    });

    // Calculate statistics
    const completedTasks = tasks.filter((t) => t.status.name === "completed").length;
    const pendingTasks = tasks.filter((t) => t.status.name !== "completed").length;

    // Format response
    const formattedTasks = tasks.map((task) => ({
      id: task.id,
      title: task.title,
      description: task.description || "",
      priority: task.priority,
      status: task.status.name,
      difficulty: task.difficulty.name,
      deadline: task.deadline,
      createdAt: task.createdAt,
    }));

    return NextResponse.json(
      {
        totalTasks: tasks.length,
        completedTasks,
        pendingTasks,
        tasks: formattedTasks,
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Get checklist error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
