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
 * /api/streaks/{id}/start:
 *   post:
 *     tags:
 *       - Streak
 *     summary: Start a streak session
 *     description: Create a new session history record with start time
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Session title
 *               description:
 *                 type: string
 *                 description: Session description
 *               breakCount:
 *                 type: number
 *                 description: Number of break sessions allowed
 *     responses:
 *       201:
 *         description: Session started successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 historyId:
 *                   type: number
 *                 startTime:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Streak not found
 *       500:
 *         description: Internal server error
 */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const streakId = parseInt(id);
    const streak = await prisma.streak.findUnique({
      where: { id: streakId },
    });

    if (!streak) {
      return NextResponse.json(
        { message: "Streak not found" },
        { status: 404 }
      );
    }

    if (streak.userId !== userId) {
      return NextResponse.json(
        { message: "Forbidden" },
        { status: 403 }
      );
    }

    // Get request body
    const body = await req.json();
    const { title = streak.title, description = "", breakCount = 0 } = body;

    const now = new Date();
    const history = await prisma.streakHistory.create({
      data: {
        streakId,
        userId,
        title,
        description,
        startTime: now,
        endTime: new Date(0), // Placeholder, will be updated on end
        duration: 0,
        breakSessions: [],
      },
    });

    // Update Streak table with the break count
    if (breakCount > 0) {
      await prisma.streak.update({
        where: { id: streakId },
        data: {
          breakCount,
        },
      });
    }

    return NextResponse.json(
      {
        historyId: history.id,
        startTime: history.startTime.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Start streak error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
